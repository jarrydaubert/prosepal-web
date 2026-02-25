#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");

function run(command) {
  execSync(command, {
    stdio: "inherit",
    cwd: ROOT_DIR,
  });
}

function main() {
  run("node scripts/generate-messages.js");
  run("node scripts/generate-sitemap.js");
  run("node scripts/generate-robots.js");
  run("node scripts/generate-llms.js");
}

main();
