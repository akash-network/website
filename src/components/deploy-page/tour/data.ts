// Network data for the Console tour. GPU availability and price ranges are
// fetched live from the Console API in the browser; provider locations come
// from the page at build time (the providers list is too large to ship).
// Bids are simulated inside the live price range, since real bids need a real
// deployment. Every number falls back to a sensible default offline.
import { useEffect, useState } from "react";
import { BASE_API_URL } from "@/lib/constants";

export const HOURS_PER_MONTH = 30.437 * 24;
/** Console keeps about 48 hours of a deployment's cost in escrow. */
export const ESCROW_HOURS = 48;

export type NetworkSnapshot = {
  /** Online providers. */
  online: number;
  /** Online providers with room for the tour's 8 vCPU · 32 GiB spec. */
  eligible: number;
  /** [lat, lng] of online providers. */
  points: [number, number][];
};

export type GpuOption = {
  id: string;
  name: string;
  ram: string;
  providers: number;
  gpus: number;
  min: number;
  max: number;
};

export type Bid = {
  id: string;
  name: string;
  host: string;
  region: string;
  uptime: number;
  lat: number;
  lng: number;
  hr: number;
};

export type NetworkData = NetworkSnapshot & {
  gpus: GpuOption[];
  /** Lowest H100 price on the network, for the sign-in screen's label. */
  h100From: number;
  live: boolean;
};

export const FALLBACK_SNAPSHOT: NetworkSnapshot = {
  online: 55,
  eligible: 43,
  points: [
    [37.37, -121.92],
    [45.52, -122.68],
    [39.04, -77.49],
    [40.71, -74.0],
    [41.88, -87.63],
    [32.78, -96.8],
    [33.45, -112.07],
    [43.65, -79.38],
    [49.28, -123.12],
    [52.37, 4.9],
    [50.11, 8.68],
    [48.86, 2.35],
    [51.51, -0.13],
    [53.35, -6.26],
    [59.33, 18.07],
    [60.17, 24.94],
    [52.23, 21.01],
    [45.46, 9.19],
    [41.39, 2.17],
    [47.38, 8.54],
    [1.35, 103.82],
    [35.68, 139.65],
    [37.57, 126.98],
    [22.32, 114.17],
    [-33.87, 151.21],
    [-36.85, 174.76],
    [19.08, 72.88],
    [-23.55, -46.63],
    [25.2, 55.27],
    [-26.2, 28.05],
  ],
};

const FALLBACK_GPUS: GpuOption[] = [
  {
    id: "h100",
    name: "H100",
    ram: "80Gi",
    providers: 3,
    gpus: 30,
    min: 2.04,
    max: 3.16,
  },
  {
    id: "a100",
    name: "A100",
    ram: "80Gi",
    providers: 3,
    gpus: 111,
    min: 1.07,
    max: 1.91,
  },
  {
    id: "pro6000se",
    name: "RTX PRO 6000 SE",
    ram: "96Gi",
    providers: 2,
    gpus: 9,
    min: 1.49,
    max: 2.04,
  },
  {
    id: "v100",
    name: "V100",
    ram: "32Gi",
    providers: 2,
    gpus: 10,
    min: 0.15,
    max: 0.23,
  },
];

/** Console's own fallback when the price API is unreachable. */
const FALLBACK_H100_FROM = 1.8;

type GpuPricesResponse = {
  models: {
    model: string;
    ram: string;
    availability: { available: number };
    providerAvailability: { available: number };
    price: { min: number; max: number } | null;
  }[];
};

/** "pro6000se" → "RTX PRO 6000 SE", "rtx4090" → "RTX 4090", "h100" → "H100". */
export function gpuName(model: string) {
  const m = model.toLowerCase();
  const pro = m.match(/^pro(\d+)(\w*)$/);
  if (pro)
    return `RTX PRO ${pro[1]}${pro[2] ? ` ${pro[2].toUpperCase()}` : ""}`;
  const rtx = m.match(/^(rtx|gtx)(\d+)(\w*)$/);
  if (rtx)
    return `${rtx[1].toUpperCase()} ${rtx[2]}${rtx[3] ? ` ${rtx[3].toUpperCase()}` : ""}`;
  return m.toUpperCase();
}

