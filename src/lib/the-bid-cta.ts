import { GPU_DETAIL_PAGES, stripInline } from "@/lib/gpu-detail-pages";
import { priceLabels } from "@/lib/gpu-detail-pages/shared";
import type { GpuDetailSlug } from "@/lib/gpu-detail-pages/slugs";
import type { LivePriceSource } from "@/lib/gpu-detail-pages/types";

// Calls to action on The Bid posts: rent the GPU on Akash Console, or call the model through
// AkashML. Posts whose title is about GPUs lead with Console and quote the GPUs the title
// names; the rest lead with AkashML.

export const CONSOLE_URL = "https://console.akash.network/new-deployment";
export const AKASHML_URL = "https://akashml.com/";

/** Where on the post a CTA sits, sent as `utm_content` and with the click event. */
export type BidCtaPlacement = "sidebar" | "top" | "end";

export type BidCtaGpu = {
  name: string;
  /** Memory spec from the GPU's pricing page, e.g. "141 GB HBM3e". */
  memory: string;
  /** Hourly rate the HTML ships with; null for GPUs offered on request (B300). */
  snapshot: number | null;
  /** Set for bid-priced GPUs; the browser swaps in the live rate. */
  source?: LivePriceSource;
  /** Request-access page for GPUs offered on request (B200, B300). */
  requestHref?: string;
};

export type BidCta = {
  lead: "console" | "akashml";
  gpus: BidCtaGpu[];
  /** "an H200", "these GPUs" or "GPUs", for "Rent … on Akash". */
  subject: string;
  /** "an H200", "an H100 or A100", or a generic phrase when the title names no GPU. */
  gpuPhrase: string;
  rentLabel: string;
  /** Set when every GPU is offered on request: the rent buttons go here instead of Console. */
  requestHref?: string;
  /** Set when the title names a model AkashML serves; the AkashML CTA then links to its page. */
  model?: BidCtaModel;
};

export type BidCtaModel = { name: string; url: string };

// Models a title may contain, mapped to their AkashML model page. The first one the title
// names wins.
const TITLE_MODELS: [RegExp, BidCtaModel][] = [
  [
    /\bKimi K3\.1 Pro\b/i,
    { name: "Kimi K3.1 Pro", url: "https://akashml.com/models/kimi-k3.1-pro" },
  ],
];

// GPU names a title may contain, mapped to their pricing data. "RTX PRO 6000" quotes the
// Server Edition, the edition with steady supply on the marketplace.
const TITLE_GPUS: [RegExp, GpuDetailSlug][] = [
  [/\bRTX PRO 6000\b/i, "rtx-pro-6000-server"],
  [/\bB300\b/i, "b300"],
  [/\bB200\b/i, "b200"],
  [/\bH200\b/i, "h200"],
  [/\bH100\b/i, "h100"],
  [/\bA100\b/i, "a100"],
];

// Quoted on GPU posts whose title names no specific model: high-end GPUs priced from live
// marketplace bids. B300 shows "Request access" until providers bid on it.
const DEFAULT_GPUS: GpuDetailSlug[] = [
  "b300",
  "h100",
  "rtx-pro-6000-server",
  "a100",
];

const GPU_TOPIC = /\bGPUs?\b|\bNVIDIA\b/i;

/** "an H200", "a B300": read as letters, so A, F, H, R and the like take "an". */
const withArticle = (name: string) =>
  `${/^[AEFHILMNORSX]/i.test(name) ? "an" : "a"} ${name}`;

const orList = (items: string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`
    : items[0];

const toGpu = (slug: GpuDetailSlug): BidCtaGpu => {
  const page = GPU_DETAIL_PAGES[slug];
  return {
    name: page.shortName,
    memory: page.hero.specs[0],
    snapshot: page.livePrice?.onRequest
      ? null
      : Number(stripInline(page.hero.price).replace(/[^\d.]/g, "")),
    source: page.livePrice,
    requestHref: page.livePrice?.onRequest
      ? `/next-gen-gpus/?gpu=${slug}#request-access`
      : undefined,
  };
};

