import { useStorage } from "@/utils/store";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import BuyingAkt from "./buying-akt-section";
import FaqSection from "./faq-section";
import TokenMetricsSection from "./token-metrics-section";

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

  const fetchInterval = 1000 * 60 * 20;

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tokenMetrics"],
    queryFn: async () => {
      const response: any = await fetch(
        "https://api.coingecko.com/api/v3/coins/akash-network?tickers=true&market_data=true",
      );
      return await response.json();
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
      setToken({
        time: 0,
      });
    }
  }, [data]);

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
  }, [currentTime, token]);

  return (
    <>
      <TokenMetricsSection
        data={data}
        isLoading={isLoading}
        isError={isError}
      />

      <div className="border-b"></div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
        <div className="flex-1">
          <div>
            <h2 className="text-2xl font-semibold  md:text-2lg ">
              {aktFeaturesSection.title}
            </h2>
            <p className="mt-4 text-sm font-normal md:text-base  ">
              {aktFeaturesSection.description}
            </p>
          </div>

          <div className="mt-8">
            <div className="space-y-4">
              <p className=" text-sm font-normal md:text-base">
                The main features of AKT 2.0 are:
              </p>

              <ul className="ml-5 list-disc space-y-2  text-sm font-normal text-para md:text-base">
                <li>
                  Take and Make Fees{" "}
                  <a
                    target="_blank"
                    className="font-medium text-primary"
                    href="https://www.mintscan.io/akash/proposals/224"
                  >
                    (Live now)
                  </a>
                </li>
                <li>
                  Stable Payment and Settlement{" "}
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

              <p className=" text-sm font-normal leading-normal md:text-base">
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
        <div className="flex-1">
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
      </div>

      <div className="border-b"></div>

      <BuyingAkt buyingAKTSection={buyingAKTSection} />
      <div className="border-b"></div>
      <FaqSection data={data} isLoading={isLoading} isError={isError} />
    </>
  );
};

export default Sections;
