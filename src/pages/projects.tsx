import { ContentImage } from "@/components/content-image";
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, X, ArrowLeft, ArrowRight, ArrowUpRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading, ProjectCard, Breadcrumbs, Eyebrow, TagList } from "@/components/sections/shared";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { filterProjects } from "@/lib/logic";
import { NotFoundPage } from "@/pages/not-found";

type Category = "all" | "product" | "mechanical" | "electronics" | "prototype" | "manufacturing";
const categories: Category[] = ["all", "product", "mechanical", "electronics", "prototype", "manufacturing"];
export function ProjectsPage() {
  const { projects } = useContent();
  const { copy, t } = useLocale();
  const [params, setParams] = useSearchParams();
  const rawCategory = params.get("category") || "all";
  const category: Category = categories.includes(rawCategory as Category) ? rawCategory as Category : "all";
  const query = params.get("q") || "";
  const filtered = useMemo(() => filterProjects(projects, category, query), [projects, category, query]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key); else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return <><Seo title={t(copy.common.projects)} description={t(copy.work.pageDescription)} /><PageHeading eyebrow={t(copy.work.eyebrow)} title={t(copy.work.pageTitle)} description={t(copy.work.pageDescription)} /><section className="section section-no-top"><div className="container"><div className="project-toolbar"><div className="filter-buttons" role="group" aria-label={t(copy.common.projects)}>{categories.map((key) => <button key={key} className={category === key ? "active" : ""} aria-pressed={category === key} aria-label={`${t(copy.work.categories[key])} ${key === "all" ? projects.length : projects.filter((project) => project.category === key).length}`} onClick={() => update("category", key)}>{t(copy.work.categories[key])}<span>{key === "all" ? projects.length : projects.filter((project) => project.category === key).length}</span></button>)}</div><div className="project-search"><Search size={17} aria-hidden="true" /><Input value={query} maxLength={100} onChange={(event) => update("q", event.target.value)} placeholder={t(copy.work.searchPlaceholder)} aria-label={t(copy.work.searchPlaceholder)} />{query && <button onClick={() => update("q", "")} aria-label={t(copy.work.reset)}><X size={15} aria-hidden="true" /></button>}</div></div><div className="results-info" role="status" aria-live="polite"><span>{filtered.length} {t(copy.work.result)}</span><span>{t(copy.common.reference)}</span></div>{filtered.length ? <div className="editorial-project-grid projects-grid-page">{filtered.map((project) => <ProjectCard key={project.slug} project={project} />)}</div> : <div className="empty-state"><Search size={34} strokeWidth={1} aria-hidden="true" /><h2>{t(copy.work.emptyTitle)}</h2><p>{t(copy.work.emptyBody)}</p><Button variant="outline" onClick={() => setParams({})}>{t(copy.work.reset)}</Button></div>}<p className="archive-note">{t(copy.work.archiveNote)}</p></div></section></>;
}
export function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects, services } = useContent();
  const { copy, t, href } = useLocale();
  const index = projects.findIndex((entry) => entry.slug === slug);
  const project = projects[index];
  if (!project) return <NotFoundPage />;
  const service = services.find((entry) => entry.slug === project.service);
  const previous = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return <><Seo title={t(project.title)} description={t(project.summary)} /><div className="container detail-breadcrumbs"><Breadcrumbs items={[{ label: t(copy.common.projects), to: href("projects") }, { label: t(project.title) }]} /></div><div className="container project-detail-head"><Eyebrow>{t(copy.common.reference)} / {project.tags[0]}</Eyebrow><h1 tabIndex={-1}>{t(project.title)}</h1><div className="project-detail-intro"><p>{t(project.summary)}</p><TagList tags={project.tags} /></div></div><figure className={`container detail-image-wrap detail-image-${project.category}`}><ContentImage src={project.image} alt={t(project.imageAlt)} width={800} height={600} fetchPriority="high" style={{ objectFit: project.imageFit === "contain" ? "contain" : "cover", objectPosition: project.imagePosition }} /><figcaption className="mono">{t(copy.common.illustration)} / TONY PRODUCT DESIGN</figcaption></figure><section className="section"><div className="container project-detail-grid"><div><Eyebrow>{t(copy.work.overview)}</Eyebrow><h2>{t(copy.work.overview)}</h2><p className="detail-body">{t(project.overview)}</p><h3>{t(copy.work.focus)}</h3><ul className="deliverables">{project.focus.map((item) => <li key={item.en}><Check size={18} aria-hidden="true" />{t(item)}</li>)}</ul><div className="reference-notice"><Info size={18} aria-hidden="true" /><p>{t(copy.work.notice)}</p></div></div><aside className="project-spec-card"><h2>{t(copy.work.specs)}</h2><dl>{project.specs.map((spec) => <div key={spec.label.en}><dt>{t(spec.label)}</dt><dd>{spec.value}</dd></div>)}</dl>{service && <Link className="text-link" to={href(`services/${service.slug}`)}>{t(service.title)}<ArrowUpRight size={16} aria-hidden="true" /></Link>}<hr /><h3>{t(copy.work.similar)}</h3><Button asChild><Link to={`${href("contact")}?service=${project.service}`}>{t(copy.common.start)}<ArrowUpRight aria-hidden="true" /></Link></Button></aside></div></section>
    {project.gallery.length > 0 && <section className="container study-gallery"><h2>{t(copy.work.gallery)}</h2><div>{project.gallery.map((image) => <figure key={image.image}><ContentImage src={image.image} alt={t(image.alt)} width={1000} height={820} loading="lazy" /><figcaption>{t(image.alt)}</figcaption></figure>)}</div></section>}
    {projects.length > 1 && <nav className="container project-pagination" aria-label={t(copy.common.projects)}><Link to={href(`projects/${previous.slug}`)}><ArrowLeft size={20} aria-hidden="true" /><span><small>{t(copy.common.previous)}</small>{t(previous.title)}</span></Link><Link to={href(`projects/${next.slug}`)}><span><small>{t(copy.common.next)}</small>{t(next.title)}</span><ArrowRight size={20} aria-hidden="true" /></Link></nav>}</>;
}
