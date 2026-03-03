#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");
const HOME_FILE = path.join(ROOT_DIR, "public", "index.html");
const MESSAGES_HUB_FILE = path.join(ROOT_DIR, "public", "messages", "index.html");
const LLMS_FILE = path.join(ROOT_DIR, "public", "llms.txt");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "message-guide-count-consistency.md");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    [
      "# Message Guide Count Consistency",
      "",
      `Date: ${new Date().toISOString()}`,
      "",
      ...lines,
      "",
    ].join("\n"),
    "utf8",
  );
}

function parseCount(pattern, input, label) {
  const match = input.match(pattern);
  if (!match) {
    throw new Error(`Could not extract ${label}.`);
  }

  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for ${label}.`);
  }
  return value;
}

function main() {
  const data = JSON.parse(readText(DATA_FILE));
  const canonicalCount = Array.isArray(data.pages) ? data.pages.length : NaN;

  if (!Number.isFinite(canonicalCount)) {
    throw new Error(
      "Canonical message count missing in data/messages-pages.json (expected pages array).",
    );
  }

  const homeCount = parseCount(
    /<strong>\s*(\d+)\s*<\/strong>\s*[\r\n\t ]*<span>\s*Message guides\s*<\/span>/i,
    readText(HOME_FILE),
    "homepage message-guide tile count",
  );
  const schemaCount = parseCount(
    /"numberOfItems"\s*:\s*(\d+)/,
    readText(MESSAGES_HUB_FILE),
    "messages hub ItemList.numberOfItems",
  );
  const llmsCount = parseCount(
    /- Message detail pages:\s*(\d+)/,
    readText(LLMS_FILE),
    "llms message detail page count",
  );

  const checks = [
    { label: "Canonical (data/messages-pages.json pages length)", value: canonicalCount },
    { label: "Homepage metric tile", value: homeCount },
    { label: "Messages hub ItemList.numberOfItems", value: schemaCount },
    { label: "llms.txt message detail pages", value: llmsCount },
  ];

  const errors = checks
    .filter((check) => check.value !== canonicalCount)
    .map((check) => `${check.label} mismatch: expected ${canonicalCount}, found ${check.value}`);

  const evidenceLines = [
    "Source of truth: data/messages-pages.json (pages length)",
    "",
    ...checks.map((check) => `- ${check.label}: ${check.value}`),
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    evidenceLines.push("", "Findings:");
    evidenceLines.push(...errors.map((error) => `- ${error}`));
    writeEvidence(evidenceLines);
    console.error("Message-guide count consistency validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("Message-guide count consistency validation passed.");
  console.log(`Evidence written: ${path.relative(ROOT_DIR, EVIDENCE_FILE).replace(/\\/g, "/")}`);
}

main();
