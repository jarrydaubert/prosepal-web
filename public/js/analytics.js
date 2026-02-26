(function bootstrapVercelAnalytics() {
  const OPT_OUT_KEY = "prosepal_analytics_opt_out";

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

  function trackEvent(name, properties = {}) {
    if (!isTrackingAllowed() || typeof name !== "string" || name.length === 0) {
      return;
    }

    const payload =
      properties && typeof properties === "object" && !Array.isArray(properties) ? properties : {};

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

  window.prosepalAnalytics = {
    isTrackingAllowed,
    trackEvent,
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
        loadVercelAnalytics();
      }
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadVercelAnalytics, { once: true });
    return;
  }

  loadVercelAnalytics();
})();
