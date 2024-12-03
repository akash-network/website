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
  return (
    <div>
      <h2 className="text-center text-2xl font-semibold  md:text-2lg ">FAQs</h2>

      <div>
        <FAQ
          faqs={[
            {
              title: "What is the maximum and circulating supply of AKT?",
              description: `Akash has a maximum supply of   ${
                data?.market_data?.max_supply
                  ? data?.market_data?.max_supply
                      ?.toString()
                      ?.split(".")[0]
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "388,539,008"
              }, with      ${
                data?.market_data?.circulating_supply
                  ? data?.market_data?.circulating_supply
                      ?.toString()
                      ?.split(".")[0]
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "214,430,074"
              } AKT in circulation as of ${
                data
                  ? new Date(data?.market_data?.last_updated)?.toUTCString()
                  : "Sat Jan 7 07:57:36 UTC"
              }
        `,
            },
            {
              title: "What is the unlock schedule for the AKT token?",
              // markdown DessertIcon
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
