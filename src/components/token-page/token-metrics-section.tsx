import { Card, CardContent } from "@/components/ui/card";

const TokenMetricsSection = ({
  data,
  isLoading,
  isError,
}: {
  data: any;
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
      value: data?.market_data?.current_price.usd,
      format: (value: number) =>
        `$${value
          ?.toFixed(2)
          ?.toString()
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
    {
      title: "Market Cap",
      value: data?.market_data?.market_cap.usd,
      format: (value: number) =>
        `$${value
          ?.toString()
          ?.split(".")[0]
          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
    {
      title: "24h Trading Volume",
      value: data?.market_data?.total_volume.usd,
      format: (value: number) =>
        `$${value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-sans text-3xl !font-medium leading-snug tracking-tight text-foreground md:text-4xl">
          Token Metrics
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <p className="text-sm font-medium leading-none text-muted-foreground">
                {metric.title}
              </p>
              <Skeleton
                isError={isError}
                number={data && metric.format(metric.value)}
                isLoading={isLoading}
                isNumber={metric.value}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        As of{" "}
        {data
          ? new Date(data?.market_data?.last_updated).toUTCString()
          : "Sat Jan 7 07:57:36 UTC"}
        {", "}
        the following are the AKT metrics, as reported by{" "}
        <a
          href="https://www.coingecko.com/en/coins/akash-network"
          className="underline-offset-2 hover:underline"
        >
          Coingecko
        </a>
        .
      </p>

      {isError && (
        <p className="text-center text-xs text-muted-foreground">
          Failed to get live data — visit{" "}
          <a
            href="https://www.coingecko.com/en/coins/akash-network"
            className="underline-offset-2 hover:underline"
          >
            Coingecko
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
    <h4 className="mt-3 text-2xl font-medium leading-none md:text-3xl">
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
