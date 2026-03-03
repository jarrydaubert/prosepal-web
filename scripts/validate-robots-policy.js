#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  ALLOWED_SEARCH_BOTS,
  BLOCKED_TRAINING_BOTS,
  DISALLOW_PATHS,
  renderRobotsTxt,
} = require("./lib/robots-policy");

const ROOT_DIR = path.join(__dirname, "..");
const ROBOTS_FILE = path.join(ROOT_DIR, "public", "robots.txt");
const GENERATOR_FILE = path.join(ROOT_DIR, "scripts", "generate-robots.js");
const EVIDENCE_DIR = path.join(ROOT_DIR, "docs", "evidence");
const EVIDENCE_FILE = path.join(EVIDENCE_DIR, "ai-crawler-policy-review.md");

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n");
}

function writeEvidence(lines) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(
    EVIDENCE_FILE,
    ["# AI Crawler Policy Review", "", `Date: ${new Date().toISOString()}`, "", ...lines, ""].join(
      "\n",
    ),
    "utf8",
  );
}

function main() {
  const errors = [];

  const actualRobots = normalizeNewlines(fs.readFileSync(ROBOTS_FILE, "utf8"));
  const expectedRobots = normalizeNewlines(renderRobotsTxt());
  if (actualRobots !== expectedRobots) {
    errors.push(
      "public/robots.txt is out of sync with scripts/lib/robots-policy.js (run bun run generate:robots).",
    );
  }

  const generatorSource = fs.readFileSync(GENERATOR_FILE, "utf8");
  if (!generatorSource.includes('require("./lib/robots-policy")')) {
    errors.push("scripts/generate-robots.js does not import the shared robots policy module.");
  }

  const overlap = ALLOWED_SEARCH_BOTS.filter((bot) => BLOCKED_TRAINING_BOTS.includes(bot));
  if (overlap.length > 0) {
    errors.push(`Bots cannot be both allowed and blocked: ${overlap.join(", ")}`);
  }

  const evidenceLines = [
    "Policy source of truth: scripts/lib/robots-policy.js",
    "",
    `- Allowed search/indexing bots: ${ALLOWED_SEARCH_BOTS.join(", ")}`,
    `- Blocked training bots: ${BLOCKED_TRAINING_BOTS.join(", ")}`,
    `- Shared disallow paths: ${DISALLOW_PATHS.join(", ")}`,
    "",
    `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  ];

  if (errors.length > 0) {
    evidenceLines.push("", "Findings:");
    evidenceLines.push(...errors.map((error) => `- ${error}`));
    writeEvidence(evidenceLines);
    console.error("AI crawler policy validation failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  writeEvidence(evidenceLines);
  console.log("AI crawler policy validation passed.");
  console.log(`Evidence written: ${path.relative(ROOT_DIR, EVIDENCE_FILE).replace(/\\/g, "/")}`);
}

main();
