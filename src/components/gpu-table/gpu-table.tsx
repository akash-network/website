import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
interface Gpus {
  availability: { total: number; available: number };
  models: Array<{
    vendor: string;
    model: string;
    ram: string;
    interface: string;
    availability: { total: number; available: number };
    providerAvailability: { total: number; available: number };
    price: { min: number; max: number; avg: number; med: number };
  }>;
}

const GpuTable = ({ initialData }: { initialData: any }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table initialData={initialData} />
    </QueryClientProvider>
  );
};

export default GpuTable;

const Table = ({ initialData }: { initialData: any }) => {
  const { data } = useQuery<Gpus, Error>({
    queryKey: ["GPU_TABLE"],
    queryFn: () =>
      axios.get("https://api-preview.cloudmos.io/internal/gpu-prices"),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    initialData: initialData,
  });
  console.log(data);

  return (
    <section className="container flex flex-col gap-8  pt-[80px]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:border-b md:pb-3">
        <h1 className="border-b pb-3 text-base font-medium md:border-b-0 md:pb-0 md:text-xl">
          GPU Models, Prices & Availability
        </h1>
        <div className="ml-auto flex items-center gap-2 ">
          <h2 className="text-xs font-medium text-iconText">
            Total Available GPUs
          </h2>
          <div className="rounded-md border p-2 shadow-sm ">
            <span className="text-sm font-bold">
              {data?.availability?.available || 0}
            </span>

            <span className="ml-2  text-xs text-iconText">
              (of {data?.availability?.total || 0})
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {data?.models?.map((model, index) => (
          <div
            key={index}
            className="flex flex-col gap-5  rounded-xl border bg-background2  p-3 shadow-sm"
          >
            <div className="flex  items-center gap-3 p-2 ">
              <img src="/logos/nvidia.png" alt="nvidia" className="h-6 " />
              <h1 className="text-2xl font-semibold">{model?.model}</h1>
            </div>
            <div className="h-px w-full bg-border"></div>
            <div className=" flex  flex-col gap-2">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-medium text-iconText">vRAM:</p>
                <p className="text-xs font-semibold">{model?.ram}</p>
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-medium text-iconText">Interface:</p>
                <p className="text-xs font-semibold">{model?.interface}</p>
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-medium text-iconText">
                  Availability:
                </p>
                <p className="">
                  <span className="text-sm  font-semibold text-foreground">
                    {model?.availability?.available}
                  </span>
                  <span className="pl-2 text-xs text-iconText">
                    (of {model?.availability?.total})
                  </span>
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-border"></div>
            <CustomHoverCard model={model} />
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table
          className="w-full border-separate border-spacing-y-1"
          cellSpacing={0}
        >
          <thead>
            <tr>
              <th className="pl-3 pr-2 text-left  text-xs font-medium text-iconText">
                Chipset
              </th>
              <th className="pl-3 pr-2 text-left  text-xs font-medium text-iconText">
                vRAM
              </th>
              <th className="pl-3  pr-2 text-left text-xs font-medium text-iconText">
                Interface
              </th>
              <th className="pl-3 pr-2 text-left  text-xs font-medium text-iconText">
                Availability
              </th>
              <th className="pl-3 pr-2 text-left  text-xs font-medium text-iconText">
                Price (USD)
              </th>
            </tr>
          </thead>
          <tbody className="mt-1 ">
            {data?.models?.map((model, index) => (
              <tr
                key={index}
                className=" overflow-hidden rounded-lg  bg-background2 shadow-sm"
              >
                <td className="rounded-l-lg border-y border-l px-6 py-2 text-lg  font-semibold ">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logos/nvidia.png"
                      alt="nvidia"
                      className="h-5 "
                    />
                    {model?.model}
                  </div>
                </td>

                <td className="border-y py-2 pl-3 pr-2 text-left text-xs font-medium text-para">
                  {model?.ram}
                </td>
                <td className="border-y py-2 pl-3 pr-2 text-left  text-xs font-medium text-para">
                  {model?.interface}
                </td>
                <td className="border-y  py-2 pl-3 pr-2 text-left">
                  <span className="text-sm  font-semibold text-foreground">
                    {model?.availability?.available}
                  </span>
                  <span className="pl-2 text-xs text-iconText">
                    (of {model?.availability?.total})
                  </span>
                </td>

                <td className="rounded-r-lg border-y border-r   pl-3 pr-2 ">
                  <CustomHoverCard model={model} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-para text-xs">
        *Disclaimer: The pricing displayed is determined by a dynamic bidding
        engine, where providers compete to offer their compute resources. These
        prices offer transparency and insight into the spectrum of pricing
        options available within the Akash marketplace. Please be aware that the
        prices displayed are subject to change based on real-time market
        conditions and individual provider offerings. As such, users are
        encouraged to review all available pricing information carefully and
        consider their specific requirements before making any decisions or
        commitments.
      </p>
    </section>
  );
};

const CustomHoverCard = ({ model }: { model: Gpus["models"][0] }) => {
  return (
    <div className="flex flex-col items-start gap-1 ">
      <div className="relative min-w-[170px] rounded-md border-x border-b px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-white/20 dark:from-background2 dark:to-background2/20"></div>
        Min: ${model?.price?.min}
      </div>
      <div className="flex w-full items-center justify-center gap-2.5 rounded-md bg-black px-2 py-1 md:w-auto">
        <div className="flex items-center gap-1">
          <HoverCard openDelay={2} closeDelay={2}>
            <HoverCardTrigger className="flex cursor-pointer items-center gap-1">
              <p className="">
                <span className="text-base text-para md:text-xs">Mid:</span>
                <span className="pl-1 text-base font-bold text-white  md:text-xs">
                  ${model?.price?.med}
                </span>
              </p>
              <Info size={12} className="text-para" />
            </HoverCardTrigger>
            <HoverCardContent align="center">
              <div className="flex flex-col">
                <div className="flex flex-col px-4 py-3">
                  <h1 className="text-xs font-medium ">
                    {model?.providerAvailability?.available || 0} providers
                    offering this <br /> model
                  </h1>
                  <div className="mt-4  flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-2xs text-iconText">Max:</h1>
                      <div className="text-xs font-bold ">
                        ${model?.price?.max}/h
                      </div>
                    </div>
                    <div className="h-5 w-px border-r "></div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-2xs text-iconText">Min:</h1>
                      <div className="text-xs font-bold ">
                        ${model?.price?.min}/h
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t bg-badgeColor px-4 py-3">
                  <p className="text-sm  text-para">Mid:</p>
                  <div className="text-sm font-semibold  ">
                    ${model?.price?.med}/h
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="h-4 w-px  bg-para"></div>
        <a
          href="https://console.akash.network/rent-gpu"
          target="_blank"
          className="text-base font-medium text-white md:text-xs"
        >
          Rent Now
        </a>
      </div>
      <div className=" relative min-w-[170px]  rounded-md border-x border-t px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        Max: ${model?.price?.max}
        <div className="absolute inset-0 bg-gradient-to-t from-white to-white/20 dark:from-background2 dark:to-background2/20"></div>
      </div>
    </div>
  );
};
