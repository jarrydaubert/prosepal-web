#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT_DIR, "public", "blog");
const MESSAGES_DIR = path.join(ROOT_DIR, "public", "messages");
const TEMPLATE_FILES = [
  path.join(ROOT_DIR, "templates", "blog-article.html"),
  path.join(ROOT_DIR, "templates", "message-page.html"),
];
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "heading-hierarchy.md");

function listHtmlFiles(dir, skipName) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".html") && name !== skipName)
    .map((name) => path.join(dir, name));
}

function relativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    [
      "# Heading Hierarchy Validation",
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
  const targetFiles = [
    ...TEMPLATE_FILES,
    ...listHtmlFiles(BLOG_DIR, "index.html"),
    ...listHtmlFiles(MESSAGES_DIR, "index.html"),
  ];

  const errors = [];

  for (const file of targetFiles) {
    const html = fs.readFileSync(file, "utf8");
    const headingMatches = [...html.matchAll(/<h([1-6])(?:\s|>)/gi)];

    let previousLevel = null;
    for (const match of headingMatches) {
      const currentLevel = Number.parseInt(match[1], 10);
      if (previousLevel !== null && currentLevel > previousLevel + 1) {
        const line = lineNumberAt(html, match.index ?? 0);
        errors.push(
          `${relativePath(file)}:${line} heading level skip: h${previousLevel} -> h${currentLevel}`,
        );
      }
      previousLevel = currentLevel;
    }
  }

  const evidenceLines = [
    `Targets scanned: ${targetFiles.length} files`,
    "- Scope: templates + blog articles + message detail pages",
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    evidenceLines.push("", "Findings:");
    evidenceLines.push(...errors.map((error) => `- ${error}`));
    writeEvidence(evidenceLines);
    console.error("Heading hierarchy validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("Heading hierarchy validation passed.");
  console.log(`Evidence written: ${relativePath(EVIDENCE_FILE)}`);
}

main();
