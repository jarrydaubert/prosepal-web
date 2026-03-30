(function bootstrapExperiments() {
  const assignmentStorageKey = "prosepal_experiment_assignments_v1";
  const exposureSessionKey = "prosepal_experiment_exposures_v1";
  const heroExperimentId = "hero_copy_clarity_v1";
  const queryParam = "exp_hero_copy_clarity_v1";
  const defaultVariant = "treatment";
  const validVariants = new Set(["control", "treatment"]);

  const heroCopyVariants = {
    control: {
      badge: "Greeting card message generator",
      headlineHtml:
        'Greeting card messages<br><span class="gradient-text">that actually land</span>',
      subtitle:
        "Find what to write in any card. Get three personalized message options in under 30 seconds.",
    },
    treatment: {
      badge: "For hard-to-write cards",
      headlineHtml:
        'What to write when the words<br><span class="gradient-text">matter most</span>',
      subtitle:
        "Sympathy, apology, encouragement, and every other high-stakes card. Get three personalized message options in under 30 seconds.",
    },
  };

  function readStorageObject(key, storage) {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }

  function writeStorageObject(key, value, storage) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write failures in restricted browser contexts.
    }
  }

  function normalizeVariant(value) {
    return typeof value === "string" && validVariants.has(value) ? value : null;
  }

  function getOverrideVariant() {
    const params = new URLSearchParams(window.location.search || "");
    return normalizeVariant(params.get(queryParam));
  }

  function resolveHeroVariant() {
    const storedAssignments = readStorageObject(assignmentStorageKey, window.localStorage);
    const override = getOverrideVariant();
    const resolved =
      override || normalizeVariant(storedAssignments[heroExperimentId]) || defaultVariant;
    storedAssignments[heroExperimentId] = resolved;
    writeStorageObject(assignmentStorageKey, storedAssignments, window.localStorage);
    return resolved;
  }

  function applyHeroCopyVariant(variant) {
    if (window.location.pathname !== "/") {
      return;
    }

    const config = heroCopyVariants[variant];
    if (!config) {
      return;
    }

    const badgeText = document.getElementById("hero-category-badge-text");
    const headline = document.getElementById("hero-headline");
    const subtitle = document.getElementById("hero-subtitle");

    if (badgeText) {
      badgeText.textContent = config.badge;
    }
    if (headline) {
      headline.innerHTML = config.headlineHtml;
    }
    if (subtitle) {
      subtitle.textContent = config.subtitle;
    }
  }

  const activeVariant = resolveHeroVariant();
  applyHeroCopyVariant(activeVariant);

  function getPrimaryContext() {
    const variant = normalizeVariant(activeVariant);
    if (!variant) {
      return {};
    }
    return {
      experiment_id: heroExperimentId,
      variant_id: variant,
    };
  }

  function emitExposureEvents(trackEvent) {
    if (typeof trackEvent !== "function") {
      return;
    }

    const seen = readStorageObject(exposureSessionKey, window.sessionStorage);
    const variant = normalizeVariant(activeVariant);
    if (!variant) {
      return;
    }

    if (seen[heroExperimentId] === variant) {
      return;
    }

    trackEvent("experiment_exposure", {
      experiment_id: heroExperimentId,
      variant_id: variant,
    });
    seen[heroExperimentId] = variant;
    writeStorageObject(exposureSessionKey, seen, window.sessionStorage);
  }

  window.prosepalExperiments = {
    getAssignment(experimentId) {
      return experimentId === heroExperimentId ? activeVariant : undefined;
    },
    getActiveAssignments() {
      return { [heroExperimentId]: activeVariant };
    },
    getPrimaryContext,
    emitExposureEvents,
  };

  const analytics = window.prosepalAnalytics;
  if (analytics?.trackEvent) {
    emitExposureEvents(analytics.trackEvent);
    return;
  }

  window.addEventListener(
    "prosepal:analytics:ready",
    () => {
      const liveAnalytics = window.prosepalAnalytics;
      if (liveAnalytics?.trackEvent) {
        emitExposureEvents(liveAnalytics.trackEvent);
      }
    },
    { once: true },
  );
})();
