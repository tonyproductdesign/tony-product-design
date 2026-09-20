// Dependency-free shared logic: exercised by Node's built-in test runner.
export interface Enquiry {
  name: string;
  email: string;
  company: string;
  service: string;
  timeline: string;
  message: string;
  consent: boolean;
  website: string;
}
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;
export const emptyEnquiry: Enquiry = {
  name: "", email: "", company: "", service: "", timeline: "0",
  message: "", consent: false, website: "",
};
export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}
export function validateEnquiry(data: Enquiry, serviceSlugs: string[]): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (data.name.trim().length < 2 || data.name.trim().length > 100) errors.name = "name";
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "email";
  if (data.company.trim().length > 150) errors.company = "company";
  if (data.service && !serviceSlugs.includes(data.service)) errors.service = "service";
  if (!["0", "1", "2", "3", "4"].includes(data.timeline)) errors.timeline = "timeline";
  if (data.message.trim().length < 20 || data.message.trim().length > 5000) errors.message = "message";
  if (!data.consent) errors.consent = "consent";
  return errors;
}
export function buildEnquiryText(
  data: Enquiry,
  labels: { name: string; email: string; company: string; service: string; timeline: string; message: string },
  serviceTitle: string,
  timelineTitle: string,
): string {
  return [
    "Tony PRODUCT DESIGN — Project enquiry",
    `${labels.name}: ${data.name.trim()}`,
    `${labels.email}: ${data.email.trim()}`,
    `${labels.company}: ${data.company.trim() || "—"}`,
    `${labels.service}: ${serviceTitle}`,
    `${labels.timeline}: ${timelineTitle}`,
    "", `${labels.message}:`, data.message.trim(),
  ].join("\n");
}
export function makeMailto(recipient: string, subject: string, body: string): string {
  // Query values are percent-encoded; a user cannot inject extra mail headers.
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject.replace(/[\r\n]/g, " "))}&body=${encodeURIComponent(body)}`;
}
export function isHttpsEndpoint(value: string): boolean {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}
export function filterProjects<T extends { category: string; title: { en: string; vi: string }; summary: { en: string; vi: string }; tags: string[] }>(
  projects: T[], category: string, query: string,
): T[] {
  const needle = normalizeSearch(query);
  return projects.filter((project) =>
    (category === "all" || project.category === category) &&
    (!needle || normalizeSearch([project.title.en, project.title.vi, project.summary.en, project.summary.vi, ...project.tags].join(" ")).includes(needle)),
  );
}
