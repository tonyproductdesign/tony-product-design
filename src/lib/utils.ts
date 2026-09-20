import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { resolveImageUrl } from "./image-paths.mjs";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function imageUrl(path: string) {
  return resolveImageUrl(path, import.meta.env.BASE_URL);
}
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
export function safeStorageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function safeStorageSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Storage can be disabled. */ }
}
export function siteUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL || "").trim();
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return "";
    return url.origin;
  } catch { return ""; }
}
