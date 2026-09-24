import { nFormatter } from "@/lib/math-helpers";
import type { ApiProviderList } from "@/types/provider";
import type { NetworkCapacity } from "../useNetworkCapacity";
import type { GpuPrices } from "../useGpuPrices";

interface Props {
  providers: ApiProviderList[];
  networkCapacity: NetworkCapacity | undefined;
  gpuPrices: GpuPrices | undefined;
}

function StatTile({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-lg border border-border bg-background p-3 lg:min-w-0">
      <p className="text-2xs font-semibold uppercase tracking-wide text-cardGray">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-2xs text-cardGray">{sublabel}</p>
    </div>
  );
}

function weightedMedianGpuPrice(gpuPrices: GpuPrices | undefined): number | null {
  if (!gpuPrices) return null;
  const priced = gpuPrices.models.filter((m) => m.price && m.availability.total > 0);
  if (priced.length === 0) return null;
  const totalWeight = priced.reduce((sum, m) => sum + m.availability.total, 0);
  if (totalWeight === 0) return null;
  const weighted = priced.reduce((sum, m) => sum + (m.price!.med * m.availability.total), 0);
  return weighted / totalWeight;
}

export function NetworkStatTiles({ providers, networkCapacity, gpuPrices }: Props) {
  const onlineProviders = providers.filter((p) => p.isOnline);
  const avgUptime =
    onlineProviders.length > 0
      ? onlineProviders.reduce((sum, p) => sum + (p.uptime30d || 0), 0) / onlineProviders.length
      : 0;

  const gpusAvailable = networkCapacity?.resources.gpu.available ?? providers.reduce((s, p) => s + (p.stats?.gpu?.available ?? 0), 0);
  const vCpuAvailable = networkCapacity ? networkCapacity.resources.cpu.available / 1000 : null;
  // Offline providers can still report a stale leaseCount from before they dropped off, so
  // counting them here would claim leases are "running now" on providers that aren't reachable.
  const runningNow = onlineProviders.reduce((sum, p) => sum + (p.leaseCount || 0), 0);
  const medianGpuPrice = weightedMedianGpuPrice(gpuPrices);

  return (
    <div className="flex flex-row flex-wrap gap-3 lg:w-[190px] lg:flex-col lg:flex-nowrap">
      <StatTile
        label="GPUs Available"
        value={nFormatter(gpusAvailable, 0)}
        sublabel={`${providers.length} providers${vCpuAvailable ? ` · ${nFormatter(vCpuAvailable, 1)} vCPU` : ""}`}
      />
      <StatTile
        label="Avg Uptime"
        value={`${(avgUptime * 100).toFixed(2)}%`}
        sublabel="Rolling 30 days, fleet-wide"
      />
      <StatTile
        label="GPU Price (Median)"
        value={medianGpuPrice !== null ? `$${medianGpuPrice.toFixed(2)}` : "—"}
        sublabel="Network-wide, per GPU-hr"
      />
      <StatTile
        label="Running Now"
        value={nFormatter(runningNow, 0)}
        sublabel="Active leases"
      />
    </div>
  );
}
