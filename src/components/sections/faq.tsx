import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Eyebrow } from "@/components/sections/shared";
import { useLocale } from "@/providers/locale";
export function FaqSection() {
  const { copy, t } = useLocale();
  return <section className="section faq-section"><div className="container faq-grid"><div><Eyebrow>{t(copy.faq.eyebrow)}</Eyebrow><h2>{t(copy.faq.title)}</h2></div><Accordion type="single" collapsible defaultValue="0">{copy.faq.items.map((item, index) => <AccordionItem key={index} value={String(index)}><AccordionTrigger>{t(item.q)}</AccordionTrigger><AccordionContent>{t(item.a)}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}
