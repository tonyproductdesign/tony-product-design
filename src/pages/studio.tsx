import { ContentImage } from "@/components/content-image";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, MapPin, CircuitBoard, Workflow, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, Eyebrow, CtaSection } from "@/components/sections/shared";
import { ProcessSection } from "@/components/sections/process";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";

export function StudioPage() {
  const { site } = useContent();
  const { copy, t, href } = useLocale();
  const valueIcons = [MessageCircle, Workflow, CircuitBoard];
  return <><Seo title={t(copy.studio.eyebrow)} description={t(copy.studio.description)} /><PageHeading eyebrow={t(copy.studio.eyebrow)} title={t(copy.studio.title)} description={t(copy.studio.description)} /><section className="section section-no-top"><div className="container studio-intro-grid"><div className="studio-art"><div className="studio-art-grid" aria-hidden="true" /><ContentImage src={site.hero.image} alt={t(copy.common.illustration)} width={800} height={600} /><div className="studio-art-caption"><span className="mono">TONY / PRODUCT DESIGN</span><MapPin size={20} aria-hidden="true" /></div></div><div className="studio-story"><Eyebrow>{t(site.location)}</Eyebrow><h2>{t(site.tagline)}</h2><p>{t(copy.studio.body)}</p><Button asChild variant="outline"><Link to={href("contact")}>{t(copy.common.contact)}<ArrowUpRight aria-hidden="true" /></Link></Button></div></div></section><section className="section studio-values"><div className="container"><Eyebrow>{t(copy.studio.valuesTitle)}</Eyebrow><h2>{t(copy.studio.valuesTitle)}</h2><div className="values-grid">{copy.studio.values.map((value, index) => { const Icon = valueIcons[index % valueIcons.length]; return <article key={value.title.en}><Icon size={28} strokeWidth={1.3} aria-hidden="true" /><span className="mono">0{index + 1}</span><h3>{t(value.title)}</h3><p>{t(value.body)}</p></article>; })}</div></div></section><section className="section"><div className="container expertise-grid"><div><Eyebrow>{t(copy.studio.expertiseTitle)}</Eyebrow><h2>{t(copy.studio.expertiseTitle)}</h2><p className="muted">{t(copy.studio.expertiseNote)}</p></div><div><ul className="expertise-list">{copy.studio.expertise.map((item) => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul><div className="tool-chips">{site.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div></div></section><ProcessSection /><CtaSection /></>;
}
