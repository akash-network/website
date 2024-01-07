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
            <h4 className="mt-2  text-2xl   font-medium md:text-3xl md:leading-[36px]">
              {data?.market_data.circulating_supply
                ? data?.market_data.circulating_supply
                    .toString()
                    .split(".")[0]
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "214,430,074"}
            </h4>
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Total Supply
            </p>
            <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
              {" "}
              {data?.market_data.total_supply
                ? data?.market_data.total_supply
                    .toString()
                    .split(".")[0]
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "214,430,074"}{" "}
            </h4>
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Maximum Supply
            </p>
            <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
              {" "}
              {data?.market_data.max_supply
                ? data?.market_data.max_supply
                    .toString()
                    .split(".")[0]
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "388,539,008"}
            </h4>
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Price
            </p>
            <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
              ${" "}
              {data?.market_data.current_price
                ? data?.market_data.current_price.usd
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "1"}
            </h4>
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              Market Cap
            </p>
            <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
              $
              {data?.market_data.market_cap
                ? data?.market_data.market_cap.usd
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "145,449,546"}{" "}
            </h4>
          </div>

          <div className="flex w-full flex-col justify-start  rounded-[8px] bg-background2 p-6 shadow">
            <p className="text-sm font-medium leading-[20px]  md:leading-tight">
              24h Trading Volume
            </p>
            <h4 className="mt-2  text-2xl font-medium  leading-none md:text-3xl md:font-medium">
              {"$"}
              {data?.market_data.total_volume
                ? data?.market_data.total_volume.usd
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "2,259,978"}{" "}
            </h4>
          </div>
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
