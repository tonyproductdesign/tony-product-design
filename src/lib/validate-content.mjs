/**
 * Small JSON schema validator for the exact subset used by this project.
 * Both the browser and build scripts run the same validation.
 * Images allow public file paths and owner-configured HTTPS URLs only.
 */
import { isAllowedImageSource } from "./image-paths.mjs";

export function assertContent(value, schema) {
  const problems = [];
  function visit(item, rule, path) {
    if (rule.type === "array") {
      if (!Array.isArray(item)) { problems.push(`${path} must be an array`); return; }
      item.forEach((entry, index) => visit(entry, rule.items, `${path}[${index}]`));
    } else if (rule.type === "object") {
      if (!item || typeof item !== "object" || Array.isArray(item)) { problems.push(`${path} must be an object`); return; }
      for (const [key, child] of Object.entries(rule.properties || {})) visit(item[key], child, `${path}.${key}`);
    } else if (rule.type && typeof item !== rule.type) {
      problems.push(`${path} must be ${rule.type}`);
    }
  }
  visit(value, schema, "content");
  if (problems.length) throw new Error(problems.slice(0, 10).join("\n"));
  for (const group of ["services", "projects", "resources"]) {
    const slugs = new Set();
    for (const item of value[group]) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) problems.push(`${group}: invalid slug ${item.slug}`);
      if (slugs.has(item.slug)) problems.push(`${group}: duplicate slug ${item.slug}`);
      slugs.add(item.slug);
    }
  }
  for (const project of value.projects) {
    if (!["product", "mechanical", "electronics", "prototype", "manufacturing"].includes(project.category)) problems.push(`Invalid category for ${project.slug}`);
    if (!value.services.some((service) => service.slug === project.service)) problems.push(`Unknown service for ${project.slug}`);
    if (!isAllowedImageSource(project.image)) problems.push(`Unsafe image path for ${project.slug}`);
    if (!["archive-reference", "concept-reference", "verified"].includes(project.status)) problems.push(`Invalid project status for ${project.slug}`);
  }
  for (const service of value.services) {
    if (!["CircuitBoard", "Box", "Workflow", "Wrench"].includes(service.icon)) problems.push(`Unknown icon for ${service.slug}`);
  }
  for (const resource of value.resources) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.download)) problems.push(`Unsafe download path for ${resource.slug}`);
  }
  for (const link of value.site.navigation) {
    if (!["", "services", "projects", "studio", "insights", "contact"].includes(link.path)) problems.push(`Unknown navigation path: ${link.path}`);
  }
  if (!["mailto", "endpoint"].includes(value.site.contactMode)) problems.push("contactMode must be mailto or endpoint");
  if (!["en", "vi"].includes(value.site.defaultLocale)) problems.push("defaultLocale must be en or vi");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.site.email)) problems.push("Invalid contact email");
  if (!/^\+?[0-9]{7,16}$/.test(value.site.phoneHref)) problems.push("phoneHref must be a normalized phone number");
  const safeImage = isAllowedImageSource;
  for (const field of ["image", "banner", "mobileBanner"]) {
    if (!safeImage(value.site.hero[field])) problems.push(`Unsafe hero image: ${field}`);
  }
  for (const project of value.projects) {
    if (!["cover", "contain"].includes(project.imageFit)) problems.push(`Invalid imageFit for ${project.slug}`);
    if (!/^[0-9a-z% .-]+$/i.test(project.imagePosition)) problems.push(`Invalid imagePosition for ${project.slug}`);
    for (const image of project.gallery) if (!safeImage(image.image)) problems.push(`Unsafe gallery image for ${project.slug}`);
  }
  const safeSocial = (raw, hosts) => {
    if (!raw) return true;
    try {
      const url = new URL(raw);
      return url.protocol === "https:" && !url.username && !url.password && hosts.includes(url.hostname);
    } catch { return false; }
  };
  if (!/^https:\/\/wa\.me\/[0-9]{7,16}$/.test(value.site.whatsapp)) problems.push("WhatsApp must use https://wa.me/<digits>");
  if (!safeSocial(value.site.instagram, ["instagram.com", "www.instagram.com"])) problems.push("Invalid Instagram URL");
  if (!safeSocial(value.site.facebook, ["facebook.com", "www.facebook.com", "fb.com", "www.fb.com"])) problems.push("Invalid Facebook URL");
  if (value.site.hero && value.copy.hero.stages.length !== value.services.length) problems.push("Cover stages must match the service count");
  if (problems.length) throw new Error(problems.join("\n"));
}
