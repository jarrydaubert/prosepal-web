#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");
const LLMS_FILE = path.join(ROOT_DIR, "public", "llms.txt");

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

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

function readDatesFromMessagesData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];
    const dates = [];

    for (const page of pages) {
      if (!page || typeof page !== "object") {
        continue;
      }
      if (isIsoDate(page.datePublished)) {
        dates.push(page.datePublished);
      }
      if (isIsoDate(page.dateModified)) {
        dates.push(page.dateModified);
      }
    }

    return dates;
  } catch {
    return [];
  }
}

function readLastUpdatedFromLlms(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const match = raw.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function todayUtcIso() {
  return new Date().toISOString().slice(0, 10);
}

function resolveContentDate({
  envContentDate = process.env.PROSEPAL_CONTENT_DATE,
  dataFile = DATA_FILE,
  llmsFile = LLMS_FILE,
} = {}) {
  if (envContentDate) {
    if (!isIsoDate(envContentDate)) {
      throw new Error(`Invalid PROSEPAL_CONTENT_DATE: "${envContentDate}". Expected YYYY-MM-DD.`);
    }
    return envContentDate;
  }

  const candidates = [];
  candidates.push(...readDatesFromMessagesData(dataFile));

  const llmsDate = readLastUpdatedFromLlms(llmsFile);
  if (llmsDate) {
    candidates.push(llmsDate);
  }

  return getMaxDate(candidates) || todayUtcIso();
}

if (require.main === module) {
  process.stdout.write(`${resolveContentDate()}\n`);
}

module.exports = {
  resolveContentDate,
  isIsoDate,
  readDatesFromMessagesData,
  readLastUpdatedFromLlms,
  getMaxDate,
};
