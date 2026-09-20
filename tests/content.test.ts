import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parseImageSource } from "../src/lib/image-paths.mjs";
import { validateImageFiles } from "../scripts/image-files.mjs";
import { assertContent } from "../src/lib/validate-content.mjs";

const read = (file: string) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const schema = read("../src/lib/content-schema.json");
const data = Object.fromEntries(["site", "services", "projects", "resources", "copy"].map((name) => [name, read(`../public/data/${name}.json`)]));
test("all shipped content passes runtime and build validation", () => assert.doesNotThrow(() => assertContent(data, schema)));
test("a missing translation fails with a clear path", () => {
  const broken = structuredClone(data);
  delete broken.copy.hero.line1.vi;
  assert.throws(() => assertContent(broken, schema), /copy.hero.line1.vi/);
});
test("duplicate slugs are rejected", () => {
  const broken = structuredClone(data); broken.projects[1].slug = broken.projects[0].slug;
  assert.throws(() => assertContent(broken, schema), /duplicate slug/);
});
test("broken project-service relationships are rejected", () => {
  const broken = structuredClone(data); broken.projects[0].service = "unknown";
  assert.throws(() => assertContent(broken, schema), /Unknown service/);
});
test("unsafe image and download paths are rejected", () => {
  const broken = structuredClone(data); broken.projects[0].image = "../../etc/passwd";
  assert.throws(() => assertContent(broken, schema), /Unsafe image/);
  const broken2 = structuredClone(data); broken2.resources[0].download = "../private";
  assert.throws(() => assertContent(broken2, schema), /Unsafe download/);
});
test("the site exposes no fake backend in its default configuration", () => {
  assert.equal(data.site.contactMode, "mailto");
  assert.equal(data.site.provenance.reviewed, false);
});
test("every local image exists", () => {
  for (const project of data.projects) {
    const source = parseImageSource(project.image);
    assert.ok(source);
    if (source.kind === "local") assert.ok(existsSync(new URL(`../public/${source.urlPath.split("?")[0]}`, import.meta.url)), project.image);
  }
});

test("the primary identity and contact details belong to Tony", () => {
  assert.equal(data.site.name, "Tony PRODUCT DESIGN");
  assert.equal(data.site.email, "brian@tonyproductdesign.com");
  assert.equal(data.site.whatsapp, "https://wa.me/84918134350");
  assert.equal(data.site.instagram, "");
  assert.equal(data.site.facebook, "");
  assert.equal(data.site.address.en, "");
});
test("legacy contact details and portfolio claims do not remain in data", () => {
  const serialized = JSON.stringify(data);
  assert.ok(!/BK Technology|bk-pcb|Da Nang|DA NANG|Cadence|26 layers|500\+ projects/i.test(serialized));
});
test("the gallery is explicitly a single supplied concept series", () => {
  assert.ok(data.projects.every((project: { status: string }) => project.status === "concept-reference"));
  assert.ok(data.site.contentNotice.en.includes("not six separate client projects"));
});
test("unknown categories fail validation", () => {
  const broken = structuredClone(data); broken.projects[0].category = "fake";
  assert.throws(() => assertContent(broken, schema), /Invalid category/);
});
test("dangerous social links fail validation", () => {
  for (const social of ["instagram", "facebook"]) {
    const broken = structuredClone(data); broken.site[social] = "javascript:alert(1)";
    assert.throws(() => assertContent(broken, schema), /Invalid/);
  }
});
test("social links require the matching HTTPS provider", () => {
  const broken = structuredClone(data); broken.site.instagram = "https://example.com/something";
  assert.throws(() => assertContent(broken, schema), /Instagram/);
  const good = structuredClone(data); good.site.instagram = "https://www.instagram.com/example";
  assert.doesNotThrow(() => assertContent(good, schema));
});
test("WhatsApp must use a normalized wa.me link", () => {
  const broken = structuredClone(data); broken.site.whatsapp = "http://wa.me/84918134350";
  assert.throws(() => assertContent(broken, schema), /WhatsApp/);
});
test("all local hero and gallery assets exist; HTTPS references are allowed", async () => {
  await validateImageFiles(data, new URL("../public/", import.meta.url).pathname);
});
test("unsafe gallery images fail validation", () => {
  const broken = structuredClone(data); broken.projects[0].gallery[0].image = "javascript:alert(1)";
  assert.throws(() => assertContent(broken, schema), /Unsafe gallery/);
});
test("the hero service rows correspond one-to-one with actual service pages", () => {
  assert.equal(data.copy.hero.stages.length, data.services.length);
  const broken = structuredClone(data); broken.copy.hero.stages.pop();
  assert.throws(() => assertContent(broken, schema), /Cover stages/);
});


test("banner viewer copy is localized without changing the image source contract", () => {
  for (const name of ["viewBanner", "bannerZoom", "bannerFit", "bannerPanHint"]) {
    for (const locale of ["en", "vi"]) assert.ok(data.copy.hero[name][locale].trim().length > 0);
  }
  assert.ok(parseImageSource(data.site.hero.banner));
});

test("missing banner zoom instructions fail with a clear translation path", () => {
  const broken = structuredClone(data);
  delete broken.copy.hero.bannerPanHint.vi;
  assert.throws(() => assertContent(broken, schema), /copy.hero.bannerPanHint.vi/);
});
