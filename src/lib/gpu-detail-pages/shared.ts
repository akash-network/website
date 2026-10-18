import type { GpuLink, GpuTable } from "./types";

// On-demand "from" rates for models priced by open bids: the lowest bid in the Akash
// Console API (/v1/gpu-prices) on October 18, 2026. H200 had no live bids then, so its rate
// is set by hand. Blackwell B-series rates come from `blackwellHourlyPrice` instead.
export const ON_DEMAND_FROM = {
  h200: 4.45,
  h100: 2.04,
  a100: 1.07,
  "rtx-pro-6000-workstation": 1.44,
  "rtx-pro-6000-server": 1.49,
} as const;

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

/** Hourly and monthly pricing table: one GPU, optionally an 8-GPU node, then a quoted row. */
export const pricingTable = (
  hourly: number,
  rows: { single: string; node?: string; quoted: string },
): GpuTable => {
  const p = priceLabels(hourly);
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
