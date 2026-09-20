import { useParams } from "react-router-dom";
import { useContent } from "@/providers/content";
import type { Locale, Localized } from "@/types/content";

export function useLocale() {
  const { locale: param } = useParams();
  const { copy, site } = useContent();
  const locale: Locale = param === "vi" ? "vi" : param === "en" ? "en" : site.defaultLocale === "vi" ? "vi" : "en";
  const t = (value: Localized) => value[locale] || value.en;
  const href = (path = "") => `/${locale}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;
  return { locale, t, href, copy };
}
