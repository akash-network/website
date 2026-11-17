// Build-time network snapshot for the Console tour: how many providers are
// online, how many can host the tour's 8 vCPU · 32 GiB spec, and where they
// are. The providers list is several megabytes, so only this summary ships.
import type { NetworkSnapshot } from "./data";

const PROVIDERS_URL = "https://console-api.akash.network/v1/providers";
const SPEC = { cpuMillicores: 8000, memoryBytes: 32 * 1024 ** 3 };
const MAX_POINTS = 240;
const DEV_CACHE_MS = 10 * 60_000;

type ApiProvider = {
  isOnline: boolean;
  ipLat: string | null;
  ipLon: string | null;
  stats?: { cpu?: { available?: number }; memory?: { available?: number } };
};

let cached: { at: number; value: NetworkSnapshot | undefined } | null = null;

export async function loadNetworkSnapshot(): Promise<
  NetworkSnapshot | undefined
> {
  if (cached && Date.now() - cached.at < DEV_CACHE_MS) return cached.value;
  let value: NetworkSnapshot | undefined;
  try {
    const response = await fetch(PROVIDERS_URL, {
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) {
      const providers = (await response.json()) as ApiProvider[];
      const online = providers.filter((p) => p.isOnline);
      const eligible = online.filter(
        (p) =>
          (p.stats?.cpu?.available ?? 0) >= SPEC.cpuMillicores &&
          (p.stats?.memory?.available ?? 0) >= SPEC.memoryBytes,
      ).length;
      const points = online
        .map((p) => [Number(p.ipLat), Number(p.ipLon)] as [number, number])
        .filter(
          ([lat, lng]) =>
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            (lat !== 0 || lng !== 0),
        )
        .slice(0, MAX_POINTS);
      if (online.length > 0)
        value = { online: online.length, eligible, points };
    }
  } catch {
    value = undefined;
  }
  cached = { at: Date.now(), value };
  return value;
}
