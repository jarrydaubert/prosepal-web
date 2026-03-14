(function bootstrapExperiments() {
  const ASSIGNMENT_STORAGE_KEY = "prosepal_experiment_assignments_v1";
  const EXPOSURE_SESSION_KEY = "prosepal_experiment_exposures_v1";
  const HERO_EXPERIMENT_ID = "hero_copy_clarity_v1";
  const VALID_VARIANTS = ["control", "treatment"];
  const QUERY_PARAM = "exp_hero_copy_clarity_v1";
  const DEFAULT_VARIANT = "treatment";
  const RANDOMIZED_ASSIGNMENT_ENABLED = false;

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

  /**
   * @param {string} key
   * @param {Storage} storage
   * @returns {Record<string, string>}
   */
  function readObjectStorage(key, storage) {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }

      /** @type {Record<string, string>} */
      const next = {};
      for (const [entryKey, value] of Object.entries(parsed)) {
        if (typeof value === "string" && value.length > 0) {
          next[entryKey] = value;
        }
      }
      return next;
    } catch {
      return {};
    }
  }

  /**
   * @param {string} key
   * @param {Record<string, string>} value
   * @param {Storage} storage
   * @returns {void}
   */
  function writeObjectStorage(key, value, storage) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write failures in restricted browser contexts.
    }
  }

  /**
   * @param {string | null} value
   * @returns {string | null}
   */
  function normalizeVariant(value) {
    if (typeof value !== "string") {
      return null;
    }
    return VALID_VARIANTS.includes(value) ? value : null;
  }

  /**
   * @returns {string}
   */
  function chooseRandomVariant() {
    if (window.crypto?.getRandomValues) {
      const buffer = new Uint8Array(1);
      window.crypto.getRandomValues(buffer);
      return VALID_VARIANTS[buffer[0] % VALID_VARIANTS.length];
    }
    return VALID_VARIANTS[Math.floor(Math.random() * VALID_VARIANTS.length)];
  }

  /**
   * @returns {string | null}
   */
  function getOverrideVariant() {
    const params = new URLSearchParams(window.location.search || "");
    return normalizeVariant(params.get(QUERY_PARAM));
  }

  /**
   * @returns {string}
   */
  function resolveHeroVariant() {
    const storedAssignments = readObjectStorage(ASSIGNMENT_STORAGE_KEY, window.localStorage);
    const override = getOverrideVariant();
    if (override) {
      storedAssignments[HERO_EXPERIMENT_ID] = override;
      writeObjectStorage(ASSIGNMENT_STORAGE_KEY, storedAssignments, window.localStorage);
      return override;
    }

    if (!RANDOMIZED_ASSIGNMENT_ENABLED) {
      storedAssignments[HERO_EXPERIMENT_ID] = DEFAULT_VARIANT;
      writeObjectStorage(ASSIGNMENT_STORAGE_KEY, storedAssignments, window.localStorage);
      return DEFAULT_VARIANT;
    }

    const persisted = normalizeVariant(storedAssignments[HERO_EXPERIMENT_ID]);
    if (persisted) {
      return persisted;
    }

    const nextVariant = chooseRandomVariant();
    storedAssignments[HERO_EXPERIMENT_ID] = nextVariant;
    writeObjectStorage(ASSIGNMENT_STORAGE_KEY, storedAssignments, window.localStorage);
    return nextVariant;
  }

  /**
   * @param {string} variant
   * @returns {void}
   */
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

  const activeAssignments = {
    [HERO_EXPERIMENT_ID]: resolveHeroVariant(),
  };

  applyHeroCopyVariant(activeAssignments[HERO_EXPERIMENT_ID]);

  /**
   * @returns {{experiment_id: string, variant_id: string} | {}}
   */
  function getPrimaryContext() {
    const variant = normalizeVariant(activeAssignments[HERO_EXPERIMENT_ID]);
    if (!variant) {
      return {};
    }
    return {
      experiment_id: HERO_EXPERIMENT_ID,
      variant_id: variant,
    };
  }

  /**
   * @param {(name: string, properties?: Record<string, unknown>) => void} trackEvent
   * @returns {void}
   */
  function emitExposureEvents(trackEvent) {
    if (typeof trackEvent !== "function") {
      return;
    }

    const seen = readObjectStorage(EXPOSURE_SESSION_KEY, window.sessionStorage);
    const variant = normalizeVariant(activeAssignments[HERO_EXPERIMENT_ID]);
    if (!variant) {
      return;
    }

    if (seen[HERO_EXPERIMENT_ID] === variant) {
      return;
    }

    trackEvent("experiment_exposure", {
      experiment_id: HERO_EXPERIMENT_ID,
      variant_id: variant,
    });
    seen[HERO_EXPERIMENT_ID] = variant;
    writeObjectStorage(EXPOSURE_SESSION_KEY, seen, window.sessionStorage);
  }

  window.prosepalExperiments = {
    /**
     * @param {string} experimentId
     * @returns {string | undefined}
     */
    getAssignment(experimentId) {
      return activeAssignments[experimentId];
    },
    /**
     * @returns {Record<string, string>}
     */
    getActiveAssignments() {
      return { ...activeAssignments };
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