/** GPUs that fit an 8B model (24 GB or more), with free capacity and a price. */
function pickGpus(response: GpuPricesResponse): GpuOption[] {
  const byId = new Map<string, GpuOption>();
  for (const m of response.models) {
    const ram = parseInt(m.ram, 10);
    if (
      !m.price ||
      ram < 24 ||
      m.availability.available < 1 ||
      m.providerAvailability.available < 1
    )
      continue;
    const id = `${m.model}-${m.ram}`;
    if (byId.has(id)) continue;
    byId.set(id, {
      id,
      name: gpuName(m.model),
      ram: m.ram,
      providers: m.providerAvailability.available,
      gpus: m.availability.available,
      min: m.price.min,
      max: m.price.max,
    });
  }
  const options = [...byId.values()].sort((a, b) => b.max - a.max).slice(0, 4);
  return options.length >= 2 ? options : FALLBACK_GPUS;
}

/** Lowest H100 price across every H100 row, as Console's sign-in label does. */
function h100From(response: GpuPricesResponse) {
  const prices = response.models
    .filter((m) => m.model === "h100" && m.price)
    .map((m) => m.price!.min);
  return prices.length ? Math.min(...prices) : FALLBACK_H100_FROM;
}

export function useNetworkData(
  snapshot: NetworkSnapshot | undefined,
): NetworkData {
  const base = snapshot ?? FALLBACK_SNAPSHOT;
  const [gpus, setGpus] = useState({
    list: FALLBACK_GPUS,
    h100From: FALLBACK_H100_FROM,
    live: false,
  });

  useEffect(() => {
    let active = true;
    fetch(`${BASE_API_URL}/v1/gpu-prices`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then(
        (response: GpuPricesResponse) =>
          active &&
          setGpus({
            list: pickGpus(response),
            h100From: h100From(response),
            live: true,
          }),
      )
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return { ...base, gpus: gpus.list, h100From: gpus.h100From, live: gpus.live };
}

// Fictional providers for simulated bids, on reserved example domains.
export const BIDDERS = [
  {
    name: "Northwind Compute",
    host: "provider.northwind.example",
    region: "us-west",
    uptime: 100,
    lat: 45.52,
    lng: -122.68,
  },
  {
    name: "Fjell Cloud",
    host: "provider.fjell.example",
    region: "eu-north",
    uptime: 99.98,
    lat: 59.91,
    lng: 10.75,
  },
  {
    name: "Kestrel Compute",
    host: "provider.kestrel.example",
    region: "eu-central",
    uptime: 99.97,
    lat: 50.11,
    lng: 8.68,
  },
  {
    name: "Sakura Racks",
    host: "provider.sakura.example",
    region: "ap-northeast",
    uptime: 100,
    lat: 35.68,
    lng: 139.65,
  },
  {
    name: "Meridian GPU",
    host: "provider.meridian.example",
    region: "us-southwest",
    uptime: 99.91,
    lat: 33.45,
    lng: -112.07,
  },
];

/** One bid per available provider (up to five), spread across the live price range. */
export function simulateBids(gpu: GpuOption): Bid[] {
  const count = Math.max(1, Math.min(BIDDERS.length, gpu.providers));
  return BIDDERS.slice(0, count).map((b, i) => {
    const share = count === 1 ? 0 : i / (count - 1);
    return {
      id: `bid-${i}`,
      ...b,
      hr: Math.round((gpu.min + (gpu.max - gpu.min) * share) * 100) / 100,
    };
  });
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
export const hourly = (hr: number) => `${usd(hr)}/hr`;
export const monthly = (hr: number) => `${usd(hr * HOURS_PER_MONTH)}/month`;
export const money = usd;
