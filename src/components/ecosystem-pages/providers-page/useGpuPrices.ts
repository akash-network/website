import { gpus } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface GpuModelPrice {
  vendor: string;
  model: string;
  ram: string;
  interface: string;
  availability: { total: number; available: number };
  providerAvailability: { total: number; available: number };
  price: {
    currency: string;
    min: number;
    max: number;
    avg: number;
    weightedAverage: number;
    med: number;
  } | null;
}

export interface GpuPrices {
  availability: { total: number; available: number };
  models: GpuModelPrice[];
}

export async function getGpuPrices(): Promise<GpuPrices> {
  const response = await axios.get(gpus);
  return response.data;
}

export function useGpuPrices() {
  return useQuery<GpuPrices, Error>({
    queryKey: ["GPU_PRICES"],
    queryFn: getGpuPrices,
    refetchInterval: 60000,
    retry: 2,
  });
}

/** Network median $/GPU-hr for a specific model, matched by vendor+model (case-insensitive). Not this provider's own price — Akash pricing is bid-based, this is the network-wide reference rate for that GPU. */
export function findGpuMedianPrice(
  prices: GpuPrices | undefined,
  vendor: string,
  model: string,
): number | null {
  if (!prices) return null;
  const match = prices.models.find(
    (m) =>
      m.vendor.toLowerCase() === vendor.toLowerCase() &&
      m.model.toLowerCase() === model.toLowerCase(),
  );
  return match?.price?.med ?? null;
}
