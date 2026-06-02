#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.join(__dirname, "..");
const LOG_DIR = path.join(ROOT_DIR, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "github-policy-drift.md");
const CODEQL_WORKFLOW_FILE = path.join(ROOT_DIR, ".github", "workflows", "codeql.yml");
const REPO = process.env.GH_REPO || "jarrydaubert/prosepal-web";

const REQUIRED_STATUS_CHECKS = ["CI", "CodeQL"];
const REQUIRED_CODE_SCANNING_TOOLS = ["CodeQL"];
const REQUIRED_SELECTED_ACTIONS = [
  "actions/checkout@v4",
  "oven-sh/setup-bun@v2",
  "github/codeql-action/init@v4",
  "github/codeql-action/analyze@v4",
];
const API_RETRY_ATTEMPTS = 12;
const API_RETRY_DELAY_SECONDS = 5;
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE_GH_AUDITS === "1";

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
 * Execute `gh api` and parse JSON output.
 * @param {string} endpoint
 * @returns {unknown}
 */
function ghApi(endpoint) {
  /** @type {unknown} */
  let lastError;

  for (let attempt = 1; attempt <= API_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const stdout = execFileSync("gh", ["api", endpoint], {
        cwd: ROOT_DIR,
        encoding: "utf8",
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
 * Flatten selected-actions patterns into normalized lines.
 * @param {unknown} patterns
 * @returns {string[]}
 */
function normalizePatterns(patterns) {
  if (!Array.isArray(patterns)) return [];

  return patterns
    .flatMap((value) => String(value).split(/\r?\n/g))
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Write evidence markdown output.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# GitHub Policy Drift Audit",
    "",
    `Date: ${new Date().toISOString()}`,
    `Repository: ${REPO}`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Add a check result line.
 * @param {{ok: boolean, name: string, details: string}} result
 * @param {string[]} lines
 * @returns {void}
 */
function appendResult(result, lines) {
  const prefix = result.ok ? "PASS" : "FAIL";
  lines.push(`- ${prefix}: ${result.name} (${result.details})`);
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  const checks = [];

  let rulesetSummaries;
  /** @type {unknown[]} */
  let rulesets = [];
  let actionsPermissions;
  let workflowPermissions;
  let selectedActions;
  let forkApproval;
  let privateVulnReporting;

  try {
    rulesetSummaries = ghApi(`repos/${REPO}/rulesets`);
    actionsPermissions = ghApi(`repos/${REPO}/actions/permissions`);
    workflowPermissions = ghApi(`repos/${REPO}/actions/permissions/workflow`);
    selectedActions = ghApi(`repos/${REPO}/actions/permissions/selected-actions`);
    forkApproval = ghApi(`repos/${REPO}/actions/permissions/fork-pr-contributor-approval`);
    privateVulnReporting = ghApi(`repos/${REPO}/private-vulnerability-reporting`);
    if (Array.isArray(rulesetSummaries)) {
      rulesets = rulesetSummaries
        .map((ruleset) => {
          const id = ruleset?.id;
          if (typeof id !== "number" && typeof id !== "string") {
            return null;
          }
          return ghApi(`repos/${REPO}/rulesets/${id}`);
        })
        .filter(Boolean);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (ALLOW_OFFLINE) {
      writeLog(["Status: SKIP", `- SKIP: GitHub API temporarily unavailable (${message})`]);
      console.warn("GitHub policy drift audit skipped (offline mode enabled).");
      console.warn(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
      return;
    }

    writeLog(["Status: FAIL", `- FAIL: GitHub API access (${message})`]);
    console.error("GitHub policy drift audit failed: unable to query GitHub API.");
    console.error(message);
    process.exit(1);
  }

  const mainRule = rulesets.find(
    (ruleset) =>
      ruleset?.enforcement === "active" &&
      Array.isArray(ruleset?.conditions?.ref_name?.include) &&
      ruleset.conditions.ref_name.include.includes("refs/heads/main"),
  );

  checks.push({
    ok: Boolean(mainRule),
    name: "Main branch ruleset",
    details: mainRule ? `${mainRule.name} is active` : "no active main ruleset found",
  });

  const ruleTypes = new Set(
    Array.isArray(mainRule?.rules) ? mainRule.rules.map((rule) => rule.type) : [],
  );
  checks.push({
    ok:
      ruleTypes.has("non_fast_forward") &&
      ruleTypes.has("deletion") &&
      ruleTypes.has("required_linear_history"),
    name: "Branch protection hardening",
    details: "requires no force-push, no deletion, linear history",
  });

  const statusRule =
    Array.isArray(mainRule?.rules) &&
    mainRule.rules.find((rule) => rule.type === "required_status_checks");
  const statusChecks = Array.isArray(statusRule?.parameters?.required_status_checks)
    ? statusRule.parameters.required_status_checks.map((entry) => entry.context)
    : [];
  const hasRequiredStatusChecks = REQUIRED_STATUS_CHECKS.every((check) =>
    statusChecks.includes(check),
  );
  checks.push({
    ok: Boolean(hasRequiredStatusChecks),
    name: "Required status checks",
    details: `found: ${statusChecks.join(", ") || "none"}`,
  });

  checks.push({
    ok:
      actionsPermissions?.allowed_actions === "selected" &&
      actionsPermissions?.sha_pinning_required === true,
    name: "Actions policy",
    details: `allowed_actions=${actionsPermissions?.allowed_actions}; sha_pinning_required=${actionsPermissions?.sha_pinning_required}`,
  });

  checks.push({
    ok:
      workflowPermissions?.default_workflow_permissions === "read" &&
      workflowPermissions?.can_approve_pull_request_reviews === true,
    name: "Workflow token permissions",
    details: `default=${workflowPermissions?.default_workflow_permissions}; can_approve_pr=${workflowPermissions?.can_approve_pull_request_reviews}`,
  });

  const normalizedPatterns = normalizePatterns(selectedActions?.patterns_allowed);
  const hasRequiredPatterns = REQUIRED_SELECTED_ACTIONS.every((pattern) =>
    normalizedPatterns.includes(pattern),
  );
  checks.push({
    ok:
      selectedActions?.github_owned_allowed === true &&
      selectedActions?.verified_allowed === true &&
      hasRequiredPatterns,
    name: "Selected actions allowlist",
    details: `patterns=${normalizedPatterns.length}`,
  });

  checks.push({
    ok: forkApproval?.approval_policy === "all_external_contributors",
    name: "Fork PR workflow approval policy",
    details: `approval_policy=${forkApproval?.approval_policy}`,
  });

  checks.push({
    ok: privateVulnReporting?.enabled === true,
    name: "Private vulnerability reporting",
    details: `enabled=${privateVulnReporting?.enabled}`,
  });

  const codeScanningRule =
    Array.isArray(mainRule?.rules) && mainRule.rules.find((rule) => rule.type === "code_scanning");
  const configuredTools = Array.isArray(codeScanningRule?.parameters?.code_scanning_tools)
    ? codeScanningRule.parameters.code_scanning_tools.map((entry) => entry.tool)
    : [];
  const hasRequiredCodeScanningTools = REQUIRED_CODE_SCANNING_TOOLS.every((tool) =>
    configuredTools.includes(tool),
  );
  checks.push({
    ok: Boolean(hasRequiredCodeScanningTools),
    name: "Main ruleset code scanning tools",
    details: `tools=${configuredTools.join(", ") || "none"}`,
  });

  const codeqlWorkflow = fs.existsSync(CODEQL_WORKFLOW_FILE)
    ? fs.readFileSync(CODEQL_WORKFLOW_FILE, "utf8")
    : "";
  checks.push({
    ok:
      codeqlWorkflow.includes("github/codeql-action/init@") &&
      codeqlWorkflow.includes("github/codeql-action/analyze@") &&
      codeqlWorkflow.includes("javascript-typescript") &&
      !codeqlWorkflow.includes("python"),
    name: "CodeQL workflow source",
    details: fs.existsSync(CODEQL_WORKFLOW_FILE)
      ? ".github/workflows/codeql.yml covers javascript-typescript"
      : ".github/workflows/codeql.yml missing",
  });

  const hasFailures = checks.some((check) => !check.ok);
  const lines = [hasFailures ? "Status: FAIL" : "Status: PASS"];
  for (const check of checks) {
    appendResult(check, lines);
  }
  writeLog(lines);

  if (hasFailures) {
    console.error("GitHub policy drift audit failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

  console.log("GitHub policy drift audit passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
