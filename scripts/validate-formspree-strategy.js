#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const INDEX_FILE = path.join(ROOT_DIR, "public", "index.html");
const HOME_JS_FILE = path.join(ROOT_DIR, "public", "js", "home.js");
const LOG_DIR = path.join(ROOT_DIR, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "formspree-endpoint-strategy.md");

const FORM_IDS = ["android-waitlist-form", "tips-popup-form"];
const EXPECTED_SOURCES = new Map([
  ["android-waitlist-form", "hero_waitlist"],
  ["tips-popup-form", "tips_popup"],
]);

/**
 * Write evidence output.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# Formspree Endpoint Strategy Validation",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Extract one form block by id.
 * @param {string} html
 * @param {string} formId
 * @returns {string}
 */
function getFormBlock(html, formId) {
  const marker = `id="${formId}"`;
  const idIndex = html.indexOf(marker);
  if (idIndex < 0) {
    return "";
  }

  const formStart = html.lastIndexOf("<form", idIndex);
  const formEnd = html.indexOf("</form>", idIndex);
  if (formStart < 0 || formEnd < 0) {
    return "";
  }

  return html.slice(formStart, formEnd + "</form>".length);
}

/**
 * Extract form action.
 * @param {string} formBlock
 * @returns {string}
 */
function extractAction(formBlock) {
  const match = formBlock.match(/\saction="([^"]+)"/i);
  return match?.[1] || "";
}

/**
 * Extract source hidden field value.
 * @param {string} formBlock
 * @returns {string}
 */
function extractSource(formBlock) {
  const match = formBlock.match(
    /<input[^>]*type="hidden"[^>]*name="source"[^>]*value="([^"]+)"[^>]*>/i,
  );
  return match?.[1] || "";
}

/**
 * Assert failure handling in JS submit handlers.
 * @param {string} js
 * @returns {{hero: boolean, popup: boolean}}
 */
function checkFailureHandling(js) {
  const hero =
    /waitlistStatus\.dataset\.state\s*=\s*"error"[\s\S]*?waitlistStatus\.textContent\s*=\s*"Submission failed/i.test(
      js,
    );
  const popup =
    /tipsPopupStatus\.dataset\.state\s*=\s*"error"[\s\S]*?tipsPopupStatus\.textContent\s*=\s*"Could not submit right now/i.test(
      js,
    );
  return { hero, popup };
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  const html = fs.readFileSync(INDEX_FILE, "utf8");
  const js = fs.readFileSync(HOME_JS_FILE, "utf8");
  const lines = [];
  let hasFailure = false;

  /** @type {string[]} */
  const actions = [];

  for (const formId of FORM_IDS) {
    const block = getFormBlock(html, formId);
    if (!block) {
      hasFailure = true;
      lines.push(`- FAIL: missing form block for \`${formId}\``);
      continue;
    }

    const action = extractAction(block);
    const source = extractSource(block);
    actions.push(action);

    if (!action.startsWith("https://formspree.io/f/")) {
      hasFailure = true;
      lines.push(
        `- FAIL: \`${formId}\` action is not a Formspree endpoint (\`${action || "(missing)"}\`)`,
      );
    } else {
      lines.push(`- PASS: \`${formId}\` action uses Formspree endpoint (\`${action}\`)`);
    }

    const expectedSource = EXPECTED_SOURCES.get(formId) || "";
    if (source !== expectedSource) {
      hasFailure = true;
      lines.push(
        `- FAIL: \`${formId}\` source tag mismatch (expected \`${expectedSource}\`, got \`${source || "(missing)"}\`)`,
      );
    } else {
      lines.push(`- PASS: \`${formId}\` source tag set to \`${source}\``);
    }
  }

  if (actions.length === FORM_IDS.length) {
    const uniqueActions = new Set(actions);
    if (uniqueActions.size !== 1) {
      hasFailure = true;
      lines.push("- FAIL: forms are not using a single shared endpoint");
    } else {
      lines.push("- PASS: both forms use the same Formspree endpoint");
    }
  }

  const failureHandling = checkFailureHandling(js);
  if (!failureHandling.hero) {
    hasFailure = true;
    lines.push("- FAIL: hero waitlist submit handler missing explicit error-state fallback");
  } else {
    lines.push("- PASS: hero waitlist submit handler includes explicit error-state fallback");
  }

  if (!failureHandling.popup) {
    hasFailure = true;
    lines.push("- FAIL: tips popup submit handler missing explicit error-state fallback");
  } else {
    lines.push("- PASS: tips popup submit handler includes explicit error-state fallback");
  }

  writeLog([hasFailure ? "Status: FAIL" : "Status: PASS", ...lines]);

  if (hasFailure) {
    console.error("Formspree endpoint strategy validation failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

  console.log("Formspree endpoint strategy validation passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
