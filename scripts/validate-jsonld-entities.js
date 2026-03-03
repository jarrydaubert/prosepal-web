#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const MESSAGES_DIR = path.join(ROOT_DIR, "public", "messages");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "jsonld-entity-leakage.md");
const ENTITY_PATTERN = /&(amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/i;

function extractJsonLdBlocks(html) {
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(regex)].map((match) => match[1].trim());
}

function listMessagePages() {
  return fs
    .readdirSync(MESSAGES_DIR)
    .filter((fileName) => fileName.endsWith(".html") && fileName !== "index.html")
    .map((fileName) => path.join(MESSAGES_DIR, fileName))
    .sort();
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    [
      "# JSON-LD Entity Leakage Validation",
      "",
      `Date: ${new Date().toISOString()}`,
      "",
      ...lines,
      "",
    ].join("\n"),
    "utf8",
  );
}

function walkValues(node, pointer, leaks) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      walkValues(node[i], `${pointer}[${i}]`, leaks);
    }
    return;
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      walkValues(value, pointer ? `${pointer}.${key}` : key, leaks);
    }
    return;
  }

  if (typeof node === "string" && ENTITY_PATTERN.test(node)) {
    leaks.push(`${pointer}: ${node}`);
  }
}

function relativePath(absolutePath) {
  return path.relative(ROOT_DIR, absolutePath).replace(/\\/g, "/");
}

function main() {
  const files = listMessagePages();
  const errors = [];

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const blocks = extractJsonLdBlocks(html);

    for (const [index, block] of blocks.entries()) {
      let parsed;
      try {
        parsed = JSON.parse(block);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${relativePath(file)} block ${index + 1}: invalid JSON-LD (${message})`);
        continue;
      }

      const leaks = [];
      walkValues(parsed, "", leaks);
      for (const leak of leaks) {
        errors.push(`${relativePath(file)} block ${index + 1}: ${leak}`);
      }
    }
  }

  const lines = [
    `Targets scanned: ${files.length} message detail pages`,
    "- Scope: all JSON-LD script blocks in generated message pages",
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    lines.push("", "Findings:");
    lines.push(...errors.map((error) => `- ${error}`));
  }

  writeEvidence(lines);

  if (errors.length > 0) {
    console.error("JSON-LD entity leakage validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("JSON-LD entity leakage validation passed.");
  console.log(`Evidence written: ${relativePath(EVIDENCE_FILE)}`);
}

main();
