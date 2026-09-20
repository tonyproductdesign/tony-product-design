import { useEffect, useRef } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/providers/locale";
import { safeStorageSet } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

export function SiteLayout() {
  const { copy, t, locale } = useLocale();
  const { locale: param } = useParams();
  const { pathname, hash } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    document.documentElement.lang = locale;
    safeStorageSet("tony-locale", locale);
    const changedPage = previous.current !== pathname;
    previous.current = pathname;
    const frame = requestAnimationFrame(() => {
      if (hash) {
        // An ID lookup, not a CSS selector: unexpected hashes cannot inject selectors.
        let id = hash.slice(1);
        try { id = decodeURIComponent(id); } catch { /* Invalid percent-encoding is treated as a literal ID. */ }
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
          target.focus({ preventScroll: true });
          return;
        }
      }
      if (changedPage) {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.querySelector<HTMLElement>("#main-content h1")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, locale]);
  const valid = !param || param === "en" || param === "vi";
  return <>
    <a className="skip-link" href="#main-content">{t(copy.common.skip)}</a>
    <Header />
    <main id="main-content">{valid ? <Outlet /> : <NotFoundPage />}</main>
    <Footer />
  </>;
}
