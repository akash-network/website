import { useEffect, useState } from "react";

import { IntlProvider } from "react-intl";
import { CustomPricingProvider } from "./CustomPricingContext";
import PriceChart from "./price-chart";
import PriceCompare from "./price-compare";
import { Pricing } from "./pricing";

export default function Index({ page, pathName }: any) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <div>
      <Layout page={page} pathName={pathName} />
    </div>
  );
}

function Layout({ page, pathName }: any) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    if (navigator?.language) {
      setLocale(navigator?.language);
    }
  }, []);

  return (
    <CustomPricingProvider>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <div className="space-y-10">
          <Pricing page={page} pathName={pathName} />
        </div>{" "}
      </IntlProvider>
    </CustomPricingProvider>
  );
}
