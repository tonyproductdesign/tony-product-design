import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, Search, Sun, Moon, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { useTheme } from "@/providers/theme";
import { normalizeSearch } from "@/lib/logic";

export function Brand({ light = false }: { light?: boolean }) {
  const { href, locale } = useLocale();
  const { site } = useContent();
  return <Link to={href()} className={`brand tony-brand ${light ? "brand-light" : ""}`} aria-label={`${site.name} - ${locale === "en" ? "home" : "trang chu"}`}>
    <span className="tony-wordmark">{site.wordmark}<i aria-hidden="true" /></span>
    <span className="tony-descriptor">{site.descriptor}</span>
  </Link>;
}
export function Header() {
  const { site, services, projects, resources } = useContent();
  const { t, href, locale, copy } = useLocale();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const navTarget = (path: string) => {
    if (path === "projects") return `${href()}#work`;
    if (path === "studio") return `${href()}#approach`;
    if (path === "contact") return `${href()}#contact`;
    return href(path);
  };
  const otherLocale = locale === "en" ? "vi" : "en";
  const translatedPath = location.pathname === "/" ? `/${otherLocale}` : location.pathname.replace(/^\/(en|vi)(?=\/|$)/, `/${otherLocale}`);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const entries = useMemo(() => [
    ...services.map((entry) => ({ title: entry.title[locale], terms: `${entry.title.en} ${entry.title.vi} ${entry.tags.join(" ")}`, kind: copy.common.services[locale], path: `services/${entry.slug}` })),
    ...projects.map((entry) => ({ title: entry.title[locale], terms: `${entry.title.en} ${entry.title.vi} ${entry.tags.join(" ")}`, kind: copy.common.projects[locale], path: `projects/${entry.slug}` })),
    ...resources.map((entry) => ({ title: entry.title[locale], terms: `${entry.title.en} ${entry.title.vi}`, kind: copy.common.resources[locale], path: `insights/${entry.slug}` })),
  ], [services, projects, resources, locale, copy]);
  const matches = entries.filter((entry) => normalizeSearch(`${entry.terms} ${entry.kind}`).includes(normalizeSearch(query)));
  return <header className="site-header">
    <div className="container nav-row">
      <Brand />
      <nav className="desktop-nav" aria-label={locale === "en" ? "Main navigation" : "Điều hướng chính"}>
        {site.navigation.filter((item) => item.path).map((item) => <Link key={item.path} to={navTarget(item.path)}>{t(item.label)}</Link>)}
      </nav>
      <div className="nav-actions">
        <Button ref={searchButtonRef} variant="ghost" size="icon" className="search-launch" onClick={() => { setQuery(""); setSearchOpen(true); }} aria-label={t(copy.common.search)}><Search aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t(copy.common.theme)}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button>
        <Link className="locale-switch" to={`${translatedPath}${location.search}${location.hash}`} aria-label={t(copy.common.language)} lang={otherLocale}>{locale.toUpperCase()}<span aria-hidden="true">↗</span></Link>
        <Button asChild size="sm" className="desktop-cta tony-header-cta"><Link to={href("contact")}>{t(copy.common.start)}<ArrowUpRight aria-hidden="true" /></Link></Button>
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild><Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label={t(copy.common.menu)}><Menu aria-hidden="true" /></Button></DialogTrigger>
          <DialogContent className="mobile-sheet" closeLabel={t(copy.common.close)}>
            <DialogTitle className="sr-only">{t(copy.common.menu)}</DialogTitle>
            <DialogDescription className="sr-only">{t(site.tagline)}</DialogDescription>
            <Brand />
            <nav aria-label={locale === "en" ? "Mobile navigation" : "Điều hướng trên di động"} className="mobile-nav">
              {site.navigation.map((item, index) => <DialogClose asChild key={item.path}><Link to={navTarget(item.path)}><span className="mono">{String(index + 1).padStart(2, "0")}</span>{t(item.label)}<ArrowUpRight size={22} aria-hidden="true" /></Link></DialogClose>)}
              <DialogClose asChild><Button asChild><Link to={href("contact")}>{t(copy.common.start)}<ArrowUpRight aria-hidden="true" /></Link></Button></DialogClose>
            </nav>
            <a className="mobile-contact" href={`mailto:${site.email}`}>{site.email}</a>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="search-dialog" closeLabel={t(copy.common.close)} onCloseAutoFocus={(event) => { event.preventDefault(); searchButtonRef.current?.focus(); }}>
        <DialogTitle className="search-title">{t(copy.common.search)}</DialogTitle>
        <DialogDescription className="search-description">{t(copy.common.searchHint)}</DialogDescription>
        <div className="search-field"><Search size={19} aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(copy.common.searchHint)} aria-label={t(copy.common.search)} />{query && <button onClick={() => setQuery("")} aria-label={t(copy.work.reset)}><X size={16} aria-hidden="true" /></button>}</div>
        <div className="search-results">
          {matches.length ? matches.map((entry) => <Link key={entry.path} to={href(entry.path)} onClick={() => setSearchOpen(false)}><span><small>{entry.kind}</small>{entry.title}</span><ArrowRight size={17} aria-hidden="true" /></Link>) : <p className="search-empty">{t(copy.common.searchEmpty)}</p>}
        </div>
        <div className="search-foot"><span>⌘ / Ctrl + K</span><span>Esc</span></div>
      </DialogContent>
    </Dialog>
  </header>;
}
