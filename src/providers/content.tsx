import fallbackSite from "../../public/data/site.json";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Content } from "@/types/content";
import schema from "@/lib/content-schema.json";
import { assertContent } from "@/lib/validate-content.mjs";
import { asset } from "@/lib/utils";

const ContentContext = createContext<Content | null>(null);
const names = ["site", "services", "projects", "resources", "copy"] as const;
export async function loadContent(signal?: AbortSignal): Promise<Content> {
  const pairs = await Promise.all(names.map(async (name) => {
    const response = await fetch(asset(`data/${name}.json`), { signal, cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load ${name}.json (${response.status})`);
    return [name, await response.json()] as const;
  }));
  const payload = Object.fromEntries(pairs);
  assertContent(payload, schema);
  return payload as unknown as Content;
}
export function ContentProvider({ children, initialData }: { children: ReactNode; initialData?: Content }) {
  const [data, setData] = useState<Content | null>(initialData || null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setError(false); setAttempt((x) => x + 1); }, []);
  useEffect(() => {
    const controller = new AbortController();
    loadContent(controller.signal).then(setData).catch((cause: unknown) => {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      // Preserve pre-rendered data during a temporary network outage.
      if (!initialData) setError(true);
      console.error("Content loading failed:", cause);
    });
    return () => controller.abort();
  }, [attempt, initialData]);
  if (error && !data) {
    return <main className="boot-screen"><div className="brand-mark">Tony.</div><h1>Content unavailable / Chưa tải được nội dung</h1><p>Please try again, or email {fallbackSite.email}.</p><button className="boot-retry" onClick={retry}>Try again / Thử lại</button></main>;
  }
  if (!data) return <div className="boot-screen" role="status" aria-live="polite"><div className="brand-mark">Tony.</div><div className="loading-line" /><p>Turning ideas into real products...</p></div>;
  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>;
}
export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used within ContentProvider");
  return value;
}
