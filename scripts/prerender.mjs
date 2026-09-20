import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";
import { assertContent } from "../src/lib/validate-content.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const env = { ...loadEnv("production", root, "VITE_"), ...process.env };
const base = env.VITE_BASE_PATH || "/";
const configuredOrigin = (env.VITE_SITE_URL || "").trim();
let origin = "";
if (configuredOrigin) {
  const url = new URL(configuredOrigin);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_SITE_URL must be a domain origin (https://your-domain.com), with no path, query or fragment. Use VITE_BASE_PATH for a subfolder.");
  }
  origin = url.origin;
}
const content = Object.fromEntries(await Promise.all(["site", "services", "projects", "resources", "copy"].map(async (name) => [name, JSON.parse(await readFile(join(root, "public/data", `${name}.json`), "utf8"))])));
const schema = JSON.parse(await readFile(join(root, "src/lib/content-schema.json"), "utf8"));
assertContent(content, schema);
const { render } = await import(pathToFileURL(join(root, ".ssr/entry-server.js")).href);
const template = await readFile(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-html-->") || !template.includes("<!--app-data-->") || !template.includes("<!--seo-start-->")) {
  throw new Error("Required prerender markers are missing from dist/index.html.");
}
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const absolute = (path) => `${origin}${base}${path.replace(/^\/+/, "")}`;
const serialized = JSON.stringify(content).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
const routes = [];
for (const locale of ["en", "vi"]) {
  const c = content.copy;
  const basics = [
    ["", `${c.hero.line1[locale]} ${c.hero.line2[locale]}`, content.site.description[locale]],
    ["services", c.common.services[locale], c.services.pageDescription[locale]],
    ["projects", c.common.projects[locale], c.work.pageDescription[locale]],
    ["studio", c.studio.eyebrow[locale], c.studio.description[locale]],
    ["insights", c.common.resources[locale], c.insights.description[locale]],
    ["contact", c.common.contact[locale], c.contact.description[locale]],
    ["privacy", c.common.privacy[locale], content.site.description[locale]],
  ];
  for (const [suffix, title, description] of basics) routes.push({ path: `/${locale}${suffix ? `/${suffix}` : ""}`, locale, title, description });
  for (const service of content.services) routes.push({ path: `/${locale}/services/${service.slug}`, locale, title: service.title[locale], description: service.summary[locale] });
  for (const project of content.projects) routes.push({ path: `/${locale}/projects/${project.slug}`, locale, title: project.title[locale], description: project.summary[locale] });
  for (const resource of content.resources) routes.push({ path: `/${locale}/insights/${resource.slug}`, locale, title: resource.title[locale], description: resource.summary[locale] });
}
const rootLocale = content.site.defaultLocale;
const rootRoute = { ...routes.find((route) => route.path === `/${rootLocale}`), path: "/", canonicalPath: `/${rootLocale}` };
const notFound = { path: "/en/not-found", locale: "en", title: "404", description: content.copy.common.notFoundBody.en, noindex: true, output: "404.html" };
for (const route of [rootRoute, ...routes, notFound]) {
  const canonicalPath = route.canonicalPath || route.path;
  const title = `${route.title.replaceAll("\n", " ")} | ${content.site.name}`;
  const canonical = absolute(canonicalPath);
  let head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<meta name="robots" content="${!origin || route.noindex ? "noindex, nofollow" : "index, follow"}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:locale" content="${route.locale === "vi" ? "vi_VN" : "en_US"}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
  ];
  if (origin) {
    head.push(`<link rel="canonical" href="${esc(canonical)}" />`, `<meta property="og:url" content="${esc(canonical)}" />`, `<meta property="og:image" content="${esc(absolute("/images/og-cover.png"))}" />`, `<meta name="twitter:image" content="${esc(absolute("/images/og-cover.png"))}" />`);
    if (!route.noindex) {
      for (const language of ["en", "vi", "x-default"]) {
        const target = language === "x-default" ? content.site.defaultLocale : language;
        const alternatePath = canonicalPath.replace(/^\/(en|vi)(?=\/|$)/, `/${target}`);
        head.push(`<link rel="alternate" hreflang="${language}" href="${esc(absolute(alternatePath))}" />`);
      }
      const org = { "@context": "https://schema.org", "@type": "Organization", name: content.site.name, url: absolute("/en"), email: content.site.email, telephone: content.site.phoneHref };
      if (content.site.address[route.locale]) org.address = content.site.address[route.locale];
      const profiles = [content.site.instagram, content.site.facebook].filter(Boolean);
      if (profiles.length) org.sameAs = profiles;
      head.push(`<script type="application/ld+json">${JSON.stringify(org).replaceAll("<", "\\u003c")}</script>`);
    }
  }
  head = head.join("\n    ");
  const html = template.replace('lang="en"', `lang="${route.locale}"`)
    .replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, `<!--seo-start-->\n${head}\n<!--seo-end-->`)
    .replace('<div id="root">', route.noindex ? '<div id="root" data-no-hydrate="true">' : '<div id="root">')
      .replace("<!--app-html-->", render(route.path, content))
    .replace("<!--app-data-->", `<script id="tony-bootstrap" type="application/json">${serialized}</script>`);
  const output = route.output ? join(dist, route.output) : route.path === "/" ? join(dist, "index.html") : join(dist, route.path.replace(/^\//, ""), "index.html");
  await mkdir(resolve(output, ".."), { recursive: true });
  await writeFile(output, html, "utf8");
}
if (origin) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${esc(absolute(route.path))}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(join(dist, "sitemap.xml"), sitemap);
  await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${absolute("/sitemap.xml")}\n`);
} else {
  await writeFile(join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
  console.warn("Preview build: VITE_SITE_URL is blank. noindex is enabled; no sitemap was generated.");
}
console.log(`Pre-rendered ${routes.length + 2} HTML pages. Deployment output: dist/`);
