export type Locale = "en" | "vi";
export type Localized = Record<Locale, string>;
export type Site = typeof import("../../public/data/site.json");
export type Service = (typeof import("../../public/data/services.json"))[number];
export type Project = (typeof import("../../public/data/projects.json"))[number];
export type Resource = (typeof import("../../public/data/resources.json"))[number];
export type Copy = typeof import("../../public/data/copy.json");
export interface Content {
  site: Site;
  services: Service[];
  projects: Project[];
  resources: Resource[];
  copy: Copy;
}
