import { Link } from "react-router-dom";
import { ArrowUpRight, CircuitBoard } from "lucide-react";
import { Eyebrow } from "@/components/sections/shared";
import { useLocale } from "@/providers/locale";

export function ProcessSection() {
  const { copy, t, href } = useLocale();
  return <section className="process-section"><div className="container process-grid"><div className="process-intro"><Eyebrow>{t(copy.process.eyebrow)}</Eyebrow><h2>{t(copy.process.title)}</h2><p>{t(copy.process.description)}</p><Link className="text-link" to={href("studio")}>{t(copy.process.link)}<ArrowUpRight size={16} aria-hidden="true" /></Link><div className="process-schematic" aria-hidden="true"><span /><span /><CircuitBoard size={52} strokeWidth={1} /><span /><span /></div></div><div className="process-steps">{copy.process.steps.map((step, index) => <div className="process-step" key={index}><span className="step-number mono">0{index + 1}</span><div><h3>{t(step.title)}</h3><p>{t(step.body)}</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div></div></section>;
}
