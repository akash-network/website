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
  /** Hourly rate the HTML ships with. */
  snapshot: number;
  /** Set for bid-priced GPUs; the browser swaps in the live rate. */
  source?: LivePriceSource;
};

export type BidCta = {
  lead: "console" | "akashml";
  gpus: BidCtaGpu[];
  /** "an H200", "these GPUs" or "GPUs", for "Rent … on Akash". */
  subject: string;
  /** "an H200", "an H100 or A100", or a generic phrase when the title names no GPU. */
  gpuPhrase: string;
  rentLabel: string;
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

// Quoted on GPU posts whose title names no specific model.
const DEFAULT_GPUS: GpuDetailSlug[] = ["h100", "h200", "a100"];

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
    snapshot: Number(stripInline(page.hero.price).replace(/[^\d.]/g, "")),
    source: page.livePrice,
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

  return {
    lead: named.length || GPU_TOPIC.test(title) ? "console" : "akashml",
    gpus,
    subject: single ?? (named.length ? "these GPUs" : "GPUs"),
    gpuPhrase: named.length
      ? withArticle(orList(gpus.map((gpu) => gpu.name)))
      : "a GPU from the Akash marketplace",
    rentLabel: single ? `Rent ${single}` : "Rent a GPU",
    model,
  };
}

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

/** The lowest snapshot rate among the GPUs, e.g. "$2.07". */
export const fromRate = (gpus: BidCtaGpu[]) =>
  priceLabels(Math.min(...gpus.map((gpu) => gpu.snapshot))).rate;

/** Serialized for `data-bid-price`; the browser recomputes the lowest rate from live bids. */
export const priceData = (gpus: BidCtaGpu[]) =>
  JSON.stringify(gpus.map(({ snapshot, source }) => ({ snapshot, source })));
