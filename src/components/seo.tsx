import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { siteUrl, asset } from "@/lib/utils";

export function Seo({ title, description, noindex = false }: { title: string; description?: string; noindex?: boolean }) {
  const { site } = useContent();
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const desc = description || t(site.description);
  useEffect(() => {
    const pageTitle = `${title.replace(/\n/g, " ")} | ${site.name}`;
    document.title = pageTitle;
    document.documentElement.lang = locale;
    const meta = (key: string, content: string, attr = "name") => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attr, key); document.head.appendChild(element); }
      element.content = content;
    };
    meta("description", desc);
    meta("robots", noindex || !siteUrl() ? "noindex, nofollow" : "index, follow");
    meta("og:title", pageTitle, "property"); meta("og:description", desc, "property");
    meta("og:type", "website", "property"); meta("og:locale", locale === "vi" ? "vi_VN" : "en_US", "property");
    meta("twitter:card", "summary_large_image"); meta("twitter:title", pageTitle); meta("twitter:description", desc);
    const origin = siteUrl();
    const canonicalPath = pathname === "/" ? `/${locale}` : pathname.replace(/\/$/, "");
    // SITE_URL is the domain origin; BASE_URL supplies the subfolder.
    const canonical = origin ? `${origin}${asset(canonicalPath)}` : "";
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = canonical;
      meta("og:url", canonical, "property");
      meta("og:image", `${origin}${asset("images/og-cover.png")}`, "property");
      meta("twitter:image", `${origin}${asset("images/og-cover.png")}`);
    } else { link?.remove(); }
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    if (origin && !noindex) {
      for (const language of ["en", "vi", "x-default"]) {
        const target = language === "x-default" ? site.defaultLocale : language;
        const path = canonicalPath.replace(/^\/(en|vi)(?=\/|$)/, `/${target}`);
        const alternate = document.createElement("link");
        alternate.rel = "alternate"; alternate.hreflang = language; alternate.href = `${origin}${asset(path)}`;
        document.head.appendChild(alternate);
      }
    }
  }, [title, desc, locale, pathname, site.name, site.defaultLocale, noindex]);
  return null;
}
