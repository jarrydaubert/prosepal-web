const SITE_URL = "https://www.prosepal.app";
const SITE_NAME = "Prosepal";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

function toAbsoluteUrl(pathname) {
  if (!pathname) return SITE_URL;
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalized}`;
}

function formatTitle(title) {
  if (!title) {
    return SITE_NAME;
  }

  if (title.includes(SITE_NAME)) {
    return title;
  }

  return `${title} | ${SITE_NAME}`;
}

function buildMetadata(options) {
  const {
    title,
    description,
    pathname = "/",
    type = "website",
    image = DEFAULT_OG_IMAGE,
    robots = "index, follow",
    twitterCard = "summary_large_image",
  } = options;

  const formattedTitle = formatTitle(title);
  const canonical = toAbsoluteUrl(pathname);
  const imageUrl = toAbsoluteUrl(image);

  return {
    title: formattedTitle,
    description,
    canonical,
    robots,
    openGraph: {
      title: formattedTitle,
      description,
      type,
      url: canonical,
      image: imageUrl,
      imageWidth: 1200,
      imageHeight: 630,
      imageAlt: `${SITE_NAME} social preview`,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: twitterCard,
      title: formattedTitle,
      description,
      image: imageUrl,
      imageAlt: `${SITE_NAME} social preview`,
    },
  };
}

module.exports = {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  buildMetadata,
  formatTitle,
  toAbsoluteUrl,
};
