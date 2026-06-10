#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const publicDir = path.join(root, "public");

// Canonical host decision (2026-06-10): apex, matching the production redirect
// and the iOS app's associated-domains entitlement.
const canonicalOrigin = "https://prosepal.app";
const bannedHostPattern = /www\.prosepal\.app/;

const requiredFiles = [
  "index.html",
  "messages/index.html",
  "blog/index.html",
  "blog/birthday-card-messages.html",
  "blog/graduation-card-messages.html",
  "blog/is-prosepal-pro-worth-it.html",
  "blog/prosepal-vs-chatgpt-greeting-cards.html",
  "blog/thank-you-card-wording.html",
  "blog/wedding-card-message.html",
  "blog/what-to-write-in-sympathy-card.html",
  "privacy.html",
  "terms.html",
  "support.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "css/site.css",
  "js/site.js",
  "app-store-badge.svg",
  "og-image-v5.jpg",
  ".well-known/apple-app-site-association",
];

const removedAssetPatterns = [
  /\/css\/(?:tokens|nav|footer|home|home-deferred|content|messages|blog|support|not-found)\.css/,
  /\/js\/(?:analytics|experiments|home|home-enhancements|home-font-loader|content-font-loader|mobile-menu|not-found-analytics)\.js/,
];

// Pages intentionally without the shared site chrome.
const chromeExempt = new Set(["404.html"]);
const headerPattern = /<header class="site-header">[\s\S]*?<\/header>/;
const footerPattern = /<footer>[\s\S]*?<\/footer>/;

function fail(message) {
  console.error(`validate-site: ${message}`);
  process.exitCode = 1;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(absolute);
    }
    return absolute;
  });
}

function fileForRoute(route) {
  const cleanRoute = route.split("#")[0].split("?")[0];
  if (cleanRoute === "/") {
    return path.join(publicDir, "index.html");
  }
  if (cleanRoute.endsWith("/")) {
    return path.join(publicDir, cleanRoute, "index.html");
  }
  const extension = path.extname(cleanRoute);
  if (extension) {
    return path.join(publicDir, cleanRoute);
  }
  return path.join(publicDir, `${cleanRoute}.html`);
}

function extractChromeBlock(html, pattern) {
  const match = html.match(pattern);
  return match ? match[0].replace(/\s+/g, " ").trim() : null;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(publicDir, file))) {
    fail(`missing required file public/${file}`);
  }
}

const messageDetailPages = fs
  .readdirSync(path.join(publicDir, "messages"))
  .filter((file) => file.endsWith(".html") && file !== "index.html");

if (messageDetailPages.length > 0) {
  fail(`expected only messages/index.html, found: ${messageDetailPages.join(", ")}`);
}

const referenceHtml = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
const referenceHeader = extractChromeBlock(referenceHtml, headerPattern);
const referenceFooter = extractChromeBlock(referenceHtml, footerPattern);

if (!referenceHeader || !referenceFooter) {
  fail("public/index.html is missing the reference site header or footer");
}

const htmlFiles = walk(publicDir).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(publicDir, file);

  if (!html.includes("/css/site.css")) {
    fail(`public/${relative} does not include /css/site.css`);
  }

  if (bannedHostPattern.test(html)) {
    fail(`public/${relative} references www.prosepal.app; canonical host is ${canonicalOrigin}`);
  }

  if (relative !== "404.html" && !html.includes(`<link rel="canonical" href="${canonicalOrigin}`)) {
    fail(`public/${relative} is missing a canonical link on ${canonicalOrigin}`);
  }

  for (const pattern of removedAssetPatterns) {
    if (pattern.test(html)) {
      fail(`public/${relative} still references removed CSS/JS assets`);
    }
  }

  const ldBlocks = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const [, json] of ldBlocks) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(`public/${relative} has invalid JSON-LD: ${error.message}`);
    }
  }

  if (!chromeExempt.has(relative)) {
    if (extractChromeBlock(html, headerPattern) !== referenceHeader) {
      fail(`public/${relative} site header drifts from public/index.html`);
    }
    if (extractChromeBlock(html, footerPattern) !== referenceFooter) {
      fail(`public/${relative} footer drifts from public/index.html`);
    }
  }

  const attributes = html.matchAll(/\s(?:href|src|action)=["']([^"']+)["']/g);
  for (const [, value] of attributes) {
    if (
      value.startsWith("http") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("#") ||
      value.startsWith("data:")
    ) {
      continue;
    }

    if (!value.startsWith("/")) {
      continue;
    }

    const target = fileForRoute(value);
    if (!fs.existsSync(target)) {
      fail(`public/${relative} links to missing local target ${value}`);
    }
  }
}

for (const file of ["sitemap.xml", "robots.txt", "llms.txt"]) {
  const content = fs.readFileSync(path.join(publicDir, file), "utf8");
  if (bannedHostPattern.test(content)) {
    fail(`public/${file} references www.prosepal.app; canonical host is ${canonicalOrigin}`);
  }
}

const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
const sitemapEntries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];

const sitemapUrls = [];
for (const [, loc, lastmod] of sitemapEntries) {
  if (!loc.startsWith(`${canonicalOrigin}/`)) {
    fail(`sitemap URL is not on the canonical host: ${loc}`);
    continue;
  }

  const route = loc.slice(canonicalOrigin.length);
  sitemapUrls.push(route);

  if (!fs.existsSync(fileForRoute(route))) {
    fail(`sitemap route does not resolve locally: ${route}`);
    continue;
  }

  if (route.startsWith("/blog/") && route.endsWith(".html")) {
    const page = fs.readFileSync(fileForRoute(route), "utf8");
    const modified = page.match(/"dateModified":\s*"([^"]+)"/);
    if (modified && modified[1] !== lastmod) {
      fail(
        `sitemap lastmod ${lastmod} does not match JSON-LD dateModified ${modified[1]} for ${route}`,
      );
    }
  }
}

if (sitemapUrls.length < 11) {
  fail("sitemap should keep the compact SEO surface, not collapse to only legal pages");
}

if (!process.exitCode) {
  console.log(
    `validate-site: ${htmlFiles.length} HTML files and ${sitemapUrls.length} sitemap URLs OK`,
  );
}
