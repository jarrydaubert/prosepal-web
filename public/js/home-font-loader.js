(() => {
  const fontStylesheetHref =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap";

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
