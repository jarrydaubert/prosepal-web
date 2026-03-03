#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "title-length-validation.md");

const TARGETS = [
  {
    file: "public/index.html",
    min: 45,
    max: 65,
    requiredPatterns: [/greeting card message/i, /occasion/i],
  },
  {
    file: "public/blog/prosepal-vs-chatgpt-greeting-cards.html",
    min: 40,
    max: 65,
    requiredPatterns: [/prosepal vs chatgpt/i, /greeting cards?/i],
  },
  {
    file: "public/blog/is-prosepal-pro-worth-it.html",
    min: 40,
    max: 65,
    requiredPatterns: [/prosepal pro/i, /worth/i, /(pricing|value)/i],
  },
  {
    file: "public/blog/what-to-write-in-sympathy-card.html",
    min: 40,
    max: 65,
    requiredPatterns: [/what to write/i, /sympathy card/i, /50/i],
  },
];

function readTitle(absoluteFilePath) {
  const html = fs.readFileSync(absoluteFilePath, "utf8");
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) {
    throw new Error(`Missing <title> in ${absoluteFilePath}`);
  }
  return match[1].trim();
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    ["# Title Length Validation", "", `Date: ${new Date().toISOString()}`, "", ...lines, ""].join(
      "\n",
    ),
    "utf8",
  );
}

function main() {
  const errors = [];
  const lines = [
    "Guidance:",
    "- Keep high-priority page titles concise (usually 45-65 characters including brand suffix).",
    "- Preserve primary query intent in each title (no ambiguity after shortening).",
    "",
    "Target pages:",
  ];

  for (const target of TARGETS) {
    const absolutePath = path.join(ROOT_DIR, target.file);
    const title = readTitle(absolutePath);
    const length = title.length;

    lines.push(`- ${target.file}: ${length} chars -> ${title}`);

    if (length < target.min || length > target.max) {
      errors.push(
        `${target.file} title length out of range (${target.min}-${target.max}): found ${length}`,
      );
    }

    for (const pattern of target.requiredPatterns) {
      if (!pattern.test(title)) {
        errors.push(`${target.file} title missing required intent fragment: ${pattern}`);
      }
    }
  }

  lines.push("", `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  if (errors.length > 0) {
    lines.push("", "Findings:");
    lines.push(...errors.map((error) => `- ${error}`));
  }

  writeEvidence(lines);

  if (errors.length > 0) {
    console.error("Title length validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Title length validation passed.");
  console.log(`Evidence written: ${path.relative(ROOT_DIR, EVIDENCE_FILE).replace(/\\/g, "/")}`);
}

main();
