#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.join(__dirname, "..");
const LOG_DIR = path.join(ROOT_DIR, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "ci-usage-budget.md");
const REPO = process.env.GH_REPO || "jarrydaubert/prosepal-web";
const RUN_LIMIT = 100;
const WINDOW_DAYS = 30;
const API_RETRY_ATTEMPTS = 12;
const API_RETRY_DELAY_SECONDS = 5;
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE_GH_AUDITS === "1";

const BUDGETS = {
  monthlyMinutesMax: 180,
  webQualityAvgMinutesMax: 3,
  codeqlAvgMinutesMax: 8,
};

/**
 * Pause before retry.
 * @param {number} seconds
 * @returns {void}
 */
function sleep(seconds) {
  execFileSync("sleep", [String(seconds)], {
    cwd: ROOT_DIR,
    stdio: ["ignore", "ignore", "ignore"],
  });
}

/**
 * Parse date safely.
 * @param {string} value
 * @returns {Date|null}
 */
function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Execute gh run list and return JSON.
 * @returns {Array<{
 *   workflowName: string,
 *   status: string,
 *   conclusion: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
function fetchRuns() {
  /** @type {unknown} */
  let lastError;

  for (let attempt = 1; attempt <= API_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const stdout = execFileSync(
        "gh",
        [
          "run",
          "list",
          "--repo",
          REPO,
          "--limit",
          String(RUN_LIMIT),
          "--json",
          "workflowName,status,conclusion,createdAt,updatedAt",
        ],
        {
          cwd: ROOT_DIR,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      return JSON.parse(stdout);
    } catch (error) {
      lastError = error;
      if (attempt < API_RETRY_ATTEMPTS) {
        sleep(API_RETRY_DELAY_SECONDS);
      }
    }
  }

  throw lastError;
}

/**
 * Format decimal minute value.
 * @param {number} value
 * @returns {string}
 */
function formatMinutes(value) {
  return `${value.toFixed(2)}m`;
}

/**
 * Write evidence markdown.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# CI Usage Budget Audit",
    "",
    `Date: ${new Date().toISOString()}`,
    `Repository: ${REPO}`,
    `Window: last ${WINDOW_DAYS} days`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  let runs;
  try {
    runs = fetchRuns();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (ALLOW_OFFLINE) {
      writeLog(["Status: SKIP", `- SKIP: GitHub API temporarily unavailable (${message})`]);
      console.warn("CI usage budget audit skipped (offline mode enabled).");
      console.warn(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
      return;
    }

    writeLog(["Status: FAIL", `- FAIL: unable to query workflow runs (${message})`]);
    console.error("CI usage budget audit failed: unable to query workflow runs.");
    console.error(message);
    process.exit(1);
  }

  const now = Date.now();
  const windowStart = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const recentCompletedRuns = runs.filter((run) => {
    if (run.status !== "completed") return false;
    const updatedAt = parseDate(run.updatedAt);
    if (!updatedAt) return false;
    return updatedAt.getTime() >= windowStart;
  });

  if (recentCompletedRuns.length === 0) {
    writeLog(["Status: FAIL", "- FAIL: no completed workflow runs found in window"]);
    console.error("CI usage budget audit failed: no completed runs in the lookback window.");
    process.exit(1);
  }

  const totalsByWorkflow = new Map();
  let totalMinutes = 0;

  for (const run of recentCompletedRuns) {
    const createdAt = parseDate(run.createdAt);
    const updatedAt = parseDate(run.updatedAt);
    if (!createdAt || !updatedAt) continue;

    const durationMinutes = Math.max(0, (updatedAt.getTime() - createdAt.getTime()) / 60000);
    totalMinutes += durationMinutes;

    const key = run.workflowName || "Unknown";
    if (!totalsByWorkflow.has(key)) {
      totalsByWorkflow.set(key, {
        runs: 0,
        success: 0,
        totalMinutes: 0,
      });
    }

    const entry = totalsByWorkflow.get(key);
    entry.runs += 1;
    if (run.conclusion === "success") {
      entry.success += 1;
    }
    entry.totalMinutes += durationMinutes;
  }

  const webQuality = totalsByWorkflow.get("Web Quality");
  const codeql = totalsByWorkflow.get("CodeQL");
  const webQualityAvg = webQuality ? webQuality.totalMinutes / webQuality.runs : 0;
  const codeqlAvg = codeql ? codeql.totalMinutes / codeql.runs : 0;

  const checks = [
    {
      name: "Monthly total runtime budget",
      ok: totalMinutes <= BUDGETS.monthlyMinutesMax,
      details: `${formatMinutes(totalMinutes)} <= ${formatMinutes(BUDGETS.monthlyMinutesMax)}`,
    },
    {
      name: "Web Quality average runtime budget",
      ok: !webQuality || webQualityAvg <= BUDGETS.webQualityAvgMinutesMax,
      details: `${formatMinutes(webQualityAvg)} <= ${formatMinutes(BUDGETS.webQualityAvgMinutesMax)}`,
    },
    {
      name: "CodeQL average runtime budget",
      ok: !codeql || codeqlAvg <= BUDGETS.codeqlAvgMinutesMax,
      details: `${formatMinutes(codeqlAvg)} <= ${formatMinutes(BUDGETS.codeqlAvgMinutesMax)}`,
    },
  ];

  const hasFailures = checks.some((check) => !check.ok);
  const lines = [hasFailures ? "Status: FAIL" : "Status: PASS"];
  lines.push("- Budgets:");
  lines.push(`  - monthly total <= ${formatMinutes(BUDGETS.monthlyMinutesMax)}`);
  lines.push(`  - Web Quality avg <= ${formatMinutes(BUDGETS.webQualityAvgMinutesMax)}`);
  lines.push(`  - CodeQL avg <= ${formatMinutes(BUDGETS.codeqlAvgMinutesMax)}`);
  lines.push("");
  lines.push(`- Completed runs in window: ${recentCompletedRuns.length}`);
  lines.push(`- Total estimated runtime: ${formatMinutes(totalMinutes)}`);
  lines.push("- Workflow breakdown:");

  const workflowRows = [...totalsByWorkflow.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [workflowName, entry] of workflowRows) {
    const avg = entry.totalMinutes / entry.runs;
    lines.push(
      `  - ${workflowName}: runs=${entry.runs}, success=${entry.success}, avg=${formatMinutes(avg)}, total=${formatMinutes(entry.totalMinutes)}`,
    );
  }

  lines.push("");
  for (const check of checks) {
    lines.push(`- ${check.ok ? "PASS" : "FAIL"}: ${check.name} (${check.details})`);
  }

  writeLog(lines);

  if (hasFailures) {
    console.error("CI usage budget audit failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

  console.log("CI usage budget audit passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
