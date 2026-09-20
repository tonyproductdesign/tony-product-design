import { ContentImage } from "@/components/content-image";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ServiceIcon } from "@/components/icon";
import { useLocale } from "@/providers/locale";
import type { Project, Service, Resource } from "@/types/content";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}><span aria-hidden="true" />{children}</p>;
}
export function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div><div className="section-heading-aside">{description && <p>{description}</p>}{action}</div></div>;
}
export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading container"><Eyebrow>{eyebrow}</Eyebrow><h1 tabIndex={-1}>{title}</h1>{description && <p>{description}</p>}{children}</div>;
}
export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { href, locale } = useLocale();
  return <nav className="breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "Đường dẫn"}><Link to={href()}>{locale === "en" ? "Home" : "Trang chủ"}</Link>{items.map((item, index) => <span key={index}><ChevronRight size={12} aria-hidden="true" />{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
export function ServiceCard({ service }: { service: Service }) {
  const { t, href, copy } = useLocale();
  return <Card className="service-card"><div className="service-card-top"><ServiceIcon name={service.icon} size={30} strokeWidth={1.3} /><span className="mono">{service.number}</span></div><h3><Link to={href(`services/${service.slug}`)}>{t(service.title)}</Link></h3><p>{t(service.summary)}</p><div className="service-tags">{service.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="text-link" to={href(`services/${service.slug}`)}>{t(copy.common.learnMore)}<ArrowUpRight size={16} aria-hidden="true" /></Link></Card>;
}
export function ProjectCard({ project }: { project: Project }) {
  const { t, href, copy } = useLocale();
  return <article className="editorial-project" data-study={project.slug}>
    <Link to={href(`projects/${project.slug}`)} className="editorial-project-link" aria-label={`${t(copy.common.details)}: ${t(project.title)}`}>
      <div className={`editorial-project-image study-${project.category}`}>
        <ContentImage src={project.image} alt={t(project.imageAlt)} width={1000} height={820} loading="lazy" decoding="async" style={{ objectPosition: project.imagePosition, objectFit: project.imageFit === "contain" ? "contain" : "cover" }} />
        <span className="study-tag">{t(copy.work.tileLabel)} / {project.number}</span>
        <span className="study-arrow"><ArrowUpRight size={23} aria-hidden="true" /></span>
      </div>
      <div className="editorial-project-caption"><div><h3>{t(project.title)}</h3><p>{t(project.subtitle)}</p></div><span>{project.number}</span></div>
    </Link>
  </article>;
}
export function ResourceCard({ resource }: { resource: Resource }) {
  const { t, href, copy } = useLocale();
  return <article className="resource-card"><div className={`resource-art resource-art-${resource.number}`} aria-hidden="true"><span className="resource-art-grid" /><span className="resource-art-number">{resource.number}</span><div className="resource-art-lines"><span /><span /><span /></div><span className="mono">TONY / DESIGN NOTES</span></div><div className="resource-card-content"><span className="eyebrow">{t(resource.category)}<span className="resource-time">{t(resource.readTime)}</span></span><h2><Link to={href(`insights/${resource.slug}`)}>{t(resource.title)}</Link></h2><p>{t(resource.summary)}</p><Link to={href(`insights/${resource.slug}`)} className="text-link">{t(copy.common.read)}<ArrowRight size={16} aria-hidden="true" /></Link></div></article>;
}
export function CtaSection() {
  const { copy, t, href } = useLocale();
  return <section className="cta-section"><div className="container cta-inner"><div className="cta-orbit" aria-hidden="true"><span /><span /><span /></div><div><Eyebrow>{t(copy.cta.eyebrow)}</Eyebrow><h2>{t(copy.cta.title)}</h2></div><div className="cta-aside"><p>{t(copy.cta.description)}</p><Button asChild size="lg"><Link to={href("contact")}>{t(copy.common.start)}<ArrowUpRight aria-hidden="true" /></Link></Button></div></div></section>;
}
export function TagList({ tags }: { tags: string[] }) {
  return <div className="tag-list">{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>;
}
