#!/usr/bin/env node

/**
 * SEO Landing Page Generator for Prosepal
 * Generates message guide pages from data/messages-pages.json.
 */

const fs = require("node:fs");
const path = require("node:path");
const { CONTENT_DATE, buildMetadata } = require("./lib/metadata");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT_DIR, "data", "messages-pages.json");
const TEMPLATE_FILE = path.join(ROOT_DIR, "templates", "message-page.html");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "messages");

const TODAY = CONTENT_DATE;
const FALLBACK_BLOG_BY_OCCASION = {
  Sympathy: { slug: "what-to-write-in-sympathy-card", title: "Sympathy Card Writing Guide" },
  Birthday: { slug: "birthday-card-messages", title: "Birthday Card Message Guide" },
  "Thank You": { slug: "thank-you-card-wording", title: "Thank You Card Wording Guide" },
  Wedding: { slug: "wedding-card-message", title: "Wedding Card Message Ideas" },
  Graduation: { slug: "graduation-card-messages", title: "Graduation Card Message Ideas" },
};
const HIGH_INTENT_SLUG_HINTS = ["sympathy", "birthday", "thank-you", "wedding"];
const MAX_EXCERPT_LENGTH = 120;

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function loadTemplate() {
  return fs.readFileSync(TEMPLATE_FILE, "utf8");
}

