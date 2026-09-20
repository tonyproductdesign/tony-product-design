import { test, expect } from "@playwright/test";

test("Tony homepage has cover, introduction, six studies and contacts in order", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("From concept");
  await expect(page.locator(".cover-service")).toHaveCount(4);
  await expect(page.locator(".cover-capabilities > span")).toHaveCount(6);
  await expect(page.locator("#work .editorial-project")).toHaveCount(6);
  await expect(page.locator(".work-endnote")).toContainText("one supplied smart-speaker concept");
  const order = await page.evaluate(() =>
    [".tony-cover", "#approach", "#work", "#contact"].map((selector) =>
      document.querySelector(selector)!.getBoundingClientRect().top));
  expect(order).toEqual([...order].sort((a, b) => a - b));
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  await expect(page.locator("body")).not.toContainText(/BK Technology|contact@bk-pcb\.com/);
});

test("locale switch preserves location and translates content", async ({ page }) => {
  await page.goto("/en#work");
  await page.getByRole("link", { name: "Switch to Vietnamese" }).click();
  await expect(page).toHaveURL(/\/vi#work$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Từ ý tưởng");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.getByRole("link", { name: "Chuyển sang tiếng Anh" }).click();
  await expect(page).toHaveURL(/\/en#work$/);
});

test("theme preference persists after refresh", async ({ page }) => {
  await page.goto("/en");
  await page.evaluate(() => localStorage.setItem("tony-theme", "light"));
  await page.reload();
  await page.getByRole("button", { name: "Toggle light / dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("site search opens by keyboard and restores focus on Escape", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("A voice");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await expect(dialog.getByRole("link")).toHaveAttribute("href", "/en/projects/smart-speaker-concept");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Search the studio" })).toBeFocused();
});

test("service banner is visible immediately and its optional viewer zooms without cropping", async ({ page }) => {
  await page.goto("/en");
  const image = page.locator(".home-service-banner");
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("loading", "eager");
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  const bounds = await image.boundingBox();
  expect(bounds!.y).toBeLessThan(150);
  expect(bounds!.width / bounds!.height).toBeCloseTo(2048 / 768, 1);
  await expect(page.locator(".cover-upper")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const trigger = page.getByRole("button", { name: "View full-size banner", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toContainText("From concept to market");
  await expect(dialog.locator(".home-banner-service-links a")).toHaveCount(4);
  await expect(dialog.locator(".home-banner-viewport img")).toHaveAttribute("src", await image.getAttribute("src") as string);
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  const viewport = dialog.locator(".home-banner-viewport");
  await expect(viewport).toHaveClass(/is-zoomed/);
  expect(await viewport.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Fit to screen", exact: true }).click();
  await expect(viewport).not.toHaveClass(/is-zoomed/);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("navigation anchors work with desktop links or mobile menu", async ({ page }, testInfo) => {
  await page.goto("/en/services");
  if (testInfo.project.name === "mobile-chromium") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog").getByRole("link", { name: /Work/ }).click();
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Work", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/en#work$/);
  await expect(page.locator("#work")).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("project category filter, empty state and reset", async ({ page }) => {
  await page.goto("/en/projects");
  await expect(page.locator(".editorial-project")).toHaveCount(6);
  await page.getByRole("button", { name: "Structure 1", exact: true }).click();
  await expect(page.locator(".editorial-project")).toHaveCount(1);
  await expect(page).toHaveURL(/category=mechanical/);
  await page.getByRole("textbox", { name: "Find a project…" }).fill("no-such-project");
  await expect(page.getByRole("heading", { name: "No matching studies." })).toBeVisible();
  await page.locator(".empty-state").getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".editorial-project")).toHaveCount(6);
});

test("footer contains correct contact links, not invented social URLs", async ({ page }) => {
  await page.goto("/en");
  const footer = page.locator("footer");
  await expect(footer.locator('a[href="mailto:brian@tonyproductdesign.com"]')).toHaveCount(1);
  await expect(footer.locator('a[href="https://wa.me/84918134350"]')).toHaveCount(1);
  await expect(footer.locator(".social-unconfigured")).toHaveCount(2);
  await expect(footer.getByRole("link", { name: /^Instagram|^Facebook/ })).toHaveCount(0);
  await expect(footer.locator("address")).toHaveText("Address available on request");
});

test("contact validates and creates an unsent email draft and download", async ({ page }) => {
  await page.goto("/en/contact?service=industrial-design");
  await expect(page.locator("#service")).toHaveValue("industrial-design");
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#name").fill("Test Visitor");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#message").fill("I would like to discuss an enclosure design and physical prototype.");
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(page.getByRole("heading", { name: "Your brief is ready. It has not been sent." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open email app" })).toHaveAttribute("href", /^mailto:brian@tonyproductdesign\.com/);
  await expect(page.locator("#brief-preview")).toHaveValue(/Test Visitor/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt" }).click();
  expect((await download).suggestedFilename()).toBe("tony-product-design-enquiry.txt");
});

test("resource downloads exist and unknown routes show the custom 404", async ({ page }) => {
  await page.goto("/en/insights/better-hardware-brief");
  const link = page.getByRole("link", { name: "Download checklist" });
  const href = await link.getAttribute("href");
  expect(href).toMatch(/project-brief-en\.md$/);
  const response = await page.request.get(href!);
  expect(response.ok()).toBeTruthy();
  await page.goto("/en/does-not-exist");
  await expect(page.getByRole("heading", { name: "An idea without a page." })).toBeVisible();
});

test("representative routes hydrate without browser errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  for (const path of ["/en", "/vi", "/en/services", "/vi/services/industrial-design", "/en/projects",
    "/en/projects/smart-speaker-concept", "/vi/studio", "/en/insights",
    "/vi/insights/design-handoff-checklist", "/en/contact", "/vi/privacy"]) {
    await page.goto(path);
    await expect(page.locator("#main-content h1")).toBeVisible();
  }
  expect(failures).toEqual([]);
});

test("query deep links keep filters and selected services after reload", async ({ page }) => {
  await page.goto("/en/projects?category=mechanical");
  await expect(page.locator(".editorial-project")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".editorial-project")).toHaveCount(1);
  await page.goto("/vi/contact?service=industrial-design");
  await expect(page.locator("#service")).toHaveValue("industrial-design");
  await page.reload();
  await expect(page.locator("#service")).toHaveValue("industrial-design");
});
