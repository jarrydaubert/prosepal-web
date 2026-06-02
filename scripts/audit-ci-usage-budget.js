#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.join(__dirname, "..");
const REPO = process.env.GH_REPO || "jarrydaubert/prosepal-web";
const RUNS_PER_PAGE = 100;
const WINDOW_DAYS = 30;
const MAX_PAGES = 25;
const GH_API_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const API_RETRY_ATTEMPTS = 12;
const API_RETRY_DELAY_SECONDS = 5;
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE_GH_AUDITS === "1";

const DEFAULT_BUDGETS = {
  monthlyMinutesReview: 650,
  monthlyMinutesMax: 750,
  ciAvgMinutesMax: 8,
  codeqlAvgMinutesMax: 8,
};
const RETIRED_WORKFLOW_NAMES = new Set([
  "Web Quality",
  "Visual Regression",
  "Lighthouse Budget",
  "Interaction Flake Audit",
  "Visual Flake Audit",
  "Monthly Governance Audit",
  "Governance Audit (manual)",
  "Release Automation",
]);

const LOG_DIR = resolveEvidenceDir();
const LOG_FILE = path.join(LOG_DIR, "ci-usage-budget.md");

/**
 * Resolve the evidence output directory.
 * @returns {string}
 */
function resolveEvidenceDir() {
  const configuredDir = (process.env.GOVERNANCE_EVIDENCE_DIR || "").trim();
  if (!configuredDir) {
    return path.join(ROOT_DIR, "docs", "evidence");
  }

  return path.isAbsolute(configuredDir) ? configuredDir : path.join(ROOT_DIR, configuredDir);
}

/**
 * Parse a positive numeric environment variable.
 * @param {string} name
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveNumberEnv(name, fallback) {
  const raw = (process.env[name] || "").trim();
  if (!raw) return fallback;

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number when provided.`);
  }

  return parsed;
}

/**
 * Load budget thresholds from env, falling back to repo defaults.
 * @returns {{
 *   monthlyMinutesReview: number,
 *   monthlyMinutesMax: number,
 *   webQualityAvgMinutesMax: number,
 *   codeqlAvgMinutesMax: number
 * }}
 */
function loadBudgets() {
  const budgets = {
    monthlyMinutesReview: parsePositiveNumberEnv(
      "GH_CI_MONTHLY_MINUTES_REVIEW",
      DEFAULT_BUDGETS.monthlyMinutesReview,
    ),
    monthlyMinutesMax: parsePositiveNumberEnv(
      "GH_CI_MONTHLY_MINUTES_MAX",
      DEFAULT_BUDGETS.monthlyMinutesMax,
    ),
    ciAvgMinutesMax: parsePositiveNumberEnv(
      "GH_CI_AVG_MINUTES_MAX",
      DEFAULT_BUDGETS.ciAvgMinutesMax,
    ),
    codeqlAvgMinutesMax: parsePositiveNumberEnv(
      "GH_CI_CODEQL_AVG_MINUTES_MAX",
      DEFAULT_BUDGETS.codeqlAvgMinutesMax,
    ),
  };

  if (budgets.monthlyMinutesReview > budgets.monthlyMinutesMax) {
    throw new Error(
      "GH_CI_MONTHLY_MINUTES_REVIEW must be less than or equal to GH_CI_MONTHLY_MINUTES_MAX.",
    );
  }

  return budgets;
}

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
 * Execute gh api and return JSON.
 * @param {string[]} args
 * @returns {unknown}
 */
