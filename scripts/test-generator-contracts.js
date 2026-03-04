#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");
const MESSAGES_HUB_FILE = path.join(ROOT_DIR, "public", "messages", "index.html");
const SITEMAP_FILE = path.join(ROOT_DIR, "public", "sitemap.xml");
const LLMS_FILE = path.join(ROOT_DIR, "public", "llms.txt");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseMessagesDataCount() {
  const raw = read(DATA_FILE);
  const parsed = JSON.parse(raw);
  const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];
  return pages.length;
}

function parseItemListCount(html) {
  const match = html.match(/"numberOfItems"\s*:\s*(\d+)/);
  assert.ok(match, "messages hub ItemList.numberOfItems missing");
  return Number.parseInt(match[1], 10);
}

function parseLlmsCount(llms) {
  const match = llms.match(/- Message detail pages:\s*(\d+)/);
  assert.ok(match, "llms message detail pages count missing");
  return Number.parseInt(match[1], 10);
}

function extractSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((match) => match[1]);
}

function assertRepresentativeMessagePageContract() {
  const raw = JSON.parse(read(DATA_FILE));
  const pages = Array.isArray(raw?.pages) ? raw.pages : [];
  assert.ok(pages.length > 0, "messages data has no pages");

  const representativeSlug = pages[0].slug;
  const pagePath = path.join(ROOT_DIR, "public", "messages", `${representativeSlug}.html`);
  const html = read(pagePath);

  assert.match(html, /<link rel="canonical" href="https:\/\/www\.prosepal\.app\/messages\//);
  assert.match(html, /"@type":\s*"Article"/);
  assert.match(html, /"@type":\s*"HowTo"/);
  assert.match(html, /"@type":\s*"FAQPage"/);
  assert.match(html, /class="article-byline"/);
  assert.ok(!html.includes("{{"), "unresolved template placeholders found");
}

function assertSitemapContract(expectedMessageCount) {
  const xml = read(SITEMAP_FILE);
  const urls = extractSitemapUrls(xml);
  assert.ok(urls.length > expectedMessageCount, "sitemap unexpectedly small");

  const unique = new Set(urls);
  assert.equal(unique.size, urls.length, "sitemap contains duplicate <loc> URLs");

  const required = [
    "https://www.prosepal.app/",
    "https://www.prosepal.app/blog/",
    "https://www.prosepal.app/messages/",
  ];
  for (const url of required) {
    assert.ok(unique.has(url), `sitemap missing required url: ${url}`);
  }
}

function main() {
  const expectedMessageCount = parseMessagesDataCount();
  assert.ok(expectedMessageCount > 0, "canonical messages data count invalid");

  const messagesHubHtml = read(MESSAGES_HUB_FILE);
  const messagesHubItemListCount = parseItemListCount(messagesHubHtml);
  assert.equal(
    messagesHubItemListCount,
    expectedMessageCount,
    "messages hub ItemList count mismatch vs data/messages-pages.json",
  );

  const llmsRaw = read(LLMS_FILE);
  const llmsCount = parseLlmsCount(llmsRaw);
  assert.equal(
    llmsCount,
    expectedMessageCount,
    "llms message detail count mismatch vs data/messages-pages.json",
  );

  assertRepresentativeMessagePageContract();
  assertSitemapContract(expectedMessageCount);

  console.log("generator contract tests passed");
}

main();
