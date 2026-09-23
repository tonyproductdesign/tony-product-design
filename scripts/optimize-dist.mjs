import { rm, readdir } from "node:fs/promises";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist");
const duplicateImages = [
  "structure-design.webp",
  "industrial-design.png",
  "mass-production.jpg",
  "tony-product.webp",
  "prototype.webp",
  "hand-sketch.webp",
  "tony-speaker-hero.webp",
];

await Promise.all([
  ...duplicateImages.map((name) => rm(join(dist, "images", name), { force: true })),
  ...((await readdir(dist, { withFileTypes: true }))
    .filter((entry) => entry.name.startsWith("."))
    .map((entry) => rm(join(dist, entry.name), { recursive: entry.isDirectory(), force: true }))),
]);

console.log(`Optimized deployment output: removed ${duplicateImages.length} duplicate images and hidden artifacts.`);
