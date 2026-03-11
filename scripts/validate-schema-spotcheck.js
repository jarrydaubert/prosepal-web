#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL, BRAND_LOGO_URL } = require("./lib/metadata");

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
 * Extract one meta property value from HTML.
 * @param {string} html
 * @param {string} property
 * @returns {string}
 */
function extractMetaProperty(html, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+property=["']${escapedProperty}["']\\s+content=(["'])(.*?)\\1`,
    "i",
  );
  const match = html.match(pattern);
  return match ? match[2].trim() : "";
}

/**
 * Normalize URL-like values for logical equality checks.
 * @param {string} value
 * @returns {string}
 */
function normalizeUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    parsed.hash = "";
    return parsed.href.replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/$/, "");
  }
}

/**
 * Normalize plain text for equality checks.
 * @param {string} value
 * @returns {string}
 */
function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Convert a site-relative path to canonical absolute URL.
 * @param {string} href
 * @returns {string}
 */
function toCanonicalUrl(href) {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  const normalizedPath = href.startsWith("/") ? href : `/${href}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Decode minimal HTML entities used in headings.
 * @param {string} value
 * @returns {string}
 */
function decodeHtmlEntities(value) {
  const entityMap = {
    amp: "&",
    quot: '"',
    "#039": "'",
    apos: "'",
    lt: "<",
    gt: ">",
  };

  return value.replace(/&(amp|quot|#039|apos|lt|gt);/g, (match, entity) => {
    const decoded = entityMap[entity];
    return typeof decoded === "string" ? decoded : match;
  });
}

/**
 * Extract visible URL/title pairs from blog hub cards.
 * @param {string} html
 * @returns {{url: string, title: string}[]}
 */
function extractBlogHubCards(html) {
  const cardRegex =
    /<article class="[^"]*\bpost-card\b[^"]*">[\s\S]*?<a href="([^"]+)">[\s\S]*?<h2 class="post-title">([^<]+)<\/h2>/gi;
  const cards = [];

  for (const match of html.matchAll(cardRegex)) {
    const rawTitle = match[2];
    cards.push({
      url: normalizeUrl(toCanonicalUrl(match[1])),
      title: normalizeText(decodeHtmlEntities(rawTitle)),
    });
  }

  return cards;
}

/**
 * Read the first resolvable Article.image value from JSON-LD.
 * @param {Record<string, unknown>} article
 * @returns {string}
 */
function resolveArticleImage(article) {
  const image = article.image;
  if (typeof image === "string") {
    return image;
  }

  if (Array.isArray(image)) {
    const firstString = image.find((entry) => typeof entry === "string");
    return typeof firstString === "string" ? firstString : "";
  }

  if (image && typeof image === "object") {
    const url = image.url;
    if (typeof url === "string") {
      return url;
    }
  }

  return "";
}

/**
 * Read publisher.logo URL from a schema object.
 * @param {Record<string, unknown>} schemaObject
 * @returns {string}
 */
