import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { ApiProviderList } from "@/types/provider";
import { GlobeExplorerCard } from "./globe/GlobeExplorerCard";
import type { ProviderCluster } from "./globe/clusterProviders";
import { LocationProvidersPanel } from "./panels/LocationProvidersPanel";
import { ProviderDetailView } from "./panels/ProviderDetailView";
import { ProviderQuickView } from "./panels/ProviderQuickView";
import { getProviderCoords } from "./providerHelpers";
import { NetworkCapacityOverview } from "./stats/NetworkCapacityOverview";
import { ProvidersTable } from "./table/ProvidersTable";
import { useGpuPrices } from "./useGpuPrices";
import { useNetworkCapacity } from "./useNetworkCapacity";
import { useProviderList } from "./useProviderList";

const queryClient = new QueryClient();

type Panel = { type: "location"; cluster: ProviderCluster } | { type: "quickview"; provider: ApiProviderList } | null;

const PROVIDER_QUERY_PARAM = "provider";
const MOBILE_BREAKPOINT = 768;

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

function ProvidersHero() {
  return (
    <div className="mb-10 flex flex-col items-start gap-6 md:mb-[60px] lg:mb-20">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
        Global supply network
      </h1>
      <p className="max-w-2xl text-base font-normal text-para">
        Real-time visibility into the distributed backbone of the protocol. Explore the global network of compute
        providers fueling deployments across the open compute marketplace.
      </p>
    </div>
  );
}

export default function ProvidersDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersDashboardContent />
    </QueryClientProvider>
  );
}

function ProvidersDashboardContent() {
  const { data: providers, isLoading, error } = useProviderList();
  const { data: networkCapacity } = useNetworkCapacity();
  const { data: gpuPrices } = useGpuPrices();

  const [panel, setPanel] = useState<Panel>(null);
  const [detailOwner, setDetailOwner] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const owner = params.get(PROVIDER_QUERY_PARAM);
    if (owner) setDetailOwner(owner);

    function handlePopState() {
      const next = new URLSearchParams(window.location.search).get(PROVIDER_QUERY_PARAM);
      setDetailOwner(next);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openDetail(owner: string) {
    setDetailOwner(owner);
    setPanel(null);
    const url = new URL(window.location.href);
    url.searchParams.set(PROVIDER_QUERY_PARAM, owner);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDetail() {
    setDetailOwner(null);
    const url = new URL(window.location.href);
    url.searchParams.delete(PROVIDER_QUERY_PARAM);
    window.history.pushState({}, "", url);
  }

  // Only online providers: most of the ~1,800 registered providers with a location are long
  // offline (some for months), and plotting them on a "Live Network" globe alongside real,
  // reachable capacity misrepresents the network as far busier/larger than it actually is.
  const geoProviders = useMemo(
    () => (providers ?? []).filter((p) => p.isOnline && getProviderCoords(p)),
    [providers],
  );

  if (detailOwner) {
    return (
      <ProviderDetailView
        owner={detailOwner}
        allProviders={geoProviders}
        gpuPrices={gpuPrices}
        onBack={closeDetail}
        onSelectProvider={openDetail}
      />
    );
  }

  if (isLoading) {
    return (
      <>
        <ProvidersHero />
        <div>
          <Skeleton className="h-[150px] w-full rounded-xl" />
          <Skeleton className="mt-4 h-[420px] w-full rounded-xl" />
          <Skeleton className="mt-4 h-[480px] w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (error || !providers) {
    return (
      <>
        <ProvidersHero />
        <div>
          <p className="py-6 text-center text-red-500">Error loading providers{error ? `: ${error.message}` : ""}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ProvidersHero />
      <div className="mb-10 md:mb-[60px] lg:mb-20">
        <div className="mb-4">
          <NetworkCapacityOverview networkCapacity={networkCapacity} />
        </div>

        <GlobeExplorerCard
          providers={geoProviders}
          networkCapacity={networkCapacity}
          gpuPrices={gpuPrices}
          selectedClusterId={panel?.type === "location" ? panel.cluster.id : null}
          onSelectCluster={(cluster) => {
            if (cluster.providers.length === 1) {
              if (isMobileViewport()) {
                openDetail(cluster.providers[0].owner);
              } else {
                setPanel({ type: "quickview", provider: cluster.providers[0] });
              }
            } else {
              setPanel({ type: "location", cluster });
            }
          }}
          panel={
            panel?.type === "location" ? (
              <LocationProvidersPanel
                cluster={panel.cluster}
                onClose={() => setPanel(null)}
                onSelectProvider={(provider) => {
                  if (isMobileViewport()) {
                    openDetail(provider.owner);
                  } else {
                    setPanel({ type: "quickview", provider });
                  }
                }}
              />
            ) : panel?.type === "quickview" ? (
              <ProviderQuickView
                provider={panel.provider}
                gpuPrices={gpuPrices}
                onClose={() => setPanel(null)}
                onViewFullProfile={(provider) => openDetail(provider.owner)}
              />
            ) : null
          }
        />

        <ProvidersTable
          providers={geoProviders}
          onSelectProvider={(provider) => {
            if (isMobileViewport()) {
              openDetail(provider.owner);
              return;
            }
            setPanel({ type: "quickview", provider });
            document.getElementById("providers-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>
    </>
  );
}
