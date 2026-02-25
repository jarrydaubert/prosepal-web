#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;
const ROOT = path.join(__dirname, "..");
const RELEASES_DIR = path.join(ROOT, "docs", "releases");

/**
 * Exit with error.
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

/**
 * Build release note template.
 * @param {string} version
 * @returns {string}
 */
function buildTemplate(version) {
  return [
    `# ${version}`,
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Summary",
    "",
    "-",
    "",
    "## Changes",
    "",
    "-",
    "",
    "## Verification",
    "",
    "- bun run check",
    "- validate:social:prod",
    "- validate:schema:prod",
    "",
  ].join("\n");
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  const version = process.argv[2];
  if (!version || !VERSION_PATTERN.test(version)) {
    fail("Usage: bun run release:prepare -- vX.Y.Z");
  }

  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  const notesPath = path.join(RELEASES_DIR, `${version}.md`);

  if (fs.existsSync(notesPath)) {
    console.log(`Release notes already exist: ${path.relative(ROOT, notesPath)}`);
  } else {
    fs.writeFileSync(notesPath, buildTemplate(version), "utf8");
    console.log(`Created release notes template: ${path.relative(ROOT, notesPath)}`);
  }

  console.log("\nNext steps:");
  console.log(`1) Update notes file: docs/releases/${version}.md`);
  console.log(`2) Create local tag: git tag -a ${version} -m "Release ${version}"`);
  console.log(`3) Push tag: git push origin ${version}`);
}

main();
