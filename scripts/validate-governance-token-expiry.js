#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const LOG_DIR = path.join(ROOT, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "governance-token-expiry.md");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parse an ISO date literal (`YYYY-MM-DD`) as UTC midnight.
 * @param {string} value
 * @returns {Date|null}
 */
function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

/**
 * Normalize a date instance to UTC midnight.
 * @param {Date} input
 * @returns {Date}
 */
function toUtcMidnight(input) {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
}

/**
 * Compute integer day difference between two UTC midnight dates.
 * @param {Date} from
 * @param {Date} to
 * @returns {number}
 */
function diffDays(from, to) {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Persist evidence markdown.
 * @param {string[]} lines
 * @returns {void}
 */
function writeEvidence(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const expiryRaw = (process.env.GH_ADMIN_TOKEN_EXPIRES_ON || "").trim();
  const minDaysRaw = (process.env.GH_ADMIN_TOKEN_MIN_DAYS || "30").trim();
  const minDays = Number.parseInt(minDaysRaw, 10);

  const today = toUtcMidnight(new Date());
  const lines = [
    "# Governance Token Expiry Validation",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
  ];

  if (!Number.isInteger(minDays) || minDays < 1) {
    lines.push("Status: FAIL");
    lines.push(`- Invalid GH_ADMIN_TOKEN_MIN_DAYS value: \`${minDaysRaw}\``);
    writeEvidence(lines);
    console.error("Governance token expiry validation failed: invalid minimum-days threshold.");
    process.exit(1);
  }

  if (!expiryRaw) {
    lines.push("Status: FAIL");
    lines.push("- Missing `GH_ADMIN_TOKEN_EXPIRES_ON`.");
    lines.push(
      "- Set repository variable `GH_ADMIN_TOKEN_EXPIRES_ON` (format `YYYY-MM-DD`) to the actual fine-grained PAT expiry date.",
    );
    writeEvidence(lines);
    console.error("Governance token expiry validation failed: missing GH_ADMIN_TOKEN_EXPIRES_ON.");
    process.exit(1);
  }

  const expiryDate = parseIsoDate(expiryRaw);
  if (!expiryDate) {
    lines.push("Status: FAIL");
    lines.push(`- Invalid GH_ADMIN_TOKEN_EXPIRES_ON format: \`${expiryRaw}\``);
    lines.push("- Expected format: `YYYY-MM-DD`.");
    writeEvidence(lines);
    console.error("Governance token expiry validation failed: invalid GH_ADMIN_TOKEN_EXPIRES_ON.");
    process.exit(1);
  }

  const daysRemaining = diffDays(today, expiryDate);
  const passes = daysRemaining > minDays;

  lines.push(`Status: ${passes ? "PASS" : "FAIL"}`);
  lines.push(`- GH_ADMIN_TOKEN_EXPIRES_ON: ${expiryRaw}`);
  lines.push(`- Days remaining: ${daysRemaining}`);
  lines.push(`- Required minimum remaining days: > ${minDays}`);

  if (!passes) {
    lines.push(
      "- Action: rotate `GH_ADMIN_TOKEN`, update repo secret, update `GH_ADMIN_TOKEN_EXPIRES_ON`, rerun `Monthly Governance Audit`.",
    );
  }

  writeEvidence(lines);

  if (!passes) {
    console.error("Governance token expiry validation failed: token is too close to expiry.");
    process.exit(1);
  }

  console.log("Governance token expiry validation passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
