import { ChevronRight, X } from "lucide-react";

import type { ApiProviderList } from "@/types/provider";
import type { ProviderCluster } from "../globe/clusterProviders";
import { getGpuSummaryLabel, getProviderDisplayName, getProviderLocationLabel, getTotalGpuCount } from "../providerHelpers";

interface Props {
  cluster: ProviderCluster;
  onClose: () => void;
  onSelectProvider: (provider: ApiProviderList) => void;
}

export function LocationProvidersPanel({ cluster, onClose, onSelectProvider }: Props) {
  const totalGpus = cluster.providers.reduce((sum, p) => sum + getTotalGpuCount(p), 0);

  return (
    <div className="flex h-full max-h-[420px] flex-col rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border p-3">
        <p className="text-sm font-semibold text-foreground">{cluster.providers.length} providers</p>
        <button type="button" onClick={onClose} aria-label="Close" className="text-cardGray hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="border-b border-border px-3 py-2 text-2xs text-cardGray">
        {cluster.providers.length} providers here &middot; {totalGpus} GPUs. Zoom in to separate them on the globe.
      </p>

      <div className="flex-1 overflow-y-auto">
        {cluster.providers.map((provider) => (
          <button
            key={provider.owner}
            type="button"
            onClick={() => onSelectProvider(provider)}
            className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 text-left hover:bg-background2"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${provider.isOnline ? "bg-emerald-500" : "bg-cardGray"}`}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{getProviderDisplayName(provider)}</p>
                <p className="truncate text-2xs text-cardGray">
                  {getProviderLocationLabel(provider)} &middot; {getGpuSummaryLabel(provider)}
                </p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-cardGray" />
          </button>
        ))}
      </div>
    </div>
  );
}
