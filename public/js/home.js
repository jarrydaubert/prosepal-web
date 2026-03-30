document.addEventListener("DOMContentLoaded", () => {
  const analytics = window.prosepalAnalytics;

  function trackEvent(name, properties = {}) {
    analytics?.trackEvent?.(name, properties);
  }

  function scheduleNonCritical(task, timeout = 1400) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => task(), { timeout });
      return;
    }

    window.setTimeout(task, 1);
  }

  function loadHomeEnhancements() {
    if (document.querySelector("script[data-home-enhancements='true']")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "/js/home-enhancements.js";
    script.defer = true;
    script.dataset.homeEnhancements = "true";
    document.head.appendChild(script);
  }

  function initScrollChrome() {
    const scrollProgress = document.querySelector(".scroll-progress");
    const nav = document.querySelector(".nav");

    if (!scrollProgress && !nav) {
      return;
    }

    let ticking = false;

    const updateScrollChrome = () => {
      ticking = false;

      if (scrollProgress) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        scrollProgress.style.transform = `scaleX(${percent})`;
      }

      if (nav) {
        nav.classList.toggle("scrolled", window.scrollY > 24);
      }
    };

    const queueUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateScrollChrome);
    };

    window.addEventListener("scroll", queueUpdate, { passive: true });
    updateScrollChrome();
  }

  function initMobileMenu() {
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

    if (!hamburger || !mobileMenu) {
      return;
    }

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

  function initHeroWaitlist() {
    const waitlistForm = document.getElementById("android-waitlist-form");
    const waitlistStatus = document.getElementById("android-waitlist-status");
    const waitlistButton = waitlistForm?.querySelector("button[type='submit']");

    if (!waitlistForm || !waitlistStatus || !(waitlistButton instanceof HTMLButtonElement)) {
      return;
    }

    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      trackEvent("waitlist_submit_start", { surface: "hero_waitlist" });

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
        trackEvent("waitlist_submit_error", { surface: "hero_waitlist" });
      } finally {
        waitlistButton.disabled = false;
        waitlistButton.textContent = defaultButtonLabel;
      }
    });
  }

  initScrollChrome();
  initMobileMenu();
  initHeroWaitlist();
  scheduleNonCritical(loadHomeEnhancements, 900);
});
