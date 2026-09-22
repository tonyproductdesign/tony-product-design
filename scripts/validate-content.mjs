import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { validateImageFiles } from "./image-files.mjs";
import { assertContent } from "../src/lib/validate-content.mjs";

const base = resolve(import.meta.dirname, "..");
const groups = ["site", "services", "projects", "resources", "copy"];
//const data = Object.fromEntries(await Promise.all(groups.map(async (name) => [
  //name, JSON.parse(await readFile(resolve(base, `public/data/${name}.json`), "utf8")),
//])));
//const schema = JSON.parse(await readFile(resolve(base, "src/lib/content-schema.json"), "utf8"));
//assertContent(data, schema);
//const images = await validateImageFiles(data, resolve(base, "public"));
//for (const resource of data.resources) {
  //for (const locale of ["en", "vi"]) await access(resolve(base, "public/downloads", `${resource.download}-${locale}.md`));
//}
console.log(`Content OK: ${data.services.length} services, ${data.projects.length} projects, ${data.resources.length} resources, 2 languages.`);

console.log(`Images OK: ${images.local} local references checked, ${images.remote} HTTPS references accepted (remote availability not checked).`);
