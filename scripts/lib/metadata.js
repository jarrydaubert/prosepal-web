const SITE_URL = "https://www.prosepal.app";
const SITE_NAME = "Prosepal";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image-v3.jpg`;
const BRAND_LOGO_URL = `${SITE_URL}/logo.png`;
const CONTENT_DATE = process.env.PROSEPAL_CONTENT_DATE || new Date().toISOString().slice(0, 10);

/**
 * Convert a site-relative path to an absolute URL for metadata.
 * Pass-through for already-absolute URLs.
 * @param {string} pathname
 * @returns {string}
 */
function toAbsoluteUrl(pathname) {
  if (!pathname) return SITE_URL;
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Ensure page titles consistently include the site name suffix.
 * @param {string} title
 * @returns {string}
 */
function formatTitle(title) {
  if (!title) {
    return SITE_NAME;
  }

  if (title.includes(SITE_NAME)) {
    return title;
  }

  return `${title} | ${SITE_NAME}`;
}

/**
 * Build canonical, Open Graph, and Twitter metadata fields from one input object.
 * @param {{
 *   title: string,
 *   description: string,
 *   pathname?: string,
 *   type?: string,
 *   image?: string,
 *   robots?: string,
 *   twitterCard?: string
 * }} options
 * @returns {{
 *   title: string,
 *   description: string,
 *   canonical: string,
 *   robots: string,
 *   openGraph: {
 *     title: string,
 *     description: string,
 *     type: string,
 *     url: string,
 *     image: string,
 *     imageWidth: number,
 *     imageHeight: number,
 *     imageAlt: string,
 *     siteName: string,
 *     locale: string
 *   },
 *   twitter: {
 *     card: string,
 *     title: string,
 *     description: string,
 *     image: string,
 *     imageAlt: string
 *   }
 * }}
 */
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
  BRAND_LOGO_URL,
  CONTENT_DATE,
  buildMetadata,
  formatTitle,
  toAbsoluteUrl,
};
