#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const TARGET_FILE = path.join(
  ROOT_DIR,
  "public",
  "blog",
  "prosepal-vs-chatgpt-greeting-cards.html",
);
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "comparison-page-structure.md");

const REQUIRED_PATTERNS = [
  {
    label: "section anchor",
    pattern: /id="side-by-side-comparison"/,
  },
  {
    label: "semantic comparison table",
    pattern: /<table class="comparison-table">/,
  },
  {
    label: "workflow row",
    pattern: /<th scope="row">Workflow<\/th>/,
  },
  {
    label: "speed-to-draft row",
    pattern: /<th scope="row">Speed to first usable draft<\/th>/,
  },
  {
    label: "scope row",
    pattern: /<th scope="row">Scope<\/th>/,
  },
  {
    label: "best-fit use case row",
    pattern: /<th scope="row">Best-fit use case<\/th>/,
  },
];

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    [
      "# Comparison Page Structure Validation",
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
  const html = fs.readFileSync(TARGET_FILE, "utf8");
  const missing = REQUIRED_PATTERNS.filter((entry) => !entry.pattern.test(html));

  const evidenceLines = [
    `Target: ${path.relative(ROOT_DIR, TARGET_FILE).replace(/\\/g, "/")}`,
    "",
    "Checks:",
    ...REQUIRED_PATTERNS.map((entry) => {
      const passed = entry.pattern.test(html);
      return `- ${entry.label}: ${passed ? "PASS" : "FAIL"}`;
    }),
    "",
    `Result: ${missing.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (missing.length > 0) {
    evidenceLines.push("", "Missing:");
    evidenceLines.push(...missing.map((entry) => `- ${entry.label}`));
    writeEvidence(evidenceLines);
    console.error("Comparison page structure validation failed.");
    for (const entry of missing) {
      console.error(`- Missing ${entry.label}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("Comparison page structure validation passed.");
  console.log(`Evidence written: ${path.relative(ROOT_DIR, EVIDENCE_FILE).replace(/\\/g, "/")}`);
}

main();
