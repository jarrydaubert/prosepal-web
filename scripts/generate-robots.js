#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { renderRobotsTxt } = require("./lib/robots-policy");

const ROOT_DIR = path.join(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "public", "robots.txt");

function main() {
  fs.writeFileSync(OUTPUT_FILE, renderRobotsTxt(), "utf8");
  console.log(`Generated robots.txt -> ${OUTPUT_FILE}`);
}

main();
