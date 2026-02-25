#!/usr/bin/env node

const { execSync } = require("node:child_process");

/**
 * Exit with policy message.
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

/**
 * Read current git branch name.
 * @returns {string}
 */
function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
}

/**
 * Ensure working tree is clean before production deploy.
 * @returns {void}
 */
function ensureCleanTree() {
  const output = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  if (output.length > 0) {
    fail("Working tree must be clean before production deploy.");
  }
}

/**
 * Enforce production deploy policy.
 * Default path is Git-based release flow.
 * Local CLI prod deploy is allowed only for explicit owner emergency override.
 * @returns {void}
 */
function main() {
  if (process.env.ALLOW_PROD_CLI_DEPLOY !== "1") {
    fail(
      [
        "Local production deploy is blocked by policy.",
        "Default production path is merge-to-main Git flow.",
        "For owner emergency override only, rerun with ALLOW_PROD_CLI_DEPLOY=1.",
      ].join("\n"),
    );
  }

  const branch = getCurrentBranch();
  if (branch !== "main") {
    fail(`Emergency production deploy allowed only from main. Current branch: ${branch}`);
  }

  ensureCleanTree();
  console.log("Production deploy policy check passed (emergency override mode).");
}

main();
