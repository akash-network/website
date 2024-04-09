import { useEffect, useState } from "react";

const TokenMetricsSection = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = async () => {
    try {
      setIsError(false);
      setIsLoading(false);

      const response: any = await fetch(
        "https://api.coingecko.com/api/v3/coins/akash-network?tickers=true&market_data=true",
      );

      const fetchedData = await response.json();
      setData(fetchedData);
    } catch (error) {
      setData(null);
      setIsLoading(false);
      setIsError(true);
    }
  };
  console.log(isLoading);

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts

    const interval = setInterval(fetchData, 10000); // Fetch data every 10 seconds

    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, []);

  // Render your data
  return (
    <div className="py-10 md:pb-[80px]  md:pt-[80px]">
      <div>
        <h2 className="text-2xl font-bold leading-9 md:text-2lg md:leading-10">
          Token Metrics
        </h2>
        <p className="mt-4 text-sm  leading-[20px] md:text-base lg:text-lg lg:leading-[32px]">
          As of{" "}
          {data
            ? new Date(data?.market_data.last_updated).toUTCString()
            : "Sat Jan 7 07:57:36 UTC"}
          {", "}
          the following are the AKT metrics, as reported by Coingecko.
        </p>
      </div>

      <div className="mt-10 space-y-[29px] md:space-y-[40px]">
        <div className=" grid  grid-cols-1  gap-6   md:grid-cols-2 lg:grid-cols-3">
          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Circulating Supply
            </p>
            <Skeleton
              number={
                data?.market_data.circulating_supply
                  .toString()
                  .split(".")[0]
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }
              isLoading={isLoading}
            />
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Total Supply
            </p>

            <Skeleton
              number={
                data?.market_data.total_supply
                  .toString()
                  .split(".")[0]
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }
              isLoading={isLoading}
            />
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Maximum Supply
            </p>
            <Skeleton
              number={
                data?.market_data.max_supply
                  .toString()
                  .split(".")[0]
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }
              isLoading={isLoading}
            />
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Price
            </p>

            <Skeleton
              number={`$${
                data?.market_data.current_price.usd
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }`}
              isLoading={isLoading}
            />
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Market Cap
            </p>
            <Skeleton
              isLoading={isLoading}
              number={`$${
                data?.market_data.max_supply
                  .toString()
                  .split(".")[0]
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }`}
            />
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              24h Trading Volume
            </p>

            <Skeleton
              number={`$${
                data?.market_data.total_volume.usd
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "0"
              }`}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {isError && (
        <p className="mt-10 text-center">
          Failed to get live data please visit
          <a
            href="https://www.coingecko.com/en/coins/akash-network"
            className="hover:text-primary/90 ml-1.5 text-primary"
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
  number,
}: {
  isLoading: boolean;
  number: string;
}) => {
  //when loading show this instead of number
  return (
    <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
      {" "}
      {isLoading ? (
        <span className=" block h-8 animate-pulse rounded bg-gray-300"></span>
      ) : (
        number
      )}
    </h4>
  );
};
