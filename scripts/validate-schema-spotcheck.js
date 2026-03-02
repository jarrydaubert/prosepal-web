#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const LOG_DIR = path.join(ROOT, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "schema-spotcheck.md");

const TARGET_RULES = [
  {
    label: "homepage",
    match: (relativePath) => relativePath === "index.html",
    requiredTypes: ["Organization", "SoftwareApplication", "WebSite", "FAQPage"],
  },
  {
    label: "messages-hub",
    match: (relativePath) => relativePath === "messages/index.html",
    requiredTypes: ["CollectionPage", "BreadcrumbList", "ItemList"],
  },
  {
    label: "blog-hub",
    match: (relativePath) => relativePath === "blog/index.html",
    requiredTypes: ["CollectionPage", "BreadcrumbList", "ItemList"],
  },
  {
    label: "message-detail",
    match: (relativePath) =>
      relativePath.startsWith("messages/") && relativePath !== "messages/index.html",
    requiredTypes: ["Article", "BreadcrumbList", "HowTo", "FAQPage"],
  },
  {
    label: "blog-article",
    match: (relativePath) => relativePath.startsWith("blog/") && relativePath !== "blog/index.html",
    requiredTypes: ["Article", "BreadcrumbList"],
  },
];

/**
 * Recursively gather files by extension.
 * @param {string} directory
 * @param {string} extension
 * @returns {string[]}
 */
function walkFiles(directory, extension) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath, extension));
      continue;
    }

    if (entry.isFile() && absolutePath.endsWith(extension)) {
      files.push(absolutePath);
    }
  }

  return files;
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
 * Recursively collect objects matching a target @type.
 * @param {unknown} node
 * @param {string} targetType
 * @param {Record<string, unknown>[]} matches
 * @returns {void}
 */
function collectTypedObjects(node, targetType, matches) {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectTypedObjects(item, targetType, matches);
    }
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  const object = /** @type {Record<string, unknown>} */ (node);
  const typeValue = object["@type"];
  const typeMatches =
    typeValue === targetType ||
    (Array.isArray(typeValue) && typeValue.some((item) => item === targetType));

  if (typeMatches) {
    matches.push(object);
  }

  for (const value of Object.values(object)) {
    collectTypedObjects(value, targetType, matches);
  }
}

/**
 * Validate schema.org JSON-LD context URL safely.
 * @param {unknown} contextValue
 * @returns {boolean}
 */
function hasValidSchemaContext(contextValue) {
  if (typeof contextValue === "string") {
    return isSchemaContextUrl(contextValue);
  }

  if (Array.isArray(contextValue)) {
    return contextValue.some((value) => typeof value === "string" && isSchemaContextUrl(value));
  }

  return false;
}

/**
 * Validate whether a context URL points to schema.org.
 * @param {string} contextUrl
 * @returns {boolean}
 */
function isSchemaContextUrl(contextUrl) {
  let parsed;
  try {
    parsed = new URL(contextUrl);
  } catch {
    return false;
  }

  const isHttp = parsed.protocol === "https:" || parsed.protocol === "http:";
  const isSchemaHost = parsed.hostname === "schema.org" || parsed.hostname === "www.schema.org";
  return isHttp && isSchemaHost;
}

/**
 * Find target rule for a relative HTML path.
 * @param {string} relativePath
 * @returns {{label: string, requiredTypes: string[]} | null}
 */
function resolveRule(relativePath) {
  for (const rule of TARGET_RULES) {
    if (rule.match(relativePath)) {
      return { label: rule.label, requiredTypes: rule.requiredTypes };
    }
  }

  return null;
}

/**
 * Validate schema blocks for one local file target.
 * @param {string} relativePath
 * @param {{label: string, requiredTypes: string[]}} rule
 * @returns {string[]}
 */
function validateTarget(relativePath, rule) {
  const htmlPath = path.join(PUBLIC_DIR, relativePath);
  const html = fs.readFileSync(htmlPath, "utf8");
  const blocks = extractJsonLdBlocks(html);
  const errors = [];

  if (blocks.length === 0) {
    return [`[${relativePath}] no JSON-LD scripts found`];
  }

  const allTypes = new Set();
  /** @type {unknown[]} */
  const parsedBlocks = [];

  for (const [index, block] of blocks.entries()) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`[${relativePath}] invalid JSON-LD block ${index + 1}: ${message}`);
      continue;
    }

    const contextValue = parsed?.["@context"];
    if (!hasValidSchemaContext(contextValue)) {
      errors.push(`[${relativePath}] block ${index + 1} missing schema.org @context`);
    }

    parsedBlocks.push(parsed);
    collectTypes(parsed, allTypes);
  }

  for (const requiredType of rule.requiredTypes) {
    if (!allTypes.has(requiredType)) {
      errors.push(`[${relativePath}] missing required @type (${rule.label}): ${requiredType}`);
    }
  }

  if (rule.label === "homepage") {
    const softwareApps = [];
    const organizations = [];

    for (const parsed of parsedBlocks) {
      collectTypedObjects(parsed, "SoftwareApplication", softwareApps);
      collectTypedObjects(parsed, "Organization", organizations);
    }

    const hasExpectedDownloadUrl = softwareApps.some((app) => {
      const downloadUrl = app.downloadUrl;
      return (
        typeof downloadUrl === "string" &&
        /^https:\/\/apps\.apple\.com\/app\/prosepal\/id6757088726$/i.test(downloadUrl)
      );
    });

    if (!hasExpectedDownloadUrl) {
      errors.push(
        `[${relativePath}] homepage SoftwareApplication.downloadUrl must be https://apps.apple.com/app/prosepal/id6757088726`,
      );
    }

    const hasValidOrganizationLogo = organizations.some((org) => {
      const logo = org.logo;
      return typeof logo === "string" && logo.startsWith("https://");
    });

    if (!hasValidOrganizationLogo) {
      errors.push(`[${relativePath}] homepage Organization.logo must be a non-empty https:// URL`);
    }
  }

  if (rule.label === "message-detail") {
    const howTos = [];

    for (const parsed of parsedBlocks) {
      collectTypedObjects(parsed, "HowTo", howTos);
    }

    const hasHowToSteps = howTos.some((howTo) => {
      const steps = howTo.step;
      return Array.isArray(steps) && steps.length > 0;
    });

    if (!hasHowToSteps) {
      errors.push(`[${relativePath}] message-detail HowTo.step must be a non-empty array`);
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
 * @returns {void}
 */
function main() {
  const htmlFiles = walkFiles(PUBLIC_DIR, ".html");
  const relativeHtmlFiles = htmlFiles
    .map((filePath) => path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/"))
    .sort();

  const scopedTargets = relativeHtmlFiles
    .map((relativePath) => ({ relativePath, rule: resolveRule(relativePath) }))
    .filter((entry) => entry.rule !== null);

  const allErrors = [];
  const lines = [
    "Status: PASS",
    `- Scope: ${scopedTargets.length} local HTML files (homepage, hubs, blog articles, message details)`,
  ];

  for (const target of scopedTargets) {
    const errors = validateTarget(target.relativePath, target.rule);
    if (errors.length > 0) {
      allErrors.push(...errors);
      continue;
    }

    lines.push(`- ${target.relativePath}: pass`);
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

main();
