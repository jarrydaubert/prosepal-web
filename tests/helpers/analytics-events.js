/**
 * Normalize Vercel analytics event signatures captured from `window.va`.
 * @param {unknown[][]} capturedCalls
 * @returns {{name: string, properties: Record<string, unknown>}[]}
 */
function normalizeEvents(capturedCalls) {
  /** @type {{name: string, properties: Record<string, unknown>}[]} */
  const normalized = [];

  for (const call of capturedCalls) {
    if (!Array.isArray(call) || call[0] !== "event") {
      continue;
    }

    const second = call[1];
    const third = call[2];

    if (second && typeof second === "object" && !Array.isArray(second)) {
      const payload = second;
      const name = typeof payload.name === "string" ? payload.name : "";
      if (!name) {
        continue;
      }
      const { name: _ignored, ...properties } = payload;
      normalized.push({ name, properties });
      continue;
    }

    if (typeof second === "string" && third && typeof third === "object" && !Array.isArray(third)) {
      normalized.push({ name: second, properties: third });
      continue;
    }

    if (typeof second === "string") {
      normalized.push({ name: second, properties: {} });
    }
  }

  return normalized;
}

/**
 * Install an in-page analytics spy before scripts execute.
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<void>}
 */
async function installAnalyticsSpy(page) {
  await page.addInitScript(() => {
    window.__analyticsCalls = window.__analyticsCalls || [];
    window.va = (...args) => {
      window.__analyticsCalls.push(args);
      const queue = window.vaq || [];
      queue.push(args);
      window.vaq = queue;
    };
  });
}

module.exports = {
  normalizeEvents,
  installAnalyticsSpy,
};
