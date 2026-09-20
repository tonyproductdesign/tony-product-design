import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppRoutes, ErrorBoundary } from "@/app";
import { ContentProvider } from "@/providers/content";
import { ThemeProvider } from "@/providers/theme";
import type { Content } from "@/types/content";

// Build-time only. No server, API or database is required after deployment.
export function render(url: string, content: Content): string {
  return renderToString(<ErrorBoundary><ContentProvider initialData={content}><ThemeProvider><StaticRouter basename={import.meta.env.BASE_URL} location={`${import.meta.env.BASE_URL.replace(/\/$/, "")}${url}`}><AppRoutes /></StaticRouter></ThemeProvider></ContentProvider></ErrorBoundary>);
}
