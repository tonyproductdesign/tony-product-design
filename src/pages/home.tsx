import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeBanner } from "@/components/sections/home-banner";
import { ProjectCard } from "@/components/sections/shared";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";

/** Portfolio-first homepage. Content and all image paths are owned by local JSON. */
export function HomePage() {
  const { site, services, projects } = useContent();
  const { copy, t, href } = useLocale();
  const featured = projects.filter((project) => project.featured);
  return <>
    <Seo title={`${t(copy.hero.line1)} ${t(copy.hero.line2)}`} />
    <section className="tony-cover tony-banner-cover" aria-labelledby="cover-title">
      <HomeBanner />
      <div className="banner-summary">
        <div>
          <h1 id="cover-title" tabIndex={-1}>{t(copy.hero.line1)} {t(copy.hero.line2)}</h1>
          <p>{t(copy.hero.description)}</p>
        </div>
        <div className="cover-actions">
          <Button asChild size="lg"><Link to={href("contact")}>{t(copy.common.start)}<ArrowUpRight aria-hidden="true" /></Link></Button>
          <a className="cover-work-link" href="#work">{t(copy.common.explore)}<ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="cover-services">
        {services.map((service, index) => <Link to={href(`services/${service.slug}`)} className="cover-service" key={service.slug}>
          <span className="cover-service-number">{service.number}</span>
          <span><strong>{t(copy.hero.stages[index]?.title || service.title)}</strong><small>{t(copy.hero.stages[index]?.subtitle || service.summary)}</small></span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>)}
      </div>
      <div className="cover-capabilities" aria-label={t(copy.hero.toolsLabel)}>
        {copy.hero.capabilities.map((item) => <span key={item.en}>{t(item)}</span>)}
      </div>
      <div className="cover-contact">
        <a href={`mailto:${site.email}`}>{site.email}<ArrowUpRight size={13} aria-hidden="true" /></a>
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {site.phone}<ArrowUpRight size={13} aria-hidden="true" /></a>
      </div>
    </section>

    <section id="approach" className="container tony-intro" tabIndex={-1} aria-labelledby="intro-title">
      <div><p className="editorial-label">{t(copy.intro.eyebrow)}</p><h2 id="intro-title">{t(copy.intro.title)}</h2></div>
      <div className="intro-body"><p>{t(copy.intro.body)}</p><Link to={href("studio")}>{t(copy.intro.link)}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </section>

    <section id="work" className="container tony-work" tabIndex={-1} aria-labelledby="work-title">
      <div className="work-heading"><h2 id="work-title">{t(copy.work.eyebrow)}</h2><Link to={href("projects")}>{t(copy.common.viewAll)}<span>{String(featured.length).padStart(2, "0")}</span><ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      <div className="editorial-project-grid">{featured.map((project) => <ProjectCard project={project} key={project.slug} />)}</div>
      <div className="work-endnote"><p>{t(copy.work.archiveNote)}</p><a href="#contact">{t(copy.common.contact)}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    </section>


  </>;
}
