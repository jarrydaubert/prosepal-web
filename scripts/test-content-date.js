#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { SITE_URL } = require("./lib/metadata");
const {
  extractDatePairFromHtml,
  getEditorialDatesForPath,
  loadEditorialMetadata,
  readDatePairFromHtmlFile,
} = require("./lib/editorial-dates");
const { resolveContentDate } = require("./resolve-content-date");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function withTempFiles(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "prosepal-content-date-test-"));
  try {
    const metadataFile = path.join(root, "editorial-metadata.json");
    const blogFile = path.join(root, "blog-entry.html");
    return callback({ root, metadataFile, blogFile });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function testEnvOverride() {
  const resolved = resolveContentDate({ envContentDate: "2026-01-15" });
  assert.equal(resolved, "2026-01-15");
}

function testMaxDateFromMetadataAndInlineHtml() {
  withTempFiles(({ metadataFile, blogFile }) => {
    fs.writeFileSync(
      metadataFile,
      JSON.stringify(
        {
          pages: {
            "/": { datePublished: "2026-02-01", dateModified: "2026-02-11" },
            "/messages/a.html": { datePublished: "2026-02-05", dateModified: "2026-02-22" },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    fs.writeFileSync(
      blogFile,
      `<!doctype html><script type="application/ld+json">{"datePublished":"2026-02-20","dateModified":"2026-03-02"}</script>`,
      "utf8",
    );

    const metadata = loadEditorialMetadata({ file: metadataFile });
    const resolved = resolveContentDate({ metadata, blogHtmlFiles: [blogFile] });
    assert.equal(resolved, "2026-03-02");
  });
}

function testMissingEditorialDatesThrow() {
  withTempFiles(({ metadataFile, blogFile }) => {
    fs.writeFileSync(metadataFile, JSON.stringify({ pages: {} }, null, 2), "utf8");
    fs.writeFileSync(blogFile, "<!doctype html><title>Missing dates</title>", "utf8");

    const metadata = loadEditorialMetadata({ file: metadataFile });
    assert.throws(() => resolveContentDate({ metadata, blogHtmlFiles: [blogFile] }));
  });
}

function testInvalidEnvThrows() {
  assert.throws(() => resolveContentDate({ envContentDate: "2026/01/15" }));
}

function readPublicFile(relativePath) {
  return fs.readFileSync(path.join(PUBLIC_DIR, relativePath), "utf8");
}

function readSitemapLastmodMap() {
  const xml = readPublicFile("sitemap.xml");
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];
  return new Map(matches.map((match) => [match[1], match[2]]));
}

function testGeneratedMessageDatesMatchMetadata() {
  const metadata = loadEditorialMetadata();

  const checks = [
    {
      pathname: "/messages/birthday-card-message-for-friend.html",
      filePath: path.join(PUBLIC_DIR, "messages", "birthday-card-message-for-friend.html"),
    },
    {
      pathname: "/messages/",
      filePath: path.join(PUBLIC_DIR, "messages", "index.html"),
    },
  ];

  for (const check of checks) {
    const expected = getEditorialDatesForPath(check.pathname, { metadata });
    const actual = readDatePairFromHtmlFile(check.filePath);
    assert.deepEqual(actual, expected, `generated dates drifted for ${check.pathname}`);
  }
}

function testStaticBlogDatesRemainExplicit() {
  const html = readPublicFile(path.join("blog", "what-to-write-in-sympathy-card.html"));
  const dates = extractDatePairFromHtml(html, "public/blog/what-to-write-in-sympathy-card.html");
  assert.deepEqual(dates, {
    datePublished: "2026-01-17",
    dateModified: "2026-01-17",
  });
}

function testSitemapLastmodMatchesEditorialSources() {
  const metadata = loadEditorialMetadata();
  const lastmods = readSitemapLastmodMap();

  assert.equal(lastmods.get(`${SITE_URL}/`), "2026-03-11");
  assert.equal(lastmods.get(`${SITE_URL}/messages/`), "2026-03-11");
  assert.equal(
    lastmods.get(`${SITE_URL}/messages/birthday-card-message-for-friend.html`),
    "2026-03-01",
  );
  assert.equal(lastmods.get(`${SITE_URL}/blog/what-to-write-in-sympathy-card.html`), "2026-01-17");

  const homepageDates = getEditorialDatesForPath("/", { metadata });
  assert.equal(lastmods.get(`${SITE_URL}/`), homepageDates.dateModified);
  assert.notEqual(
    lastmods.get(`${SITE_URL}/`),
    lastmods.get(`${SITE_URL}/blog/what-to-write-in-sympathy-card.html`),
    "sitemap lastmod should not collapse to one synthetic date",
  );
}

function main() {
  testEnvOverride();
  testMaxDateFromMetadataAndInlineHtml();
  testMissingEditorialDatesThrow();
  testInvalidEnvThrows();
  testGeneratedMessageDatesMatchMetadata();
  testStaticBlogDatesRemainExplicit();
  testSitemapLastmodMatchesEditorialSources();
  console.log("content-date resolver tests passed");
}

main();
