#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { getAllEditorialDates, isIsoDate, loadEditorialMetadata } = require("./lib/editorial-dates");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function toTime(value) {
  if (!isIsoDate(value)) {
    return Number.NaN;
  }

  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getMaxDate(values) {
  let winner = null;
  let winnerTime = Number.NEGATIVE_INFINITY;

  for (const candidate of values) {
    const candidateTime = toTime(candidate);
    if (!Number.isFinite(candidateTime)) {
      continue;
    }

    if (candidateTime > winnerTime) {
      winner = candidate;
      winnerTime = candidateTime;
    }
  }

  return winner;
}

function getBlogHtmlFiles(publicDir = PUBLIC_DIR) {
  const blogDir = path.join(publicDir, "blog");

  return fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .map((name) => path.join(blogDir, name));
}

function resolveContentDate({
  envContentDate = process.env.PROSEPAL_CONTENT_DATE,
  metadata = loadEditorialMetadata(),
  blogHtmlFiles = getBlogHtmlFiles(),
} = {}) {
  if (envContentDate) {
    if (!isIsoDate(envContentDate)) {
      throw new Error(`Invalid PROSEPAL_CONTENT_DATE: "${envContentDate}". Expected YYYY-MM-DD.`);
    }
    return envContentDate;
  }

  const candidates = getAllEditorialDates({
    metadata,
    htmlFiles: blogHtmlFiles,
  });
  const resolved = getMaxDate(candidates);

  if (!resolved) {
    throw new Error("Unable to resolve PROSEPAL_CONTENT_DATE from editorial metadata.");
  }

  return resolved;
}

if (require.main === module) {
  process.stdout.write(`${resolveContentDate()}\n`);
}

module.exports = {
  getBlogHtmlFiles,
  resolveContentDate,
  isIsoDate,
  getMaxDate,
};
