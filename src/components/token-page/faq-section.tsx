import { FAQ } from "./faq";

const FaqSection = ({
  data,
  isLoading,
  isError,
}: {
  data: any;
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
