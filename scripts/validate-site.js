#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const CLEAN_URL_OVERRIDES = {
  "privacy.html": "/privacy",
  "terms.html": "/terms",
  "support.html": "/support",
};

/**
 * Recursively collect all HTML files under the given directory.
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
 * Convert an absolute file path to a path relative to `public/`.
 * @param {string} filePath
 * @returns {string}
 */
function relativeToPublic(filePath) {
  return filePath.replace(`${PUBLIC_DIR}${path.sep}`, "").split(path.sep).join("/");
}

/**
 * Normalize an HTML file path to a canonical URL pathname.
 * @param {string} relativePath
 * @returns {string}
 */
function htmlToUrlPath(relativePath) {
  if (CLEAN_URL_OVERRIDES[relativePath]) {
    return CLEAN_URL_OVERRIDES[relativePath];
  }

  if (relativePath === "index.html") return "/";
  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.replace(/\/index\.html$/, "/")}`;
  }
  return `/${relativePath}`;
}

/**
 * Count regex matches in a string.
 * @param {string} text
 * @param {RegExp} regex
 * @returns {number}
 */
function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Check whether a URL path maps to an existing static file or index route.
 * @param {string} webPath
 * @returns {boolean}
 */
function pathExistsFromWebPath(webPath) {
  const clean = webPath.split("?")[0].split("#")[0];
  const asPath = clean.startsWith("/") ? clean.slice(1) : clean;
  const hasExtension = path.extname(asPath) !== "";

  const candidates = [path.join(PUBLIC_DIR, asPath), path.join(PUBLIC_DIR, asPath, "index.html")];

  if (!hasExtension) {
    candidates.push(path.join(PUBLIC_DIR, `${asPath}.html`));
  }

  return candidates.some((candidate) => fs.existsSync(candidate));
}

/**
 * Validate title, description, and canonical tags per page.
 * @param {string} filePath
 * @param {string} html
 * @param {string[]} errors
 * @returns {void}
 */
function validatePageMeta(filePath, html, errors) {
  const rel = relativeToPublic(filePath);
  const titleCount = countMatches(html, /<title>/gi);
  const descCount = countMatches(html, /<meta\s+name="description"/gi);
  const canonicalCount = countMatches(html, /<link\s+rel="canonical"/gi);

  if (titleCount !== 1) {
    errors.push(`${rel}: expected 1 <title>, found ${titleCount}`);
  }

  if (descCount !== 1) {
    errors.push(`${rel}: expected 1 meta description, found ${descCount}`);
  }

  const noindex = /<meta\s+name="robots"\s+content="[^">]*noindex/i.test(html);
  const requiresCanonical = !noindex;

  if (requiresCanonical && canonicalCount !== 1) {
    errors.push(`${rel}: expected 1 canonical link on indexable page, found ${canonicalCount}`);
  }
}

/**
 * Validate Open Graph/Twitter image metadata points to existing files.
 * @param {string} filePath
 * @param {string} html
 * @param {string[]} errors
 * @returns {void}
 */
function validateImageMeta(filePath, html, errors) {
  const rel = relativeToPublic(filePath);
  const imageMetaMatches = [
    ...html.matchAll(
      /<(meta)\s+(?:property|name)="(?:og:image|twitter:image)"\s+content="([^"]+)"/gi,
    ),
  ];

  for (const [, , imageUrl] of imageMetaMatches) {
    if (!imageUrl.startsWith(SITE_URL)) {
      continue;
    }

    const webPath = imageUrl.replace(SITE_URL, "");
    if (!pathExistsFromWebPath(webPath)) {
      errors.push(`${rel}: meta image target does not exist -> ${imageUrl}`);
    }
  }
}

/**
 * Validate local link and asset references resolve within the static site.
 * @param {string} filePath
 * @param {string} html
 * @param {string[]} errors
 * @returns {void}
 */
function validateLinks(filePath, html, errors) {
  const rel = relativeToPublic(filePath);
  const matches = [...html.matchAll(/(?:href|src)="([^"]+)"/gi)];

  for (const [, rawUrl] of matches) {
    if (
      rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://") ||
      rawUrl.startsWith("mailto:") ||
      rawUrl.startsWith("tel:") ||
      rawUrl.startsWith("data:") ||
      rawUrl.startsWith("#")
    ) {
      continue;
    }

    if (rawUrl.startsWith("/_vercel/")) {
      continue;
    }

    if (!rawUrl.startsWith("/")) {
      continue;
    }

    if (!pathExistsFromWebPath(rawUrl)) {
      errors.push(`${rel}: broken local reference -> ${rawUrl}`);
    }
  }
}

/**
 * Validate pages avoid executable inline JS/CSS and inline style attributes.
 * @param {string} filePath
 * @param {string} html
 * @param {string[]} errors
 * @returns {void}
 */
function validateInlineCode(filePath, html, errors) {
  const rel = relativeToPublic(filePath);

  const inlineScripts = [
    ...html.matchAll(/<script(?![^>]*src=)(?![^>]*type="application\/ld\+json")[^>]*>/gi),
  ];
  if (inlineScripts.length > 0) {
    errors.push(`${rel}: contains executable inline script blocks (${inlineScripts.length})`);
  }

  const inlineStyleTags = [...html.matchAll(/<style[^>]*>/gi)];
  if (inlineStyleTags.length > 0) {
    errors.push(`${rel}: contains inline <style> blocks (${inlineStyleTags.length})`);
  }

  const styleAttrs = [...html.matchAll(/\sstyle="[^"]*"/gi)];
  if (styleAttrs.length > 0) {
    errors.push(`${rel}: contains inline style attributes (${styleAttrs.length})`);
  }
}

/**
 * Read URL list from generated sitemap.
 * @returns {string[]}
 */
function parseSitemap() {
  const sitemapPath = path.join(PUBLIC_DIR, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    return [];
  }

  const xml = fs.readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

/**
 * Determine whether an HTML file should be indexable in sitemap.
 * @param {string} html
 * @param {string} relativePath
 * @returns {boolean}
 */
function isIndexable(html, relativePath) {
  if (relativePath === "404.html") {
    return false;
  }

  return !/<meta\s+name="robots"\s+content="[^">]*noindex/i.test(html);
}

/**
 * Validate sitemap contains all indexable pages and no non-indexable pages.
 * @param {string[]} htmlFiles
 * @param {string[]} errors
 * @returns {void}
 */
function validateSitemapCoverage(htmlFiles, errors) {
  const sitemapUrls = new Set(parseSitemap());
  const expectedUrls = new Set();

  for (const filePath of htmlFiles) {
    const rel = relativeToPublic(filePath);
    const html = fs.readFileSync(filePath, "utf8");

    if (!isIndexable(html, rel)) {
      continue;
    }

    const urlPath = htmlToUrlPath(rel);
    expectedUrls.add(`${SITE_URL}${urlPath}`);
  }

  for (const expected of expectedUrls) {
    if (!sitemapUrls.has(expected)) {
      errors.push(`sitemap.xml missing indexable URL -> ${expected}`);
    }
  }

  for (const loc of sitemapUrls) {
    if (!expectedUrls.has(loc)) {
      errors.push(`sitemap.xml contains non-indexable URL -> ${loc}`);
    }
  }
}

/**
 * Execute all static HTML and sitemap validations.
 * @returns {void}
 */
function main() {
  const errors = [];
  const htmlFiles = getHtmlFiles(PUBLIC_DIR);

  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, "utf8");
    validatePageMeta(filePath, html, errors);
    validateImageMeta(filePath, html, errors);
    validateLinks(filePath, html, errors);
    validateInlineCode(filePath, html, errors);
  }

  validateSitemapCoverage(htmlFiles, errors);

  if (errors.length > 0) {
    console.error("Site validation failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Validation passed for ${htmlFiles.length} HTML files.`);
}

main();
