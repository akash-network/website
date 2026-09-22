import { ArrowUpRight, X } from "lucide-react";

import type { ApiProviderList } from "@/types/provider";
import {
  formatBytesLabel,
  formatPricePerHour,
  formatVCpu,
  getGpuSummaryLabel,
  getProviderDeployLabel,
  getProviderDisplayName,
  getProviderLocationLabel,
} from "../providerHelpers";
import { findGpuMedianPrice, type GpuPrices } from "../useGpuPrices";

interface Props {
  provider: ApiProviderList;
  gpuPrices: GpuPrices | undefined;
  onClose: () => void;
  onViewFullProfile: (provider: ApiProviderList) => void;
}

export function ProviderQuickView({ provider, gpuPrices, onClose, onViewFullProfile }: Props) {
  const totalVCpu = formatVCpu(provider.stats?.cpu?.total ?? 0);
  const totalMemory = formatBytesLabel(provider.stats?.memory?.total ?? 0);
  const gpuModel = provider.gpuModels[0];
  const indicativePrice = gpuModel ? findGpuMedianPrice(gpuPrices, gpuModel.vendor, gpuModel.model) : null;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{getProviderDisplayName(provider)}</p>
          <p className="text-2xs text-cardGray">{getProviderLocationLabel(provider)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-cardGray hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="GPU" value={getGpuSummaryLabel(provider)} sublabel={provider.gpuModels.length ? undefined : "CPU only"} />
        <MiniStat label="Uptime 30D" value={`${((provider.uptime30d || 0) * 100).toFixed(1)}%`} />
        <MiniStat label="Total vCPU" value={`${totalVCpu}`} sublabel="capacity" />
        <MiniStat label="Total Memory" value={totalMemory} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-2xs text-cardGray">Indicative rate</p>
        <p className="text-xs font-semibold text-foreground">
          {indicativePrice !== null ? `${formatPricePerHour(indicativePrice)} (network median)` : "Varies by workload"}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <a
          href={`https://console.akash.network/providers/${provider.owner}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          <span className="truncate">{getProviderDeployLabel(provider)}</span>
        </a>
        <button
          type="button"
          onClick={() => onViewFullProfile(provider)}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-background2"
        >
          View full profile
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-md border border-border p-2">
      <p className="text-2xs uppercase tracking-wide text-cardGray">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground" title={value}>
        {value}
      </p>
      {sublabel && <p className="text-2xs text-cardGray">{sublabel}</p>}
    </div>
  );
}
