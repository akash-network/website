import { useEffect, useState } from "react";

import { IntlProvider } from "react-intl";
import { CustomPricingProvider } from "./CustomPricingContext";
import PriceChart from "./price-chart";
import PriceCompare from "./price-compare";
import { Pricing } from "./pricing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { PricingDashboardProps } from "@/types/pricing";

export default function Index({ page, pathName, initialData }: PricingDashboardProps) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <div>
      <Layout page={page} pathName={pathName} initialData={initialData} />
    </div>
  );
}

function Layout({ page, pathName, initialData }: PricingDashboardProps) {
  const [locale, setLocale] = useState("en-US");
  const queryClient = new QueryClient();
  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <CustomPricingProvider>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <QueryClientProvider client={queryClient}>
          <div className="space-y-10">
            <Pricing
              page={page}
              pathName={pathName}
              initialData={initialData}
            />
          </div>{" "}
        </QueryClientProvider>
      </IntlProvider>
    </CustomPricingProvider>
  );
}
