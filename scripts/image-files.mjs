import { stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { parseImageSource } from "../src/lib/image-paths.mjs";

/** List image references with their JSON field names for useful diagnostics. */
export function imageEntries(data) {
  const entries = [];
  for (const key of ["image", "banner", "mobileBanner"]) entries.push([`site.hero.${key}`, data.site.hero[key]]);
  data.projects.forEach((project, index) => {
    entries.push([`projects[${index}].image (${project.slug})`, project.image]);
    project.gallery.forEach((image, galleryIndex) => entries.push([`projects[${index}].gallery[${galleryIndex}].image`, image.image]));
  });
  return entries;
}

/** HTTPS images are not fetched at build time; no network/SSRF dependency. */
export async function validateImageFiles(data, publicDirectory) {
  const base = resolve(publicDirectory);
  let local = 0;
  let remote = 0;
  for (const [field, source] of imageEntries(data)) {
    const parsed = parseImageSource(source);
    if (!parsed) throw new Error(`${field}: unsafe image path or URL: ${source}`);
    if (parsed.kind === "remote") { remote++; continue; }
    const filename = resolve(base, parsed.path);
    if (!filename.startsWith(base + sep)) throw new Error(`${field}: path must remain inside public/`);
    let info;
    try { info = await stat(filename); }
    catch { throw new Error(`${field}: file not found: public/${parsed.path}. Check the exact filename, extension and letter case.`); }
    if (!info.isFile()) throw new Error(`${field}: not an image file: public/${parsed.path}`);
    local++;
  }
  return { local, remote };
}
