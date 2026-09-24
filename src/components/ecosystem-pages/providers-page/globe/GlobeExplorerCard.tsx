import { ArrowUpRight, Minus, Pause, Play, RotateCcw, Plus, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import type { ApiProviderList } from "@/types/provider";
import { BecomeProviderDialog } from "../BecomeProviderDialog";
import type { GpuPrices } from "../useGpuPrices";
import type { NetworkCapacity } from "../useNetworkCapacity";
import { NetworkStatTiles } from "../stats/NetworkStatTiles";
import { clusterProviders, type ProviderCluster } from "./clusterProviders";
import { ProvidersGlobe } from "./ProvidersGlobe";

const MIN_SCALE = 0.85;
const MAX_SCALE = 2.4;

interface Props {
  providers: ApiProviderList[];
  networkCapacity: NetworkCapacity | undefined;
  gpuPrices: GpuPrices | undefined;
  selectedClusterId: string | null;
  onSelectCluster: (cluster: ProviderCluster) => void;
  panel: ReactNode | null;
}

function matchesQuery(provider: ApiProviderList, query: string): boolean {
  const q = query.toLowerCase();
  return (
    (provider.organization || provider.name || "").toLowerCase().includes(q) ||
    (provider.city || provider.ipRegion || "").toLowerCase().includes(q) ||
    (provider.country || provider.ipCountry || "").toLowerCase().includes(q) ||
    provider.gpuModels.some((g) => `${g.vendor} ${g.model}`.toLowerCase().includes(q))
  );
}

export function GlobeExplorerCard({ providers, networkCapacity, gpuPrices, selectedClusterId, onSelectCluster, panel }: Props) {
  const [search, setSearch] = useState("");
  const [scale, setScale] = useState(MIN_SCALE);
  const [spinning, setSpinning] = useState(true);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);

  const clusters = useMemo(() => clusterProviders(providers), [providers]);

  const cities = useMemo(() => {
    const set = new Set(providers.map((p) => p.city || p.ipRegion).filter(Boolean));
    return set.size;
  }, [providers]);
  const countries = useMemo(() => {
    const set = new Set(providers.map((p) => p.ipCountryCode || p.country).filter(Boolean));
    return set.size;
  }, [providers]);

  function handleSelectCluster(cluster: ProviderCluster) {
    setFocusTarget({ lat: cluster.lat, lng: cluster.lng });
    onSelectCluster(cluster);
  }

  const dimUnmatched = search.trim()
    ? (cluster: ProviderCluster) => !cluster.providers.some((p) => matchesQuery(p, search))
    : undefined;

  function renderSearchInput() {
    return (
      <div className="relative w-full sm:w-auto">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cardGray" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search providers, cities, GPUs..."
          className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-cardGray focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
        />
      </div>
    );
  }

  return (
    <div id="providers-explorer" className="rounded-xl border border-border bg-background2 p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-semibold uppercase tracking-wide text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Network
          </span>
          <span className="text-cardGray">
            {providers.length} providers &middot; {cities} cities &middot; {countries} countries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <IconButton onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.2))} label="Zoom in">
              <Plus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.2))} label="Zoom out">
              <Minus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              onClick={() => {
                setScale(MIN_SCALE);
                setFocusTarget(null);
              }}
              label="Reset view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton onClick={() => setSpinning((s) => !s)} label={spinning ? "Pause spin" : "Resume spin"}>
              {spinning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </IconButton>
            <button
              type="button"
              onClick={() => setProviderDialogOpen(true)}
              className="ml-1 hidden h-7 items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground px-3 text-xs font-medium text-background hover:opacity-90 md:flex"
            >
              Become a Provider
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <BecomeProviderDialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="order-3 w-full md:order-1 lg:w-auto">
          <NetworkStatTiles providers={providers} networkCapacity={networkCapacity} gpuPrices={gpuPrices} />
        </div>

        <div className="order-1 flex w-full flex-1 items-center justify-center py-2 md:order-2">
          <ProvidersGlobe
            clusters={clusters}
            focusTarget={focusTarget}
            scale={scale}
            spinning={spinning}
            highlightedClusterId={selectedClusterId}
            dimUnmatched={dimUnmatched}
            onSelectCluster={handleSelectCluster}
          />
        </div>

        <div className="order-2 w-full md:hidden">{renderSearchInput()}</div>

        <button
          type="button"
          onClick={() => setProviderDialogOpen(true)}
          className="order-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 md:hidden"
        >
          Become a Provider
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>

        {panel && (
          <div className="order-5 w-full shrink-0 animate-in fade-in slide-in-from-right-4 duration-200 lg:w-[340px]">
            {panel}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
        <p className="text-2xs text-cardGray">Drag to spin &middot; click a marker to explore</p>
        <div className="hidden md:block">{renderSearchInput()}</div>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-background2"
    >
      {children}
    </button>
  );
}
