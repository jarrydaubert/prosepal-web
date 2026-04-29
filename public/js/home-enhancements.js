(function initHomeEnhancements() {
  const analytics = window.prosepalAnalytics;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function trackEvent(name, properties = {}) {
    analytics?.trackEvent?.(name, properties);
  }

  function initRevealObserver() {
    const revealElements = document.querySelectorAll(".reveal");

    if (revealElements.length === 0) {
      return;
    }

    if (reducedMotion) {
      revealElements.forEach((element) => {
        element.classList.add("visible");
      });
      return;
    }

    document.body.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  }

  function initDemoInteractions() {
    const demoData = {
      sympathy: {
        context: "Close friend who lost their mother, heartfelt tone",
        message:
          "I don't have the right words, and I'm not going to pretend I do. I'm here for the hard days, the quiet ones, and whatever comes next.",
      },
      birthday: {
        context: "Best friend turning 30, warm and playful tone",
        message:
          "Thirty looks incredible on you. Thank you for being the person who makes ordinary days feel like milestones. I'm lucky to celebrate you.",
      },
      thankyou: {
        context: "Mentor who supported a major career step",
        message:
          "Thank you for backing me before I had proof to offer. Your belief changed my path, and I will carry that forward in how I show up for others.",
      },
      wedding: {
        context: "Close couple on their wedding day, joyful tone",
        message:
          "Today is beautiful, but what is even better is how you choose each other every day. Wishing you a lifetime of laughter, steadiness, and adventure.",
      },
    };

    const demoChips = document.querySelectorAll(".demo-chip");
    const demoPanel = document.getElementById("demo-panel");
    const demoContext = document.getElementById("demo-context");
    const demoMessage = document.getElementById("demo-message");
    const copyButton = document.getElementById("demo-copy");

    function selectDemo(key, selectedChip) {
      const value = demoData[key];
      if (!value || !demoContext || !demoMessage) {
        return;
      }

      demoContext.textContent = value.context;
      demoMessage.textContent = value.message;

      demoChips.forEach((chip) => {
        const isActive = chip === selectedChip;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-selected", String(isActive));
        chip.tabIndex = isActive ? 0 : -1;
      });

      if (demoPanel && selectedChip?.id) {
        demoPanel.setAttribute("aria-labelledby", selectedChip.id);
      }
    }

    function fallbackCopyText(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }

      document.body.removeChild(textarea);
      return copied;
    }

    demoChips.forEach((chip, index) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.key;
        if (!key) {
          return;
        }

        selectDemo(key, chip);
        trackEvent("demo_chip_click", { variant: key, interaction: "click" });
      });

      chip.addEventListener("keydown", (event) => {
        if (
          event.key !== "ArrowRight" &&
          event.key !== "ArrowLeft" &&
          event.key !== "Home" &&
          event.key !== "End"
        ) {
          return;
        }

        event.preventDefault();

        let nextIndex;
        if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = demoChips.length - 1;
        } else {
          const direction = event.key === "ArrowRight" ? 1 : -1;
          nextIndex = (index + direction + demoChips.length) % demoChips.length;
        }

        const nextChip = demoChips[nextIndex];
        const key = nextChip.dataset.key;
        if (!key) {
          return;
        }

        selectDemo(key, nextChip);
        nextChip.focus();
        trackEvent("demo_chip_click", { variant: key, interaction: "keyboard" });
      });
    });

    if (!copyButton || !demoMessage) {
      return;
    }

    copyButton.addEventListener("click", async () => {
      const defaultLabel = "Copy sample";
      const textToCopy = demoMessage.textContent || "";

      try {
        await navigator.clipboard.writeText(textToCopy);
        copyButton.textContent = "Copied";
      } catch {
        const copied = fallbackCopyText(textToCopy);
        if (copied) {
          copyButton.textContent = "Copied";
        } else {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(demoMessage);
          selection?.removeAllRanges();
          selection?.addRange(range);
          demoMessage.setAttribute("tabindex", "-1");
          demoMessage.focus();
          copyButton.textContent = "Select text to copy";
        }
      }

      window.setTimeout(() => {
        copyButton.textContent = defaultLabel;
      }, 1400);
    });
  }

  function initTipsPopup() {
    const tipsPopupOverlay = document.getElementById("tips-popup-overlay");
    const tipsPopupClose = document.getElementById("tips-popup-close");
    const tipsPopupDismiss = document.getElementById("tips-popup-dismiss");
    const tipsPopupForm = document.getElementById("tips-popup-form");
    const tipsPopupEmail = document.getElementById("tips-popup-email");
    const tipsPopupStatus = document.getElementById("tips-popup-status");
    const tipsPopupButton = tipsPopupForm?.querySelector("button[type='submit']");
    const tipsPopupDialog = tipsPopupOverlay?.querySelector(".tips-popup");
    const focusableSelector =
      "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    if (
      !tipsPopupOverlay ||
      !tipsPopupClose ||
      !tipsPopupDismiss ||
      !tipsPopupForm ||
      !tipsPopupStatus ||
      !(tipsPopupButton instanceof HTMLButtonElement) ||
      !tipsPopupDialog
    ) {
      return;
    }

    const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";
    const configuredPopupDelay = Number(window.__prosepalPopupDelayMs);
    const popupDelayMs =
      Number.isFinite(configuredPopupDelay) && configuredPopupDelay >= 0
        ? configuredPopupDelay
        : 12000;
    const configuredIntentSuppressMs = Number(window.__prosepalPopupIntentSuppressMs);
    const popupIntentSuppressMs =
      Number.isFinite(configuredIntentSuppressMs) && configuredIntentSuppressMs >= 0
        ? configuredIntentSuppressMs
        : 45000;
    const popupDismissDays = 14;
    const popupSubmitDays = 90;
    const conversionIntentSelector = "#android-waitlist-form, .hero-actions, .hero-secondary-links";

    let popupOpen = false;
    let popupSeen = false;
    let previousFocusedElement = null;
    let lastConversionIntentAt = 0;
    let popupTimerId = null;

    function markConversionIntent() {
      lastConversionIntentAt = Date.now();
    }

    function hasRecentConversionIntent() {
      if (Date.now() - lastConversionIntentAt < popupIntentSuppressMs) {
        return true;
      }

      const activeElement = document.activeElement;
      return (
        activeElement instanceof Element && Boolean(activeElement.closest("#android-waitlist-form"))
      );
    }

    function isConversionIntentTarget(target) {
      return target instanceof Element && Boolean(target.closest(conversionIntentSelector));
    }

    function getDismissedUntil() {
      try {
        return Number(localStorage.getItem(POPUP_DISMISS_KEY) || 0);
      } catch {
        return 0;
      }
    }

    function setDismissed(days) {
      try {
        localStorage.setItem(POPUP_DISMISS_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
      } catch {
        // Ignore storage failures.
      }
    }

    function shouldShowPopup() {
      return Date.now() > getDismissedUntil();
    }

    function openPopup(trigger) {
      if (popupOpen || popupSeen || !shouldShowPopup()) {
        return;
      }

      popupOpen = true;
      popupSeen = true;
      trackEvent("tips_popup_open", { surface: "tips_popup", trigger });
      previousFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      tipsPopupOverlay.classList.add("open");
      tipsPopupOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      tipsPopupEmail?.focus();
    }

    function closePopup(persistDays, reason) {
      if (!popupOpen) {
        return;
      }

      popupOpen = false;
      trackEvent("tips_popup_dismiss", { surface: "tips_popup", reason });
      tipsPopupOverlay.classList.remove("open");
      tipsPopupOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      if (typeof persistDays === "number") {
        setDismissed(persistDays);
      }

      previousFocusedElement?.focus();
    }

    function schedulePopupOpen(delay = popupDelayMs) {
      if (popupOpen || popupSeen || !shouldShowPopup() || popupTimerId !== null) {
        return;
      }

      popupTimerId = window.setTimeout(() => {
        popupTimerId = null;

        if (popupOpen || popupSeen || !shouldShowPopup()) {
          return;
        }

        if (hasRecentConversionIntent()) {
          const retryDelay = Math.max(
            popupIntentSuppressMs - (Date.now() - lastConversionIntentAt),
            400,
          );
          schedulePopupOpen(retryDelay);
          return;
        }

        openPopup("timer");
      }, delay);
    }

    schedulePopupOpen();

    document.addEventListener("pointerdown", (event) => {
      if (isConversionIntentTarget(event.target)) {
        markConversionIntent();
      }
    });

    document.addEventListener("focusin", (event) => {
      if (isConversionIntentTarget(event.target)) {
        markConversionIntent();
      }
    });

    document.addEventListener("input", (event) => {
      if (isConversionIntentTarget(event.target)) {
        markConversionIntent();
      }
    });

    document.addEventListener("mouseout", (event) => {
      if (event.clientY <= 0) {
        openPopup("exit_intent");
      }
    });

    tipsPopupClose.addEventListener("click", () => {
      closePopup(popupDismissDays, "close_button");
    });

    tipsPopupDismiss.addEventListener("click", () => {
      closePopup(popupDismissDays, "dismiss_button");
    });

    tipsPopupOverlay.addEventListener("click", (event) => {
      if (event.target === tipsPopupOverlay) {
        closePopup(popupDismissDays, "overlay_click");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!popupOpen) {
        return;
      }

      if (event.key === "Escape") {
        closePopup(popupDismissDays, "escape_key");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = [...tipsPopupDialog.querySelectorAll(focusableSelector)].filter(
        (element) => element instanceof HTMLElement && !element.hasAttribute("disabled"),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !tipsPopupDialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });

    tipsPopupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      markConversionIntent();
      trackEvent("waitlist_submit_start", { surface: "tips_popup" });

      tipsPopupButton.disabled = true;
      const defaultLabel = tipsPopupButton.textContent;
      tipsPopupButton.textContent = "Submitting...";
      tipsPopupStatus.textContent = "";
      tipsPopupStatus.removeAttribute("data-state");

      try {
        const response = await fetch(tipsPopupForm.action, {
          method: "POST",
          body: new FormData(tipsPopupForm),
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Popup Formspree submission failed");
        }

        tipsPopupForm.reset();
        tipsPopupStatus.dataset.state = "success";
        tipsPopupStatus.textContent = "Thanks. Check your inbox soon.";
        trackEvent("waitlist_submit_success", { surface: "tips_popup" });
        setDismissed(popupSubmitDays);
        window.setTimeout(() => closePopup(undefined, "submit_success"), 1200);
      } catch {
        tipsPopupStatus.dataset.state = "error";
        tipsPopupStatus.textContent = "Could not submit right now. Please try again.";
        trackEvent("waitlist_submit_error", { surface: "tips_popup" });
      } finally {
        tipsPopupButton.disabled = false;
        tipsPopupButton.textContent = defaultLabel;
      }
    });
  }

  initRevealObserver();
  initDemoInteractions();
  initTipsPopup();
})();
