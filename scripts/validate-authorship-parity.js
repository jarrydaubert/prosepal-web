#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "authorship-parity.md");

const CASES = [
  {
    label: "blog sample",
    file: path.join(ROOT_DIR, "public", "blog", "what-to-write-in-sympathy-card.html"),
  },
  {
    label: "message sample",
    file: path.join(ROOT_DIR, "public", "messages", "birthday-card-message-for-friend.html"),
  },
];

const BYLINE_PATTERN =
  /<p class="article-byline">Reviewed by <strong>Prosepal Editorial Team<\/strong> · Greeting card writing specialists<\/p>/;
const SCHEMA_AUTHOR_PATTERN =
  /"author"\s*:\s*\{\s*"@type"\s*:\s*"Organization",\s*"name"\s*:\s*"Prosepal Editorial Team"/m;

function relativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    [
      "# Authorship Parity Validation",
      "",
      `Date: ${new Date().toISOString()}`,
      "",
      ...lines,
      "",
    ].join("\n"),
    "utf8",
  );
}

function main() {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const notes = [];

  for (const entry of CASES) {
    const html = fs.readFileSync(entry.file, "utf8");
    const hasByline = BYLINE_PATTERN.test(html);
    const hasSchemaAuthor = SCHEMA_AUTHOR_PATTERN.test(html);

    notes.push(`- ${entry.label}: ${relativePath(entry.file)}`);
    notes.push(`  - byline present: ${hasByline ? "yes" : "no"}`);
    notes.push(`  - schema author parity: ${hasSchemaAuthor ? "yes" : "no"}`);

    if (!hasByline) {
      errors.push(`${entry.label} missing visible byline.`);
    }
    if (!hasSchemaAuthor) {
      errors.push(`${entry.label} missing Organization author parity in JSON-LD.`);
    }
  }

  const evidenceLines = [
    "Checks:",
    ...notes,
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    evidenceLines.push("", "Findings:");
    evidenceLines.push(...errors.map((error) => `- ${error}`));
    writeEvidence(evidenceLines);
    console.error("Authorship parity validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("Authorship parity validation passed.");
  console.log(`Evidence written: ${relativePath(EVIDENCE_FILE)}`);
}

main();
