import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { Brand } from "@/components/layout/header";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";

export function Footer() {
  const { site } = useContent();
  const { t, href, copy } = useLocale();
  const f = copy.footer;
  const address = t(site.address) || t(site.location);
  return <footer id="contact" className="site-footer tony-footer" tabIndex={-1}>
    <div className="container">
      <div className="footer-invitation">
        <div><p className="editorial-label">{t(f.eyebrow)}</p><h2>{t(f.title)}</h2></div>
        <Link to={href("contact")} className="footer-contact-arrow" aria-label={t(f.contactLink)}><ArrowUpRight size={56} strokeWidth={1.2} aria-hidden="true" /></Link>
      </div>
      <div className="tony-contact-grid">
        <div className="footer-primary-contact"><h3>{t(f.email)}</h3><a href={`mailto:${site.email}`} className="tony-email">{site.email}<ArrowUpRight size={19} aria-hidden="true" /></a><p>{t(f.signature)}</p></div>
        <div><h3>{t(f.whatsapp)}</h3><a href={site.whatsapp} target="_blank" rel="noopener noreferrer">{site.phone}<ArrowUpRight size={15} aria-hidden="true" /></a><h3 className="footer-address-title">{t(f.address)}</h3><address>{address}</address></div>
        <div><h3>{t(f.social)}</h3>{(["instagram", "facebook"] as const).map((network) => {
          const label = network === "instagram" ? "Instagram" : "Facebook";
          return site[network] ? <a key={network} href={site[network]} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={15} aria-hidden="true" /></a> :
            <span key={network} className="social-unconfigured" title={t(f.unconfigured)}>{label}<small>{t(f.unconfigured)}</small></span>;
        })}</div>
      </div>
      <div className="tony-footer-bottom">
        <Brand />
        <span>© {site.copyrightYear} {site.name}</span>
        <div><Link to={href("privacy")}>{t(copy.common.privacy)}</Link><Link to={href("services")}>{t(copy.common.services)}</Link><Link to={href("insights")}>{t(copy.common.resources)}</Link></div>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} aria-label={t(f.backTop)}><ArrowUp size={20} aria-hidden="true" /></button>
      </div>
    </div>
  </footer>;
}
