import { bytesToShrink } from "@/lib/unit-utils";
import { roundDecimal } from "@/lib/math-helpers";
import type { ApiProviderDetail, ApiProviderList } from "@/types/provider";

export interface ProviderCoords {
  lat: number;
  lng: number;
}

export function getProviderCoords(
  provider: ApiProviderList,
): ProviderCoords | null {
  const lat = parseFloat(provider.ipLat ?? "");
  const lng = parseFloat(provider.ipLon ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

export function getProviderDisplayName(provider: ApiProviderList): string {
  return provider.organization || provider.name || provider.hostUri || provider.owner;
}

/** "Deploy to {name}" reads better than a generic CTA, but the display name can fall back to a
 * hostUri or raw owner address — too long/unreadable for a button — so those cases fall back to
 * generic phrasing instead. */
export function getProviderDeployLabel(provider: ApiProviderList): string {
  const name = getProviderDisplayName(provider);
  const isUnreadable = name.length > 24 || name.startsWith("http") || name.startsWith("akash1");
  return isUnreadable ? "Deploy to this provider" : `Deploy to ${name}`;
}

export function getProviderLocationLabel(provider: ApiProviderList): string {
  const city = provider.city || provider.ipRegion;
  const country = provider.ipCountryCode || provider.country;
  if (city && country) return `${city}, ${country}`;
  return country || city || "Unknown location";
}

export function getProviderRegionLabel(provider: ApiProviderList): string {
  const region = provider.locationRegion || provider.ipRegionCode || provider.ipRegion;
  return region ? region.replace(/-/g, " ").toUpperCase() : "UNKNOWN";
}

export function formatVCpu(milliCores: number): number {
  return roundDecimal(milliCores / 1000, 1);
}

export function formatBytesLabel(bytes: number): string {
  const { value, unit } = bytesToShrink(bytes, true);
  return `${roundDecimal(value, value >= 100 ? 0 : 1)} ${unit}`;
}

export function getGpuSummaryLabel(provider: ApiProviderList): string {
  if (!provider.gpuModels || provider.gpuModels.length === 0) return "CPU only";
  return provider.gpuModels
    .map((g) => `${g.vendor.toUpperCase()} ${g.model.toUpperCase()}`)
    .join(", ");
}

export function getTotalGpuCount(provider: ApiProviderList): number {
  return provider.stats?.gpu?.total ?? 0;
}

export interface UptimeSummary {
  /** Fraction of checks in the covered window that were online, 0-1. */
  onlineRatio: number;
  /** Number of distinct offline streaks detected in the covered window. */
  incidentCount: number;
  /** Total offline duration across all streaks, in minutes. */
  downtimeMinutes: number;
  /** Human label for the time span the checks actually cover, e.g. "24h". */
  windowLabel: string;
  points: Array<{ date: string; isOnline: boolean }>;
}

/**
 * Derives a reliability summary from a provider's raw uptime-check history. The API's `uptime`
 * array is a rolling recent window (roughly the last 24h of ~15-minute probes), not a 90-day
 * history, so the window label reflects the actual span covered rather than assuming a fixed range.
 */
export function summarizeUptimeChecks(
  checks: ApiProviderDetail["uptime"] | undefined,
): UptimeSummary | null {
  if (!checks || checks.length === 0) return null;

  const sorted = [...checks].sort(
    (a, b) => new Date(a.checkDate).getTime() - new Date(b.checkDate).getTime(),
  );

  let incidentCount = 0;
  let downtimeMs = 0;
  let onlineCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const check = sorted[i];
    if (check.isOnline) onlineCount++;

    const wasOnlineBefore = i === 0 ? true : sorted[i - 1].isOnline;
    if (!check.isOnline && wasOnlineBefore) incidentCount++;

    if (!check.isOnline && i > 0) {
      downtimeMs +=
        new Date(check.checkDate).getTime() -
        new Date(sorted[i - 1].checkDate).getTime();
    }
  }

  const spanMs =
    new Date(sorted[sorted.length - 1].checkDate).getTime() -
    new Date(sorted[0].checkDate).getTime();
  const spanHours = spanMs / (1000 * 60 * 60);
  const windowLabel = spanHours >= 20 ? "24h" : `${Math.max(1, Math.round(spanHours))}h`;

  return {
    onlineRatio: onlineCount / sorted.length,
    incidentCount,
    downtimeMinutes: Math.round(downtimeMs / (1000 * 60)),
    windowLabel,
    points: sorted.map((c) => ({ date: c.checkDate as unknown as string, isOnline: c.isOnline })),
  };
}

/**
 * Real-data "similar providers": same region, sorted by uptime, excluding the current provider.
 * Not a recommendation model — a straightforward filter over already-fetched provider data.
 */
export function pickSimilarProviders(
  all: ApiProviderList[],
  current: ApiProviderList,
  count = 3,
): ApiProviderList[] {
  const currentRegion = current.locationRegion || current.ipRegionCode;
  const sameRegion = all.filter(
    (p) =>
      p.owner !== current.owner &&
      getProviderCoords(p) &&
      (p.locationRegion || p.ipRegionCode) === currentRegion,
  );

  const pool = sameRegion.length >= count
    ? sameRegion
    : all.filter((p) => p.owner !== current.owner && getProviderCoords(p));

  return [...pool].sort((a, b) => (b.uptime30d ?? 0) - (a.uptime30d ?? 0)).slice(0, count);
}

export function formatPricePerHour(value: number): string {
  return `$${value < 1 ? value.toFixed(3) : value.toFixed(2)}/hr`;
}
