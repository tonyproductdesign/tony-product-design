import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { ContentImage } from "@/components/content-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import "@/styles/home-banner.css";

/** The actual service artwork is visible before any click. The dialog only enlarges it. */
export function HomeBanner() {
  const { site, services } = useContent();
  const { copy, t, href } = useLocale();
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) setZoomed(false);
  }

  function toggleZoom() {
    setZoomed((previous) => !previous);
    viewport.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild>
      <button type="button" className="home-banner-trigger" aria-label={t(copy.hero.viewBanner)}>
        {/* Deliberately do not use mobileBanner: it is a different brand card,
            not the four-stage service banner the owner wants visitors to see. */}
        <ContentImage
          className="home-service-banner"
          src={site.hero.banner}
          alt={t(copy.hero.bannerDescription)}
          width={2048}
          height={768}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="home-banner-caption">
          <span>{t(copy.hero.eyebrow)}</span>
          <span>{t(copy.hero.viewBanner)}<Maximize2 size={15} aria-hidden="true" /></span>
        </span>
      </button>
    </DialogTrigger>

    <DialogContent className="home-banner-dialog" closeLabel={t(copy.common.close)}>
      <div className="home-banner-dialog-heading">
        <DialogTitle>{t(copy.hero.bannerTitle)}</DialogTitle>
        <DialogDescription>{t(copy.hero.bannerDescription)}</DialogDescription>
      </div>
      <div className="home-banner-toolbar">
        <Button variant="outline" size="sm" onClick={toggleZoom} aria-pressed={zoomed}>
          {zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />}
          {t(zoomed ? copy.hero.bannerFit : copy.hero.bannerZoom)}
        </Button>
        <p id="home-banner-pan-hint">{t(copy.hero.bannerPanHint)}</p>
      </div>
      <div
        ref={viewport}
        className={`home-banner-viewport${zoomed ? " is-zoomed" : ""}`}
        role="region"
        tabIndex={0}
        aria-label={t(copy.hero.bannerTitle)}
        aria-describedby="home-banner-pan-hint"
      >
        <ContentImage src={site.hero.banner} alt={t(copy.hero.bannerDescription)} width={2048} height={768} />
      </div>
      <div className="home-banner-service-links">
        {services.map((service) => <Link key={service.slug} to={href(`services/${service.slug}`)} onClick={() => changeOpen(false)}>
          {t(service.title)}<ArrowUpRight size={15} aria-hidden="true" />
        </Link>)}
      </div>
    </DialogContent>
  </Dialog>;
}
