// Models that have a detail page at /pricing/gpus/<slug>/. Kept apart from the page data so
// the pricing table can link to them without bundling every page's copy into the client.
export const GPU_DETAIL_SLUGS = ["b300"] as const;

export type GpuDetailSlug = (typeof GPU_DETAIL_SLUGS)[number];

export const gpuDetailHref = (model: string) => {
  const slug = (model ?? "").toLowerCase();
  return (GPU_DETAIL_SLUGS as readonly string[]).includes(slug)
    ? `/pricing/gpus/${slug}/`
    : undefined;
};
