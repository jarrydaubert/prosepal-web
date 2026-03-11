(() => {
  const fontStylesheetHref =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap";

  function promoteAsyncStylesheet(link) {
    if (!(link instanceof HTMLLinkElement) || link.dataset.asyncPromoted === "true") {
      return;
    }

    link.dataset.asyncPromoted = "true";

    const applyStylesheet = () => {
      link.media = "all";
    };

    if (link.sheet) {
      applyStylesheet();
      return;
    }

    link.addEventListener("load", applyStylesheet, { once: true });
    link.addEventListener("error", applyStylesheet, { once: true });
  }

  document.querySelectorAll("link[data-async-home-sections='true']").forEach((link) => {
    promoteAsyncStylesheet(link);
  });

  if (document.querySelector(`link[href="${fontStylesheetHref}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontStylesheetHref;
  link.media = "print";
  link.dataset.asyncFonts = "true";
  document.head.appendChild(link);
  promoteAsyncStylesheet(link);
})();
