import fallbackSite from "../public/data/site.json";
import { Component, type ReactNode, type ErrorInfo } from "react";
import { Routes, Route } from "react-router-dom";
import { SiteLayout } from "@/components/layout/site-layout";
import { HomePage } from "@/pages/home";
import { ServicesPage, ServiceDetailPage } from "@/pages/services";
import { ProjectsPage, ProjectDetailPage } from "@/pages/projects";
import { StudioPage } from "@/pages/studio";
import { InsightsPage, InsightDetailPage } from "@/pages/insights";
import { ContactPage } from "@/pages/contact";
import { PrivacyPage } from "@/pages/privacy";
import { NotFoundPage } from "@/pages/not-found";

export function AppRoutes() {
  return <Routes>
    <Route path="/" element={<SiteLayout />}><Route index element={<HomePage />} /></Route>
    <Route path="/:locale" element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="services/:slug" element={<ServiceDetailPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:slug" element={<ProjectDetailPage />} />
      <Route path="studio" element={<StudioPage />} />
      <Route path="insights" element={<InsightsPage />} />
      <Route path="insights/:slug" element={<InsightDetailPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>;
}
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Application error", error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="boot-screen"><div className="brand-mark">Tony.</div><h1>Something did not connect.</h1><p>Please reload the page or email {fallbackSite.email}.</p><button className="boot-retry" onClick={() => window.location.reload()}>Reload</button></main>;
    return this.props.children;
  }
}
