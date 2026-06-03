document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!menuButton || !mobileMenu) {
      return;
    }
    mobileMenu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }
});
