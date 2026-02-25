const assert = require("node:assert/strict");
const {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  buildMetadata,
  formatTitle,
  toAbsoluteUrl,
} = require("./lib/metadata");

function run() {
  assert.equal(formatTitle("Home"), "Home | Prosepal");
  assert.equal(formatTitle("Home | Prosepal"), "Home | Prosepal");

  assert.equal(toAbsoluteUrl("/messages/"), `${SITE_URL}/messages/`);
  assert.equal(toAbsoluteUrl("messages/index.html"), `${SITE_URL}/messages/index.html`);
  assert.equal(toAbsoluteUrl("https://example.com/x"), "https://example.com/x");

  const meta = buildMetadata({
    title: "Messages",
    description: "Card message ideas",
    pathname: "/messages/",
  });

  assert.equal(meta.title, "Messages | Prosepal");
  assert.equal(meta.canonical, `${SITE_URL}/messages/`);
  assert.equal(meta.openGraph.image, DEFAULT_OG_IMAGE);
  assert.equal(meta.twitter.card, "summary_large_image");

  const noIndex = buildMetadata({
    title: "404",
    description: "Not found",
    pathname: "/404.html",
    robots: "noindex",
    image: "/blog/og-sympathy-card.jpg",
  });

  assert.equal(noIndex.robots, "noindex");
  assert.equal(noIndex.openGraph.image, `${SITE_URL}/blog/og-sympathy-card.jpg`);

  console.log("metadata tests passed");
}

run();
