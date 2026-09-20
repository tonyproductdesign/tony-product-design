import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes, ErrorBoundary } from "@/app";
import { ContentProvider } from "@/providers/content";
import { ThemeProvider } from "@/providers/theme";
import { assertContent } from "@/lib/validate-content.mjs";
import schema from "@/lib/content-schema.json";
import type { Content } from "@/types/content";
import "@/styles.css";

let initialData: Content | undefined;
const bootstrap = document.getElementById("tony-bootstrap");
try {
  if (bootstrap?.textContent) {
    const payload: unknown = JSON.parse(bootstrap.textContent);
    assertContent(payload, schema);
    initialData = payload as Content;
  }
} catch (error) { console.error("Invalid pre-rendered data; fetching JSON instead.", error); }
const root = document.getElementById("root");
if (!root) throw new Error("Root element missing");
const app = <StrictMode><ErrorBoundary><ContentProvider initialData={initialData}><ThemeProvider><BrowserRouter basename={import.meta.env.BASE_URL}><AppRoutes /></BrowserRouter></ThemeProvider></ContentProvider></ErrorBoundary></StrictMode>;
// Query-driven filters/forms differ from the query-free static HTML.
      // Re-render these URLs and the generic host 404 without mismatched hydration.
      const queryDriven = ["q", "category", "service"].some((key) => new URLSearchParams(window.location.search).has(key));
      if (initialData && root.hasChildNodes() && !root.dataset.noHydrate && !queryDriven) hydrateRoot(root, app);
else createRoot(root).render(app);