function ghApi(args) {
  /** @type {unknown} */
  let lastError;

  for (let attempt = 1; attempt <= API_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const stdout = execFileSync("gh", ["api", ...args], {
        cwd: ROOT_DIR,
        encoding: "utf8",
        maxBuffer: GH_API_MAX_BUFFER_BYTES,
        stdio: ["ignore", "pipe", "pipe"],
      });
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
 * Fetch workflow runs until the configured lookback window is fully covered.
 * @param {number} windowStart
 * @returns {{
 *   runs: Array<{
 *   workflowName: string,
 *   status: string,
 *   conclusion: string,
 *   createdAt: string,
 *   updatedAt: string
 *   }>,
 *   pagesFetched: number,
 *   truncated: boolean,
 *   oldestFetchedUpdatedAt: string | null,
 *   coverageReason: "pagination_exhausted" | "crossed_window_boundary" | "max_pages_exceeded"
 * }}
 */
function fetchRuns(windowStart) {
  /** @type {ReturnType<typeof fetchRuns>["runs"]} */
  const runs = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = ghApi([`repos/${REPO}/actions/runs?per_page=${RUNS_PER_PAGE}&page=${page}`]);
    const workflowRuns = Array.isArray(response?.workflow_runs) ? response.workflow_runs : [];

    for (const run of workflowRuns) {
      runs.push({
        workflowName: run.name || "Unknown",
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      });
    }

    if (workflowRuns.length < RUNS_PER_PAGE) {
      return {
        runs,
        pagesFetched: page,
        truncated: false,
        oldestFetchedUpdatedAt: workflowRuns[workflowRuns.length - 1]?.updated_at || null,
        coverageReason: "pagination_exhausted",
      };
    }

    const oldestUpdatedAt = parseDate(workflowRuns[workflowRuns.length - 1]?.updated_at || "");
    if (oldestUpdatedAt && oldestUpdatedAt.getTime() < windowStart) {
      return {
        runs,
        pagesFetched: page,
        truncated: false,
        oldestFetchedUpdatedAt: workflowRuns[workflowRuns.length - 1]?.updated_at || null,
        coverageReason: "crossed_window_boundary",
      };
    }
  }

  return {
    runs,
    pagesFetched: MAX_PAGES,
    truncated: true,
    oldestFetchedUpdatedAt: runs[runs.length - 1]?.updatedAt || null,
    coverageReason: "max_pages_exceeded",
  };
}

/**
 * Aggregate workflow totals that match a predicate.
 * @param {Map<string, { runs: number, success: number, totalMinutes: number }>} totalsByWorkflow
 * @param {(workflowName: string) => boolean} matcher
 * @returns {{ runs: number, success: number, totalMinutes: number } | null}
 */
function aggregateWorkflowTotals(totalsByWorkflow, matcher) {
  let aggregate = null;

  for (const [workflowName, entry] of totalsByWorkflow.entries()) {
    if (!matcher(workflowName)) continue;

    if (!aggregate) {
      aggregate = {
        runs: 0,
        success: 0,
        totalMinutes: 0,
      };
    }

    aggregate.runs += entry.runs;
    aggregate.success += entry.success;
    aggregate.totalMinutes += entry.totalMinutes;
  }

  return aggregate;
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
 * Normalize retired workflow names so current evidence does not re-document retired gates.
 * @param {string} workflowName
 * @returns {string}
 */
function normalizeWorkflowName(workflowName) {
  return RETIRED_WORKFLOW_NAMES.has(workflowName) ? "Retired workflow history" : workflowName;
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
  let budgets;
  try {
    budgets = loadBudgets();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLog(["Status: FAIL", `- FAIL: invalid CI budget configuration (${message})`]);
    console.error("CI usage budget audit failed: invalid configuration.");
    console.error(message);
    process.exit(1);
  }

  let result;
  try {
    result = fetchRuns(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
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
  const runs = result.runs;

  if (result.truncated) {
    writeLog([
      "Status: FAIL",
      `- FAIL: workflow run pagination truncated before the ${WINDOW_DAYS}-day window was fully covered (pages=${result.pagesFetched}, per_page=${RUNS_PER_PAGE}, max_pages=${MAX_PAGES})`,
    ]);
    console.error("CI usage budget audit failed: workflow run pagination truncated.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

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

    const key = normalizeWorkflowName(run.workflowName || "Unknown");
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

  const ci = aggregateWorkflowTotals(totalsByWorkflow, (workflowName) => workflowName === "CI");
  const codeql = aggregateWorkflowTotals(
    totalsByWorkflow,
    (workflowName) => workflowName === "CodeQL" || workflowName.startsWith("CodeQL "),
  );
  const ciAvg = ci ? ci.totalMinutes / ci.runs : 0;
  const codeqlAvg = codeql ? codeql.totalMinutes / codeql.runs : 0;
  const coverageDetails =
    result.coverageReason === "crossed_window_boundary"
      ? `oldest fetched run updated_at ${result.oldestFetchedUpdatedAt || "n/a"} crosses the ${WINDOW_DAYS}-day boundary`
      : `available results exhausted after ${result.pagesFetched} page(s); oldest fetched run updated_at ${result.oldestFetchedUpdatedAt || "n/a"}`;

  const checks = [
    {
      name: "Lookback window coverage",
      ok: true,
      details: coverageDetails,
    },
    {
      name: "Monthly total runtime budget",
      ok: totalMinutes <= budgets.monthlyMinutesMax,
      details: `${formatMinutes(totalMinutes)} <= ${formatMinutes(budgets.monthlyMinutesMax)}`,
    },
    {
      name: "CI average runtime budget",
      ok: !ci || ciAvg <= budgets.ciAvgMinutesMax,
      details: `${formatMinutes(ciAvg)} <= ${formatMinutes(budgets.ciAvgMinutesMax)}`,
    },
    {
      name: "CodeQL average runtime budget",
      ok: !codeql || codeqlAvg <= budgets.codeqlAvgMinutesMax,
      details: `${formatMinutes(codeqlAvg)} <= ${formatMinutes(budgets.codeqlAvgMinutesMax)}`,
    },
  ];

  const hasFailures = checks.some((check) => !check.ok);
  const lines = [hasFailures ? "Status: FAIL" : "Status: PASS"];
  lines.push("- Budgets:");
  lines.push(`  - monthly review threshold <= ${formatMinutes(budgets.monthlyMinutesReview)}`);
  lines.push(`  - monthly total <= ${formatMinutes(budgets.monthlyMinutesMax)}`);
  lines.push(`  - CI avg <= ${formatMinutes(budgets.ciAvgMinutesMax)}`);
  lines.push(`  - CodeQL avg <= ${formatMinutes(budgets.codeqlAvgMinutesMax)}`);
  lines.push("");
  lines.push(`- Pages fetched: ${result.pagesFetched}`);
  lines.push(`- API page size: ${RUNS_PER_PAGE}`);
  lines.push(`- Oldest fetched run updated_at: ${result.oldestFetchedUpdatedAt || "n/a"}`);
  lines.push(`- Completed runs in window: ${recentCompletedRuns.length}`);
  lines.push(`- Total estimated runtime: ${formatMinutes(totalMinutes)}`);
  if (totalMinutes > budgets.monthlyMinutesReview && totalMinutes <= budgets.monthlyMinutesMax) {
    lines.push(
      `- Review note: total runtime is above the review threshold (${formatMinutes(totalMinutes)} > ${formatMinutes(budgets.monthlyMinutesReview)}) but still within the enforced cap.`,
    );
  }
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
