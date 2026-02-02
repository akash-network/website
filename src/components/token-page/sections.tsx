import { useStorage } from "@/utils/store";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { TokenSectionsProps, CoinGeckoTokenData } from "@/types/components";
import type { TokenData } from "@/types/store";
import BuyAktButton from "./buy-akt-modal";
import TokenMetricsSection from "./token-metrics-section";

const Sections = ({
  url,
  aktFeaturesSection,
  buyingAKTSection,
  faqsSection,
}: TokenSectionsProps) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Query
        aktFeaturesSection={aktFeaturesSection}
        buyingAKTSection={buyingAKTSection}
        faqsSection={faqsSection}
        url={url}
      />
    </QueryClientProvider>
  );
};

const Query = ({
  aktFeaturesSection,
  buyingAKTSection,
  faqsSection,
  url,
}: TokenSectionsProps) => {
  const token = useStorage((state) => state.token);
  const setToken = useStorage((state) => state.setToken);

  const [enabled, setEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const fetchInterval = 1000 * 60 * 20; // 20 minutes

  const { data, isLoading, isError } = useQuery<CoinGeckoTokenData>({
    queryKey: ["tokenMetrics"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/akash-network?tickers=true&market_data=true",
      );
      return response.json() as Promise<CoinGeckoTokenData>;
    },
    refetchInterval: fetchInterval,
    keepPreviousData: true,
    retry: true,
    enabled: enabled,
    initialData: token as CoinGeckoTokenData | undefined,
  });

  useEffect(() => {
    if (data && data.time !== token?.time) {
      const tokenData: TokenData = {
        time: new Date().getTime(),
      };
      setToken(tokenData);
    }

    if (!token) {
      setToken({ time: 0 });
    }
  }, [data, token, setToken]);

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

  return (
    <div className="flex flex-col gap-10">
      <TokenMetricsSection
        data={data}
        isLoading={isLoading}
        isError={isError}
      />

      <BuyAktButton className="mx-auto px-20" />
    </div>
  );
};

export default Sections;
