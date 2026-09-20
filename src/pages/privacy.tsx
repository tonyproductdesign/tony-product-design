import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/sections/shared";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { useTheme } from "@/providers/theme";
export function PrivacyPage() {
  const { site } = useContent();
  const { copy, t } = useLocale();
  const { reset } = useTheme();
  const [cleared, setCleared] = useState(false);
  return <><Seo title={t(copy.common.privacy)} /><PageHeading eyebrow={t(copy.privacy.eyebrow)} title={t(copy.privacy.title)} /><div className="container privacy-content">{copy.privacy.sections.map((section) => <section key={section.title.en}><h2>{t(section.title)}</h2><p>{t(section.body)}</p></section>)}<p>{t(copy.privacy.contact)} <a href={`mailto:${site.email}`}>{site.email}</a>.</p><Button variant="outline" onClick={() => { reset(); setCleared(true); }}>{t(copy.privacy.clear)}</Button>{cleared && <p className="small" role="status">{t(copy.privacy.cleared)}</p>}</div></>;
}
