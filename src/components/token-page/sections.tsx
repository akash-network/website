import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import BuyingAkt from "./buying-akt-section";
import FaqSection from "./faq-section";
import TokenMetricsSection from "./token-metrics-section";
import { useStorage } from "@/utils/store";
import { useEffect, useState } from "react";

const Sections = ({
  aktFeaturesSection,
  buyingAKTSection,
  faqsSection,
}: {
  aktFeaturesSection: any;
  buyingAKTSection: any;
  faqsSection: any;
}) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Query
        aktFeaturesSection={aktFeaturesSection}
        buyingAKTSection={buyingAKTSection}
        faqsSection={faqsSection}
      />
    </QueryClientProvider>
  );
};

const Query = ({
  aktFeaturesSection,
  buyingAKTSection,
  faqsSection,
}: {
  aktFeaturesSection: any;
  buyingAKTSection: any;
  faqsSection: any;
}) => {
  const token = useStorage((state: any) => state?.token);
  const [enabled, setEnabled] = useState(false);
  const setToken = useStorage((state: any) => state?.setToken);
  console.log(
    new Date(token?.time ?? new Date().getTime()).toLocaleTimeString(),
  );
  // 20 mins
  const fetchInterval = 1000 * 60 * 20;
  console.log(fetchInterval);

  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tokenMetrics"],
    queryFn: async () => {
      const response: any = await fetch(
        "https://api.coingecko.com/api/v3/coins/akash-network?tickers=true&market_data=true",
      );
      return await response.json();
    },
    //mili seconds
    refetchInterval: fetchInterval,
    keepPreviousData: true,
    retry: true,
    enabled: enabled,

    initialData: token,
  });

  useEffect(() => {
    if (data) {
      setToken({
        ...data,
        time: new Date().getTime(),
      });
    }
  }, [data]);

  console.log(currentTime, enabled);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || currentTime - token?.time > fetchInterval) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [currentTime, token?.time]);

  return (
    <>
      <div id="token-metrics">
        <TokenMetricsSection
          data={data}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className="w-full">
        <div className="border-b"></div>
      </div>

      <div id="akt-features">
        <div className="mt-[40px] md:mt-[80px]">
          <div>
            <h2 className="text-2xl font-bold leading-9 md:text-2lg md:leading-10">
              {aktFeaturesSection.title}
            </h2>
            <p className="mt-4 text-base font-normal md:text-lg md:leading-[30px]">
              {aktFeaturesSection.description}
            </p>
          </div>

          <div className="mt-10">
            <img
              alt="Feature illustration"
              width={1200}
              height={1200}
              src={aktFeaturesSection.image.src}
              loading="lazy"
              className="dark:hidden"
            />
            <img
              alt="Feature illustration"
              width={1200}
              height={1200}
              src={
                aktFeaturesSection.darkImage.src ?? aktFeaturesSection.image.src
              }
              loading="lazy"
              className="hidden dark:block"
            />
          </div>

          <div className="mt-10">
            <div className="space-y-8">
              <p className="text-sm font-normal md:text-[18px]">
                The main features of AKT 2.0 are:
              </p>

              <ul className="ml-8 list-disc space-y-2 text-sm font-normal text-[#7F7F7F] md:text-[18px]">
                <li>
                  Take and Make Fees
                  <a
                    target="_blank"
                    className="font-medium text-primary"
                    href="https://www.mintscan.io/akash/proposals/224"
                  >
                    (Live now)
                  </a>
                </li>
                <li>
                  Stable Payment and Settlement
                  <a
                    target="_blank"
                    className="font-medium text-primary"
                    href="https://www.mintscan.io/akash/proposals/228"
                  >
                    (Live now)
                  </a>
                </li>
                <li>Incentive Distribution Pool</li>
                <li>Provider Subsidies</li>
                <li>Public Goods Fund</li>
              </ul>

              <p className="text-sm font-normal leading-normal md:text-[18px]">
                Read the specification and roadmap for AKT2.0{" "}
                <a
                  target="_blank"
                  className="font-medium text-primary"
                  href="https://github.com/akash-network/community/tree/main/sig-economics/akt20-prop"
                >
                  here
                </a>
                , and keep up with the latest developments in{" "}
                <a
                  target="_blank"
                  className="font-medium text-primary"
                  href=" https://github.com/akash-network/community/tree/main/sig-economics
                  "
                >
                  sig-economics
                </a>
                and
                <a
                  target="_blank"
                  className="font-medium text-primary"
                  href="https://github.com/orgs/akash-network/discussions/categories/economics"
                >
                  GitHub Discussions.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[40px] w-full md:mt-[80px]">
        <div className="border-b"></div>
      </div>

      <div id="buying-akt">
        <BuyingAkt buyingAKTSection={buyingAKTSection} />
      </div>

      <div id="faq">
        <FaqSection data={data} isLoading={isLoading} isError={isError} />
      </div>
    </>
  );
};

export default Sections;
