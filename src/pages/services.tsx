import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, CtaSection, ServiceCard, Breadcrumbs, Eyebrow, TagList } from "@/components/sections/shared";
import { FaqSection } from "@/components/sections/faq";
import { ServiceIcon } from "@/components/icon";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { NotFoundPage } from "@/pages/not-found";

export function ServicesPage() {
  const { services } = useContent();
  const { copy, t } = useLocale();
  return <><Seo title={t(copy.common.services)} description={t(copy.services.pageDescription)} /><PageHeading eyebrow={t(copy.services.eyebrow)} title={t(copy.services.pageTitle)} description={t(copy.services.pageDescription)} /><section className="section section-no-top"><div className="container"><div className="services-grid services-grid-large">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div><div className="scope-note"><span className="status-dot" /><p>{t(copy.services.scopeNote)}</p></div></div></section><FaqSection /><CtaSection /></>;
}
export function ServiceDetailPage() {
  const { slug } = useParams();
  const { services } = useContent();
  const { t, href, copy } = useLocale();
  const service = services.find((entry) => entry.slug === slug);
  if (!service) return <NotFoundPage />;
  return <><Seo title={t(service.title)} description={t(service.summary)} /><div className="container detail-breadcrumbs"><Breadcrumbs items={[{ label: t(copy.common.services), to: href("services") }, { label: t(service.title) }]} /></div><section className="container service-detail-head"><div><Eyebrow>{service.number} / {t(service.title)}</Eyebrow><h1 tabIndex={-1}>{t(service.headline)}</h1><p>{t(service.summary)}</p><TagList tags={service.tags} /><Button asChild size="lg"><Link to={`${href("contact")}?service=${service.slug}`}>{t(copy.services.discuss)}<ArrowUpRight aria-hidden="true" /></Link></Button></div><div className="service-blueprint" aria-hidden="true"><div className="blueprint-grid" /><span className="mono">TONY / DISCIPLINE {service.number}</span><ServiceIcon name={service.icon} size={150} strokeWidth={.65} /><div className="blueprint-axis" /><span className="mono">CONSIDERED. CONNECTED.</span></div></section><section className="section"><div className="container service-detail-grid"><div><Eyebrow>{t(copy.services.deliverables)}</Eyebrow><h2>{t(copy.services.deliverables)}</h2><ul className="deliverables">{service.deliverables.map((item) => <li key={item.en}><Check size={19} aria-hidden="true" />{t(item)}</li>)}</ul><p className="muted small">{t(copy.services.scopeNote)}</p></div><div className="approach-card"><h2>{t(copy.services.steps)}</h2>{service.steps.map((step, index) => <div key={step.en}><span className="mono">0{index + 1}</span><p>{t(step)}</p><ArrowRight size={16} aria-hidden="true" /></div>)}</div></div></section><CtaSection /></>;
}
