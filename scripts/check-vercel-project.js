#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const VERCEL_PROJECT_FILE = path.join(ROOT, ".vercel", "project.json");

// Guardrail values for this repo. Override with env vars if Vercel project is migrated.
const EXPECTED_PROJECT_ID =
  process.env.EXPECTED_VERCEL_PROJECT_ID || "prj_drrormeL9LQJaIWEmyS1zsfyTb7Q";
const EXPECTED_ORG_ID = process.env.EXPECTED_VERCEL_ORG_ID || "team_85dggpRwntnaGYNvf7T6FKM8";

/**
 * Print a terminal-friendly error and exit with non-zero status.
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

/**
 * Validate that local Vercel linkage points to the expected project/org IDs.
 * This prevents accidental deploys to another project from the same machine.
 * @returns {void}
 */
function main() {
  if (!fs.existsSync(VERCEL_PROJECT_FILE)) {
    fail(
      [
        "Missing .vercel/project.json in this repo.",
        "Run: vercel link --project prosepal-web",
        "Then rerun this check.",
      ].join("\n"),
    );
  }

  let project;
  try {
    project = JSON.parse(fs.readFileSync(VERCEL_PROJECT_FILE, "utf8"));
  } catch (_error) {
    fail(`Could not parse ${VERCEL_PROJECT_FILE}.`);
  }

  const actualProjectId = project.projectId || "";
  const actualOrgId = project.orgId || "";

  if (actualProjectId !== EXPECTED_PROJECT_ID || actualOrgId !== EXPECTED_ORG_ID) {
    fail(
      [
        "Vercel link mismatch for prosepal-web.",
        `Expected projectId: ${EXPECTED_PROJECT_ID}`,
        `Actual projectId:   ${actualProjectId || "(missing)"}`,
        `Expected orgId:     ${EXPECTED_ORG_ID}`,
        `Actual orgId:       ${actualOrgId || "(missing)"}`,
        "",
        "This guard exists because this machine also deploys other projects (for example payetax).",
        "Relink before deploy: vercel link --project prosepal-web",
      ].join("\n"),
    );
  }

  console.log("✅ Vercel link check passed for prosepal-web.");
  console.log(`   projectId: ${actualProjectId}`);
  console.log(`   orgId: ${actualOrgId}`);
}

main();
