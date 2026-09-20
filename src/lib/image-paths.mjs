/**
 * Shared image policy used by the browser, static rendering and Node validation.
 * Public images keep their filenames. External images must use HTTPS.
 * This module has no browser globals or third-party runtime dependencies.
 */

/**
 * @typedef {{ kind: "local", path: string, urlPath: string } |
 *   { kind: "remote", url: string }} ImageSource
 */

/** @param {unknown} raw @returns {ImageSource | null} */
export function parseImageSource(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || /[\u0000-\u001f\u007f\\]/.test(value)) return null;

  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
      // Keep signed CDN query strings untouched. Image URLs need not end in .jpg.
      return { kind: "remote", url: value };
    } catch { return null; }
  }

  // Never accept protocol-relative URLs, arbitrary schemes or traversal paths.
  if (value.startsWith("//") || value.includes("#")) return null;
  const queryAt = value.indexOf("?");
  const pathname = queryAt < 0 ? value : value.slice(0, queryAt);
  const query = queryAt < 0 ? "" : value.slice(queryAt);
  const rawSegments = pathname.replace(/^\//, "").split("/");
  let segments;
  try { segments = rawSegments.map((segment) => decodeURIComponent(segment)); }
  catch { return null; }
  if (segments.some((part) => !part || part === "." || part === ".." || /[\u0000-\u001f\u007f\\/%:*?"<>|#]/.test(part))) return null;
  const isProducts = segments[0] === "assets" && segments[1] === "products" && segments.length >= 3;
  const isLegacy = segments[0] === "images" && segments.length >= 2;
  if ((!isProducts && !isLegacy) || !/\.(?:avif|webp|png|jpe?g|gif|svg)$/i.test(segments.at(-1) || "")) return null;
  return {
    kind: "local",
    path: segments.join("/"),
    urlPath: segments.map((part) => encodeURIComponent(part)).join("/") + query,
  };
}

/** @param {unknown} value */
export function isAllowedImageSource(value) {
  return parseImageSource(value) !== null;
}

/** @param {string} base */
function normalizeBase(base) {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error("Image base must be / or a slash-terminated deployment path.");
  return base;
}

/**
 * Resolve local paths against the application's base, never the current route.
 * @param {string} source
 * @param {string} [base]
 */
export function resolveImageUrl(source, base = "/") {
  const parsed = parseImageSource(source);
  if (!parsed) throw new Error(`Unsafe image path or URL: ${source}`);
  return parsed.kind === "remote" ? parsed.url : normalizeBase(base) + parsed.urlPath;
}
