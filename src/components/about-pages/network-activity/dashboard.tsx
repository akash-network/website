import OnThisPageDropdown from "@/components/on-this-page-mobile";
import { mainnetId } from "@/lib/constants";
import { percIncrease, udenomToDenom } from "@/lib/math-helpers.ts";
import { bytesToShrink } from "@/lib/unit-utils";
import {
  appendSearchParams,
  getShortText,
  useFriendlyMessageType,
} from "@/lib/utils";
import type { DashboardData } from "@/types/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import {
  FormattedNumber,
  FormattedRelativeTime,
  IntlProvider,
} from "react-intl";
import { HumanReadableBytes } from "./human-readable-bytes";
import StatsCard, { StatsCardSkeleton } from "./stats-card";
import { USD } from "./usd-label";
import { useDashboardData } from "./useDashboardData";
import { useMarketData } from "./useMarketData";

const queryClient = new QueryClient();

export default function Index({ initialData }: { initialData: DashboardData }) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <Layout initialData={initialData} />
      </IntlProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function Layout({ initialData }: { initialData: DashboardData }) {
  const marketData = useMarketData();
  const dashboardQuery = useDashboardData();
  // do not remove below line
  dashboardQuery.isFetching;
  marketData.isFetching;

  const nav = [
    {
      label: "Token Metrics",
      link: `#token-metrics`,
      enabled: true,
    },
    {
      label: "Network Summary",
      link: `#network-summary`,
      enabled: true,
    },
    {
      label: "Spent Assets",
      link: `#spent-assets`,
      enabled: true,
    },
    {
      label: "Total resources leased",
      link: `#total-resources-leased`,
      enabled: true,
    },
    {
      label: "Network Capacity",
      link: `#network-capacity`,
      enabled: true,
    },
    {
      label: "Blockchain",
      link: `#blockchain`,
      enabled: true,
    },
    {
      label: "Blocks",
      link: `#blocks`,
      enabled: true,
    },
    {
      label: "Transactions",
      link: `#transactions`,
      enabled: true,
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-x-5">
      <div className="sticky top-[120px] hidden h-[calc(100vh-120px)] overflow-y-auto pb-10 md:col-span-4 md:block lg:col-span-3">
        <p className="text-sm font-bold leading-[20px]">ON THIS PAGE</p>
        <div className="border-b py-2"></div>

        <div className="mt-4 flex flex-col gap-y-4">
          {nav?.map((subItem: any) => (
            <a
              key={subItem.label}
              href={subItem.link}
              style={{
                paddingLeft:
                  subItem.depth > 2 ? `${subItem.depth * 5}px` : "0px",
              }}
              className="inline-flex cursor-pointer text-base font-medium text-para hover:text-primary"
            >
              {subItem.label}
            </a>
          ))}
        </div>
      </div>

      <div
        className={`col-span-12 mx-auto w-full md:col-span-8 md:pl-10 lg:col-span-9 `}
      >
        <OnThisPageDropdown nav={nav} />

        <div className="space-y-10">
          <div className="mt-10 md:mt-0">
            <h1
              id="overview"
              className="text-2xl font-bold leading-[32px] md:text-2lg md:leading-[40px] lg:text-3lg lg:leading-[48px]"
            >
              Network Activity
            </h1>
          </div>
        </div>

        <div className="mt-12">
          <div>
            {dashboardQuery.isLoading && !dashboardQuery.data && (
              <div className="space-y-10" id="token-metrics">
                {/* Network Summary */}
                <section>
                  <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
                    Network Summary
                  </h2>

                  <div className="mt-5  grid grid-cols-2  gap-x-4  gap-y-4 md:gap-x-[18px]  lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </section>

                {/* Spent Assets */}
                <section>
                  <h2 className="text-2xl font-bold leading-none md:text-2lg">
                    Spent Assets
                  </h2>
                  <div className="mt-5  grid grid-cols-2  gap-x-4  gap-y-4 md:gap-x-[18px]  lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold leading-none md:text-2lg">
                    Total resources leased
                  </h2>
                  <div className="mt-5  grid grid-cols-2  gap-x-4  gap-y-4 md:gap-x-[18px]  lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold leading-none md:text-2lg">
                    Network Capacity
                  </h2>
                  <div className="mt-5  grid grid-cols-2  gap-x-4  gap-y-4 md:gap-x-[18px]  lg:grid-cols-3 xl:grid-cols-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold leading-none md:text-2lg">
                    Blockchain
                  </h2>
                  <div className="mt-5  grid grid-cols-1  gap-x-4  gap-y-4 md:gap-x-[18px] lg:grid-cols-2 xl:grid-cols-3">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton /> <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </section>
              </div>
            )}

            {dashboardQuery.data && marketData.data && (
              <div>
                <Dashboard
                  dashboardData={dashboardQuery.data}
                  marketData={marketData.data}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({
  dashboardData,
  marketData,
}: {
  dashboardData: DashboardData;
  marketData: any;
}) {
  const memoryDiff = bytesToShrink(
    dashboardData.now.activeMemory - dashboardData.compare.activeMemory,
  );

  const storageDiff = bytesToShrink(
    dashboardData.now.activeStorage - dashboardData.compare.activeStorage,
  );

  const capacityMemoryDiff = bytesToShrink(
    dashboardData.networkCapacityStats.now.memory -
      dashboardData.networkCapacityStats.compare.memory,
  );

  const capacityStorageDiff = bytesToShrink(
    dashboardData.networkCapacityStats.now.storage -
      dashboardData.networkCapacityStats.compare.storage,
  );

  return (
    <div className="space-y-10">
      <section>
        <h2
          id="token-metrics"
          className="text-xl font-bold leading-none md:text-2xl lg:text-2lg"
        >
          Token Metrics
        </h2>
        <div className="mt-5  grid  grid-cols-1 gap-4 gap-y-4  sm:grid-cols-2 md:grid-cols-1  md:gap-5  lg:grid-cols-2 xl:grid-cols-3  ">
          <StatsCard
            graph={false}
            number={
              <>
                <USD />
                <span>
                  <FormattedNumber
                    value={marketData.price}
                    notation="compact"
                    maximumFractionDigits={2}
                  />
                </span>
              </>
            }
            text="AKT Price"
            diffPercent={marketData.priceChangePercentage24 / 100}
          />

          <StatsCard
            graph={false}
            number={
              <>
                <USD />
                <span>
                  <FormattedNumber value={marketData.marketCap} />
                </span>
              </>
            }
            text="Market Cap"
          />

          <StatsCard
            graph={false}
            number={
              <>
                <USD />
                <span>
                  <FormattedNumber value={marketData.volume} />
                </span>
              </>
            }
            text="Volume (24H)"
          />

          <StatsCard
            graph={false}
            number={
              <>
                <span>{marketData.marketCapRank}</span>
              </>
            }
            text="Rank"
          />
        </div>
      </section>

      {/* Network Summary */}
      <section>
        <h2
          id="network-summary"
          className="text-xl font-bold leading-none md:text-2xl lg:text-2lg"
        >
          Network Summary
        </h2>
        <div className="mt-5  grid grid-cols-2  gap-4  gap-y-4 md:grid-cols-1  md:gap-5  lg:grid-cols-2 xl:grid-cols-3  ">
          <StatsCard
            graphLink="https://stats.akash.network/graph/daily-usd-spent"
            number={
              <>
                <USD />
                <span>
                  <FormattedNumber
                    value={udenomToDenom(dashboardData.now.dailyUUsdSpent)}
                    notation="compact"
                    maximumFractionDigits={2}
                  />
                </span>
              </>
            }
            text="USD spent (24h)"
            diffNumber={udenomToDenom(
              dashboardData.now.dailyUUsdSpent -
                dashboardData.compare.dailyUUsdSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.dailyUUsdSpent,
              dashboardData.now.dailyUUsdSpent,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/total-usd-spent"
            number={
              <>
                <USD />
                <span>
                  <FormattedNumber
                    value={udenomToDenom(dashboardData.now.totalUUsdSpent)}
                    maximumFractionDigits={2}
                    notation="compact"
                  />
                </span>
              </>
            }
            text="Total spent USD"
            diffNumber={udenomToDenom(
              dashboardData.now.totalUUsdSpent -
                dashboardData.compare.totalUUsdSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.totalUUsdSpent,
              dashboardData.now.totalUUsdSpent,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/daily-deployment-count"
            number={
              <FormattedNumber
                value={
                  dashboardData.now.totalLeaseCount -
                  dashboardData.compare.totalLeaseCount
                }
                notation="compact"
              />
            }
            text="New leases (24h)"
            diffNumber={
              dashboardData.now.dailyLeaseCount -
              dashboardData.compare.dailyLeaseCount
            }
            diffPercent={percIncrease(
              dashboardData.compare.dailyLeaseCount,
              dashboardData.now.dailyLeaseCount,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/all-time-deployment-count"
            number={
              <FormattedNumber
                value={dashboardData.now.totalLeaseCount}
                notation="compact"
                maximumFractionDigits={2}
              />
            }
            text="Total leases"
            diffNumber={
              dashboardData.now.totalLeaseCount -
              dashboardData.compare.totalLeaseCount
            }
            diffPercent={percIncrease(
              dashboardData.compare.totalLeaseCount,
              dashboardData.now.totalLeaseCount,
            )}
          />
        </div>
      </section>

      {/* Spent Assets */}
      <section id="spent-assets">
        <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
          Spent Assets
        </h2>
        <div className="mt-5  grid grid-cols-2  gap-4  gap-y-4 md:grid-cols-1  md:gap-5  lg:grid-cols-2 xl:grid-cols-3  ">
          <StatsCard
            graphLink="https://stats.akash.network/graph/daily-akt-spent"
            number={
              <>
                <span>
                  <FormattedNumber
                    value={udenomToDenom(dashboardData.now.dailyUAktSpent)}
                    notation="compact"
                    maximumFractionDigits={2}
                  />
                </span>
              </>
            }
            text="AKT spent (24h)"
            diffNumber={udenomToDenom(
              dashboardData.now.dailyUAktSpent -
                dashboardData.compare.dailyUAktSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.dailyUAktSpent,
              dashboardData.now.dailyUAktSpent,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/total-akt-spent"
            number={
              <>
                <FormattedNumber
                  value={udenomToDenom(dashboardData.now.totalUAktSpent)}
                  maximumFractionDigits={2}
                  notation="compact"
                />{" "}
              </>
            }
            text="Total spent AKT"
            diffNumber={udenomToDenom(
              dashboardData.now.totalUAktSpent -
                dashboardData.compare.totalUAktSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.totalUAktSpent,
              dashboardData.now.totalUAktSpent,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/daily-usdc-spent"
            number={
              <>
                <span>
                  <FormattedNumber
                    value={udenomToDenom(dashboardData.now.dailyUUsdcSpent)}
                    maximumFractionDigits={2}
                    notation="compact"
                  />
                </span>
              </>
            }
            text="USDC spent (24h)"
            diffNumber={udenomToDenom(
              dashboardData.now.dailyUUsdcSpent -
                dashboardData.compare.dailyUUsdcSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.dailyUUsdcSpent,
              dashboardData.now.dailyUUsdcSpent,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/total-usdc-spent"
            number={
              <>
                <FormattedNumber
                  value={udenomToDenom(dashboardData.now.totalUUsdcSpent)}
                  maximumFractionDigits={2}
                  notation="compact"
                />
              </>
            }
            text="Total spent USDC"
            diffNumber={udenomToDenom(
              dashboardData.now.totalUUsdcSpent -
                dashboardData.compare.totalUUsdcSpent,
            )}
            diffPercent={percIncrease(
              dashboardData.compare.totalUUsdcSpent,
              dashboardData.now.totalUUsdcSpent,
            )}
          />
        </div>
      </section>

      {/* Total resources leased */}
      <section id="total-resources-leased">
        <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
          Total resources leased
        </h2>
        <div className="mt-5  grid grid-cols-2  gap-4  gap-y-4 md:grid-cols-1  md:gap-5  lg:grid-cols-2 xl:grid-cols-3  ">
          <StatsCard
            graphLink="https://stats.akash.network/graph/active-deployment"
            number={
              <FormattedNumber
                maximumFractionDigits={2}
                notation="compact"
                value={dashboardData.now.activeLeaseCount}
              />
            }
            text="Active leases"
            diffNumber={
              dashboardData.now.activeLeaseCount -
              dashboardData.compare.activeLeaseCount
            }
            diffPercent={percIncrease(
              dashboardData.compare.activeLeaseCount,
              dashboardData.now.activeLeaseCount,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/compute"
            number={
              <>
                <FormattedNumber
                  value={dashboardData.now.activeCPU / 1000}
                  maximumFractionDigits={2}
                  notation="compact"
                />
              </>
            }
            text="Compute (CPU)"
            diffNumber={
              (dashboardData.now.activeCPU - dashboardData.compare.activeCPU) /
              1000
            }
            diffPercent={percIncrease(
              dashboardData.compare.activeCPU,
              dashboardData.now.activeCPU,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/graphics-gpu"
            number={
              <>
                <FormattedNumber
                  value={dashboardData.now.activeGPU}
                  maximumFractionDigits={2}
                  notation="compact"
                />
              </>
            }
            text="Graphics (GPU)"
            diffNumber={
              dashboardData.now.activeGPU - dashboardData.compare.activeGPU
            }
            diffPercent={percIncrease(
              dashboardData.compare.activeGPU,
              dashboardData.now.activeGPU,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/memory"
            number={
              <HumanReadableBytes value={dashboardData.now.activeMemory} />
            }
            text="Memory (TB)"
            diffNumberUnit={memoryDiff.unit}
            diffNumber={memoryDiff.value}
            diffPercent={percIncrease(
              dashboardData.compare.activeMemory,
              dashboardData.now.activeMemory,
            )}
          />

          <StatsCard
            graphLink="https://stats.akash.network/graph/storage"
            number={
              <HumanReadableBytes value={dashboardData.now.activeStorage} />
            }
            text="Storage (TB)"
            diffNumberUnit={storageDiff.unit}
            diffNumber={storageDiff.value}
            diffPercent={percIncrease(
              dashboardData.compare.activeStorage,
              dashboardData.now.activeStorage,
            )}
          />
        </div>
      </section>

      {/* Network Capacity */}
      <section id="network-capacity">
        <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
          Network Capacity
        </h2>
        <div className="mt-5  grid grid-cols-2  gap-4  gap-y-4 md:grid-cols-1  md:gap-5  lg:grid-cols-2 xl:grid-cols-3  ">
          <StatsCard
            graphLink="https://console.akash.network/provider-graph/active-providers"
            number={
              <FormattedNumber
                value={dashboardData.networkCapacity.activeProviderCount}
              />
            }
            text="Active providers"
            diffNumber={
              dashboardData.networkCapacityStats.now.count -
              dashboardData.networkCapacityStats.compare.count
            }
            diffPercent={percIncrease(
              dashboardData.networkCapacityStats.compare.count,
              dashboardData.networkCapacityStats.now.count,
            )}
          />

          <StatsCard
            graphLink="https://console.akash.network/provider-graph/compute-cpu"
            number={
              <>
                <FormattedNumber
                  value={dashboardData.networkCapacity.totalCPU / 1000}
                  maximumFractionDigits={0}
                />
              </>
            }
            text="Compute (CPU)"
            diffNumber={
              (dashboardData.networkCapacityStats.now.cpu -
                dashboardData.networkCapacityStats.compare.cpu) /
              1000
            }
            diffPercent={percIncrease(
              dashboardData.networkCapacityStats.compare.cpu,
              dashboardData.networkCapacityStats.now.cpu,
            )}
          />

          <StatsCard
            graphLink="https://console.akash.network/provider-graph/graphics-gpu"
            number={
              <>
                <FormattedNumber
                  value={dashboardData.networkCapacity.totalGPU}
                  maximumFractionDigits={0}
                />
              </>
            }
            text="Graphics (GPU)"
            diffNumber={
              dashboardData.networkCapacityStats.now.gpu -
              dashboardData.networkCapacityStats.compare.gpu
            }
            diffPercent={percIncrease(
              dashboardData.networkCapacityStats.compare.gpu,
              dashboardData.networkCapacityStats.now.gpu,
            )}
          />

          <StatsCard
            graphLink="https://console.akash.network/provider-graph/memory"
            number={
              <HumanReadableBytes
                value={dashboardData.networkCapacity.totalMemory}
              />
            }
            text="Memory (TB)"
            diffNumberUnit={capacityMemoryDiff.unit}
            diffNumber={capacityMemoryDiff.value}
            diffPercent={percIncrease(
              dashboardData.networkCapacityStats.compare.memory,
              dashboardData.networkCapacityStats.now.memory,
            )}
          />

          <StatsCard
            graphLink="https://console.akash.network/provider-graph/storage"
            number={
              <HumanReadableBytes
                value={dashboardData.networkCapacity.totalStorage}
              />
            }
            text="Storage (TB)"
            diffNumberUnit={capacityStorageDiff.unit}
            diffNumber={capacityStorageDiff.value}
            diffPercent={percIncrease(
              dashboardData.networkCapacityStats.compare.storage,
              dashboardData.networkCapacityStats.now.storage,
            )}
          />
        </div>
      </section>

      {/* Blockchain */}
      <section id="blockchain">
        <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
          Blockchain
        </h2>
        <div className="mt-5  grid grid-cols-1  gap-x-4  gap-y-4 md:gap-x-[18px] lg:grid-cols-2 xl:grid-cols-3">
          <StatsCard
            graph={false}
            number={
              <FormattedNumber
                maximumFractionDigits={2}
                notation="compact"
                value={dashboardData.chainStats.height}
              />
            }
            text="Height"
          />

          <StatsCard
            graph={false}
            number={
              <FormattedNumber
                maximumFractionDigits={2}
                notation="compact"
                value={dashboardData.chainStats.transactionCount}
              />
            }
            text="Transactions"
          />

          <StatsCard
            graph={false}
            number={
              <>
                <FormattedNumber
                  value={udenomToDenom(
                    dashboardData.chainStats.communityPool,
                    6,
                  )}
                  notation="compact"
                  minimumFractionDigits={2}
                />
              </>
            }
            text="Community pool (AKT)"
          />

          <StatsCard
            graph={false}
            number={
              <>
                <FormattedNumber
                  value={udenomToDenom(dashboardData.chainStats.bondedTokens)}
                  notation="compact"
                  maximumFractionDigits={2}
                />
                /
                <FormattedNumber
                  value={udenomToDenom(dashboardData.chainStats.totalSupply)}
                  notation="compact"
                  maximumFractionDigits={2}
                />
                <span className="ml-1 mt-1 text-xs">
                  <FormattedNumber
                    value={
                      udenomToDenom(dashboardData.chainStats.bondedTokens) /
                      udenomToDenom(dashboardData.chainStats.totalSupply)
                    }
                    style="percent"
                    maximumFractionDigits={2}
                  />{" "}
                </span>
              </>
            }
            text="Bonded tokens"
          />

          <StatsCard
            graph={false}
            number={
              <FormattedNumber
                value={dashboardData.chainStats.inflation}
                style="percent"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
              />
            }
            text="Inflation"
          />

          <StatsCard
            graph={false}
            number={
              <FormattedNumber
                value={dashboardData.chainStats.stakingAPR}
                style="percent"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
              />
            }
            text="Staking APR"
          />
        </div>
      </section>

      {/* Blocks */}
      <section id="blocks">
        <h2 className="text-2xl font-bold leading-none md:text-2lg">Blocks</h2>

        <table className="mt-6 w-full  md:mt-7">
          <thead className="text-justify text-[10px] font-bold leading-none md:text-base  ">
            <tr className="border-b border-[#D9D9D9]">
              <th className="py-2  md:py-5 ">Height</th>
              <th className="py-2 md:py-5 ">Proposer</th>
              <th className="py-2 md:py-5 ">TXS</th>
              <th className="py-2 md:py-5 ">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9D9] border-b border-b-[#D9D9D9]">
            {dashboardData.latestBlocks.map((block) => (
              <tr key={block.height}>
                <td className="py-2 text-[10px] font-bold md:py-5 md:text-base ">
                  <a
                    href={`https://stats.akash.network/blocks/${
                      block.height
                    }${appendSearchParams({
                      network: mainnetId,
                    })}`}
                    target="_blank"
                  >
                    {block.height}
                  </a>
                </td>
                <td className="flex w-fit text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  <a
                    href={`https://stats.akash.network/validators/${
                      block.proposer.operatorAddress
                    }${appendSearchParams({
                      network: mainnetId,
                    })}`}
                    target="_blank"
                  >
                    {getShortText(block.proposer.moniker, 20)}
                  </a>
                </td>
                <td className="text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  {block.transactionCount}
                </td>
                <td className="text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  <FormattedRelativeTime
                    value={
                      (new Date(block.datetime).getTime() -
                        new Date().getTime()) /
                      1000
                    }
                    numeric="auto"
                    unit="second"
                    style="short"
                    updateIntervalInSeconds={7}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <a
          target="_blank"
          href="https://stats.akash.network/blocks"
          className="mx-auto mt-8 flex w-fit cursor-pointer rounded-[6px] border bg-background2  px-2.5 py-1.5 text-sm font-medium leading-none lg:px-3 lg:py-2"
        >
          View more
        </a>
      </section>

      {/* Transactions */}
      <section id="transactions">
        <h2 className="text-xl font-bold leading-none md:text-2xl lg:text-2lg">
          Transactions
        </h2>

        <table className="mt-6 w-full  md:mt-7">
          <thead className="text-justify text-[10px] font-bold leading-none md:text-base  ">
            <tr className="border-b border-[#D9D9D9]">
              <th className="py-2  md:py-5 ">Tx Hash</th>
              <th className="py-2 md:py-5 ">Type</th>
              <th className="py-2 md:py-5 ">Height</th>
              <th className="py-2 md:py-5 ">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9D9] border-b border-b-[#D9D9D9]">
            {dashboardData.latestTransactions.map((transaction) => (
              <tr key={transaction.hash}>
                <td className="py-2 text-[10px] font-bold md:py-5 md:text-base ">
                  <a
                    target="_blank"
                    href={`https://stats.akash.network/transactions/${
                      transaction.hash
                    }${appendSearchParams({
                      network: mainnetId,
                    })}`}
                  >
                    {getShortText(transaction.hash, 15)}
                  </a>
                </td>
                <td className="text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  {transaction.messages[0].isReceiver
                    ? "Receive"
                    : useFriendlyMessageType(transaction.messages[0].type)}

                  {transaction.messages.length > 1
                    ? " +" + (transaction.messages.length - 1)
                    : ""}
                </td>
                <td className="text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  {transaction.height}
                </td>
                <td className="text-[10px] font-bold text-[#808080] md:py-[16px] md:text-base">
                  <FormattedRelativeTime
                    value={
                      (new Date(transaction.datetime).getTime() -
                        new Date().getTime()) /
                      1000
                    }
                    numeric="auto"
                    unit="second"
                    style="short"
                    updateIntervalInSeconds={7}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <a
          target="_blank"
          href="https://stats.akash.network/transactions"
          className="mx-auto mt-8 flex w-fit cursor-pointer rounded-[6px] border bg-background2  px-2.5 py-1.5 text-sm font-medium leading-none lg:px-3 lg:py-2"
        >
          View more
        </a>
      </section>
    </div>
  );
}
