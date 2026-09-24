import { BASE_API_URL } from "@/lib/constants";
import { gpus as GPU_PRICES_URL } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import type { GpuPricesResponse } from "../gpus/gpu-models";

// Average hours in a month, the same constant the Akash Console API uses (30.437 days × 24h).
export const HOURS_PER_MONTH = 30.437 * 24;

const ONE_MINUTE = 60_000;

export function useGpuPrices() {
  return useQuery<GpuPricesResponse>({
    queryKey: ["PRICING_GPU_PRICES"],
    queryFn: async () =>
      (await axios.get<GpuPricesResponse>(GPU_PRICES_URL)).data,
    refetchInterval: ONE_MINUTE,
  });
}

/** Deployment spec in the units `/v1/pricing` expects: millicores and bytes. */
export interface PricingSpec {
  cpu: number;
  memory: number;
  storage: number;
}

/** Monthly USD estimates returned by the Console API for one spec. */
export interface PricingEstimate {
  spec: PricingSpec;
  akash: number;
  aws: number;
  gcp: number;
  azure: number;
}

// The endpoint accepts at most 10 specs per request.
export function usePricingEstimates(specs: PricingSpec[]) {
  return useQuery<PricingEstimate[]>({
    queryKey: ["PRICING_ESTIMATES", specs],
    queryFn: async () =>
      (await axios.post<PricingEstimate[]>(`${BASE_API_URL}/v1/pricing`, specs))
        .data,
    keepPreviousData: true,
    staleTime: 10 * ONE_MINUTE,
  });
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

/** AKT/USD from CoinGecko: the current price and the mean of the last 30 daily closes. */
export function useAktPrice() {
  const current = useQuery<number>({
    queryKey: ["PRICING_AKT_CURRENT"],
    queryFn: async () => {
      const { data } = await axios.get<{ "akash-network"?: { usd?: number } }>(
        `${COINGECKO_API}/simple/price?ids=akash-network&vs_currencies=usd`,
      );
      const price = data?.["akash-network"]?.usd;
      if (!price) throw new Error("AKT price missing from CoinGecko response");
      return price;
    },
    staleTime: 5 * ONE_MINUTE,
  });

  const average30d = useQuery<number>({
    queryKey: ["PRICING_AKT_30D_AVERAGE"],
    queryFn: async () => {
      const { data } = await axios.get<{ prices?: [number, number][] }>(
        `${COINGECKO_API}/coins/akash-network/market_chart?vs_currency=usd&days=30&interval=daily`,
      );
      const prices = (data?.prices ?? []).map(([, price]) => price);
      if (prices.length === 0) throw new Error("No AKT price history returned");
      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    },
    staleTime: 30 * ONE_MINUTE,
  });

  return { current, average30d };
}

export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
