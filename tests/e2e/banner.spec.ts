import { test, expect } from "@playwright/test";
import site from "../../public/data/site.json";
import { readFileSync } from "node:fs";

const artwork = readFileSync(new URL("../../public/images/tony-services-banner.webp", import.meta.url));

test("home uses the service banner on mobile, not the separate brand card", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi");
  const image = page.locator(".home-service-banner");
  await expect(image).toHaveAttribute("src", `/${site.hero.banner}`);
  await expect(image).toBeVisible();
  await expect(page.getByRole("button", { name: "Xem banner phóng to", exact: true })).toBeVisible();
  await expect(page.locator(".cover-services")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("homepage and viewer honor a JSON HTTPS banner URL without altering product data", async ({ page }) => {
  const modifiedSite = structuredClone(site);
  modifiedSite.hero.banner = "https://images.example.com/services.webp?v=2";
  await page.route("**/data/site.json", (route) => route.fulfill({ json: modifiedSite }));
  await page.route("https://images.example.com/**", (route) => route.fulfill({ contentType: "image/webp", body: artwork }));
  await page.goto("/en");
  await expect(page.locator(".home-service-banner")).toHaveAttribute("src", modifiedSite.hero.banner);
  await page.getByRole("button", { name: "View full-size banner", exact: true }).click();
  await expect(page.locator(".home-banner-viewport img")).toHaveAttribute("src", modifiedSite.hero.banner);
});

test("a failed external banner falls back while HTML services remain available", async ({ page }) => {
  const modifiedSite = structuredClone(site);
  modifiedSite.hero.banner = "https://images.example.com/missing.webp";
  await page.route("**/data/site.json", (route) => route.fulfill({ json: modifiedSite }));
  await page.route("https://images.example.com/**", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/en");
  await expect(page.locator(".home-service-banner")).toHaveAttribute("data-image-fallback", "true");
  await expect(page.locator(".cover-service")).toHaveCount(4);
  await expect(page.locator(".cover-contact")).toContainText(site.email);
});
