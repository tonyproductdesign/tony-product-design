import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, ResourceCard, CtaSection, Breadcrumbs, Eyebrow } from "@/components/sections/shared";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { asset } from "@/lib/utils";
import { NotFoundPage } from "@/pages/not-found";

export function InsightsPage() {
  const { resources } = useContent();
  const { copy, t } = useLocale();
  return <><Seo title={t(copy.common.resources)} description={t(copy.insights.description)} /><PageHeading eyebrow={t(copy.insights.eyebrow)} title={t(copy.insights.title)} description={t(copy.insights.description)} /><section className="section section-no-top"><div className="container"><div className="resources-grid">{resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}</div><p className="archive-note">{t(copy.insights.note)}</p></div></section><CtaSection /></>;
}
export function InsightDetailPage() {
  const { slug } = useParams();
  const { resources } = useContent();
  const { t, copy, href, locale } = useLocale();
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) return <NotFoundPage />;
  return <><Seo title={t(resource.title)} description={t(resource.summary)} /><div className="container detail-breadcrumbs"><Breadcrumbs items={[{ label: t(copy.common.resources), to: href("insights") }, { label: t(resource.title) }]} /></div><article className="container article-layout"><div className="article-content"><Eyebrow>{t(resource.category)} / {t(resource.readTime)}</Eyebrow><h1 tabIndex={-1}>{t(resource.title)}</h1><p className="article-lead">{t(resource.summary)}</p><div className="article-divider" />{resource.sections.map((section) => <section key={section.heading.en}><h2>{t(section.heading)}</h2><p>{t(section.body)}</p></section>)}<p className="article-note">{t(copy.insights.note)}</p><Link className="text-link" to={href("insights")}><ArrowLeft size={17} aria-hidden="true" />{t(copy.insights.back)}</Link></div><aside className="download-card"><Download size={30} strokeWidth={1.3} aria-hidden="true" /><h2>{t(copy.insights.downloadTitle)}</h2><p>{t(copy.insights.downloadBody)}</p><Button asChild><a href={asset(`downloads/${resource.download}-${locale}.md`)} download>{t(copy.common.download)}<Download aria-hidden="true" /></a></Button><Link className="text-link" to={href("contact")}>{t(copy.common.start)}<ArrowUpRight size={16} aria-hidden="true" /></Link></aside></article><CtaSection /></>;
}
