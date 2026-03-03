#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { SITE_URL } = require("./lib/metadata");
const {
  ALLOWED_SEARCH_BOTS,
  BLOCKED_TRAINING_BOTS,
  DISALLOW_PATHS,
} = require("./lib/robots-policy");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");

/**
 * Read a generated file from `public/`.
 * @param {string} fileName
 * @returns {string}
 */
function readPublicFile(fileName) {
  return fs.readFileSync(path.join(PUBLIC_DIR, fileName), "utf8");
}

/**
 * Count generated message detail pages from source data.
 * @returns {number}
 */
function readMessageCount() {
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  return Array.isArray(raw.pages) ? raw.pages.length : 0;
}

/**
 * Count blog article pages (excluding index).
 * @returns {number}
 */
function readBlogCount() {
  const blogDir = path.join(PUBLIC_DIR, "blog");
  return fs.readdirSync(blogDir).filter((name) => name.endsWith(".html") && name !== "index.html")
    .length;
}

/**
 * Assert crawler policy and sitemap declaration in robots.txt.
 * @returns {void}
 */
function testRobots() {
  const robots = readPublicFile("robots.txt");

  for (const bot of ALLOWED_SEARCH_BOTS) {
    assert.match(
      robots,
      new RegExp(`User-agent: ${bot}`),
      `robots.txt missing allow rule for ${bot}`,
    );
  }

  for (const bot of BLOCKED_TRAINING_BOTS) {
    assert.match(
      robots,
      new RegExp(`User-agent: ${bot}[\\s\\S]*?Disallow: /`),
      `robots.txt missing block rule for ${bot}`,
    );
  }

  for (const disallowPath of DISALLOW_PATHS) {
    assert.match(
      robots,
      new RegExp(`Disallow: ${disallowPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      `robots.txt missing Disallow path ${disallowPath}`,
    );
  }

  assert.match(
    robots,
    new RegExp(`Sitemap: ${SITE_URL}/sitemap\\.xml`),
    "robots.txt missing sitemap declaration",
  );
}

/**
 * Assert sitemap coverage and canonical-domain constraints.
 * @returns {void}
 */
function testSitemap() {
  const sitemap = readPublicFile("sitemap.xml");
  const locMatches = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)];
  const urls = locMatches.map((match) => match[1]);
  const uniqueUrls = new Set(urls);

  assert.ok(urls.length > 0, "sitemap.xml has no URLs");
  assert.equal(uniqueUrls.size, urls.length, "sitemap.xml contains duplicate URLs");
  assert.ok(urls.includes(`${SITE_URL}/`), "sitemap.xml missing homepage");
  assert.ok(urls.includes(`${SITE_URL}/messages/`), "sitemap.xml missing messages hub");
  assert.ok(urls.includes(`${SITE_URL}/blog/`), "sitemap.xml missing blog hub");
  assert.ok(
    !urls.some((url) => url.endsWith("/404.html")),
    "sitemap.xml should not include 404 page",
  );
  assert.ok(
    urls.every((url) => url.startsWith(SITE_URL)),
    "sitemap.xml has non-canonical domain URLs",
  );
}

/**
 * Assert llms.txt structure, links, and coverage counts.
 * @returns {void}
 */
function testLlms() {
  const llms = readPublicFile("llms.txt");
  const messageCount = readMessageCount();
  const blogCount = readBlogCount();

  assert.match(llms, /# Prosepal/, "llms.txt missing project header");
  assert.match(llms, /## Message Guides by Occasion/, "llms.txt missing grouped message section");
  assert.match(llms, /## Blog Guides/, "llms.txt missing blog section");
  assert.match(llms, /## Crawler & AI Policy/, "llms.txt missing crawler policy section");
  assert.match(
    llms,
    new RegExp(`\\[Sitemap\\]\\(${SITE_URL}/sitemap\\.xml\\)`),
    "llms.txt missing sitemap link",
  );
  assert.match(
    llms,
    new RegExp(`\\[Robots\\]\\(${SITE_URL}/robots\\.txt\\)`),
    "llms.txt missing robots link",
  );
  assert.ok(
    !/&#\d+;|&#x[0-9a-f]+;|&amp;|&apos;|&quot;/i.test(llms),
    "llms.txt contains raw HTML entities",
  );

  const messageLinks = [
    ...llms.matchAll(new RegExp(`\\(${SITE_URL}/messages/[^)]+\\.html\\)`, "g")),
  ];
  const blogLinks = [...llms.matchAll(new RegExp(`\\(${SITE_URL}/blog/[^)]+\\.html\\)`, "g"))];

  assert.equal(
    messageLinks.length,
    messageCount,
    `llms.txt message-link count mismatch: expected ${messageCount}, got ${messageLinks.length}`,
  );
  assert.equal(
    blogLinks.length,
    blogCount,
    `llms.txt blog-link count mismatch: expected ${blogCount}, got ${blogLinks.length}`,
  );
}

/**
 * Run all SEO artifact assertions.
 * @returns {void}
 */
function main() {
  testRobots();
  testSitemap();
  testLlms();
  console.log("SEO artifact tests passed");
}

main();
