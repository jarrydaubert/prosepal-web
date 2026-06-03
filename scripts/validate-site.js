#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const publicDir = path.join(root, "public");

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

const htmlFiles = walk(publicDir).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(publicDir, file);

  if (!html.includes("/css/site.css")) {
    fail(`public/${relative} does not include /css/site.css`);
  }

  for (const pattern of removedAssetPatterns) {
    if (pattern.test(html)) {
      fail(`public/${relative} still references removed CSS/JS assets`);
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

const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>https:\/\/www\.prosepal\.app([^<]*)<\/loc>/g)].map(
  ([, route]) => route,
);

if (sitemapUrls.length < 11) {
  fail("sitemap should keep the compact SEO surface, not collapse to only legal pages");
}

for (const route of sitemapUrls) {
  if (!fs.existsSync(fileForRoute(route))) {
    fail(`sitemap route does not resolve locally: ${route}`);
  }
}

if (!process.exitCode) {
  console.log(
    `validate-site: ${htmlFiles.length} HTML files and ${sitemapUrls.length} sitemap URLs OK`,
  );
}
