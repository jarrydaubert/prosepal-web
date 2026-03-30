#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = path.join(__dirname, "..");

/**
 * Build an ISO timestamp offset from now.
 * @param {number} ageDays
 * @param {number} durationMinutes
 * @returns {{ createdAt: string, updatedAt: string }}
 */
function buildWindowTimes(ageDays, durationMinutes) {
  const updatedAt = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);
  const createdAt = new Date(updatedAt.getTime() - durationMinutes * 60 * 1000);
  return {
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Create a fake workflow run fixture.
 * @param {string} workflowName
 * @param {number} ageDays
 * @param {number} durationMinutes
 * @returns {{
 *   name: string,
 *   status: string,
 *   conclusion: string,
 *   created_at: string,
 *   updated_at: string
 * }}
 */
function createRun(workflowName, ageDays, durationMinutes) {
  const { createdAt, updatedAt } = buildWindowTimes(ageDays, durationMinutes);
  return {
    name: workflowName,
    status: "completed",
    conclusion: "success",
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/**
 * Run the audit script with a fake `gh` binary and return the result.
 * @param {{
 *   fixture: unknown,
 *   envOverrides?: Record<string, string>
 * }} options
 * @returns {{ status: number | null, stdout: string, stderr: string, evidence: string }}
 */
function runAudit({ fixture, envOverrides = {} }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-usage-budget-test-"));
  const binDir = path.join(tempDir, "bin");
  const evidenceDir = path.join(tempDir, "evidence");
  const fixturePath = path.join(tempDir, "runs.json");
  const ghPath = path.join(binDir, "gh");

  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(fixturePath, JSON.stringify(fixture), "utf8");
  fs.writeFileSync(
    ghPath,
    `#!/bin/sh
if [ "$1" = "api" ]; then
  cat "${fixturePath}"
  exit 0
fi
echo "unexpected gh invocation: $*" >&2
exit 1
`,
    { mode: 0o755 },
  );

  const result = spawnSync("node", ["scripts/audit-ci-usage-budget.js"], {
    cwd: ROOT_DIR,
    encoding: "utf8",
    env: {
      ...process.env,
      ...envOverrides,
      PATH: `${binDir}:${process.env.PATH}`,
      GOVERNANCE_EVIDENCE_DIR: evidenceDir,
    },
  });

  const evidencePath = path.join(evidenceDir, "ci-usage-budget.md");
  const evidence = fs.readFileSync(evidencePath, "utf8");

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    evidence,
  };
}

function main() {
  const runs = [
    createRun("Lighthouse Budget", 1, 640),
    createRun("Web Quality", 2, 1),
    createRun("Web Quality", 3, 1),
    createRun("Web Quality", 4, 1),
    createRun("Web Quality", 5, 1),
    createRun("Web Quality", 6, 1),
    createRun("Web Quality", 7, 1),
    createRun("Web Quality", 8, 1),
    createRun("Web Quality", 9, 1),
    createRun("Web Quality", 10, 1),
    createRun("Web Quality", 11, 1),
    createRun("CodeQL Setup", 12, 5),
  ];

  const passResult = runAudit({
    fixture: {
      workflow_runs: runs,
    },
  });
  assert.equal(passResult.status, 0, passResult.stderr || "expected passing audit");
  assert.match(passResult.stdout, /CI usage budget audit passed/);
  assert.match(passResult.evidence, /Status: PASS/);
  assert.match(passResult.evidence, /monthly review threshold <= 650\.00m/);
  assert.match(passResult.evidence, /monthly total <= 750\.00m/);
  assert.match(passResult.evidence, /Review note: total runtime is above the review threshold/);
  assert.match(passResult.evidence, /Web Quality average runtime budget \(1\.00m <= 3\.00m\)/);
  assert.match(passResult.evidence, /CodeQL average runtime budget \(5\.00m <= 8\.00m\)/);

  const failResult = runAudit({
    fixture: {
      workflow_runs: runs,
    },
    envOverrides: {
      GH_CI_MONTHLY_MINUTES_REVIEW: "600",
      GH_CI_MONTHLY_MINUTES_MAX: "640",
    },
  });
  assert.equal(failResult.status, 1, "expected failing audit when monthly cap is lowered");
  assert.match(failResult.stderr, /CI usage budget audit failed/);
  assert.match(failResult.evidence, /Status: FAIL/);
  assert.match(failResult.evidence, /monthly total <= 640\.00m/);
  assert.match(failResult.evidence, /FAIL: Monthly total runtime budget \(655\.00m <= 640\.00m\)/);

  console.log("ci usage budget audit tests passed");
}

main();
