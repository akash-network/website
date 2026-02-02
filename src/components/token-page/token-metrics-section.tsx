import type { CoinGeckoTokenData } from "@/types/components";

const TokenMetricsSection = ({
  data,
  isLoading,
  isError,
}: {
  data: CoinGeckoTokenData | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const metrics = [
    {
      title: "Circulating Supply",
      value: data?.market_data?.circulating_supply,
      format: (value: number) =>
        value
          ?.toString()
          ?.split(".")[0]
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Total Supply",
      value: data?.market_data?.total_supply,
      format: (value: number) =>
        value
          ?.toString()
          ?.split(".")[0]
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Maximum Supply",
      value: data?.market_data?.max_supply,
      format: (value: number) =>
        value
          ?.toString()
          ?.split(".")[0]
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    },
    {
      title: "Price",
      value: data?.market_data?.current_price?.usd,
      format: (value: number) =>
        `$${value
          ?.toFixed(2)
          ?.toString()
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
    {
      title: "Market Cap",
      value: data?.market_data?.market_cap?.usd,
      format: (value: number) =>
        `$${value
          ?.toString()
          ?.split(".")[0]
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
    {
      title: "24h Trading Volume",
      value: data?.market_data?.total_volume?.usd,
      format: (value: number) =>
        `$${value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
  ];

  return (
    <div className="">
      <div>
        <h2 className="text-center text-2xl font-semibold leading-9 md:text-2lg md:leading-10">
          Token Metrics
        </h2>
        <p className="mt-4 text-center text-sm leading-[20px] md:text-base lg:text-lg lg:leading-[32px]">
          As of{" "}
          {data?.market_data?.last_updated
            ? new Date(data.market_data.last_updated).toUTCString()
            : "Sat Jan 7 07:57:36 UTC"}
          {", "}
          the following are the AKT metrics, as reported by Coingecko.
        </p>
      </div>

      <div className="mt-10 space-y-[29px] md:space-y-[40px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex w-full flex-col justify-start rounded-lg border bg-background2 p-6 shadow"
            >
              <p className="text-sm font-medium leading-[20px] md:leading-tight">
                {metric.title}
              </p>
              <Skeleton
                isError={isError}
                number={data && metric.value !== undefined ? metric.format(metric.value as number) : "0"}
                isLoading={isLoading}
                isNumber={metric.value}
              />
            </div>
          ))}
        </div>
      </div>

      {isError && (
        <p className="mt-10 text-center">
          Failed to get live data please visit
          <a
            href="https://www.coingecko.com/en/coins/akash-network"
            className="ml-1.5 text-primary hover:text-primary/90"
          >
            coingecko
          </a>
        </p>
      )}
    </div>
  );
};

export default TokenMetricsSection;

const Skeleton = ({
  isLoading,
  isError,
  number,
  isNumber,
}: {
  isLoading: boolean;
  number?: string;
  isError: boolean;
  isNumber?: number;
}) => {
  return (
    <h4 className="mt-2 text-2xl font-medium leading-none md:text-3xl md:font-medium">
      {isLoading || isError ? (
        <span className="block h-8 animate-pulse rounded bg-gray-300"></span>
      ) : isNumber ? (
        number
      ) : (
        <span className="block h-8 animate-pulse rounded bg-gray-300"></span>
      )}
    </h4>
  );
};
