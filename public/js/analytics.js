(function bootstrapVercelAnalytics() {
  const OPT_OUT_KEY = "prosepal_analytics_opt_out";
  const APP_STORE_LINK_SELECTOR = "a[href*='apps.apple.com/app/prosepal/id6757088726']";

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

  /**
   * Derive a stable, analytics-friendly page type from the current path.
   * @param {string} pathname
   * @returns {string}
   */
  function getPageType(pathname) {
    if (pathname === "/") return "home";
    if (pathname === "/blog/" || pathname === "/blog/index.html") return "blog_hub";
    if (pathname.startsWith("/blog/")) return "blog_article";
    if (pathname === "/messages/" || pathname === "/messages/index.html") return "messages_hub";
    if (pathname.startsWith("/messages/")) return "message_detail";
    if (pathname === "/privacy.html" || pathname === "/terms.html") return "legal";
    if (pathname === "/support.html") return "support";
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
    if (link.id) return link.id;
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
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        loadVercelAnalytics();
        setupAppStoreClickTracking();
      },
      { once: true },
    );
    return;
  }

  loadVercelAnalytics();
  setupAppStoreClickTracking();
})();