export function bidCta(title: string): BidCta {
  const named = TITLE_GPUS.map(([pattern, slug]) => ({
    slug,
    index: title.search(pattern),
  }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)
    .map(({ slug }) => slug);

  const gpus = (named.length ? named : DEFAULT_GPUS).map(toGpu);
  const model = TITLE_MODELS.map(([pattern, model]) => ({
    model,
    index: title.search(pattern),
  }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0]?.model;
  const single = named.length === 1 ? withArticle(gpus[0].name) : undefined;
  const requestHref = gpus.every((gpu) => gpu.requestHref)
    ? gpus[0].requestHref
    : undefined;

  return {
    lead: named.length || GPU_TOPIC.test(title) ? "console" : "akashml",
    gpus,
    subject: single ?? (named.length ? "these GPUs" : "GPUs"),
    gpuPhrase: named.length
      ? withArticle(orList(gpus.map((gpu) => gpu.name)))
      : "a GPU from the Akash marketplace",
    rentLabel: requestHref
      ? "Request access"
      : single
        ? `Rent ${single}`
        : "Rent a GPU",
    requestHref,
    model,
  };
}

/** Attributes for a CTA's rent link: Console in a new tab, or the request-access page in the
 *  same tab when every GPU is offered on request. */
export const rentLinkAttrs = (
  cta: BidCta,
  postId: string,
  placement: BidCtaPlacement,
) =>
  cta.requestHref
    ? { href: cta.requestHref, "data-bid-cta": "request" }
    : {
        href: bidCtaHref(CONSOLE_URL, postId, placement),
        target: "_blank",
        rel: "noopener noreferrer",
        "data-bid-cta": "console",
      };

/** Outbound CTA link, tagged so Console and AkashML analytics can attribute the visit. */
export const bidCtaHref = (
  url: string,
  postId: string,
  placement: BidCtaPlacement,
) => {
  const href = new URL(url);
  href.search = new URLSearchParams({
    utm_source: "the_bid",
    utm_medium: "organic_blog",
    utm_campaign: postId,
    utm_content: placement,
  }).toString();
  return href.toString();
};

/** Shown in place of a rate when none of the GPUs has a price (B300 with no bids). */
export const NO_RATE_LABEL = "Request access";

/** How a CTA price reads: "$2.55" for one GPU, "Avg. $2.16" across several, and the unit after
 *  it. With no rate it reads "Request access" and drops the unit. */
export type BidPriceFormat = {
  unit: string;
  rateClass?: string;
  unitClass?: string;
  /** With no rate, "Request access" links here. Leave unset inside another link. */
  requestHref?: string;
  linkClass?: string;
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Price HTML from per-GPU hourly rates (null where a GPU has no price). Shared by the build
 *  and the browser, which re-renders it with live weighted-average bids. */
export function bidPriceHtml(
  rates: (number | null | undefined)[],
  {
    unit,
    rateClass = "",
    unitClass = "",
    requestHref,
    linkClass = "",
  }: BidPriceFormat,
) {
  const priced = rates.filter(
    (rate): rate is number => typeof rate === "number" && rate > 0,
  );
  if (!priced.length)
    return requestHref
      ? `<a href="${escapeHtml(requestHref)}" class="${escapeHtml(linkClass)}" data-bid-cta="request">${escapeHtml(NO_RATE_LABEL)}</a>`
      : escapeHtml(NO_RATE_LABEL);
  const avg = priced.reduce((sum, rate) => sum + rate, 0) / priced.length;
  const prefix = priced.length > 1 ? "Avg. " : "";
  return `${prefix}<span class="${escapeHtml(rateClass)}">${priceLabels(avg).rate}</span><span class="${escapeHtml(unitClass)}">${escapeHtml(unit)}</span>`;
}

/** Attributes for a CTA price element: what the browser needs to refresh it. */
export const priceAttrs = (gpus: BidCtaGpu[], format: BidPriceFormat) => ({
  "data-bid-price": JSON.stringify(
    gpus.map(({ snapshot, source }) => ({ snapshot, source })),
  ),
  "data-bid-format": JSON.stringify(format),
});

/** Build-time price HTML from the snapshot rates. */
export const snapshotPriceHtml = (gpus: BidCtaGpu[], format: BidPriceFormat) =>
  bidPriceHtml(
    gpus.map((gpu) => gpu.snapshot),
    format,
  );
