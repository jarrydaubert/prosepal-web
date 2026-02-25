#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "llms.txt");
const MESSAGE_DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");
const OCCASION_ORDER = [
  "Sympathy",
  "Birthday",
  "Thank You",
  "Wedding",
  "Graduation",
  "Get Well",
  "New Baby",
  "Retirement",
  "Christmas",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
];
const ALLOWED_SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
];
const BLOCKED_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sanitizeForMarkdown(text) {
  return decodeHtmlEntities(text)
    .replace(/\n+/g, " ")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMeta(filePath, name) {
  const html = fs.readFileSync(filePath, "utf8");
  const safeName = escapeRegex(name);
  const pattern = new RegExp(`<meta\\s+name=["']${safeName}["']\\s+content=(["'])(.*?)\\1`, "i");
  const match = html.match(pattern);
  return match ? sanitizeForMarkdown(match[2]) : "";
}

function extractTitle(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? sanitizeForMarkdown(match[1]) : path.basename(filePath);
}

function loadMessageCatalog() {
  const raw = JSON.parse(fs.readFileSync(MESSAGE_DATA_FILE, "utf8"));
  return Array.isArray(raw.pages) ? raw.pages : [];
}

function occasionRank(occasion) {
  const idx = OCCASION_ORDER.indexOf(occasion);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function listBlogPages() {
  const dir = path.join(PUBLIC_DIR, "blog");
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .sort()
    .map((fileName) => {
      const filePath = path.join(dir, fileName);
      return {
        fileName,
        url: `${SITE_URL}/blog/${fileName}`,
        title: extractTitle(filePath),
        description: extractMeta(filePath, "description"),
      };
    });
}

function listMessagePages() {
  const dir = path.join(PUBLIC_DIR, "messages");
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .sort()
    .map((fileName) => {
      const filePath = path.join(dir, fileName);
      return {
        fileName,
        url: `${SITE_URL}/messages/${fileName}`,
        title: extractTitle(filePath),
        description: extractMeta(filePath, "description"),
      };
    });
}

function main() {
  const messageCatalog = loadMessageCatalog();
  const occasionByFile = new Map(
    messageCatalog.map((page) => [`${page.slug}.html`, page.occasion || "Other"]),
  );

  const messagePages = listMessagePages();
  const blogPages = listBlogPages();
  const today = new Date().toISOString().slice(0, 10);

  const groupedMessages = new Map();
  for (const page of messagePages) {
    const occasion = occasionByFile.get(page.fileName) || "Other";
    if (!groupedMessages.has(occasion)) {
      groupedMessages.set(occasion, []);
    }
    groupedMessages.get(occasion).push(page);
  }

  const messageSection = [...groupedMessages.entries()]
    .sort((a, b) => {
      const rankDiff = occasionRank(a[0]) - occasionRank(b[0]);
      return rankDiff === 0 ? a[0].localeCompare(b[0]) : rankDiff;
    })
    .map(([occasion, pages]) => {
      const items = pages
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((page) => `- [${page.title}](${page.url}): ${page.description}`)
        .join("\n");
      return `### ${occasion} (${pages.length})\n${items}`;
    })
    .join("\n\n");

  const blogSection = blogPages
    .map((page) => `- [${page.title}](${page.url}): ${page.description}`)
    .join("\n");

  const content = `# Prosepal

> AI-powered greeting card message generator for birthdays, sympathy, thank-you notes, weddings, and more.

Last updated: ${today}

Prosepal helps users turn blank-card anxiety into clear, natural wording. The web experience is content-led (message examples and blog guides) with App Store conversion as the primary product CTA.

## Main Pages

- [Home](${SITE_URL}/): Landing page and app download links
- [Messages Hub](${SITE_URL}/messages/): Message examples by occasion and relationship
- [Blog Hub](${SITE_URL}/blog/): Writing guides and card wording help
- [Privacy](${SITE_URL}/privacy.html)
- [Terms](${SITE_URL}/terms.html)
- [Support](${SITE_URL}/support.html)

## Coverage Snapshot

- Message detail pages: ${messagePages.length}
- Blog guides: ${blogPages.length}
- Primary platform: iOS

## Message Guides by Occasion

${messageSection}

## Blog Guides

${blogSection}

## Product

- iOS App Store: https://apps.apple.com/app/prosepal/id6757088726
- Pricing: Free trial generation, Pro monthly/yearly
- Platform: iOS (Android waitlist available on site)

## Crawler & AI Policy

- Allowed search/indexing bots: ${ALLOWED_SEARCH_BOTS.join(", ")}
- Blocked training bots: ${BLOCKED_TRAINING_BOTS.join(", ")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots](${SITE_URL}/robots.txt)
`;

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`Generated llms.txt -> ${OUTPUT_FILE}`);
}

main();
