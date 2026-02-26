(function setupMobileMenu() {
  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const firstMobileLink = mobileMenu?.querySelector("a");

  if (!hamburger || !mobileMenu) {
    return;
  }

  function closeMenu(restoreFocus) {
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    if (restoreFocus) {
      hamburger.focus();
    }
  }

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";

    if (isOpen && firstMobileLink instanceof HTMLElement) {
      firstMobileLink.focus();
    }
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
      closeMenu(true);
    }
  });
})();
