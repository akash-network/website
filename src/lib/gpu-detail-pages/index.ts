import { a100 } from "./a100";
import { b200 } from "./b200";
import { b300 } from "./b300";
import { h100 } from "./h100";
import { h200 } from "./h200";
import { rtxPro6000Server } from "./rtx-pro-6000-server";
import { rtxPro6000Workstation } from "./rtx-pro-6000-workstation";
import type { GpuDetailSlug } from "./slugs";
import type { GpuDetailPage } from "./types";

// To add a GPU page: write its copy next to b300.ts, register it here and add its slug to
// GPU_DETAIL_SLUGS (plus MODEL_SLUGS if the slug differs from the API model id). The pricing
// table links the matching row to the new page.
export const GPU_DETAIL_PAGES: Record<GpuDetailSlug, GpuDetailPage> = {
  b300,
  b200,
  h200,
  h100,
  a100,
  "rtx-pro-6000-workstation": rtxPro6000Workstation,
  "rtx-pro-6000-server": rtxPro6000Server,
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
