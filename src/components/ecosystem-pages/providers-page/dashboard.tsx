import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IntlProvider } from "react-intl";

import ProvidersCard from "./card";
import SortDropDown from "./sort-dropdown";
import { useProviderList } from "./useProviderList";
const queryClient = new QueryClient();

export default function Index({ pathName, initialProviders }: any) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <Layout pathName={pathName} initialProviders={initialProviders} />
      </IntlProvider>
    </QueryClientProvider>
  );
}

const sortOptions = [
  { id: "active-leases-desc", title: "Active Leases (desc)" },
  { id: "active-leases-asc", title: "Active Leases (asc)" },
  { id: "gpu-available-desc", title: "GPUs Available (desc)" },
];

function Layout({ pathName, initialProviders }: any) {
  const { data: providers, isLoading: isLoadingProviders } = useProviderList({
    initialProviders: initialProviders,
  });

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<string>("active-leases-desc");
  const [filteredProviders, setFilteredProviders] = useState<any>([]);

  const [search, setSearch] = useState("");
  const [isFilteringActive, setIsFilteringActive] = useState(true);
  const [isFilteringFavorites, setIsFilteringFavorites] = useState(false);
  const [isFilteringAudited, setIsFilteringAudited] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageProviders = filteredProviders.slice(start, end);
  const pageCount = Math.ceil(filteredProviders.length / rowsPerPage);

  useEffect(() => {
    if (providers) {
      let filteredProviders = [...providers];

      // Filter for search
      if (search) {
        filteredProviders = filteredProviders.filter(
          (x) =>
            x.hostUri?.includes(search.toLowerCase()) ||
            x.owner?.includes(search.toLowerCase()),
        );
      }

      if (isFilteringActive) {
        filteredProviders = filteredProviders.filter((x) => x.isOnline);
      }

      if (isFilteringAudited) {
        filteredProviders = filteredProviders.filter(
          (x) => x.isAudited && x.isOnline,
        );
      }

      filteredProviders = filteredProviders.sort((a, b) => {
        if (sort === "active-leases-desc") {
          return b.leaseCount - a.leaseCount;
        } else if (sort === "active-leases-asc") {
          return a.leaseCount - b.leaseCount;
        } else if (sort === "my-leases-desc") {
          return b.userLeases - a.userLeases;
        } else if (sort === "my-active-leases-desc") {
          return b.userActiveLeases - a.userActiveLeases;
        } else if (sort === "gpu-available-desc") {
          const totalGpuB =
            b.availableStats.gpu + b.pendingStats.gpu + b.activeStats.gpu;
          const totalGpuA =
            a.availableStats.gpu + a.pendingStats.gpu + a.activeStats.gpu;
          return totalGpuB - totalGpuA;
        } else {
          return 1;
        }
      });

      setFilteredProviders(filteredProviders);
    }
  }, [
    providers,
    isFilteringActive,
    isFilteringFavorites,
    isFilteringAudited,
    search,
    sort,
  ]);

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

  const onIsFilteringActiveClick = (value: any) => {
    setPage(1);
    setIsFilteringActive(value);
  };

  const onIsFilteringAuditedClick = (value: any) => {
    setPage(1);
    setIsFilteringAudited(value);
  };
  const ref = useRef<HTMLInputElement>(null);
  const onSearchChange = (event: any) => {
    const value = event.target.value;
    setSearch(value);
  };

  return (
    <>
      {isLoadingProviders ? (
        <div className="">loading...</div>
      ) : (
        <div className="  flex justify-between lg:gap-x-[20px] xl:gap-x-[48px]">
          <div className="w-full">
            <div className="flex flex-col  items-center justify-between gap-6 md:flex-row">
              <h2 id="overview" className="text-base font-semibold md:text-xl">
                List of Providers
              </h2>

              <div className="flex flex-shrink-0 items-center gap-x-3 md:gap-x-3 lg:gap-x-9">
                <SortDropDown
                  setSort={setSort}
                  currentSort={sort}
                  sortOptions={sortOptions}
                />
              </div>
            </div>

            {currentPageProviders.length === 0 && (
              <p className="py-6  text-center">No providers found</p>
            )}

            <div className="mt-4   grid w-full grid-cols-1 gap-5  sm:grid-cols-2    md:grid-cols-2 md:gap-5   lg:grid-cols-3  lg:gap-5  ">
              {currentPageProviders.map((provider: any) => {
                return (
                  <ProvidersCard key={provider.owner} provider={provider} />
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mb-10 mt-10 flex w-full items-center  justify-between">
              <div className="flex flex-shrink-0 space-x-4">
                {page !== 1 && (
                  <button
                    disabled={page === 1}
                    onClick={handlePrevPage}
                    className="inline-flex items-center justify-center  gap-x-1.5 rounded-md border  bg-background px-2.5 py-1.5 text-sm font-medium  leading-none text-textGray shadow-sm hover:bg-gray-50 dark:bg-darkGray lg:px-3 lg:py-2"
                  >
                    Previous
                  </button>
                )}

                {page !== pageCount && (
                  <button
                    onClick={handleNextPage}
                    disabled={page === pageCount}
                    className="inline-flex items-center justify-center  gap-x-1.5 rounded-md border bg-background  px-2.5 py-1.5 text-sm font-medium  leading-none text-textGray shadow-sm hover:bg-gray-50 dark:bg-darkGray lg:px-3 lg:py-2"
                  >
                    Next
                  </button>
                )}
              </div>

              <p className="text-xs md:text-base">
                Page: {page} / {pageCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
