import { b300 } from "./b300";
import type { GpuDetailSlug } from "./slugs";
import type { GpuDetailPage } from "./types";

// To add a GPU page: write its copy next to b300.ts, register it here and add its slug to
// GPU_DETAIL_SLUGS. The pricing table links the matching row to the new page.
export const GPU_DETAIL_PAGES: Record<GpuDetailSlug, GpuDetailPage> = {
  b300,
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Renders the `**bold**` and `[label](href)` markup allowed in page copy as HTML. */
export function renderInline(text: string) {
  return escapeHtml(text)
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-medium text-foreground">$1</strong>',
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      (_, label, href) =>
        `<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ""} class="font-medium text-foreground underline underline-offset-4 decoration-zinc-300 hover:decoration-current dark:decoration-white/30">${label}</a>`,
    );
}

/** Plain text of the same markup, for meta tags and structured data. */
export const stripInline = (text: string) =>
  text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");

export { GPU_DETAIL_SLUGS, gpuDetailHref } from "./slugs";
export type { GpuDetailPage, GpuLink, GpuTable } from "./types";
