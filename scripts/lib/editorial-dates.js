const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..", "..");
const EDITORIAL_METADATA_FILE = path.join(ROOT_DIR, "data", "editorial-metadata.json");

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseIsoDate(value) {
  if (!isIsoDate(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function validateDatePair(context, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid editorial metadata for ${context}: expected object.`);
  }

  const datePublished = value.datePublished;
  const dateModified = value.dateModified;

  if (!isIsoDate(datePublished)) {
    throw new Error(`Invalid datePublished for ${context}: expected YYYY-MM-DD.`);
  }

  if (!isIsoDate(dateModified)) {
    throw new Error(`Invalid dateModified for ${context}: expected YYYY-MM-DD.`);
  }

  const publishedDate = parseIsoDate(datePublished);
  const modifiedDate = parseIsoDate(dateModified);

  if (!publishedDate || !modifiedDate) {
    throw new Error(`Invalid editorial dates for ${context}: unable to parse ISO value.`);
  }

  if (modifiedDate < publishedDate) {
    throw new Error(`Invalid editorial dates for ${context}: dateModified precedes datePublished.`);
  }

  return { datePublished, dateModified };
}

function loadEditorialMetadata({ file = EDITORIAL_METADATA_FILE } = {}) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw);
  const pages = parsed?.pages;

  if (!pages || typeof pages !== "object" || Array.isArray(pages)) {
    throw new Error("Invalid editorial metadata file: missing pages object.");
  }

  const normalized = {};
  for (const [pathname, value] of Object.entries(pages)) {
    normalized[pathname] = validateDatePair(pathname, value);
  }

  return { pages: normalized };
}

function extractDatePairFromHtml(html, context = "inline HTML metadata") {
  const publishedMatch = html.match(/"datePublished"\s*:\s*"([0-9-]+)"/);
  const modifiedMatch = html.match(/"dateModified"\s*:\s*"([0-9-]+)"/);

  if (!publishedMatch && !modifiedMatch) {
    return null;
  }

  if (!publishedMatch || !modifiedMatch) {
    throw new Error(`Incomplete inline editorial dates for ${context}.`);
  }

  return validateDatePair(context, {
    datePublished: publishedMatch[1],
    dateModified: modifiedMatch[1],
  });
}

function readDatePairFromHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return extractDatePairFromHtml(html, path.relative(ROOT_DIR, filePath));
}

function getEditorialDatesForPath(
  pathname,
  { metadata = loadEditorialMetadata(), htmlFile = null, allowInlineHtml = false } = {},
) {
  const explicitDates = metadata.pages[pathname];
  if (explicitDates) {
    return explicitDates;
  }

  if (allowInlineHtml) {
    if (!htmlFile) {
      throw new Error(`Missing htmlFile for inline editorial date lookup: ${pathname}`);
    }

    const inlineDates = readDatePairFromHtmlFile(htmlFile);
    if (inlineDates) {
      return inlineDates;
    }
  }

  throw new Error(`Missing editorial metadata for ${pathname}`);
}

function getAllEditorialDates({ metadata = loadEditorialMetadata(), htmlFiles = [] } = {}) {
  const dates = [];

  for (const value of Object.values(metadata.pages)) {
    dates.push(value.datePublished, value.dateModified);
  }

  for (const filePath of htmlFiles) {
    const inlineDates = readDatePairFromHtmlFile(filePath);
    if (!inlineDates) {
      continue;
    }

    dates.push(inlineDates.datePublished, inlineDates.dateModified);
  }

  return dates;
}

module.exports = {
  EDITORIAL_METADATA_FILE,
  extractDatePairFromHtml,
  getAllEditorialDates,
  getEditorialDatesForPath,
  isIsoDate,
  loadEditorialMetadata,
  parseIsoDate,
  readDatePairFromHtmlFile,
  validateDatePair,
};
