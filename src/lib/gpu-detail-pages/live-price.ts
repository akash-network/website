import {
  gpuHourlyPrice,
  parseRamGb,
  type GpuPricesResponse,
} from "@/components/pricing-page/gpus/gpu-models";
import { BASE_API_URL } from "@/lib/constants";
import type { LivePriceSource } from "./types";

// Browser helpers for prices that ship as snapshots and refresh from the Akash Console API.

export async function fetchGpuPrices() {
  const res = await fetch(`${BASE_API_URL}/v1/gpu-prices`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as GpuPricesResponse;
}

/** The current weighted-average bid for a model (the figure the GPU pricing table shows), or
 *  undefined when it has no bids. If several variants match (e.g. SXM and PCIe), quotes the
 *  cheapest one's average. */
export function liveHourly(
  data: GpuPricesResponse,
  { model, ramGb }: LivePriceSource,
) {
  const prices = (data.models ?? [])
    .filter((m) => m.model === model && (!ramGb || parseRamGb(m.ram) === ramGb))
    .map(gpuHourlyPrice)
    .filter((price): price is number => typeof price === "number" && price > 0);
  return prices.length ? Math.min(...prices) : undefined;
}
