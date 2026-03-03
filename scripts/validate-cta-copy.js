#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const BLOG_DIR = path.join(PUBLIC_DIR, "blog");
const MESSAGES_DIR = path.join(PUBLIC_DIR, "messages");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "cta-copy-consistency.md");

const APPROVED_CTA_LABEL = "Get 3 Message Options";
const APPROVED_WAITLIST_LABEL = "Get Early Access";
const APPROVED_PROMISE_FRAGMENT = "under 30 seconds";
const DEPRECATED_STRINGS = [
  "Write Better Cards",
  "Get the App",
  "Try Prosepal Free",
  "Download Free on iOS",
  "Notify me",
  "in under 10 seconds",
  "under a minute",
  "in seconds.",
  "in seconds,",
];

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listHtmlFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith(".html"))
    .map((entry) => path.join(dir, entry));
}

/**
 * @param {string} absolutePath
 * @returns {string}
 */
function relativePath(absolutePath) {
  return path.relative(ROOT_DIR, absolutePath).replace(/\\/g, "/");
}

/**
 * @param {string} haystack
 * @param {string} needle
 * @returns {number[]}
 */
function findLineNumbers(haystack, needle) {
  const lines = haystack.split("\n");
  const matches = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(needle)) {
      matches.push(i + 1);
    }
  }
  return matches;
}

/**
 * @param {string[]} lines
 * @returns {void}
 */
function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    ["# CTA Copy Consistency", "", `Date: ${new Date().toISOString()}`, "", ...lines, ""].join(
      "\n",
    ),
    "utf8",
  );
}

function main() {
  const targetFiles = [
    path.join(PUBLIC_DIR, "index.html"),
    ...listHtmlFiles(BLOG_DIR),
    ...listHtmlFiles(MESSAGES_DIR),
  ];

  /** @type {{file: string, text: string}[]} */
  const docs = targetFiles.map((file) => ({
    file,
    text: fs.readFileSync(file, "utf8"),
  }));

  /** @type {string[]} */
  const errors = [];

  for (const deprecated of DEPRECATED_STRINGS) {
    for (const doc of docs) {
      const lines = findLineNumbers(doc.text, deprecated);
      if (lines.length > 0) {
        for (const line of lines) {
          errors.push(
            `${relativePath(doc.file)}:${line} contains deprecated copy: "${deprecated}"`,
          );
        }
      }
    }
  }

  const homeHtml = docs.find((doc) => doc.file.endsWith("/index.html"))?.text || "";
  const blogCombined = docs
    .filter((doc) => doc.file.startsWith(BLOG_DIR))
    .map((doc) => doc.text)
    .join("\n");
  const messagesCombined = docs
    .filter((doc) => doc.file.startsWith(MESSAGES_DIR))
    .map((doc) => doc.text)
    .join("\n");

  if (!homeHtml.includes(APPROVED_CTA_LABEL)) {
    errors.push("Homepage does not include the approved CTA label.");
  }
  if (!blogCombined.includes(APPROVED_CTA_LABEL)) {
    errors.push("Blog surfaces do not include the approved CTA label.");
  }
  if (!messagesCombined.includes(APPROVED_CTA_LABEL)) {
    errors.push("Messages surfaces do not include the approved CTA label.");
  }
  if (!homeHtml.includes(APPROVED_WAITLIST_LABEL)) {
    errors.push("Homepage waitlist does not include the approved value-forward label.");
  }
  if (!blogCombined.includes(APPROVED_WAITLIST_LABEL)) {
    errors.push("Blog surfaces do not include the approved value-forward waitlist label.");
  }
  if (!messagesCombined.includes(APPROVED_WAITLIST_LABEL)) {
    errors.push("Message surfaces do not include the approved value-forward waitlist label.");
  }

  if (!homeHtml.includes(APPROVED_PROMISE_FRAGMENT)) {
    errors.push('Homepage does not include approved promise fragment "under 30 seconds".');
  }
  if (!blogCombined.includes(APPROVED_PROMISE_FRAGMENT)) {
    errors.push('Blog surfaces do not include approved promise fragment "under 30 seconds".');
  }
  if (!messagesCombined.includes(APPROVED_PROMISE_FRAGMENT)) {
    errors.push('Message surfaces do not include approved promise fragment "under 30 seconds".');
  }

  const evidenceLines = [
    `Targets scanned: ${docs.length} HTML files`,
    "",
    "Approved copy source:",
    `- CTA label: "${APPROVED_CTA_LABEL}"`,
    `- Waitlist label: "${APPROVED_WAITLIST_LABEL}"`,
    `- Promise fragment: "${APPROVED_PROMISE_FRAGMENT}"`,
    "",
    "Deprecated strings checked:",
    ...DEPRECATED_STRINGS.map((item) => `- "${item}"`),
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    evidenceLines.push("", "Findings:");
    evidenceLines.push(...errors.map((error) => `- ${error}`));
    writeEvidence(evidenceLines);
    console.error("CTA copy consistency validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("CTA copy consistency validation passed.");
  console.log(`Evidence written: ${relativePath(EVIDENCE_FILE)}`);
}

main();
