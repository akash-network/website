import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import { Skeleton } from "@/components/ui/skeleton";
import ProvidersCard from "./card";
import SortDropDown from "./sort-dropdown";
import { useProviderList } from "./useProviderList";

const queryClient = new QueryClient();

const SORT_OPTIONS = [
  { id: "active-leases-desc", title: "Most Active Leases" },
  { id: "active-leases-asc", title: "Least Active Leases" },
  { id: "gpu-available-desc", title: "Most Available GPUs" },
];

const ROWS_PER_PAGE = 12;

interface ProviderListProps {
  pathName?: string;
}

export default function ProvidersList({ pathName }: ProviderListProps) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    const navigatorLocale = navigator?.language;
    if (navigatorLocale) {
      setLocale(navigatorLocale);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <ProviderListContent pathName={pathName} />
      </IntlProvider>
    </QueryClientProvider>
  );
}

function ProviderListContent({ pathName }: ProviderListProps) {
  const { data: providers, isLoading: isLoadingProviders } = useProviderList();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<string>("active-leases-desc");
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isFilteringActive, setIsFilteringActive] = useState(true);
  const [isFilteringAudited, setIsFilteringAudited] = useState(false);

  const start = (page - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const currentPageProviders = filteredProviders.slice(start, end);
  const pageCount = Math.ceil(filteredProviders.length / ROWS_PER_PAGE);

  useEffect(() => {
    if (!providers) return;

    let filtered = [...providers];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (provider) =>
          provider.hostUri?.toLowerCase().includes(searchLower) ||
          provider.owner?.toLowerCase().includes(searchLower),
      );
    }

    if (isFilteringActive) {
      filtered = filtered.filter((provider) => provider.isOnline);
    }

    if (isFilteringAudited) {
      filtered = filtered.filter(
        (provider) => provider.isAudited && provider.isOnline,
      );
    }

    filtered.sort((a, b) => {
      switch (sort) {
        case "active-leases-desc":
          return b.leaseCount - a.leaseCount;
        case "active-leases-asc":
          return a.leaseCount - b.leaseCount;
        case "gpu-available-desc":
          const totalGpuB =
            b.availableStats.gpu + b.pendingStats.gpu + b.activeStats.gpu;
          const totalGpuA =
            a.availableStats.gpu + a.pendingStats.gpu + a.activeStats.gpu;
          return totalGpuB - totalGpuA;
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
    setPage(1);
  }, [providers, isFilteringActive, isFilteringAudited, search, sort]);

  const handleNextPage = () => {
    if (page < pageCount) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  if (isLoadingProviders) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: ROWS_PER_PAGE }).map((_, index) => (
          <ProviderCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6 flex flex-col items-center justify-between md:flex-row">
        <h2 className="mb-4 text-xl font-semibold md:mb-0">
          List of Providers
        </h2>

        <div className="flex items-center space-x-4">
          <SortDropDown
            setSort={setSort}
            currentSort={sort}
            sortOptions={SORT_OPTIONS}
          />
        </div>
      </div>

      {currentPageProviders.length === 0 ? (
        <p className="py-6 text-center text-gray-500">No providers found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {currentPageProviders.map((provider) => (
              <ProvidersCard key={provider.owner} provider={provider} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex space-x-2">
              {page > 1 && (
                <button
                  onClick={handlePrevPage}
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                >
                  Previous
                </button>
              )}
              {page < pageCount && (
                <button
                  onClick={handleNextPage}
                  className="rounded border px-4 py-2 hover:bg-gray-100"
                >
                  Next
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Page {page} of {pageCount}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-background2 p-4">
      <div className="flex gap-x-[10px]">
        <Skeleton className="h-12 w-12 rounded border" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      <div className="mt-[10px] border-b pb-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="mt-3 flex flex-col items-center justify-between">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>

        <Skeleton className="mt-3 h-2 w-full" />
      </div>

      <div className="mt-3 flex flex-col gap-y-[6px]">
        {[
          { label: "CPU:", width: "w-full" },
          { label: "GPU:", width: "w-full" },
          { label: "Memory:", width: "w-full" },
          { label: "Active Leases:", width: "w-full" },
          { label: "Region:", width: "w-full" },
        ].map((stat, index) => (
          <div
            key={index}
            className="flex w-full items-center justify-between rounded-sm border p-[9px]"
          >
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Skeleton className="h-5 w-48" />
      </div>
    </div>
  );
}