function escapeHtml(text) {
  if (!text) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsonLd(text) {
  if (!text) return "";

  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function parseIsoDate(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const parsed = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function slugSeed(slug) {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function resolvePageDates(page) {
  const baseline = parseIsoDate(CONTENT_DATE) || new Date();
  const seed = slugSeed(page.slug);
  const fallbackPublished = addDays(baseline, -30 - (seed % 180));
  const fallbackModified = addDays(baseline, -(seed % 21));

  const publishedDate = parseIsoDate(page.datePublished) || fallbackPublished;
  let modifiedDate = parseIsoDate(page.dateModified) || fallbackModified;
  if (modifiedDate < publishedDate) {
    modifiedDate = publishedDate;
  }

  return {
    datePublished: formatIsoDate(publishedDate),
    dateModified: formatIsoDate(modifiedDate),
    dateDisplay: modifiedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
}

function withIndefiniteArticle(phrase) {
  if (!phrase) {
    return "";
  }

  const article = /^[aeiou]/i.test(phrase.trim()) ? "an" : "a";
  return `${article} ${phrase}`;
}

function truncateAtWordBoundary(text, maxLength) {
  const source = typeof text === "string" ? text.trim() : "";
  if (!source || source.length <= maxLength) {
    return source;
  }

  const truncated = source.slice(0, maxLength);
  const boundaryIndex = truncated.search(/\s+\S*$/);
  const safeSlice = boundaryIndex > 0 ? truncated.slice(0, boundaryIndex) : truncated;
  return `${safeSlice.trimEnd()}...`;
}

function generateMessagesHtml(messages) {
  return messages
    .map((msg) => `        <div class="message-example">"${escapeHtml(msg)}"</div>`)
    .join("\n");
}

function generateTipsHtml(tips) {
  return tips
    .map(
      (tip) =>
        `          <li><strong>${escapeHtml(tip.title)}:</strong> ${escapeHtml(tip.content)}</li>`,
    )
    .join("\n");
}

function generateFaqsHtml(faqs) {
  return faqs
    .map(
      (faq) => `
        <div class="faq-item">
          <h3 class="faq-question">${escapeHtml(faq.question)}</h3>
          <p class="faq-answer">${escapeHtml(faq.answer)}</p>
        </div>`,
    )
    .join("\n");
}

function generateFaqSchema(faqs) {
  return faqs
    .map((faq, index) => {
      const comma = index < faqs.length - 1 ? "," : "";
      return `{
        "@type": "Question",
        "name": "${escapeJsonLd(faq.question)}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${escapeJsonLd(faq.answer)}"
        }
      }${comma}`;
    })
    .join("\n      ");
}

function generateHowToSteps(tips, relationship) {
  const steps = [
    {
      name: `Understand the ${relationship} relationship`,
      text: tips[0]?.content || `Consider the unique dynamics of writing for a ${relationship}.`,
    },
    {
      name: "Choose the right tone",
      text: tips[1]?.content || "Match your tone to the occasion and your relationship.",
    },
    {
      name: "Avoid common mistakes",
      text: tips[2]?.content || "Be genuine and avoid cliches that might fall flat.",
    },
  ];

  return steps
    .map((step, index) => {
      const comma = index < steps.length - 1 ? "," : "";
      return `{
        "@type": "HowToStep",
        "name": "${escapeJsonLd(step.name)}",
        "text": "${escapeJsonLd(step.text)}"
      }${comma}`;
    })
    .join("\n      ");
}

function isHighIntentSlug(slug) {
  return HIGH_INTENT_SLUG_HINTS.some((hint) => slug.includes(hint));
}

function getFallbackRelatedBlog(page) {
  return FALLBACK_BLOG_BY_OCCASION[page.occasion] || null;
}

function generateRelatedLinksHtml(page, pages) {
  const links = [];
  const seenHrefs = new Set();
  const seenSlugs = new Set();
  let messageLinkCount = 0;

  function addLink(href, title, slug = null) {
    if (!href || !title || seenHrefs.has(href)) {
      return;
    }

    if (slug) {
      seenSlugs.add(slug);
    }

    if (href.startsWith("/messages/")) {
      messageLinkCount += 1;
    }

    seenHrefs.add(href);
    links.push(`          <a href="${href}" class="related-link">${escapeHtml(title)}</a>`);
  }

  if (page.relatedPages) {
    for (const related of page.relatedPages) {
      const existingPage = pages.find((item) => item.slug === related.slug);
      if (!existingPage) {
        continue;
      }

      addLink(
        `/messages/${existingPage.slug}.html`,
        related.title || existingPage.title,
        existingPage.slug,
      );
    }
  }

  const autoCandidates = pages
    .filter((candidate) => candidate.slug !== page.slug && !seenSlugs.has(candidate.slug))
    .map((candidate) => {
      let score = 0;
      if (candidate.occasion === page.occasion) score += 3;
      if (candidate.relationship === page.relationship) score += 2;
      if (isHighIntentSlug(candidate.slug)) score += 1;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.candidate.title.localeCompare(b.candidate.title);
    });

  for (const { candidate } of autoCandidates) {
    if (messageLinkCount >= 4) {
      break;
    }

    addLink(`/messages/${candidate.slug}.html`, candidate.title, candidate.slug);
  }

  const relatedBlog = page.relatedBlog || getFallbackRelatedBlog(page);
  if (relatedBlog) {
    addLink(`/blog/${relatedBlog.slug}.html`, relatedBlog.title);
  } else {
    addLink("/blog/", "Browse Writing Guides on the Blog");
  }

  addLink("/messages/", "All Message Guides");

  return links.join("\n");
}

function calculateReadTime(page) {
  const allText = [
    page.intro,
    page.whenToSend,
    ...page.tips.map((tip) => `${tip.title} ${tip.content}`),
    ...page.shortMessages,
    ...page.mediumMessages,
    ...page.heartfeltMessages,
    ...page.faqs.map((faq) => `${faq.question} ${faq.answer}`),
  ].join(" ");

  const wordCount = allText.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  return Math.max(4, Math.min(8, readTime));
}

function generateBreadcrumbTitle(page) {
  return `${page.occasion} for ${page.relationship}`;
}

function generatePage(page, template, pages) {
  let html = template;
  const pageDates = resolvePageDates(page);
  const metadata = buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    pathname: `/messages/${page.slug}.html`,
    type: "article",
  });

  const replacements = {
    "{{metaTitle}}": escapeHtml(metadata.title),
    "{{metaDescription}}": escapeHtml(metadata.description),
    "{{targetKeyword}}": escapeHtml(page.targetKeyword),
    "{{title}}": escapeHtml(page.title),
    "{{slug}}": page.slug,
    "{{occasion}}": escapeHtml(page.occasion),
    "{{occasionWithArticle}}": escapeHtml(withIndefiniteArticle(page.occasion)),
    "{{relationship}}": escapeHtml(page.relationship),
    "{{intro}}": escapeHtml(page.intro),
    "{{whenToSend}}": escapeHtml(page.whenToSend),
    "{{datePublished}}": pageDates.datePublished,
    "{{dateModified}}": pageDates.dateModified,
    "{{dateDisplay}}": pageDates.dateDisplay,
    "{{readTime}}": String(calculateReadTime(page)),
    "{{breadcrumbTitle}}": escapeHtml(generateBreadcrumbTitle(page)),
    "{{occasion | lower}}": page.occasion.toLowerCase(),
    "{{tipsHtml}}": generateTipsHtml(page.tips),
    "{{shortMessagesHtml}}": generateMessagesHtml(page.shortMessages),
    "{{mediumMessagesHtml}}": generateMessagesHtml(page.mediumMessages),
    "{{heartfeltMessagesHtml}}": generateMessagesHtml(page.heartfeltMessages),
    "{{faqsHtml}}": generateFaqsHtml(page.faqs),
    "{{relatedLinksHtml}}": generateRelatedLinksHtml(page, pages),
    "{{faqSchema}}": generateFaqSchema(page.faqs),
    "{{howToSteps}}": generateHowToSteps(page.tips, page.relationship),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value);
  }

  return html;
}

function buildMessageCards(pages) {
  const grouped = {};
  for (const page of pages) {
    if (!grouped[page.occasion]) {
      grouped[page.occasion] = [];
    }
    grouped[page.occasion].push(page);
  }

  const occasionOrder = [
    "Sympathy",
    "Birthday",
    "Valentine's Day",
    "Mother's Day",
    "Father's Day",
    "Thank You",
    "Wedding",
    "Christmas",
    "New Baby",
    "Get Well",
    "Retirement",
    "Graduation",
    "Anniversary",
    "Apology",
    "Encouragement",
    "Farewell",
  ];

  const sortedOccasions = Object.keys(grouped).sort((a, b) => {
    const indexA = occasionOrder.indexOf(a);
    const indexB = occasionOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  let cardsHtml = "";
  for (const occasion of sortedOccasions) {
    for (const page of grouped[occasion]) {
      const excerpt = truncateAtWordBoundary(page.metaDescription, MAX_EXCERPT_LENGTH);
      cardsHtml += `
      <article class="post-card">
        <a href="/messages/${page.slug}.html">
          <div class="post-emoji">${page.emoji}</div>
          <div class="post-content">
            <span class="post-tag">${escapeHtml(page.occasion)}</span>
            <h2 class="post-title">${escapeHtml(page.title)}</h2>
            <p class="post-excerpt">${escapeHtml(excerpt)}</p>
            <div class="post-meta">${calculateReadTime(page)} min read</div>
          </div>
        </a>
      </article>`;
    }
  }

  return cardsHtml;
}

function generateHubPage(pages) {
  const metadata = buildMetadata({
    title: "Card Message Examples for Every Occasion",
    description:
      "Find the perfect words for any greeting card. Browse message examples for sympathy, birthday, wedding, thank you cards and more.",
    pathname: "/messages/",
  });

  const cardsHtml = buildMessageCards(pages);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="apple-itunes-app" content="app-id=6757088726">
  <title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <meta name="keywords" content="card messages, greeting card examples, what to write in a card, sympathy messages, birthday messages, wedding card messages, card wording">
  <meta name="robots" content="index, follow">

  <meta property="og:title" content="${escapeHtml(metadata.openGraph.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.openGraph.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${metadata.openGraph.url}">
  <meta property="og:image" content="${metadata.openGraph.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(metadata.openGraph.imageAlt)}">
  <meta property="og:site_name" content="Prosepal">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metadata.twitter.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.twitter.description)}">
  <meta name="twitter:image" content="${metadata.twitter.image}">
  <meta name="twitter:image:alt" content="${escapeHtml(metadata.twitter.imageAlt)}">
  <meta name="color-scheme" content="dark">

  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="canonical" href="${metadata.canonical}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <script defer src="/js/content-font-loader.js"></script>
  <noscript>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  </noscript>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Card Message Examples for Every Occasion",
    "description": "${escapeJsonLd(metadata.description)}",
    "url": "${metadata.canonical}",
    "datePublished": "${TODAY}",
    "dateModified": "${TODAY}",
    "publisher": {
      "@type": "Organization",
      "name": "Prosepal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.prosepal.app/logo.png"
      }
    }
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.prosepal.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Messages",
        "item": "https://www.prosepal.app/messages/"
      }
    ]
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Card Message Examples",
    "description": "Browse message examples for sympathy, birthday, wedding, thank you cards and more",
    "numberOfItems": ${pages.length},
    "itemListElement": [
${pages
  .map((page, index) => {
    return `      {"@type": "ListItem", "position": ${index + 1}, "url": "https://www.prosepal.app/messages/${page.slug}.html", "name": "${escapeJsonLd(page.title)}"}`;
  })
  .join(",\n")}
    ]
  }
  </script>

  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/messages.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="site-header">
    <nav class="header-content hub" aria-label="Main navigation">
      <a href="/" class="header-brand">
        <span>Prosepal</span>
      </a>
      <div class="header-links">
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How it works</a>
        <a href="/#faq">FAQ</a>
        <a href="/messages/">Messages</a>
        <a href="/blog/">Blog</a>
      </div>
      <a href="https://apps.apple.com/app/prosepal/id6757088726" class="header-cta">Write Better Cards</a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
      <a href="/">Home</a>
      <a href="/#features">Features</a>
      <a href="/#how-it-works">How it works</a>
      <a href="/#faq">FAQ</a>
      <a href="/messages/">Messages</a>
      <a href="/blog/">Blog</a>
      <a href="https://apps.apple.com/app/prosepal/id6757088726" class="header-cta">Write Better Cards</a>
    </nav>
  </header>

  <section class="hub-hero">
    <h1>Card Message Examples</h1>
    <p>Find the perfect words for any greeting card. Browse examples for specific occasions and relationships, with tips on tone and timing.</p>
  </section>

  <main class="posts-section" id="main-content">
    <div class="posts-grid">${cardsHtml}
    </div>
  </main>

  <section class="cta-section">
    <h2>Need Something More Personal?</h2>
    <p>Prosepal generates personalized card messages for many occasions. Get 3 options in under 30 seconds.</p>
    <a href="https://apps.apple.com/app/prosepal/id6757088726" class="cta-button">Get 3 Message Options</a>
    <div class="waitlist-inline">
      <p class="waitlist-inline-label">On Android? Join the waitlist.</p>
      <form class="waitlist-inline-form" data-waitlist-surface="messages_hub_waitlist" action="https://formspree.io/f/xgooqzgg" method="POST">
        <input type="email" name="email" placeholder="you@email.com" autocomplete="email" required aria-label="Email address for Android waitlist">
        <input type="hidden" name="source" value="messages_hub_waitlist">
        <input type="text" name="_gotcha" class="waitlist-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit">Notify me</button>
        <p class="waitlist-inline-status" data-waitlist-status aria-live="polite"></p>
      </form>
    </div>
  </section>

  <footer>
    <div class="footer-content hub">
      <div class="footer-brand">
        <span>Prosepal</span>
      </div>
      <nav class="footer-links">
        <a href="/">Home</a>
        <a href="/messages/">Messages</a>
        <a href="/blog/">Blog</a>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms of Use</a>
        <a href="/support.html">Support</a>
      </nav>
      <div class="copyright">&copy; 2026 Prosepal. All rights reserved.</div>
    </div>
  </footer>

  <script defer src="/js/mobile-menu.js"></script>
  <script defer src="/js/analytics.js"></script>
</body>
</html>`;
}

function main() {
  const data = loadData();
  const template = loadTemplate();
  const pages = data.pages;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const [index, page] of pages.entries()) {
    const html = generatePage(page, template, pages);
    const outputPath = path.join(OUTPUT_DIR, `${page.slug}.html`);
    fs.writeFileSync(outputPath, html, "utf8");
    console.log(`${index + 1}. generated ${page.slug}.html`);
  }

  const hubHtml = generateHubPage(pages);
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), hubHtml, "utf8");
  console.log(`Generated ${pages.length + 1} pages total.`);
}

main();
