#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const BLOG_DIR = path.join(PUBLIC_DIR, "blog");
const EVIDENCE_PATH = path.join(ROOT_DIR, "docs", "evidence", "blog-image-audit.md");

const RATIO_PROFILES = [
  { name: "OG recommended", ratio: 1200 / 630 },
  { name: "16:9", ratio: 16 / 9 },
  { name: "16:10", ratio: 16 / 10 },
  { name: "square", ratio: 1 },
];
const RATIO_TOLERANCE = 0.03;
const MIN_IMAGE_WIDTH = 1200;

/**
 * @param {string} html
 * @param {string} pattern
 * @returns {string|null}
 */
function extractMetaContent(html, pattern) {
  const regex = new RegExp(
    `<meta\\s+(?:property|name)="${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s+content="([^"]+)"`,
    "i",
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

/**
 * @param {string} html
 * @returns {{ width: number|null, height: number|null }}
 */
function extractOgSize(html) {
  const width = extractMetaContent(html, "og:image:width");
  const height = extractMetaContent(html, "og:image:height");
  return {
    width: width ? Number(width) : null,
    height: height ? Number(height) : null,
  };
}

/**
 * @param {Buffer} bytes
 * @returns {{width:number,height:number}|null}
 */
function parsePngDimensions(bytes) {
  if (bytes.length < 24) return null;
  const signature = bytes.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

/**
 * @param {Buffer} bytes
 * @returns {{width:number,height:number}|null}
 */
function parseJpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (offset + 2 > bytes.length) break;
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof && offset + 7 < bytes.length) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  return null;
}

/**
 * @param {string} content
 * @returns {{width:number,height:number}|null}
 */
function parseSvgDimensions(content) {
  const widthMatch = content.match(/\bwidth="([\d.]+)"/i);
  const heightMatch = content.match(/\bheight="([\d.]+)"/i);
  if (widthMatch && heightMatch) {
    return {
      width: Number(widthMatch[1]),
      height: Number(heightMatch[1]),
    };
  }

  const viewBoxMatch = content.match(/\bviewBox="([\d.\s-]+)"/i);
  if (!viewBoxMatch) return null;
  const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || Number.isNaN(parts[2]) || Number.isNaN(parts[3])) return null;
  return { width: parts[2], height: parts[3] };
}

/**
 * @param {string} imagePath
 * @returns {{width:number,height:number}|null}
 */
function readDimensions(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();

  if (ext === ".svg") {
    return parseSvgDimensions(fs.readFileSync(imagePath, "utf8"));
  }

  const bytes = fs.readFileSync(imagePath);
  if (ext === ".png") return parsePngDimensions(bytes);
  if (ext === ".jpg" || ext === ".jpeg") return parseJpegDimensions(bytes);
  return null;
}

/**
 * @param {number} ratio
 * @returns {string|null}
 */
function nearestRatioName(ratio) {
  let best = null;
  for (const candidate of RATIO_PROFILES) {
    const delta = Math.abs(ratio - candidate.ratio);
    if (!best || delta < best.delta) {
      best = { name: candidate.name, delta };
    }
  }

  if (!best || best.delta > RATIO_TOLERANCE) {
    return null;
  }
  return best.name;
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((name) => name.endsWith(".html") && name !== "index.html")
  .sort();

const errors = [];
const warnings = [];
const lines = [];

for (const name of files) {
  const filePath = path.join(BLOG_DIR, name);
  const html = fs.readFileSync(filePath, "utf8");

  const ogImage = extractMetaContent(html, "og:image");
  const twImage = extractMetaContent(html, "twitter:image");
  const ogSize = extractOgSize(html);

  if (!ogImage) {
    errors.push(`${name}: missing og:image`);
    continue;
  }
  if (!twImage) {
    errors.push(`${name}: missing twitter:image`);
    continue;
  }
  if (ogImage !== twImage) {
    errors.push(`${name}: og:image and twitter:image must match`);
    continue;
  }
  if (!ogImage.startsWith(`${SITE_URL}/blog/`)) {
    errors.push(`${name}: image must be under ${SITE_URL}/blog/`);
    continue;
  }

  const relativeImage = ogImage.replace(`${SITE_URL}/`, "");
  const localImagePath = path.join(PUBLIC_DIR, relativeImage);
  if (!fs.existsSync(localImagePath)) {
    errors.push(`${name}: referenced image missing -> ${relativeImage}`);
    continue;
  }

  const dims = readDimensions(localImagePath);
  if (!dims) {
    warnings.push(`${name}: could not parse dimensions for ${relativeImage}`);
    lines.push(`- ${name}: ${relativeImage} (dimensions unavailable)`);
    continue;
  }

  const ratio = dims.width / dims.height;
  const ratioName = nearestRatioName(ratio);
  if (dims.width < MIN_IMAGE_WIDTH) {
    errors.push(
      `${name}: image width too small (${dims.width}px). Minimum required width is ${MIN_IMAGE_WIDTH}px`,
    );
  }
  if (!ratioName) {
    errors.push(
      `${name}: unsupported ratio ${dims.width}x${dims.height} (${ratio.toFixed(3)}); use OG/16:9/16:10/square`,
    );
  }

  if (ogSize.width && ogSize.height) {
    const metaRatio = ogSize.width / ogSize.height;
    if (Math.abs(metaRatio - ratio) > 0.06) {
      warnings.push(
        `${name}: og:image:width/height (${ogSize.width}x${ogSize.height}) differs from asset (${dims.width}x${dims.height})`,
      );
    }
  }

  lines.push(
    `- ${name}: ${relativeImage} (${dims.width}x${dims.height}, ${ratioName || "unknown"})`,
  );
}

const report = [
  "# Blog Image Audit",
  "",
  `- Date: ${new Date().toISOString()}`,
  `- Scope: ${files.length} blog article pages`,
  `- Minimum width: ${MIN_IMAGE_WIDTH}px`,
  `- Allowed ratios: OG 1200x630, 16:9, 16:10, square`,
  "",
  "## Image Targets",
  ...lines,
  "",
  "## Warnings",
  ...(warnings.length ? warnings.map((w) => `- ${w}`) : ["- none"]),
  "",
];

fs.writeFileSync(EVIDENCE_PATH, `${report.join("\n")}\n`, "utf8");

if (errors.length > 0) {
  console.error("Blog image audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  if (warnings.length > 0) {
    console.error("\nWarnings:");
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
  process.exit(1);
}

console.log("Blog image audit passed.");
for (const warning of warnings) {
  console.log(`WARN: ${warning}`);
}
console.log(`Evidence written: ${path.relative(ROOT_DIR, EVIDENCE_PATH)}`);
