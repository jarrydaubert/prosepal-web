#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { CONTENT_DATE, SITE_URL } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "sitemap.xml");
const CLEAN_URL_OVERRIDES = {
  "privacy.html": "/privacy",
  "terms.html": "/terms",
  "support.html": "/support",
};

/**
 * Recursively collect all HTML files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Convert an absolute file path to a public-relative path.
 * @param {string} fullPath
 * @returns {string}
 */
function toPublicPath(fullPath) {
  return fullPath.replace(`${PUBLIC_DIR}${path.sep}`, "").split(path.sep).join("/");
}

/**
 * Convert a public-relative HTML path to canonical URL path shape.
 * @param {string} publicPath
 * @returns {string|null}
 */
function toUrlPath(publicPath) {
  if (CLEAN_URL_OVERRIDES[publicPath]) {
    return CLEAN_URL_OVERRIDES[publicPath];
  }

  if (publicPath === "index.html") {
    return "/";
  }

  if (publicPath === "404.html") {
    return null;
  }

  if (publicPath.endsWith("/index.html")) {
    return `/${publicPath.replace(/\/index\.html$/, "/")}`;
  }

  return `/${publicPath}`;
}

const HIGH_INTENT_TOPICS = [
  "sympathy",
  "birthday",
  "thank-you",
  "wedding",
  "christmas",
  "valentines-day",
  "mothers-day",
  "fathers-day",
];

const MEDIUM_INTENT_TOPICS = ["graduation", "get-well", "new-baby", "retirement"];

/**
 * Extract the page slug from a URL path.
 * @param {string} urlPath
 * @returns {string}
 */
function extractSlug(urlPath) {
  const clean = urlPath.replace(/\/$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1].replace(/\.html$/, "");
}

/**
 * Classify page intent tier for priority tuning.
 * @param {string} slug
 * @returns {"high"|"medium"|"longtail"}
 */
function getIntentTier(slug) {
  if (HIGH_INTENT_TOPICS.some((topic) => slug.includes(topic))) {
    return "high";
  }

  if (MEDIUM_INTENT_TOPICS.some((topic) => slug.includes(topic))) {
    return "medium";
  }

  return "longtail";
}

/**
 * Get sitemap priority for a URL path.
 * @param {string} urlPath
 * @returns {string}
 */
function getPriority(urlPath) {
  if (urlPath === "/") return "1.0";
  if (urlPath === "/messages/") return "0.95";
  if (urlPath === "/blog/") return "0.90";

  if (urlPath.startsWith("/messages/")) {
    const tier = getIntentTier(extractSlug(urlPath));
    if (tier === "high") return "0.90";
    if (tier === "medium") return "0.84";
    return "0.78";
  }

  if (urlPath.startsWith("/blog/")) {
    const tier = getIntentTier(extractSlug(urlPath));
    if (tier === "high") return "0.88";
    if (tier === "medium") return "0.82";
    return "0.76";
  }

  if (urlPath === "/support") return "0.40";
  if (urlPath === "/privacy" || urlPath === "/terms") return "0.20";
  return "0.5";
}

/**
 * Get sitemap change frequency for a URL path.
 * @param {string} urlPath
 * @returns {string}
 */
function getChangeFreq(urlPath) {
  if (urlPath === "/" || urlPath === "/messages/" || urlPath === "/blog/") return "weekly";

  if (urlPath.startsWith("/messages/") || urlPath.startsWith("/blog/")) {
    return "monthly";
  }

  if (urlPath === "/privacy" || urlPath === "/terms") {
    return "yearly";
  }

  return "monthly";
}

/**
 * File mtime converted to `YYYY-MM-DD`.
 * @param {string} filePath
 * @returns {string}
 */
function toLastMod() {
  return CONTENT_DATE;
}

/**
 * Exclude pages marked as noindex from sitemap entries.
 * @param {string} filePath
 * @returns {boolean}
 */
function isIndexable(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
}

/**
 * Build a sitemap XML document from URL entries.
 * @param {{loc: string, lastmod: string, changefreq: string, priority: string}[]} entries
 * @returns {string}
 */
function buildXml(entries) {
  const urlEntries = entries
    .map((entry) => {
      return [
        "  <url>",
        `    <loc>${entry.loc}</loc>`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

/**
 * Generate sitemap.xml for all indexable pages.
 * @returns {void}
 */
function main() {
  const htmlFiles = getHtmlFiles(PUBLIC_DIR);
  const entries = htmlFiles
    .map((filePath) => {
      const publicPath = toPublicPath(filePath);
      const urlPath = toUrlPath(publicPath);

      if (!urlPath) {
        return null;
      }

      if (!isIndexable(filePath)) {
        return null;
      }

      return {
        loc: `${SITE_URL}${urlPath}`,
        lastmod: toLastMod(filePath),
        changefreq: getChangeFreq(urlPath),
        priority: getPriority(urlPath),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = buildXml(entries);
  fs.writeFileSync(OUTPUT_FILE, xml, "utf8");
  console.log(`Generated sitemap with ${entries.length} URLs -> ${OUTPUT_FILE}`);
}

main();
