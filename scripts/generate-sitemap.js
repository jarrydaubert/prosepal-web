#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "sitemap.xml");

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

function toPublicPath(fullPath) {
  return fullPath.replace(`${PUBLIC_DIR}${path.sep}`, "").split(path.sep).join("/");
}

function toUrlPath(publicPath) {
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

function extractSlug(urlPath) {
  const clean = urlPath.replace(/\/$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1].replace(/\.html$/, "");
}

function getIntentTier(slug) {
  if (HIGH_INTENT_TOPICS.some((topic) => slug.includes(topic))) {
    return "high";
  }

  if (MEDIUM_INTENT_TOPICS.some((topic) => slug.includes(topic))) {
    return "medium";
  }

  return "longtail";
}

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

  if (urlPath === "/support.html") return "0.40";
  if (urlPath === "/privacy.html" || urlPath === "/terms.html") return "0.20";
  return "0.5";
}

function getChangeFreq(urlPath) {
  if (urlPath === "/" || urlPath === "/messages/" || urlPath === "/blog/") return "weekly";

  if (urlPath.startsWith("/messages/") || urlPath.startsWith("/blog/")) {
    return "monthly";
  }

  if (urlPath === "/privacy.html" || urlPath === "/terms.html") {
    return "yearly";
  }

  return "monthly";
}

function toLastMod(filePath) {
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

function isIndexable(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
}

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
