import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { parseImageSource, resolveImageUrl, isAllowedImageSource } from "../src/lib/image-paths.mjs";
import { assertContent } from "../src/lib/validate-content.mjs";
import { validateImageFiles } from "../scripts/image-files.mjs";

const root = new URL("../", import.meta.url);
const schema = JSON.parse(await readFile(new URL("src/lib/content-schema.json", root), "utf8"));
const data = Object.fromEntries(await Promise.all(["site", "services", "projects", "resources", "copy"].map(async (key) =>
  [key, JSON.parse(await readFile(new URL(`public/data/${key}.json`, root), "utf8"))])));

test("relative and root-relative product paths resolve identically", () => {
  for (const path of ["assets/products/front.webp", "/assets/products/front.webp"]) {
    assert.equal(resolveImageUrl(path), "/assets/products/front.webp");
    assert.equal(resolveImageUrl(path, "/portfolio/"), "/portfolio/assets/products/front.webp");
  }
});
test("legacy images paths remain compatible", () => {
  assert.equal(resolveImageUrl("images/tony-product.webp"), "/images/tony-product.webp");
  assert.equal(resolveImageUrl("/images/tony-product.webp", "/tony/"), "/tony/images/tony-product.webp");
});
test("nested filenames, uppercase extensions, spaces and Unicode are supported", () => {
  assert.equal(resolveImageUrl("assets/products/Speaker_V2/Front View.JPG"), "/assets/products/Speaker_V2/Front%20View.JPG");
  const source = parseImageSource("assets/products/Loa%20m%E1%BB%9Bi.webp");
  assert.ok(source && source.kind === "local");
  assert.equal(source.path, "assets/products/Loa m\u1edbi.webp");
  assert.equal(source.urlPath, "assets/products/Loa%20m%E1%BB%9Bi.webp");
});
test("all documented local formats are accepted", () => {
  for (const ext of ["avif", "webp", "png", "jpg", "jpeg", "gif", "svg"]) assert.ok(isAllowedImageSource(`assets/products/front.${ext}`));
});
test("local cache-busting queries survive URL resolution but not file lookup", () => {
  const parsed = parseImageSource("/assets/products/front.webp?v=2&size=large");
  assert.ok(parsed && parsed.kind === "local");
  assert.equal(parsed.path, "assets/products/front.webp");
  assert.equal(resolveImageUrl("/assets/products/front.webp?v=2&size=large"), "/assets/products/front.webp?v=2&size=large");
});
test("external HTTPS paths and signed CDN queries are preserved", () => {
  const sources = [
    "https://tonyproductdesign.com/assets/products/front.webp",
    "https://cdn.example.com/image/abc?width=1000&format=webp&sig=a%2Fb%3D",
  ];
  for (const source of sources) {
    assert.equal(resolveImageUrl(source, "/portfolio/"), source);
    assert.equal(parseImageSource(source)?.kind, "remote");
  }
});
test("unsupported schemes, protocol-relative URLs and credentials are rejected", () => {
  for (const source of ["javascript:alert(1)", "data:image/svg+xml,<svg/>", "blob:https://example.com/a", "http://example.com/a.png", "//example.com/a.png", "https://user:password@example.com/a.png", "file:///tmp/a.png", "ftp://example.com/a.png"]) {
    assert.equal(isAllowedImageSource(source), false, source);
    assert.throws(() => resolveImageUrl(source), /Unsafe image/);
  }
});
test("traversal, encoded separators, wrong roots and unsupported extensions fail", () => {
  for (const source of [
    "assets/products/../private.png", "assets/products/%2e%2e/private.png", "assets/products/%252e%252e/private.png",
    "assets/products/a%2fb.png", "assets/products/a%5cb.png", "assets/products/a\\b.png",
    "public/assets/products/a.png", "src/assets/products/a.png", "assets/products//a.png",
    "assets/products/a.html", "assets/products/.png/../../a.png", "assets/products/front.png#x",
  ]) assert.equal(isAllowedImageSource(source), false, source);
});
test("empty, control-character and malformed URL inputs fail", () => {
  for (const source of ["", " ", null, 1, {}, "https://", "https://bad host/a.png", "assets/products/a\n.png", "assets/products/%ZZ.png", "assets/products/%00.png"]) {
    assert.equal(isAllowedImageSource(source), false);
  }
});
test("invalid deployment bases cannot turn a local path into a remote URL", () => {
  for (const base of ["https://example.com/", "//example.com/", "../", "portfolio"]) assert.throws(() => resolveImageUrl("assets/products/a.webp", base), /Image base/);
});
test("content schema permits a mix of local and external images in every image slot", () => {
  const mixed = structuredClone(data);
  mixed.site.hero.image = "https://images.example.com/cover?id=1";
  mixed.site.hero.banner = "/assets/products/banner.JPG";
  mixed.site.hero.mobileBanner = "https://images.example.com/mobile.avif";
  mixed.projects[0].image = "https://tonyproductdesign.com/assets/products/a.webp";
  mixed.projects[0].gallery[0].image = "assets/products/Speaker V2/back.PNG";
  assert.doesNotThrow(() => assertContent(mixed, schema));
});
test("content schema rejects unsafe image sources in hero, cards and gallery", () => {
  const variants = [
    (d: typeof data) => { d.site.hero.image = "http://example.com/a.png"; },
    (d: typeof data) => { d.projects[0].image = "//example.com/a.png"; },
    (d: typeof data) => { d.projects[0].gallery[0].image = "assets/products/../private.png"; },
  ];
  for (const mutate of variants) { const broken = structuredClone(data); mutate(broken); assert.throws(() => assertContent(broken, schema), /Unsafe/); }
});
test("file validation handles leading slashes, encoded filenames, queries and skips HTTPS", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tony-images-"));
  try {
    await mkdir(join(directory, "assets/products"), { recursive: true });
    await writeFile(join(directory, "assets/products/Front View.webp"), "fixture");
    const local = "/assets/products/Front%20View.webp?v=2";
    const remote = "https://no-network-request.example.com/id?format=webp";
    const content = { site: { hero: { image: local, banner: remote, mobileBanner: remote } }, projects: [{ slug: "test", image: local, gallery: [{ image: remote }] }] };
    assert.deepEqual(await validateImageFiles(content, directory), { local: 2, remote: 3 });
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("a missing local file reports the specific JSON field and path", async () => {
  const broken = structuredClone(data); broken.projects[0].image = "assets/products/not-a-real-file.webp";
  await assert.rejects(() => validateImageFiles(broken, new URL("public/", root).pathname), /projects\[0\]\.image.*file not found: public\/assets\/products\/not-a-real-file.webp/);
});
test("all shipped product cards use assets/products while existing files remain compatible", async () => {
  assert.ok(data.projects.every((p: { image: string }) => p.image.startsWith("assets/products/")));
  const result = await validateImageFiles(data, new URL("public/", root).pathname);
  assert.equal(result.remote, 0);
  assert.ok(result.local > data.projects.length);
  await readFile(new URL("public/images/tony-product.webp", root));
});
test("the inventory command prints copyable image fields and the confirmed production domain", () => {
  const entries = JSON.parse(execFileSync(process.execPath, [new URL("scripts/list-product-images.mjs", root).pathname], { cwd: root, encoding: "utf8", env: { ...process.env, VITE_SITE_URL: "https://tonyproductdesign.com", VITE_BASE_PATH: "/" } }));
  assert.ok(entries.length >= 7);
  assert.ok(entries.every((row: { image: string; url: string }) => row.image.startsWith("assets/products/") && row.url === `https://tonyproductdesign.com/${row.image}`));
});
test("production settings use Tony's domain and editable images are not immutable assets", async () => {
  const env = await readFile(new URL(".env.production", root), "utf8");
  assert.match(env, /^VITE_SITE_URL=https:\/\/tonyproductdesign\.com$/m);
  const headers = await readFile(new URL("public/_headers", root), "utf8");
  assert.match(headers, /\/assets\/products\/\*\n\s+Cache-Control: public, max-age=0, must-revalidate/);
  assert.ok(!/^\/assets\/\*$/m.test(headers));
  const vite = await readFile(new URL("vite.config.ts", root), "utf8");
  assert.match(vite, /assetsDir: "assets\/build"/);
});
