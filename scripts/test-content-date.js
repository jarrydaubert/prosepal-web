#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { resolveContentDate } = require("./resolve-content-date");

function withTempFiles(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "prosepal-content-date-test-"));
  try {
    const dataFile = path.join(root, "messages-pages.json");
    const llmsFile = path.join(root, "llms.txt");
    return callback({ root, dataFile, llmsFile });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function testEnvOverride() {
  const resolved = resolveContentDate({ envContentDate: "2026-01-15" });
  assert.equal(resolved, "2026-01-15");
}

function testMaxDateFromDataBeatsLlms() {
  withTempFiles(({ dataFile, llmsFile }) => {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        {
          pages: [
            { slug: "a", datePublished: "2026-02-01", dateModified: "2026-02-11" },
            { slug: "b", datePublished: "2026-02-05", dateModified: "2026-03-02" },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    fs.writeFileSync(llmsFile, "Last updated: 2026-02-20\n", "utf8");

    const resolved = resolveContentDate({ dataFile, llmsFile });
    assert.equal(resolved, "2026-03-02");
  });
}

function testLlmsFallbackWhenDataMissingDates() {
  withTempFiles(({ dataFile, llmsFile }) => {
    fs.writeFileSync(dataFile, JSON.stringify({ pages: [{ slug: "x" }] }, null, 2), "utf8");
    fs.writeFileSync(llmsFile, "Last updated: 2026-02-27\n", "utf8");

    const resolved = resolveContentDate({ dataFile, llmsFile });
    assert.equal(resolved, "2026-02-27");
  });
}

function testInvalidEnvThrows() {
  assert.throws(() => resolveContentDate({ envContentDate: "2026/01/15" }));
}

function main() {
  testEnvOverride();
  testMaxDateFromDataBeatsLlms();
  testLlmsFallbackWhenDataMissingDates();
  testInvalidEnvThrows();
  console.log("content-date resolver tests passed");
}

main();
