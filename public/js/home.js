document.addEventListener("DOMContentLoaded", () => {
  const scrollProgress = document.querySelector(".scroll-progress");
  const nav = document.querySelector(".nav");
  if (scrollProgress || nav) {
    const handleScroll = () => {
      if (scrollProgress) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
        scrollProgress.style.width = `${percent}%`;
      }

      if (nav) {
        nav.classList.toggle("scrolled", window.scrollY > 24);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  const revealElements = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealElements.length > 0) {
    if (reducedMotion) {
      revealElements.forEach((element) => {
        element.classList.add("visible");
      });
    } else {
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
  }

  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const firstMobileLink = mobileMenu?.querySelector("a");

  function closeMobileMenu(restoreFocus) {
    if (!hamburger || !mobileMenu) {
      return;
    }

    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    if (restoreFocus) {
      hamburger.focus();
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";

      if (isOpen && firstMobileLink) {
        firstMobileLink.focus();
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
        closeMobileMenu(true);
      }
    });
  }

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
  const analytics = window.prosepalAnalytics;

  function trackEvent(name, properties = {}) {
    analytics?.trackEvent?.(name, properties);
  }

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

  if (demoChips.length > 0) {
    demoChips.forEach((chip, index) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.key;
        if (!key) {
          return;
        }

        selectDemo(key, chip);
        trackEvent("demo_chip_click", { variant: key });
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
      });
    });
  }

  if (copyButton && demoMessage) {
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

      setTimeout(() => {
        copyButton.textContent = defaultLabel;
      }, 1400);
    });
  }

  const waitlistForm = document.getElementById("android-waitlist-form");
  const waitlistStatus = document.getElementById("android-waitlist-status");
  const waitlistButton = waitlistForm?.querySelector("button[type='submit']");

  if (waitlistForm && waitlistStatus && waitlistButton instanceof HTMLButtonElement) {
    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      waitlistButton.disabled = true;
      const defaultButtonLabel = waitlistButton.textContent;
      waitlistButton.textContent = "Submitting...";
      waitlistStatus.textContent = "";
      waitlistStatus.removeAttribute("data-state");

      try {
        const response = await fetch(waitlistForm.action, {
          method: "POST",
          body: new FormData(waitlistForm),
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Formspree submission failed");
        }

        waitlistForm.reset();
        waitlistStatus.dataset.state = "success";
        waitlistStatus.textContent = "Thanks, you are on the Android waitlist.";
        trackEvent("waitlist_submit_success", { surface: "hero_waitlist" });
      } catch {
        waitlistStatus.dataset.state = "error";
        waitlistStatus.textContent = "Submission failed. Please try again in a moment.";
      } finally {
        waitlistButton.disabled = false;
        waitlistButton.textContent = defaultButtonLabel;
      }
    });
  }

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
    tipsPopupOverlay &&
    tipsPopupClose &&
    tipsPopupDismiss &&
    tipsPopupForm &&
    tipsPopupStatus &&
    tipsPopupButton instanceof HTMLButtonElement &&
    tipsPopupDialog
  ) {
    const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";
    const POPUP_DELAY_MS = 12000;
    const POPUP_DISMISS_DAYS = 14;
    const POPUP_SUBMIT_DAYS = 90;
    let popupOpen = false;
    let popupSeen = false;
    let previousFocusedElement = null;

    function getDismissedUntil() {
      try {
        return Number(localStorage.getItem(POPUP_DISMISS_KEY) || 0);
      } catch {
        return 0;
      }
    }

    function setDismissed(days) {
      const until = Date.now() + days * 24 * 60 * 60 * 1000;

      try {
        localStorage.setItem(POPUP_DISMISS_KEY, String(until));
      } catch {
        // Ignore storage failures (private mode, blocked storage).
      }
    }

    function shouldShowPopup() {
      return Date.now() > getDismissedUntil();
    }

    function openPopup() {
      if (popupOpen || popupSeen || !shouldShowPopup()) {
        return;
      }

      popupOpen = true;
      popupSeen = true;
      previousFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      tipsPopupOverlay.classList.add("open");
      tipsPopupOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      if (tipsPopupEmail instanceof HTMLInputElement) {
        tipsPopupEmail.focus();
      }
    }

    function closePopup(persistDays) {
      popupOpen = false;
      tipsPopupOverlay.classList.remove("open");
      tipsPopupOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      if (typeof persistDays === "number") {
        setDismissed(persistDays);
      }

      if (previousFocusedElement) {
        previousFocusedElement.focus();
      }
    }

    if (shouldShowPopup()) {
      window.setTimeout(openPopup, POPUP_DELAY_MS);
    }

    document.addEventListener("mouseout", (event) => {
      if (event.clientY > 0) {
        return;
      }
      openPopup();
    });

    tipsPopupClose.addEventListener("click", () => {
      closePopup(POPUP_DISMISS_DAYS);
    });

    tipsPopupDismiss.addEventListener("click", () => {
      closePopup(POPUP_DISMISS_DAYS);
    });

    tipsPopupOverlay.addEventListener("click", (event) => {
      if (event.target === tipsPopupOverlay) {
        closePopup(POPUP_DISMISS_DAYS);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!popupOpen) {
        return;
      }

      if (event.key === "Escape") {
        closePopup(POPUP_DISMISS_DAYS);
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
        setDismissed(POPUP_SUBMIT_DAYS);
        window.setTimeout(() => closePopup(), 1200);
      } catch {
        tipsPopupStatus.dataset.state = "error";
        tipsPopupStatus.textContent = "Could not submit right now. Please try again.";
      } finally {
        tipsPopupButton.disabled = false;
        tipsPopupButton.textContent = defaultLabel;
      }
    });
  }
});
