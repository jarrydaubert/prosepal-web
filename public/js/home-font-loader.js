(() => {
  const fontStylesheetHref =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap";

  if (document.querySelector(`link[href="${fontStylesheetHref}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontStylesheetHref;
  link.media = "print";
  link.dataset.asyncFonts = "true";

  const applyStylesheet = () => {
    link.media = "all";
  };

  link.addEventListener("load", applyStylesheet, { once: true });
  link.addEventListener("error", applyStylesheet, { once: true });
  document.head.appendChild(link);
})();
