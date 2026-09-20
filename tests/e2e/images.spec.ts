import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const projects = JSON.parse(readFileSync(new URL("../../public/data/projects.json", import.meta.url), "utf8"));
const imageBytes = readFileSync(new URL("../../public/assets/products/tony-product.webp", import.meta.url));

test("local product images work on a directly loaded detail route", async ({ page }) => {
  await page.goto(`/en/projects/${projects[0].slug}`);
  const image = page.locator(".detail-image-wrap img");
  await expect(image).toHaveAttribute("src", /^\/assets\/products\//);
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
});

test("an HTTPS image from JSON is loaded without a local-path prefix", async ({ page }) => {
  const content = structuredClone(projects);
  const url = "https://images.example.com/product?width=1000&format=webp";
  content[0].image = url;
  content[0].gallery[0].image = url;
  await page.route("**/data/projects.json", (route) => route.fulfill({ json: content }));
  await page.route("https://images.example.com/**", (route) => route.fulfill({ status: 200, contentType: "image/webp", body: imageBytes }));
  await page.goto(`/en/projects/${projects[0].slug}`);
  const image = page.locator(".detail-image-wrap img");
  await expect(image).toHaveAttribute("src", url);
  await expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  const gallery = page.locator(".study-gallery img").first();
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveAttribute("src", url);
});

test("an unavailable external product image gets a local fallback", async ({ page }) => {
  const content = structuredClone(projects);
  content[0].image = "https://images.example.com/missing.webp";
  await page.route("**/data/projects.json", (route) => route.fulfill({ json: content }));
  await page.route("https://images.example.com/**", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto(`/en/projects/${projects[0].slug}`);
  const image = page.locator(".detail-image-wrap img");
  await expect(image).toHaveAttribute("data-image-fallback", "true");
  await expect(image).toHaveAttribute("src", "/images/product-placeholder.svg");
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
});
