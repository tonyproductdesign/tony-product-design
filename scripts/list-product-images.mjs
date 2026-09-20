import { readdir, readFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { resolveImageUrl } from "../src/lib/image-paths.mjs";

const root = resolve(import.meta.dirname, "..");
const publicRoot = resolve(root, "public");
const productRoot = resolve(publicRoot, "assets/products");
// Match the relevant Vite env-file precedence without requiring dependencies.
const settings = {};
for (const file of [".env", ".env.local", ".env.production", ".env.production.local"]) {
  let text;
  try { text = await readFile(resolve(root, file), "utf8"); }
  catch (error) { if (error.code === "ENOENT") continue; throw error; }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(VITE_SITE_URL|VITE_BASE_PATH)\s*=\s*(.*?)\s*$/);
    if (match) settings[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2").replace(/\s+#.*$/, "").trim();
  }
}
const origin = (process.env.VITE_SITE_URL ?? settings.VITE_SITE_URL ?? "").trim();
const base = process.env.VITE_BASE_PATH ?? settings.VITE_BASE_PATH ?? "/";
if (origin) {
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("VITE_SITE_URL must be an HTTPS domain origin.");
}
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && /\.(avif|webp|png|jpe?g|gif|svg)$/i.test(entry.name)) files.push(path);
  }
  return files;
}
const records = (await walk(productRoot)).sort().map((path) => {
  const image = relative(publicRoot, path).split(sep).join("/");
  const publicPath = resolveImageUrl(image, base);
  return { file: `public/${image}`, image, url: origin ? new URL(publicPath, origin).href : publicPath };
});
console.log(JSON.stringify(records, null, 2));
