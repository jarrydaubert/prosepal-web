(function bootstrapVercelAnalytics() {
  const OPT_OUT_KEY = "prosepal_analytics_opt_out";
  const ATTRIBUTION_KEY = "prosepal_analytics_attribution_v1";
  const ATTRIBUTION_TTL_DAYS = 90;
  const ATTRIBUTION_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
  ];
  const APP_STORE_LINK_SELECTOR = "a[href*='apps.apple.com/app/prosepal/id6757088726']";
  const CONTENT_WAITLIST_FORM_SELECTOR = ".waitlist-inline-form[data-waitlist-surface]";
  const EXPERIMENT_ASSIGNMENT_KEY = "prosepal_experiment_assignments_v1";
  const PRIMARY_EXPERIMENT_ID = "hero_copy_clarity_v1";
  const PRIMARY_EXPERIMENT_VARIANTS = new Set(["control", "treatment"]);

  function isTrackingAllowed() {
    const doNotTrackEnabled =
      window.doNotTrack === "1" || navigator.doNotTrack === "1" || navigator.msDoNotTrack === "1";
    const globalPrivacyControlEnabled = navigator.globalPrivacyControl === true;

    let hasOptedOut = false;
    try {
      hasOptedOut = window.localStorage.getItem(OPT_OUT_KEY) === "1";
    } catch {
      hasOptedOut = false;
    }

    return !doNotTrackEnabled && !globalPrivacyControlEnabled && !hasOptedOut;
  }

  function queueVercelAnalytics(bucket, args) {
    const queue = window[bucket] || [];
    queue.push(args);
    window[bucket] = queue;
  }

  window.va =
    window.va ||
    function queueAnalytics(...args) {
      queueVercelAnalytics("vaq", args);
    };

  window.si =
    window.si ||
    function queueSpeedInsights(...args) {
      queueVercelAnalytics("siq", args);
    };

  function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadVercelAnalytics() {
    if (!isTrackingAllowed()) {
      return;
    }

    loadScript("/_vercel/insights/script.js");
    loadScript("/_vercel/speed-insights/script.js");
  }

  let vercelAnalyticsScheduled = false;

  function scheduleVercelAnalyticsLoad() {
    if (vercelAnalyticsScheduled || !isTrackingAllowed()) {
      return;
    }

    vercelAnalyticsScheduled = true;
    const load = () => {
      loadVercelAnalytics();
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(load, { timeout: 2500 });
      return;
    }

    if (document.readyState === "complete") {
      window.setTimeout(load, 0);
      return;
    }

    window.addEventListener("load", load, { once: true });
  }

  function readStoredAttribution() {
    try {
      const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      const expiresAt =
        typeof parsed.expires_at === "number" && Number.isFinite(parsed.expires_at)
          ? parsed.expires_at
          : 0;
      if (expiresAt <= Date.now()) {
        window.localStorage.removeItem(ATTRIBUTION_KEY);
        return {};
      }

      const values = parsed.values;
      if (!values || typeof values !== "object" || Array.isArray(values)) {
        return {};
      }

      const attribution = {};
      for (const field of ATTRIBUTION_FIELDS) {
        const value = values[field];
        if (typeof value === "string" && value.length > 0) {
          attribution[field] = value;
        }
      }
      return attribution;
    } catch {
      return {};
    }
  }

  function writeStoredAttribution(attribution) {
    if (!attribution || typeof attribution !== "object") {
      return;
    }

    const payload = {};
    for (const field of ATTRIBUTION_FIELDS) {
      const value = attribution[field];
      if (typeof value === "string" && value.length > 0) {
        payload[field] = value.slice(0, 160);
      }
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    try {
      window.localStorage.setItem(
        ATTRIBUTION_KEY,
        JSON.stringify({
          values: payload,
          captured_at: Date.now(),
          expires_at: Date.now() + ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000,
        }),
      );
    } catch {
      // Ignore storage errors in restricted contexts.
    }
  }

  function extractAttributionFromLocation() {
    const params = new URLSearchParams(window.location.search || "");
    const attribution = {};

    for (const field of ATTRIBUTION_FIELDS) {
      const value = params.get(field);
      if (typeof value === "string" && value.trim().length > 0) {
        attribution[field] = value.trim();
      }
    }

    return attribution;
  }

  function mergeAttribution(base, extra) {
    const merged = { ...base };
    for (const field of ATTRIBUTION_FIELDS) {
      const value = extra[field];
      if (typeof value === "string" && value.length > 0) {
        merged[field] = value;
      }
    }
    return merged;
  }

  function initializeAttribution() {
    if (!isTrackingAllowed()) {
      return {};
    }

    const storedAttribution = readStoredAttribution();
    const fromLocation = extractAttributionFromLocation();
    const merged = mergeAttribution(storedAttribution, fromLocation);

    if (Object.keys(fromLocation).length > 0) {
      writeStoredAttribution(merged);
    }

    return merged;
  }

  let attributionProperties = initializeAttribution();

  function getAttributionProperties() {
    if (!isTrackingAllowed()) {
      return {};
    }

    if (Object.keys(attributionProperties).length === 0) {
      attributionProperties = readStoredAttribution();
    }
    return attributionProperties;
  }

  function readStoredPrimaryExperimentContext() {
    try {
      const raw = window.localStorage.getItem(EXPERIMENT_ASSIGNMENT_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }

      const variant = parsed[PRIMARY_EXPERIMENT_ID];
      if (typeof variant !== "string" || !PRIMARY_EXPERIMENT_VARIANTS.has(variant)) {
        return {};
      }

      return {
        experiment_id: PRIMARY_EXPERIMENT_ID,
        variant_id: variant,
      };
    } catch {
      return {};
    }
  }

  function getExperimentProperties() {
    const liveContext = window.prosepalExperiments?.getPrimaryContext?.();
    if (liveContext && typeof liveContext === "object" && !Array.isArray(liveContext)) {
      const experimentId = liveContext.experiment_id;
      const variantId = liveContext.variant_id;
      if (
        typeof experimentId === "string" &&
        experimentId.length > 0 &&
        typeof variantId === "string" &&
        variantId.length > 0
      ) {
        return {
          experiment_id: experimentId,
          variant_id: variantId,
        };
      }
    }

    return readStoredPrimaryExperimentContext();
  }

  function trackEvent(name, properties = {}) {
    if (!isTrackingAllowed() || typeof name !== "string" || name.length === 0) {
      return;
    }

    const basePayload =
      properties && typeof properties === "object" && !Array.isArray(properties) ? properties : {};
    const payload = {
      ...getAttributionProperties(),
      ...getExperimentProperties(),
      ...basePayload,
    };

    try {
      window.va("event", { name, ...payload });
      return;
    } catch {
      // Some integrations accept a positional event signature.
    }

    try {
      window.va("event", name, payload);
    } catch {
      // Ignore analytics transport failures.
    }
  }

  /**
   * Derive a stable, analytics-friendly page type from the current path.
   * @param {string} pathname
   * @returns {string}
   */
  function getPageType(pathname) {
    if (pathname === "/") return "home";
    if (pathname === "/blog" || pathname === "/blog/" || pathname === "/blog/index.html") {
      return "blog_hub";
    }
    if (pathname.startsWith("/blog/")) return "blog_article";
    if (
      pathname === "/messages" ||
      pathname === "/messages/" ||
      pathname === "/messages/index.html"
    ) {
      return "messages_hub";
    }
    if (pathname.startsWith("/messages/")) return "message_detail";
    if (
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname === "/privacy.html" ||
      pathname === "/terms.html"
    ) {
      return "legal";
    }
    if (pathname === "/support" || pathname === "/support.html") return "support";
    return "other";
  }

  /**
   * Derive a stable location value from a clicked App Store link and its context.
   * @param {HTMLElement} link
   * @returns {string}
   */
  function getAppStoreLocation(link) {
    const dataLocation = link.getAttribute("data-analytics-location");
    if (dataLocation) return dataLocation;
    if (link.closest("#mobile-menu")) return "mobile_menu";
    if (link.closest(".nav") || link.closest(".header-content")) return "header_nav";
    if (link.closest(".hero-actions")) return "hero_primary";
    if (link.closest(".final-cta") || link.closest(".cta-section") || link.closest(".cta-box")) {
      return "content_cta";
    }
    if (link.closest("footer")) return "footer";
    return "inline_link";
  }

  function setupAppStoreClickTracking() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest(APP_STORE_LINK_SELECTOR);
      if (!(link instanceof HTMLElement)) {
        return;
      }

      trackEvent("app_store_click", {
        location: getAppStoreLocation(link),
        page_type: getPageType(window.location.pathname),
        page_path: window.location.pathname,
      });
    });
  }

  function setupContentWaitlistForms() {
    const forms = document.querySelectorAll(CONTENT_WAITLIST_FORM_SELECTOR);
    for (const formElement of forms) {
      if (!(formElement instanceof HTMLFormElement)) {
        continue;
      }

      if (formElement.dataset.waitlistBound === "1") {
        continue;
      }
      formElement.dataset.waitlistBound = "1";

      const surface = formElement.dataset.waitlistSurface || "content_waitlist";
      const submitButton = formElement.querySelector("button[type='submit']");
      const statusElement = formElement.querySelector("[data-waitlist-status]");

      formElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        trackEvent("waitlist_submit_start", { surface });

        let defaultButtonLabel = "Get Early Access";
        if (submitButton instanceof HTMLButtonElement) {
          defaultButtonLabel = submitButton.textContent || defaultButtonLabel;
          submitButton.disabled = true;
          submitButton.textContent = "Submitting...";
        }

        if (statusElement instanceof HTMLElement) {
          statusElement.textContent = "";
          statusElement.removeAttribute("data-state");
        }

        try {
          const response = await fetch(formElement.action, {
            method: formElement.method || "POST",
            body: new FormData(formElement),
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Waitlist submission failed");
          }

          formElement.reset();
          if (statusElement instanceof HTMLElement) {
            statusElement.dataset.state = "success";
            statusElement.textContent = "Thanks, you are on the Android waitlist.";
          }
          trackEvent("waitlist_submit_success", { surface });
        } catch {
          if (statusElement instanceof HTMLElement) {
            statusElement.dataset.state = "error";
            statusElement.textContent = "Submission failed. Please try again in a moment.";
          }
          trackEvent("waitlist_submit_error", { surface });
        } finally {
          if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = false;
            submitButton.textContent = defaultButtonLabel;
          }
        }
      });
    }
  }

  window.prosepalAnalytics = {
    isTrackingAllowed,
    trackEvent,
    getPageType,
    setOptOut(value) {
      try {
        if (value) {
          window.localStorage.setItem(OPT_OUT_KEY, "1");
          return;
        }

        window.localStorage.removeItem(OPT_OUT_KEY);
      } catch {
        // Ignore storage errors in restricted browser contexts.
      }

      if (!value) {
        scheduleVercelAnalyticsLoad();
      }
    },
  };
  window.dispatchEvent(new CustomEvent("prosepal:analytics:ready"));

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        scheduleVercelAnalyticsLoad();
        setupAppStoreClickTracking();
        setupContentWaitlistForms();
      },
      { once: true },
    );
    return;
  }

  scheduleVercelAnalyticsLoad();
  setupAppStoreClickTracking();
  setupContentWaitlistForms();
})();
