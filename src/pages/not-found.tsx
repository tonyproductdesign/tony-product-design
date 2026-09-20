import { Link } from "react-router-dom";
import { ArrowUpRight, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";
import { useLocale } from "@/providers/locale";
export function NotFoundPage() {
  const { t, href, copy } = useLocale();
  return <><Seo title="404" noindex /><section className="container not-found"><div className="not-found-code" aria-hidden="true">4<Unplug size={95} strokeWidth={1} />4</div><span className="eyebrow">404 / NOT CONNECTED</span><h1 tabIndex={-1}>{t(copy.common.notFoundTitle)}</h1><p>{t(copy.common.notFoundBody)}</p><Button asChild><Link to={href()}>{t(copy.common.home)}<ArrowUpRight aria-hidden="true" /></Link></Button></section></>;
}
