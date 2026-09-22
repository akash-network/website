import type { ApiProviderList } from "@/types/provider";
import { getProviderCoords } from "../providerHelpers";

export interface ProviderCluster {
  id: string;
  lat: number;
  lng: number;
  providers: ApiProviderList[];
}

/** Degrees of lat/lng proximity within which providers are grouped into one globe marker. IP geolocation is metro-area precision at best, so a coarse threshold reads as "same area" rather than implying street-level accuracy. */
const CLUSTER_THRESHOLD_DEGREES = 4;

export function clusterProviders(providers: ApiProviderList[]): ProviderCluster[] {
  const clusters: ProviderCluster[] = [];

  for (const provider of providers) {
    const coords = getProviderCoords(provider);
    if (!coords) continue;

    const existing = clusters.find(
      (cluster) =>
        Math.hypot(cluster.lat - coords.lat, cluster.lng - coords.lng) <
        CLUSTER_THRESHOLD_DEGREES,
    );

    if (existing) {
      existing.providers.push(provider);
      existing.lat =
        existing.providers.reduce((sum, p) => sum + getProviderCoords(p)!.lat, 0) /
        existing.providers.length;
      existing.lng =
        existing.providers.reduce((sum, p) => sum + getProviderCoords(p)!.lng, 0) /
        existing.providers.length;
    } else {
      clusters.push({
        id: `cluster-${provider.owner}`,
        lat: coords.lat,
        lng: coords.lng,
        providers: [provider],
      });
    }
  }

  return clusters;
}
