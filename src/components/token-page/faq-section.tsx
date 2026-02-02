import { useStorage } from "@/utils/store";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FAQ } from "./faq";
export const FaqsToken = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Query />
    </QueryClientProvider>
  );
};

const Query = () => {
  const token = useStorage((state) => state.token);
  const setToken = useStorage((state) => state.setToken);

  const [enabled, setEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const fetchInterval = 1000 * 60 * 20; // 20 minutes

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tokenMetrics"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/akash-network?tickers=true&market_data=true",
      );
      return response.json();
    },
    refetchInterval: fetchInterval,
    keepPreviousData: true,
    retry: true,
    enabled: enabled,
    initialData: token,
  });

  useEffect(() => {
    if (data?.time !== token?.time && data) {
      setToken({
        ...data,
        time: new Date().getTime(),
      });
    }

    if (token === null) {
      setToken({ time: 0 });
    }
  }, [data]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const shouldFetch = !token || currentTime - token?.time > fetchInterval;
    setEnabled(shouldFetch);
  }, [currentTime, token]);

  return <FaqSection data={data} isLoading={isLoading} isError={isError} />;
};

import type { CoinGeckoTokenData } from "@/types/components";

const FaqSection = ({
  data,
  isLoading,
  isError,
}: {
  data: CoinGeckoTokenData | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const formatNumber = (num: number) => {
    return num
      ?.toString()
      ?.split(".")[0]
      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const maxSupply = data?.market_data?.max_supply
    ? formatNumber(data.market_data.max_supply)
    : "388,539,008";

  const circulatingSupply = data?.market_data?.circulating_supply
    ? formatNumber(data.market_data.circulating_supply)
    : "214,430,074";

  const lastUpdated = data?.market_data?.last_updated
    ? new Date(data.market_data.last_updated).toUTCString()
    : "Sat Jan 7 07:57:36 UTC";

  return (
    <div>
      <h2 className="text-center text-2xl font-semibold md:text-2lg">FAQs</h2>

      <div>
        <FAQ
          faqs={[
            {
              title: "What is the maximum and circulating supply of AKT?",
              description: `Akash has a maximum supply of ${maxSupply}, with ${circulatingSupply} AKT in circulation as of ${lastUpdated}`,
            },
            {
              title: "What is the unlock schedule for the AKT token?",
              description:
                "All AKT under circulation is unlocked. AKT Unlock Schedule is available [here](https://docs.google.com/spreadsheets/d/1MUULetp59lgNq0z4ckVI51QdtMGvqtKOW8wRfX5R8yY/edit#gid=2130333819)",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FaqSection;
