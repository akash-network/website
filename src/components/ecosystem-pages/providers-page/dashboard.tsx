import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IntlProvider } from "react-intl";

import { Search } from "lucide-react";
import ProvidersCard from "./card";
import FilterMobile from "./filter-mobile";
import Nav from "./nav";
import SortDropDown from "./sort-dropdown";
import Tag from "./tag";
import { useProviderList } from "./useProviderList";
import { ArrowUpCircle } from "lucide-react";
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
  const [searchIconVisible, setSearchIconVisible] = useState(true);

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
        filteredProviders = filteredProviders.filter((x) => x.isAudited);
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
      {/* Header */}
      <div className="container ">
        <div className="mt-6 flex flex-col justify-between gap-x-6 pb-6 md:mt-8 md:pb-8 lg:mt-10 lg:flex-row lg:border-b lg:pb-10">
          {" "}
          <Nav pathName={pathName} />
          <div className="my-5 border-b  lg:hidden"></div>
          <div className="flex w-full flex-1 items-center justify-between gap-x-[32px]  lg:flex-row-reverse lg:justify-start lg:gap-x-[36px]">
            <FilterMobile
              onIsFilteringActiveClick={onIsFilteringActiveClick}
              isFilteringActive={isFilteringActive}
              onIsFilteringAuditedClick={onIsFilteringAuditedClick}
              isFilteringAudited={isFilteringAudited}
              className=" lg:hidden"
            />

            <div
              className={`relative
               transition-all duration-300 ease-in-out
                ${!searchIconVisible ? "w-56 pl-3" : "w-28 pl-9"}
              inline-flex items-center justify-center gap-x-1.5  rounded-md border  border-border bg-background2   pr-3 text-xs font-medium leading-none text-sortText shadow-sm  hover:bg-gray-50 dark:hover:bg-darkGray  md:text-sm`}
            >
              {searchIconVisible && (
                <button
                  className="absolute left-3"
                  onClick={() => ref?.current?.focus()}
                >
                  <Search className="text-sm text-foreground" size={16} />
                </button>
              )}

              <input
                ref={ref}
                type="text"
                className=" h-full w-full rounded-lg bg-transparent py-2.5 outline-none  placeholder:font-normal placeholder:text-foreground"
                placeholder="Search"
                onFocus={() => setSearchIconVisible(false)}
                onBlur={() => setSearchIconVisible(true)}
                value={search}
                onChange={onSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="container">
        <div className="mt-10 hidden gap-x-5 overflow-x-auto md:flex lg:hidden">
          <Tag
            onClick={() =>
              onIsFilteringActiveClick(isFilteringActive ? false : true)
            }
            isActive={isFilteringActive}
          >
            Active
          </Tag>
          <Tag
            onClick={() =>
              onIsFilteringAuditedClick(isFilteringAudited ? false : true)
            }
            isActive={isFilteringAudited}
          >
            Audited
          </Tag>
        </div>
      </div>

      <div className="container mt-10 flex gap-x-5 overflow-x-auto md:hidden">
        <Tag
          onClick={() =>
            onIsFilteringActiveClick(isFilteringActive ? false : true)
          }
          isActive={isFilteringActive}
        >
          Active
        </Tag>
        <Tag
          onClick={() =>
            onIsFilteringAuditedClick(isFilteringAudited ? false : true)
          }
          isActive={isFilteringAudited}
        >
          Audited
        </Tag>
      </div> */}

      {isLoadingProviders ? (
        <div className="container mt-10">loading...</div>
      ) : (
        <div className="container mt-10 flex justify-between lg:gap-x-[20px] xl:gap-x-[48px]">
          <div className="hidden w-[200px] flex-shrink-0 pt-5 lg:block">
            <p className="text-sm font-medium leading-[20px] text-cardGray">
              Filter By
            </p>

            <div className="border-b pb-2"></div>

            <div className="mt-4 flex flex-col gap-y-4">
              <p
                onClick={() => {
                  onIsFilteringActiveClick(true);
                  onIsFilteringAuditedClick(false);
                }}
                className={`inline-flex cursor-pointer text-base font-medium  hover:text-primary ${
                  isFilteringActive ? "text-primary" : "text-para"
                }`}
              >
                Active
              </p>
              <p
                onClick={() => {
                  onIsFilteringAuditedClick(true);
                  onIsFilteringActiveClick(false);
                }}
                className={`inline-flex cursor-pointer text-base font-medium  hover:text-primary ${
                  isFilteringAudited ? "text-primary" : "text-para"
                }`}
              >
                Audited
              </p>
            </div>
            <div className="">
              <div className="my-8 border-b pb-2" />
              <p className="text-sm font-medium text-para">
                Start Earning and join our community today!
              </p>

              <a href="/providers">
                <button className="mt-3 rounded-lg border border-[#D1D5DB] bg-background2 px-4 py-2 text-center font-medium ">
                  Become a Provider
                </button>
              </a>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold leading-[28px] md:text-2lg md:leading-[48px]">
                Providers
              </h3>

              <div className="flex flex-shrink-0 items-center gap-x-3 md:gap-x-3 lg:gap-x-9">
                <SortDropDown
                  setSort={setSort}
                  currentSort={sort}
                  sortOptions={sortOptions}
                />
              </div>
            </div>

            {currentPageProviders.length === 0 && <p>No providers found</p>}

            <div className="mt-4   grid w-full grid-cols-1 gap-5  sm:grid-cols-2    md:grid-cols-2 md:gap-5   lg:grid-cols-2  lg:gap-5  xl:grid-cols-3 ">
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

const SearchIcon = () => {
  return (
    <>
      <div className="hidden md:block" id="searchIcon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.498 15.5L18.998 19"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M5 11C5 14.3137 7.68629 17 11 17C12.6597 17 14.1621 16.3261 15.2483 15.237C16.3308 14.1517 17 12.654 17 11C17 7.68629 14.3137 5 11 5C7.68629 5 5 7.68629 5 11Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>

      <div className="block md:hidden" id="searchIcon">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.334 10.333L12.6673 12.6663"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M3.33398 7.33301C3.33398 9.54215 5.12485 11.333 7.33398 11.333C8.44047 11.333 9.44202 10.8837 10.1662 10.1577C10.8878 9.43411 11.334 8.43566 11.334 7.33301C11.334 5.12387 9.54312 3.33301 7.33398 3.33301C5.12485 3.33301 3.33398 5.12387 3.33398 7.33301Z"
            stroke="#272540"
            strokeWidth="1.17434"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </>
  );
};
