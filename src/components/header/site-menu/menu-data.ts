import {
  gpuHourlyPrice,
  type GpuPricesResponse,
} from "@/components/pricing-page/gpus/gpu-models";

// Build-time snapshot for the site menu's network tiles. The header renders
// on every page, so the fetch is memoized per build (and per dev server)
// instead of hitting the 3.8 MB /v1/providers endpoint once per page. The
// provider count and H100 price are refreshed live when the menu opens;
// marker positions change rarely enough that the snapshot is fine.
const API_URL = "https://console-api.akash.network";
const FETCH_TIMEOUT_MS = 15_000;

interface ProviderRaw {
  isOnline: boolean;
  ipLat: string | null;
  ipLon: string | null;
}

export type GlobeMarker = [number, number];

export interface H100Price {
  /** Same "Starting at" figure the GPU pricing page shows. */
  hourly: number;
  available: number;
}

export interface SiteMenuData {
  /** Same figure as "Active Providers" on the providers page. */
  activeProviderCount: number | null;
  markers: GlobeMarker[];
  h100: H100Price | null;
}

/** Cheapest priced H100 variant, with availability summed across variants. */
export function pickH100(prices: GpuPricesResponse | null): H100Price | null {
  const variants = (prices?.models ?? []).filter(
    (model) => model.model?.toLowerCase() === "h100",
  );
  const hourly = variants
    .map(gpuHourlyPrice)
    .filter((price): price is number => price !== null);
  if (hourly.length === 0) return null;

  return {
    hourly: Math.min(...hourly),
    available: variants.reduce(
      (sum, model) => sum + (model.availability?.available ?? 0),
      0,
    ),
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

async function loadSiteMenuData(): Promise<SiteMenuData> {
  const [providers, capacity, gpuPrices] = await Promise.all([
    fetchJson<ProviderRaw[]>("/v1/providers"),
    fetchJson<{ activeProviderCount: number }>("/v1/network-capacity"),
    fetchJson<GpuPricesResponse>("/v1/gpu-prices"),
  ]);

  // Providers in the same city land on the same dot, so dedupe them (to 0.1°)
  // to keep the serialized island props small.
  const unique = new Map<string, GlobeMarker>();
  for (const provider of providers ?? []) {
    if (!provider.isOnline) continue;
    const lat = parseFloat(provider.ipLat ?? "");
    const lng = parseFloat(provider.ipLon ?? "");
    if (!lat || !lng) continue;

    const marker: GlobeMarker = [
      Math.round(lat * 10) / 10,
      Math.round(lng * 10) / 10,
    ];
    unique.set(marker.join(","), marker);
  }

  return {
    activeProviderCount: capacity?.activeProviderCount ?? null,
    markers: [...unique.values()],
    h100: pickH100(gpuPrices),
  };
}

let cached: Promise<SiteMenuData> | undefined;

export function getSiteMenuData(): Promise<SiteMenuData> {
  cached ??= loadSiteMenuData();
  return cached;
}
