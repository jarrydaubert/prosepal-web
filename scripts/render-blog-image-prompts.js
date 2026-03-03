#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const configPath = path.resolve(__dirname, "blog-images.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const args = process.argv.slice(2);
const slugArg = args.find((arg) => arg.startsWith("--slug="));
const onlySlug = slugArg ? slugArg.slice("--slug=".length).trim() : "";

const { styleGuide, categoryColors, posts } = config;
const selectedPosts = onlySlug ? posts.filter((post) => post.slug === onlySlug) : posts;

if (onlySlug && selectedPosts.length === 0) {
  console.error(`No post found for slug: ${onlySlug}`);
  process.exit(1);
}

for (const post of selectedPosts) {
  const category = categoryColors[post.category] || {};
  const keywords = Array.isArray(post.keywords) ? post.keywords.join(", ") : "";
  const negatives = Array.isArray(styleGuide.negativeConstraints)
    ? styleGuide.negativeConstraints.join(", ")
    : "no text, no letters, no logos, no watermark";
  const prompt = [
    `Create a high-quality blog hero image for "${post.title}".`,
    `Aspect ratio: ${styleGuide.aspectRatio}.`,
    `Style: ${styleGuide.illustrationStyle}.`,
    `Mood: ${styleGuide.mood}.`,
    `Lighting: ${styleGuide.lighting}.`,
    styleGuide.cameraAngle ? `Camera angle: ${styleGuide.cameraAngle}.` : "",
    `Background: ${styleGuide.background.style} (base ${styleGuide.background.base}).`,
    `Category accent: ${category.accent || "balanced neutral glow"}${category.color ? ` (${category.color})` : ""}.`,
    category.rimLight ? `Rim light: ${category.rimLight}.` : "",
    `Visual concept: ${post.visualConcept}`,
    `Keywords to incorporate conceptually: ${keywords}.`,
    `Negative constraints: ${negatives}.`,
    "Keep composition centered and uncluttered for social preview cropping.",
  ]
    .filter(Boolean)
    .join(" ");

  console.log(`---`);
  console.log(`slug: ${post.slug}`);
  console.log(`targetPage: ${post.targetPage}`);
  console.log(`outputFilename: ${post.outputFilename}`);
  console.log(`prompt:`);
  console.log(prompt);
  console.log("");
}
