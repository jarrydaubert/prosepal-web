#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TARGETS = [
  {
    label: "homepage",
    url: "https://www.prosepal.app/",
    expectedCanonical: "https://www.prosepal.app/",
    expectedOgType: "website",
  },
  {
    label: "blog-sympathy",
    url: "https://www.prosepal.app/blog/what-to-write-in-sympathy-card.html",
    expectedCanonical: "https://www.prosepal.app/blog/what-to-write-in-sympathy-card.html",
    expectedOgType: "article",
  },
];

const REQUIRED_META = [
  "og:title",
  "og:description",
  "og:type",
  "og:url",
  "og:image",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

const LOG_DIR = path.join(__dirname, "..", "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "social-preview-validation.md");

/**
 * Fetch text content from a URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

/**
 * Extract the first canonical href from HTML.
 * @param {string} html
 * @returns {string}
 */
function extractCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match ? match[1] : "";
}

/**
 * Extract OG/Twitter meta tags into a map.
 * @param {string} html
 * @returns {Map<string, string>}
 */
function extractMetaMap(html) {
  const map = new Map();
  const regex = /<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/gi;
  for (const match of html.matchAll(regex)) {
    map.set(match[1], match[2]);
  }
  return map;
}

/**
 * Normalize URL strings for logical equality checks.
 * @param {string} value
 * @returns {string}
 */
function normalizeUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/+$/, "");
    return `${parsed.origin}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

/**
 * Verify a preview image URL resolves to an image response.
 * @param {string} imageUrl
 * @returns {Promise<void>}
 */
async function validateImage(imageUrl) {
  const response = await fetch(imageUrl, { method: "HEAD", redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Image URL failed: ${imageUrl} (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Image URL is not image/*: ${imageUrl} (${contentType || "unknown"})`);
  }
}

/**
 * Validate one target page for social preview essentials.
 * @param {{label: string, url: string, expectedCanonical: string, expectedOgType: string}} target
 * @returns {Promise<string[]>}
 */
async function validateTarget(target) {
  const html = await fetchText(target.url);
  const errors = [];
  const meta = extractMetaMap(html);
  const canonical = extractCanonical(html);

  for (const key of REQUIRED_META) {
    if (!meta.get(key)) {
      errors.push(`[${target.label}] missing meta: ${key}`);
    }
  }

  if (normalizeUrl(canonical) !== normalizeUrl(target.expectedCanonical)) {
    errors.push(
      `[${target.label}] canonical mismatch: expected ${target.expectedCanonical}, got ${canonical || "(missing)"}`,
    );
  }

  if (meta.get("og:type") !== target.expectedOgType) {
    errors.push(
      `[${target.label}] og:type mismatch: expected ${target.expectedOgType}, got ${meta.get("og:type") || "(missing)"}`,
    );
  }

  if (normalizeUrl(meta.get("og:url")) !== normalizeUrl(target.expectedCanonical)) {
    errors.push(
      `[${target.label}] og:url mismatch: expected ${target.expectedCanonical}, got ${meta.get("og:url") || "(missing)"}`,
    );
  }

  const imageUrls = new Set([meta.get("og:image"), meta.get("twitter:image")].filter(Boolean));
  for (const imageUrl of imageUrls) {
    try {
      await validateImage(imageUrl);
    } catch (error) {
      errors.push(`[${target.label}] ${error.message}`);
    }
  }

  return errors;
}

/**
 * Write a lightweight evidence log for release QA records.
 * @param {string[]} results
 * @returns {void}
 */
function writeLog(results) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const lines = [
    "# Social Preview Validation",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    ...results,
    "",
  ];
  fs.writeFileSync(LOG_FILE, lines.join("\n"), "utf8");
}

/**
 * Entry point.
 * @returns {Promise<void>}
 */
async function main() {
  const allErrors = [];
  const lines = ["Status: PASS"];

  for (const target of TARGETS) {
    const errors = await validateTarget(target);
    if (errors.length > 0) {
      allErrors.push(...errors);
      continue;
    }
    lines.push(`- ${target.label}: pass`);
  }

  if (allErrors.length > 0) {
    lines[0] = "Status: FAIL";
    lines.push(...allErrors.map((error) => `- ${error}`));
  }

  writeLog(lines);

  if (allErrors.length > 0) {
    console.error("Social preview validation failed:");
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Social preview validation passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main().catch((error) => {
  console.error(`Social preview validation error: ${error.message}`);
  process.exit(1);
});
