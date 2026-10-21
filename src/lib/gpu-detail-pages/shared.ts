import type { GpuLink, GpuTable, LivePriceSource } from "./types";

type BidPricedSlug =
  | "h200"
  | "h100"
  | "a100"
  | "rtx-pro-6000-workstation"
  | "rtx-pro-6000-server";

// Pages priced from open bids. The browser fetches the Akash Console API (/v1/gpu-prices) on
// load and shows the provider-weighted average bid, the same figure as the GPU pricing table.
// The snapshot rate (that average on SNAPSHOT_DATE) is what the HTML ships with, for crawlers
// and visitors without JavaScript, and what stays if the API is down or has no bids. H200 had
// no bids; its rate is the listed price.
export const BID_PRICED: Record<
  BidPricedSlug,
  { source: LivePriceSource; snapshot: number }
> = {
  h200: { source: { model: "h200", listed: true }, snapshot: 4.45 },
  h100: { source: { model: "h100", ramGb: 80 }, snapshot: 2.73 },
  a100: { source: { model: "a100", ramGb: 80 }, snapshot: 1.72 },
  "rtx-pro-6000-workstation": {
    source: { model: "pro6000we" },
    snapshot: 1.44,
  },
  "rtx-pro-6000-server": { source: { model: "pro6000se" }, snapshot: 2.02 },
};
export const SNAPSHOT_DATE = new Date("2026-10-20T00:00:00Z");

/** When this build ran. Fixed-rate prices are current as of this date. */
export const BUILD_DATE = new Date();

/** "October 20, 2026" */
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** "2026-10-20", for structured data and <time datetime>. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const usd = (value: number) => `$${value.toFixed(2)}`;
const usdWhole = (value: number) =>
  `$${Math.round(value).toLocaleString("en-US")}`;

/** Price labels for a per-GPU hourly rate. Months are 720 hours (30 days, 24/7). */
export const priceLabels = (hourly: number) => ({
  /** "$5.00" */
  rate: usd(hourly),
  /** "$5" for whole-dollar rates, otherwise the same as `rate`. */
  rateShort: Number.isInteger(hourly) ? `$${hourly}` : usd(hourly),
  monthly: usdWhole(hourly * 720),
  node: usd(hourly * 8),
  nodeMonthly: usdWhole(hourly * 8 * 720),
});

export const deployLink: GpuLink = {
  label: "Deploy on-demand",
  href: "https://console.akash.network/new-deployment",
  external: true,
};

export const allPricingLink: GpuLink = {
  label: "See all GPU pricing",
  href: "/pricing/gpus/",
};

export const DEPLOY_STEP_ADD_APP = {
  title: "Add your app.",
  text: "Pick a template or paste a Docker image.",
};

export const DEPLOY_STEP_DEPLOY = {
  title: "Deploy.",
  text: "Request quotes, accept one and start your workload.",
};

/** Marks a value the browser swaps for its live equivalent (see `renderInline`). */
const live = (key: string, value: string) => `{{${key}|${value}}}`;

/** `priceLabels`, marked for live updates. */
export const livePriceLabels = (hourly: number) => {
  const labels = priceLabels(hourly);
  return Object.fromEntries(
    Object.entries(labels).map(([key, value]) => [key, live(key, value)]),
  ) as typeof labels;
};

/** A date the browser replaces with today's once it has confirmed the price. */
export const liveDate = (date: Date) => live("asOf", formatDate(date));

/** Hourly and monthly pricing table: one GPU, optionally an 8-GPU node, then a quoted row. */
export const pricingTable = (
  hourly: number,
  rows: { single: string; node?: string; quoted: string },
  { livePrice = false } = {},
): GpuTable => {
  const p = livePrice ? livePriceLabels(hourly) : priceLabels(hourly);
  return {
    columns: ["Configuration", "Per hour", "Per month (720 h)"],
    numericColumns: [1, 2],
    rows: [
      [rows.single, p.rate, p.monthly],
      ...(rows.node ? [[rows.node, p.node, p.nodeMonthly]] : []),
      [rows.quoted, "Custom quote", "Custom quote"],
    ],
  };
};
