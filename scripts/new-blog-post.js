#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const TEMPLATE_PATH = path.join(ROOT_DIR, "templates", "blog-article.html");
const BLOG_DIR = path.join(ROOT_DIR, "public", "blog");

/**
 * @param {string[]} argv
 * @returns {{slug:string,title:string,description:string,keywords:string}}
 */
function parseArgs(argv) {
  const getValue = (flag) => {
    const direct = argv.find((arg) => arg.startsWith(`${flag}=`));
    if (direct) return direct.slice(flag.length + 1).trim();

    const idx = argv.indexOf(flag);
    if (idx >= 0 && argv[idx + 1]) return argv[idx + 1].trim();

    return "";
  };

  return {
    slug: getValue("--slug"),
    title: getValue("--title"),
    description: getValue("--description"),
    keywords: getValue("--keywords"),
  };
}

/**
 * @param {string} input
 * @returns {string}
 */
function toTitleCase(input) {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * @param {string} date
 * @returns {string}
 */
function monthLabel(date) {
  const dt = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

/**
 * @param {string} slug
 * @returns {string}
 */
function validateSlug(slug) {
  if (!slug) return "Missing --slug";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must use lowercase letters, numbers, and hyphens only";
  }
  return "";
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(
      [
        "Usage:",
        '  node scripts/new-blog-post.js --slug=your-slug --title="Your Title" [--description="..."] [--keywords="..."]',
        "",
        "Example:",
        '  node scripts/new-blog-post.js --slug=what-to-write-in-farewell-card --title="What to Write in a Farewell Card"',
      ].join("\n"),
    );
    return;
  }

  const args = parseArgs(argv);
  const slugError = validateSlug(args.slug);
  if (slugError) {
    console.error(slugError);
    process.exit(1);
  }
  if (!args.title) {
    console.error("Missing --title");
    process.exit(1);
  }

  const description = args.description || `Practical guide: ${args.title}.`;
  const keywords =
    args.keywords || `${args.slug.replace(/-/g, ", ")}, greeting card messages, prosepal`;
  const today = new Date().toISOString().slice(0, 10);
  const canonicalPath = `/blog/${args.slug}.html`;
  const filePath = path.join(BLOG_DIR, `${args.slug}.html`);
  const ogImagePath = `/blog/og-${args.slug}.jpg`;
  const breadcrumb = args.title.replace(/\s*\|.*$/, "").trim();

  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${path.relative(ROOT_DIR, filePath)}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const replacements = {
    PAGE_TITLE: args.title,
    META_DESCRIPTION: description,
    META_KEYWORDS: keywords,
    CANONICAL_PATH: canonicalPath,
    OG_IMAGE_PATH: ogImagePath,
    PUBLISHED_DATE: today,
    MODIFIED_DATE: today,
    BREADCRUMB_LABEL: breadcrumb,
    UPDATED_LABEL: monthLabel(today),
    READ_TIME: "6",
    HERO_ALT: `${breadcrumb} guide image`,
    HERO_CAPTION: "Use this guide as a starting point, then personalize in your own voice.",
    TOC_ITEMS: [
      '<li><a href="#quick-answer">Quick Answer</a></li>',
      '<li><a href="#examples">Message Examples</a></li>',
      '<li><a href="#tips">Writing Tips</a></li>',
      '<li><a href="#final-thoughts">Final Thoughts</a></li>',
    ].join("\n            "),
    ARTICLE_BODY: [
      "<p>Opening paragraph: clarify who this guide is for and what outcome they will get.</p>",
      "",
      '<h2 id="quick-answer">Quick Answer</h2>',
      "<p>Give the concise answer first for search intent and fast readers.</p>",
      "",
      '<h2 id="examples">Message Examples</h2>',
      "<p>Add practical examples that users can adapt quickly.</p>",
      "",
      '<h2 id="tips">Writing Tips</h2>',
      "<ul>",
      "  <li>Be specific to relationship and occasion.</li>",
      "  <li>Prefer sincere and plain language over cliches.</li>",
      "  <li>Keep most examples short enough to fit in real cards.</li>",
      "</ul>",
      "",
      '<h2 id="final-thoughts">Final Thoughts</h2>',
      "<p>Close with reassurance and one clear next action.</p>",
    ].join("\n          "),
    RELATED_LINKS: [
      '<li><a href="/blog/">Browse all card writing guides</a></li>',
      '<li><a href="/messages/">Explore message examples by occasion</a></li>',
      '<li><a href="https://apps.apple.com/app/prosepal/id6757088726">Try Prosepal on iOS</a></li>',
    ].join("\n            "),
  };

  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }

  fs.writeFileSync(filePath, output, "utf8");

  const promptStub = {
    slug: args.slug,
    title: args.title,
    category: "decision-guides",
    visualConcept: `Describe a scene for "${args.title}" with no text overlays.`,
    keywords: [toTitleCase(args.slug), "greeting card", "editorial illustration"],
    outputFilename: path.basename(ogImagePath),
    targetPage: canonicalPath,
  };

  console.log(`Created ${path.relative(ROOT_DIR, filePath)}`);
  console.log("Next steps:");
  console.log("1. Add a card entry on /public/blog/index.html");
  console.log("2. Add an image prompt object to scripts/blog-images.json");
  console.log(`3. Generate image and save to public/blog/${path.basename(ogImagePath)}`);
  console.log(
    "4. Run: bun run generate:site && bun run validate:blog:images && bun run validate:schema:local",
  );
  console.log("\nPrompt stub:");
  console.log(JSON.stringify(promptStub, null, 2));
}

main();
