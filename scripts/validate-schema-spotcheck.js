#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TARGETS = [
  {
    label: "homepage",
    url: "https://www.prosepal.app/",
    requiredTypes: ["Organization", "SoftwareApplication", "WebSite", "FAQPage"],
  },
  {
    label: "blog-sympathy",
    url: "https://www.prosepal.app/blog/what-to-write-in-sympathy-card.html",
    requiredTypes: ["Article", "BreadcrumbList"],
  },
  {
    label: "message-sympathy-coworker",
    url: "https://www.prosepal.app/messages/sympathy-card-message-for-coworker.html",
    requiredTypes: ["Article", "BreadcrumbList", "HowTo", "FAQPage"],
  },
];

const LOG_DIR = path.join(__dirname, "..", "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "schema-spotcheck.md");

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
 * Extract JSON-LD blocks from an HTML document.
 * @param {string} html
 * @returns {string[]}
 */
function extractJsonLdBlocks(html) {
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(regex)].map((match) => match[1].trim());
}

/**
 * Recursively collect @type values.
 * @param {unknown} node
 * @param {Set<string>} types
 * @returns {void}
 */
function collectTypes(node, types) {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectTypes(item, types);
    }
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  const object = /** @type {Record<string, unknown>} */ (node);
  const typeValue = object["@type"];
  if (typeof typeValue === "string") {
    types.add(typeValue);
  } else if (Array.isArray(typeValue)) {
    for (const item of typeValue) {
      if (typeof item === "string") {
        types.add(item);
      }
    }
  }

  for (const value of Object.values(object)) {
    collectTypes(value, types);
  }
}

/**
 * Verify schema.org JSON-LD context URL safely.
 * @param {unknown} contextValue
 * @returns {boolean}
 */
function hasValidSchemaContext(contextValue) {
  if (typeof contextValue !== "string") {
    return false;
  }

  let parsed;
  try {
    parsed = new URL(contextValue);
  } catch {
    return false;
  }

  const isHttp = parsed.protocol === "https:" || parsed.protocol === "http:";
  const isSchemaHost = parsed.hostname === "schema.org" || parsed.hostname === "www.schema.org";
  return isHttp && isSchemaHost;
}

/**
 * Validate schema blocks for one target page.
 * @param {{label: string, url: string, requiredTypes: string[]}} target
 * @returns {Promise<string[]>}
 */
async function validateTarget(target) {
  const html = await fetchText(target.url);
  const blocks = extractJsonLdBlocks(html);
  const errors = [];

  if (blocks.length === 0) {
    return [`[${target.label}] no JSON-LD scripts found`];
  }

  const allTypes = new Set();

  for (const [index, block] of blocks.entries()) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (error) {
      errors.push(`[${target.label}] invalid JSON-LD block ${index + 1}: ${error.message}`);
      continue;
    }

    const contextValue = parsed?.["@context"];
    if (!hasValidSchemaContext(contextValue)) {
      errors.push(`[${target.label}] block ${index + 1} missing schema.org @context`);
    }

    collectTypes(parsed, allTypes);
  }

  for (const requiredType of target.requiredTypes) {
    if (!allTypes.has(requiredType)) {
      errors.push(`[${target.label}] missing required @type: ${requiredType}`);
    }
  }

  return errors;
}

/**
 * Write release QA evidence output.
 * @param {string[]} results
 * @returns {void}
 */
function writeLog(results) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const lines = [
    "# Schema Spot-Check",
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
    console.error("Schema spot-check failed:");
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Schema spot-check passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main().catch((error) => {
  console.error(`Schema spot-check error: ${error.message}`);
  process.exit(1);
});