function resolvePublisherLogo(schemaObject) {
  const publisher = schemaObject.publisher;
  if (!publisher || typeof publisher !== "object") {
    return "";
  }

  const logo = publisher.logo;
  if (typeof logo === "string") {
    return logo;
  }

  if (logo && typeof logo === "object" && typeof logo.url === "string") {
    return logo.url;
  }

  return "";
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
 * @returns {{errors: string[], notes: string[]}}
 */
function validateTarget(relativePath, rule) {
  const htmlPath = path.join(PUBLIC_DIR, relativePath);
  const html = fs.readFileSync(htmlPath, "utf8");
  const blocks = extractJsonLdBlocks(html);
  const errors = [];
  const notes = [];

  if (blocks.length === 0) {
    return { errors: [`[${relativePath}] no JSON-LD scripts found`], notes };
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

  if (rule.label === "blog-article") {
    const ogImage = extractMetaProperty(html, "og:image");
    if (!ogImage) {
      errors.push(`[${relativePath}] blog-article missing og:image meta property`);
      return { errors, notes };
    }

    const articles = [];
    for (const parsed of parsedBlocks) {
      collectTypedObjects(parsed, "Article", articles);
    }

    const normalizedOgImage = normalizeUrl(ogImage);
    const hasMatchingArticleImage = articles.some((article) => {
      const articleImage = resolveArticleImage(article);
      return normalizeUrl(articleImage) === normalizedOgImage;
    });

    if (!hasMatchingArticleImage) {
      errors.push(
        `[${relativePath}] blog-article Article.image must match og:image (${normalizedOgImage})`,
      );
    }

    const hasCanonicalPublisherLogo = articles.some(
      (article) => normalizeUrl(resolvePublisherLogo(article)) === normalizeUrl(BRAND_LOGO_URL),
    );

    if (!hasCanonicalPublisherLogo) {
      errors.push(
        `[${relativePath}] blog-article publisher.logo must be ${normalizeUrl(BRAND_LOGO_URL)}`,
      );
    }
  }

  if (rule.label === "blog-hub") {
    const blogCards = extractBlogHubCards(html);
    const itemLists = [];
    const collectionPages = [];
    for (const parsed of parsedBlocks) {
      collectTypedObjects(parsed, "ItemList", itemLists);
      collectTypedObjects(parsed, "CollectionPage", collectionPages);
    }

    if (itemLists.length === 0) {
      errors.push(`[${relativePath}] blog-hub missing ItemList object`);
      return { errors, notes };
    }

    const itemList = itemLists[0];
    const schemaEntries = Array.isArray(itemList.itemListElement) ? itemList.itemListElement : [];
    const schemaCount =
      typeof itemList.numberOfItems === "number"
        ? itemList.numberOfItems
        : Number.parseInt(String(itemList.numberOfItems ?? ""), 10);

    if (!Number.isFinite(schemaCount)) {
      errors.push(`[${relativePath}] blog-hub ItemList.numberOfItems must be numeric`);
    }

    if (schemaCount !== blogCards.length) {
      errors.push(
        `[${relativePath}] blog-hub ItemList.numberOfItems mismatch: expected ${blogCards.length}, found ${schemaCount}`,
      );
    }

    if (schemaEntries.length !== blogCards.length) {
      errors.push(
        `[${relativePath}] blog-hub itemListElement length mismatch: expected ${blogCards.length}, found ${schemaEntries.length}`,
      );
    }

    for (let i = 0; i < Math.min(schemaEntries.length, blogCards.length); i += 1) {
      const entry = schemaEntries[i];
      const card = blogCards[i];
      const entryPosition =
        typeof entry?.position === "number"
          ? entry.position
          : Number.parseInt(String(entry?.position ?? ""), 10);
      const entryUrl = normalizeUrl(typeof entry?.url === "string" ? entry.url : "");
      const entryName = normalizeText(typeof entry?.name === "string" ? entry.name : "");

      if (entryPosition !== i + 1) {
        errors.push(
          `[${relativePath}] blog-hub itemListElement[${i}] position mismatch: expected ${i + 1}, found ${entryPosition}`,
        );
      }

      if (entryUrl !== card.url) {
        errors.push(
          `[${relativePath}] blog-hub itemListElement[${i}] url mismatch: expected ${card.url}, found ${entryUrl}`,
        );
      }

      if (entryName !== card.title) {
        errors.push(
          `[${relativePath}] blog-hub itemListElement[${i}] name mismatch: expected "${card.title}", found "${entryName}"`,
        );
      }
    }

    const hasCanonicalCollectionLogo = collectionPages.some(
      (page) => normalizeUrl(resolvePublisherLogo(page)) === normalizeUrl(BRAND_LOGO_URL),
    );
    if (!hasCanonicalCollectionLogo) {
      errors.push(
        `[${relativePath}] blog-hub CollectionPage.publisher.logo must be ${normalizeUrl(BRAND_LOGO_URL)}`,
      );
    }

    notes.push(
      `[${relativePath}] blog-hub parity: visible cards=${blogCards.length}, itemList entries=${schemaEntries.length}, numberOfItems=${schemaCount}`,
    );
  }

  return { errors, notes };
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
    const result = validateTarget(target.relativePath, target.rule);
    const errors = result.errors;
    if (errors.length > 0) {
      allErrors.push(...errors);
      continue;
    }

    lines.push(`- ${target.relativePath}: pass`);
    lines.push(...result.notes.map((note) => `- ${note}`));
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
