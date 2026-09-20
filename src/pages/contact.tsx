import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Mail, Phone, MapPin, Check, Copy, Download, ArrowLeft, LoaderCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeading } from "@/components/sections/shared";
import { Seo } from "@/components/seo";
import { useContent } from "@/providers/content";
import { useLocale } from "@/providers/locale";
import { validateEnquiry, emptyEnquiry, buildEnquiryText, makeMailto, isHttpsEndpoint, type Enquiry, type EnquiryErrors } from "@/lib/logic";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="form-field"><Label htmlFor={id}>{label}</Label>{children}{error && <p id={`${id}-error`} className="field-error">{error}</p>}</div>;
}
export function ContactPage() {
  const { site, services } = useContent();
  const { t, copy, href, locale } = useLocale();
  const c = copy.contact;
  const [params] = useSearchParams();
  const requestedService = params.get("service") || "";
  const initialService = services.some((service) => service.slug === requestedService) ? requestedService : "";
  const [form, setForm] = useState<Enquiry>(() => ({ ...emptyEnquiry, service: initialService }));
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<"editing" | "prepared" | "submitting" | "submitted">("editing");
  const [requestError, setRequestError] = useState(false);
  const [clipboardStatus, setClipboardStatus] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || "";
  const endpointMode = site.contactMode === "endpoint" && isHttpsEndpoint(endpoint);
  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (status === "prepared" || status === "submitted") resultRef.current?.focus();
  }, [status]);
  function change<K extends keyof Enquiry>(key: K, value: Enquiry[K]) {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
  }
  function errorText(key: keyof typeof c.validation) {
    return errors[key] ? t(c.validation[key]) : undefined;
  }
  function aria(key: keyof typeof c.validation) {
    return { "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `${key}-error` : undefined };
  }
  const serviceTitle = t(services.find((service) => service.slug === form.service)?.title || c.servicePlaceholder);
  const timelineTitle = t(c.timelines[Number(form.timeline)] || c.timelines[0]);
  const brief = buildEnquiryText(form, {
    name: t(c.name), email: t(c.email), company: t(c.company),
    service: t(c.service), timeline: t(c.timeline), message: t(c.message),
  }, serviceTitle, timelineTitle);
  const subject = `Project enquiry - ${form.name.trim()}`;
  const fullMailto = makeMailto(site.email, subject, brief);
  const longBrief = fullMailto.length > 1800;
  const mailto = longBrief ? makeMailto(site.email, subject, t(c.longEmailBody)) : fullMailto;
  function validate() {
    const next = validateEnquiry(form, services.map((service) => service.slug));
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      requestAnimationFrame(() => document.getElementById(first)?.focus());
      return false;
    }
    return true;
  }
  function prepareEmail() {
    if (!validate()) return;
    setClipboardStatus(""); setRequestError(false); setStatus("prepared");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    if (form.website.trim()) { setRequestError(true); return; }
    if (!endpointMode) { prepareEmail(); return; }
    setStatus("submitting"); setRequestError(false);
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim(), company: form.company.trim(),
          service: serviceTitle, timeline: timelineTitle, message: form.message.trim(),
          consent: form.consent, locale, _subject: subject, _gotcha: form.website,
        }),
      });
      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
      setStatus("submitted");
    } catch {
      setStatus("editing"); setRequestError(true);
    } finally {
      window.clearTimeout(timeout);
    }
  }
  async function copyBrief() {
    try { await navigator.clipboard.writeText(brief); setClipboardStatus(t(c.copied)); }
    catch { setClipboardStatus(t(c.copyError)); }
  }
  function downloadBrief() {
    const blob = new Blob(["\uFEFF", brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tony-product-design-enquiry.txt";
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const busy = status === "submitting";
  return <><Seo title={t(copy.common.contact)} description={t(c.description)} /><PageHeading eyebrow={t(c.eyebrow)} title={t(c.title)} description={t(c.description)} /><section className="section section-no-top"><div className="container contact-layout">
    <aside className="contact-sidebar"><div className="contact-method"><Mail size={21} strokeWidth={1.3} aria-hidden="true" /><span className="eyebrow">{t(c.emailLabel)}</span><a href={`mailto:${site.email}`}>{site.email}<ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="contact-method"><Phone size={21} strokeWidth={1.3} aria-hidden="true" /><span className="eyebrow">{t(c.phoneLabel)}</span><a href={site.whatsapp} target="_blank" rel="noopener noreferrer">{site.phone}<ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="contact-method"><MapPin size={21} strokeWidth={1.3} aria-hidden="true" /><span className="eyebrow">{t(c.locationLabel)}</span><p>{t(site.address) || t(site.location)}</p></div><div className="contact-brand-note"><span>Tony</span><small>PRODUCT DESIGN</small></div><p className="contact-verification">{t(site.contactVerification)}</p></aside>
    <div className="contact-form-card">
    {status === "prepared" || status === "submitted" ? <div className="enquiry-result">
      <span className="result-icon"><Check size={30} aria-hidden="true" /></span><h2 ref={resultRef} tabIndex={-1}>{t(status === "prepared" ? c.prepared : c.sent)}</h2><p>{t(status === "prepared" ? c.preparedBody : c.sentBody)}</p>
      {status === "prepared" && <><div className="enquiry-actions"><Button asChild><a href={mailto}>{t(c.openEmail)}<ArrowUpRight aria-hidden="true" /></a></Button><Button variant="outline" onClick={copyBrief}><Copy aria-hidden="true" />{t(c.copy)}</Button><Button variant="outline" onClick={downloadBrief}><Download aria-hidden="true" />{t(c.download)}</Button></div>{longBrief && <p className="long-brief-note"><Info size={17} aria-hidden="true" />{t(c.longNote)}</p>}<p className="clipboard-status" role="status" aria-live="polite">{clipboardStatus}</p><Label htmlFor="brief-preview">{t(c.review)}</Label><Textarea id="brief-preview" readOnly value={brief} rows={12} className="brief-preview" /></>}
      <Button variant="ghost" onClick={() => { setStatus("editing"); setRequestError(false); }}><ArrowLeft aria-hidden="true" />{t(c.edit)}</Button>
    </div> : <>
      <h2>{t(c.formTitle)}</h2><p className="form-intro">{t(c.formDescription)}</p>
      <form onSubmit={submit} noValidate aria-busy={busy}>
        <div className="form-grid">
          <Field id="name" label={`${t(c.name)} *`} error={errorText("name")}><Input id="name" name="name" autoComplete="name" placeholder={t(c.namePlaceholder)} required maxLength={100} value={form.name} onChange={(event) => change("name", event.target.value)} {...aria("name")} disabled={busy} /></Field>
          <Field id="email" label={`${t(c.email)} *`} error={errorText("email")}><Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={t(c.emailPlaceholder)} required maxLength={254} value={form.email} onChange={(event) => change("email", event.target.value)} {...aria("email")} disabled={busy} /></Field>
          <Field id="company" label={`${t(c.company)} (${t(copy.common.optional)})`} error={errorText("company")}><Input id="company" name="company" autoComplete="organization" placeholder={t(c.companyPlaceholder)} maxLength={150} value={form.company} onChange={(event) => change("company", event.target.value)} {...aria("company")} disabled={busy} /></Field>
          <Field id="service" label={t(c.service)} error={errorText("service")}><select className="ui-input" id="service" name="service" value={form.service} onChange={(event) => change("service", event.target.value)} {...aria("service")} disabled={busy}><option value="">{t(c.servicePlaceholder)}</option>{services.map((service) => <option key={service.slug} value={service.slug}>{t(service.title)}</option>)}</select></Field>
        </div>
        <Field id="timeline" label={t(c.timeline)} error={errorText("timeline")}><select id="timeline" name="timeline" className="ui-input" value={form.timeline} onChange={(event) => change("timeline", event.target.value)} {...aria("timeline")} disabled={busy}>{c.timelines.map((timeline, index) => <option key={timeline.en} value={String(index)}>{t(timeline)}</option>)}</select></Field>
        <Field id="message" label={`${t(c.message)} *`} error={errorText("message")}><Textarea id="message" name="message" required rows={6} maxLength={5000} value={form.message} placeholder={t(c.messagePlaceholder)} onChange={(event) => change("message", event.target.value)} {...aria("message")} disabled={busy} /><span className="character-count">{form.message.length.toLocaleString(locale)} / 5,000</span></Field>
        <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => change("website", event.target.value)} /></div>
        <div className="consent-row"><input id="consent" name="consent" type="checkbox" checked={form.consent} onChange={(event) => change("consent", event.target.checked)} {...aria("consent")} disabled={busy} /><Label htmlFor="consent">{t(c.consent)} <Link to={href("privacy")}>{t(copy.common.privacy)}</Link></Label></div>{errors.consent && <p className="field-error" id="consent-error">{errorText("consent")}</p>}
        {Object.values(errors).some(Boolean) && <p className="form-alert" role="alert">{t(c.required)}</p>}
        {requestError && <div className="form-alert" role="alert"><p>{t(c.sendError)}</p><button type="button" className="text-link" onClick={prepareEmail}>{t(c.fallback)}<ArrowUpRight size={16} aria-hidden="true" /></button></div>}
        <Button size="lg" type="submit" disabled={busy} className="form-submit">{busy ? <><LoaderCircle className="spin" aria-hidden="true" />{t(c.sending)}</> : <>{t(endpointMode ? c.submitEndpoint : c.submit)}<ArrowUpRight aria-hidden="true" /></>}</Button>
        <p className="form-privacy-note"><Info size={15} aria-hidden="true" />{t(endpointMode ? c.endpointNote : c.privacyNote)}</p>
      </form></>}
    </div>
  </div></section></>;
}
