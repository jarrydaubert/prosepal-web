#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const CSS_DIR = path.join(PUBLIC_DIR, "css");
const DEFAULT_THRESHOLDS = {
  "inline-style-attr": 0,
  "inline-style-tag": 0,
  "hardcoded-font-family": 0,
  "hardcoded-color-hex": 10,
  "hardcoded-color-rgba": 120,
  "hardcoded-radius": 20,
  "hardcoded-font-size": 30,
};

function walk(dir, extension, collector = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, extension, collector);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(extension)) {
      collector.push(fullPath);
    }
  }

  return collector;
}

function toRelative(filePath) {
  return filePath.replace(`${ROOT_DIR}${path.sep}`, "").split(path.sep).join("/");
}

function getLineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function collectMatches(filePath, text, regex, type, filter = null) {
  const findings = [];

  for (const match of text.matchAll(regex)) {
    const value = match[1] || match[0];

    if (filter && !filter(value)) {
      continue;
    }

    findings.push({
      type,
      file: toRelative(filePath),
      line: getLineNumber(text, match.index || 0),
      value: value.trim(),
    });
  }

  return findings;
}

function auditHtml(htmlFiles) {
  const findings = [];

  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, "utf8");

    findings.push(
      ...collectMatches(filePath, html, /\sstyle="([^"]*)"/gi, "inline-style-attr"),
      ...collectMatches(filePath, html, /<style[^>]*>/gi, "inline-style-tag"),
    );
  }

  return findings;
}

function auditCss(cssFiles) {
  const findings = [];

  for (const filePath of cssFiles) {
    const fileName = path.basename(filePath);

    if (fileName === "tokens.css") {
      continue;
    }

    const css = fs.readFileSync(filePath, "utf8");

    findings.push(
      ...collectMatches(
        filePath,
        css,
        /font-size\s*:\s*([^;]+);/gi,
        "hardcoded-font-size",
        (value) => !value.includes("var(--font-size-") && !value.includes("inherit"),
      ),
      ...collectMatches(
        filePath,
        css,
        /font-family\s*:\s*([^;]+);/gi,
        "hardcoded-font-family",
        (value) => !value.includes("var(--font-family-") && !value.includes("inherit"),
      ),
      ...collectMatches(filePath, css, /(#[0-9a-fA-F]{3,8})\b/g, "hardcoded-color-hex"),
      ...collectMatches(filePath, css, /\brgba\([^)]+\)/gi, "hardcoded-color-rgba"),
      ...collectMatches(
        filePath,
        css,
        /border-radius\s*:\s*([^;]+);/gi,
        "hardcoded-radius",
        (value) =>
          !value.includes("var(--radius-") && !value.includes("0") && !value.includes("inherit"),
      ),
    );
  }

  return findings;
}

function extractStylesheetLinks(html, htmlPath) {
  const links = [];
  const linkRegex = /<link\b[^>]*>/gi;

  for (const linkTag of html.match(linkRegex) || []) {
    if (!/rel\s*=\s*["'][^"']*stylesheet[^"']*["']/i.test(linkTag)) {
      continue;
    }

    const hrefMatch = linkTag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch?.[1]) {
      continue;
    }

    const href = hrefMatch[1].trim().split("#")[0].split("?")[0];

    if (!href.endsWith(".css") || href.startsWith("http://") || href.startsWith("https://")) {
      continue;
    }

    const candidate = href.startsWith("/")
      ? path.join(PUBLIC_DIR, href.slice(1))
      : path.resolve(path.dirname(htmlPath), href);

    if (candidate.startsWith(PUBLIC_DIR) && fs.existsSync(candidate)) {
      links.push(candidate);
    }
  }

  return links;
}

function getReferencedCssFiles(htmlFiles) {
  const cssSet = new Set();

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, "utf8");
    const links = extractStylesheetLinks(html, htmlFile);

    for (const link of links) {
      cssSet.add(link);
    }
  }

  if (cssSet.size === 0) {
    for (const file of walk(CSS_DIR, ".css")) {
      cssSet.add(file);
    }
  }

  return [...cssSet];
}

function summarize(findings) {
  const byType = new Map();

  for (const finding of findings) {
    const count = byType.get(finding.type) || 0;
    byType.set(finding.type, count + 1);
  }

  return [...byType.entries()].sort((a, b) => b[1] - a[1]);
}

function toCountMap(findings) {
  return new Map(summarize(findings));
}

function printThresholds(thresholds) {
  console.log("\nThresholds:");
  Object.entries(thresholds).forEach(([type, limit]) => {
    console.log(`  ${type}: <= ${limit}`);
  });
}

function evaluateThresholds(findings, thresholds) {
  const counts = toCountMap(findings);
  const breaches = [];

  for (const [type, limit] of Object.entries(thresholds)) {
    const count = counts.get(type) || 0;
    if (count > limit) {
      breaches.push({ type, count, limit });
    }
  }

  return breaches;
}

function printFindings(findings, maxPerType = 20) {
  if (findings.length === 0) {
    console.log("Style audit passed: no tracked issues found.");
    return;
  }

  const grouped = new Map();

  for (const finding of findings) {
    if (!grouped.has(finding.type)) {
      grouped.set(finding.type, []);
    }
    grouped.get(finding.type).push(finding);
  }

  console.log("Style audit report:\n");

  for (const [type, items] of grouped.entries()) {
    console.log(`- ${type}: ${items.length}`);

    items.slice(0, maxPerType).forEach((item) => {
      console.log(`  ${item.file}:${item.line} -> ${item.value}`);
    });

    if (items.length > maxPerType) {
      console.log(`  ... ${items.length - maxPerType} more`);
    }
  }

  console.log("\nSummary:");
  summarize(findings).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

function main() {
  const args = process.argv.slice(2);
  const htmlFiles = walk(PUBLIC_DIR, ".html");
  const cssFiles = getReferencedCssFiles(htmlFiles);

  const findings = [...auditHtml(htmlFiles), ...auditCss(cssFiles)];
  printFindings(findings);

  if (args.includes("--show-thresholds")) {
    printThresholds(DEFAULT_THRESHOLDS);
  }

  const shouldFailOnIssues = args.includes("--fail-on-issues");
  const shouldFailOnThresholds = args.includes("--fail-on-thresholds");

  if (shouldFailOnIssues && findings.length > 0) {
    process.exit(1);
  }

  if (shouldFailOnThresholds) {
    const breaches = evaluateThresholds(findings, DEFAULT_THRESHOLDS);
    if (breaches.length > 0) {
      console.log("\nThreshold breaches:");
      breaches.forEach((breach) => {
        console.log(`  ${breach.type}: ${breach.count} (limit ${breach.limit})`);
      });
      process.exit(1);
    }
  }
}

main();
