import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { BecomeProviderDialog } from "@/components/ecosystem-pages/providers-page/BecomeProviderDialog";
import { GlobeExplorerCard } from "@/components/ecosystem-pages/providers-page/globe/GlobeExplorerCard";
import type { ProviderCluster } from "@/components/ecosystem-pages/providers-page/globe/clusterProviders";
import { LocationProvidersPanel } from "@/components/ecosystem-pages/providers-page/panels/LocationProvidersPanel";
import { ProviderQuickView } from "@/components/ecosystem-pages/providers-page/panels/ProviderQuickView";
import { getProviderCoords } from "@/components/ecosystem-pages/providers-page/providerHelpers";
import { NetworkCapacityOverview } from "@/components/ecosystem-pages/providers-page/stats/NetworkCapacityOverview";
import { useGpuPrices } from "@/components/ecosystem-pages/providers-page/useGpuPrices";
import { useNetworkCapacity } from "@/components/ecosystem-pages/providers-page/useNetworkCapacity";
import { useProviderList } from "@/components/ecosystem-pages/providers-page/useProviderList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiProviderList } from "@/types/provider";

const queryClient = new QueryClient();

const PROVIDERS_PAGE = "/ecosystem/providers";
const MOBILE_BREAKPOINT = 768;
const PROVIDER_LIST_POLL_MS = 60_000;

type Panel =
  | { type: "location"; cluster: ProviderCluster }
  | { type: "quickview"; provider: ApiProviderList }
  | null;

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/** The homepage has no room for the providers page's full detail view, so "view full profile"
 * hands off to that page, which opens the same view from its `?provider=` param. */
function openProviderProfile(provider: ApiProviderList) {
  window.location.href = `${PROVIDERS_PAGE}?provider=${encodeURIComponent(provider.owner)}`;
}

export function NetworkExplorer() {
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        {/* Heading and copy beside the actions only from lg:, the first width where the heading,
            the copy and both buttons fit on one row; below that the buttons sit under the copy. */}
        <div className="mb-6 flex flex-col gap-5 md:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div>
            <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
              Global Grid. No Off Switch.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-para">
              Access a global network engineered for high availability. While
              centralized clouds rely on single points of failure, Akash uses a
              distributed protocol to keep your workloads independent and
              resilient against system-wide failure.
            </p>
          </div>
          {/* The section's two actions as one group: joining the network (primary) and exploring
              it (secondary). Primary first, the same order as the homepage's closing CTA, so
              keyboard order matches what's on screen; full-width and stacked on mobile. */}
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setProviderDialogOpen(true)}
            >
              Become a Provider <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 border border-border bg-transparent text-foreground hover:bg-accent"
            >
              <a href={PROVIDERS_PAGE}>
                Explore Compute Providers{" "}
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <BecomeProviderDialog
          open={providerDialogOpen}
          onOpenChange={setProviderDialogOpen}
        />
        <NetworkExplorerContent />
      </div>
    </QueryClientProvider>
  );
}

function NetworkExplorerContent() {
  const { data: providers, isLoading } = useProviderList({
    refetchInterval: PROVIDER_LIST_POLL_MS,
    refetchIntervalInBackground: false,
  });
  const { data: networkCapacity } = useNetworkCapacity();
  const { data: gpuPrices } = useGpuPrices();

  const [panel, setPanel] = useState<Panel>(null);

  // Online providers only, matching the providers page's "Live Network" globe.
  const geoProviders = useMemo(
    () => (providers ?? []).filter((p) => p.isOnline && getProviderCoords(p)),
    [providers],
  );

  function showProvider(provider: ApiProviderList) {
    if (isMobileViewport()) openProviderProfile(provider);
    else setPanel({ type: "quickview", provider });
  }

  if (isLoading) {
    return (
      <div aria-hidden="true">
        {/* Sized to the loaded capacity tiles + explorer card at each breakpoint so the
            section doesn't jump when data arrives. */}
        <Skeleton className="h-[438px] w-full rounded-xl sm:h-[338px] lg:h-[177px]" />
        <Skeleton className="mt-4 h-[950px] w-full rounded-xl md:h-[776px] lg:h-[660px]" />
      </div>
    );
  }

  // The globe has nothing to show without the provider list; the heading and "View All
  // Providers" link above still give the section somewhere to go. (A failed background
  // refetch keeps the last good data, so this only triggers when the first load fails.)
  if (!providers) return null;

  return (
    <>
      <div className="mb-4">
        <NetworkCapacityOverview networkCapacity={networkCapacity} />
      </div>

      <GlobeExplorerCard
        showBecomeProvider={false}
        providers={geoProviders}
        networkCapacity={networkCapacity}
        gpuPrices={gpuPrices}
        selectedClusterId={panel?.type === "location" ? panel.cluster.id : null}
        onSelectCluster={(cluster) => {
          if (cluster.providers.length === 1)
            showProvider(cluster.providers[0]);
          else setPanel({ type: "location", cluster });
        }}
        panel={
          panel?.type === "location" ? (
            <LocationProvidersPanel
              cluster={panel.cluster}
              onClose={() => setPanel(null)}
              onSelectProvider={showProvider}
            />
          ) : panel?.type === "quickview" ? (
            <ProviderQuickView
              provider={panel.provider}
              gpuPrices={gpuPrices}
              onClose={() => setPanel(null)}
              onViewFullProfile={openProviderProfile}
            />
          ) : null
        }
      />
    </>
  );
}
