// Models that have a detail page at /pricing/gpus/<slug>/. Kept apart from the page data so
// the pricing table can link to them without bundling every page's copy into the client.
export const GPU_DETAIL_SLUGS = [
  "b300",
  "b200",
  "h200",
  "h100",
  "a100",
  "rtx-pro-6000-workstation",
  "rtx-pro-6000-server",
] as const;

export type GpuDetailSlug = (typeof GPU_DETAIL_SLUGS)[number];

// Console API model ids whose page slug differs from the id. The Max-Q edition has no page.
const MODEL_SLUGS: Record<string, GpuDetailSlug> = {
  pro6000we: "rtx-pro-6000-workstation",
  pro6000se: "rtx-pro-6000-server",
};

export const gpuDetailHref = (model: string) => {
  const id = (model ?? "").toLowerCase();
  const slug = MODEL_SLUGS[id] ?? id;
  return (GPU_DETAIL_SLUGS as readonly string[]).includes(slug)
    ? `/pricing/gpus/${slug}/`
    : undefined;
};
