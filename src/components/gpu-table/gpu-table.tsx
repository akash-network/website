import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { gpus } from "@/utils/api";
import clsx from "clsx";
import CheckBox from "./checkbox";
import Filter, { defaultFilters, type Filters } from "./filter";
import Sort from "./sort";
import { useStorage } from "@/utils/store";
import { Skeleton } from "../ui/skeleton";
export interface Gpus {
  availability: { total: number; available: number };
  models: Array<{
    vendor: string;
    model: string;
    ram: string;
    interface: string;
    availability: { total: number; available: number };
    providerAvailability: { total: number; available: number };
    price: {
      min: number;
      max: number;
      avg: number;
      med: number;
      weightedAverage: number;
    };
  }>;
  time?: number;
}

const GpuTable = ({
  initialData,
  subCom,
}: {
  initialData?: any;
  subCom?: boolean;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table
        initialData={{
          data: initialData,
        }}
        subCom={subCom}
      />
    </QueryClientProvider>
  );
};

export default GpuTable;

const Table = ({
  initialData,
  subCom,
}: {
  initialData?: {
    data: any;
  };
  subCom?: boolean;
}) => {
  const fetchInterval = 1000 * 60;

  const {
    data: result,
    isLoading,
    isFetching,
    isInitialLoading,
  } = useQuery<
    {
      data: Gpus;
    },
    Error
  >({
    queryKey: ["GPU_TABLE"],
    queryFn: () => axios.get(gpus),
    refetchIntervalInBackground: true,

    refetchInterval: fetchInterval,
  });

  const data = result?.data;

  return (
    <Tables
      data={data}
      subCom={subCom}
      isLoading={isLoading || isInitialLoading}
    />
  );
};

export const modifyModel = (model: string) => {
  return model === "rtxa6000"
    ? "A6000"
    : model?.includes("rtx")
    ? model?.replace("rtx", "RTX ").replace("ti", " Ti")
    : model;
};

export const price = (price: number) => {
  return price ? `$${price?.toFixed(2)}` : "--";
};

export const Tables = ({
  data,
  subCom,
  isLoading,
}: {
  data?: Gpus;
  subCom?: boolean;
  isLoading?: boolean;
}) => {
  const [filteredData, setFilteredData] = React.useState<Gpus["models"]>([]);
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  console.log(filteredData);

  return (
    <section
      className={clsx(
        " mx-auto flex max-w-[1080px]  flex-col gap-8 ",
        subCom ? "" : "container pt-[80px]",
      )}
    >
      <h1
        className={clsx(
          " text-lg font-medium ",
          subCom ? "md:text-xl " : "  md:text-xl",
        )}
      >
        GPU Availability and Pricing
      </h1>
      <div className="flex flex-col gap-4 ">
        <div
          className={clsx(
            "flex flex-col justify-between gap-8 ",
            subCom
              ? "border-b pb-4 lg:flex-row lg:items-center"
              : "border-b pb-4 md:flex-row md:items-center",
          )}
        >
          <div className="  flex items-center gap-2   ">
            <h2 className="text-sm font-medium text-linkText">
              Total Available GPUs
            </h2>
            <div className="rounded-md border p-2 shadow-sm ">
              <span className="text-base font-bold">
                {filteredData?.length > 0
                  ? filteredData?.reduce(
                      (prev, curr) =>
                        prev + (curr?.availability?.available ?? 0),
                      0,
                    )
                  : data?.availability?.available || 0}
              </span>

              <span className="ml-2  text-sm text-linkText">
                (of{" "}
                {filteredData?.length > 0
                  ? filteredData?.reduce(
                      (prev, curr) => prev + (curr?.availability?.total ?? 0),
                      0,
                    )
                  : data?.availability?.total || 0}
                )
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <Filter
              filters={filters}
              setFilters={setFilters}
              setFilteredData={setFilteredData}
              res={data}
            />
            <Sort
              setFilteredData={setFilteredData}
              res={data}
              filters={filters}
            />
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "flex flex-col gap-4 ",
          subCom ? "lg:hidden" : "md:hidden",
        )}
      >
        {/* //most availability at top */}

        {isLoading
          ? new Array(10).fill(0).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-5  rounded-xl border bg-background2  p-3 shadow-sm"
              >
                <div className="flex  items-center gap-3 p-2 ">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="h-px w-full bg-border"></div>
                <div className=" flex  flex-col gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="h-px w-full bg-border"></div>
                <div className="flex flex-col items-start gap-1 ">
                  <div className="rounded-x-md relative min-w-[170px]  rounded-b-md border-x border-b px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex  w-full items-center justify-center gap-2.5   rounded-md bg-black px-2 py-2 dark:bg-[#EDEDED] md:w-auto ">
                    <div className="flex items-center gap-1">
                      <HoverCard openDelay={2} closeDelay={2}>
                        <HoverCardTrigger className="flex cursor-pointer items-center gap-1">
                          <p className="flex items-center">
                            <span className="text-base text-[#D7DBDF] dark:text-[#3E3E3E] md:text-xs">
                              Avg:
                            </span>
                            <span className="pl-1 text-base font-bold text-white dark:text-black  md:text-xs">
                              <Skeleton className="h-5 w-20" />
                            </span>
                          </p>
                          <Info
                            size={12}
                            className="text-[#D7DBDF] dark:text-[#3E3E3E]"
                          />
                        </HoverCardTrigger>
                      </HoverCard>
                    </div>
                  </div>

                  <div className="rounded-x-md relative min-w-[170px]  rounded-t-md border-x border-t px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))
          : filteredData?.map((model, index) => (
              <div
                key={index}
                className="flex flex-col gap-5  rounded-xl border bg-background2  p-3 shadow-sm"
              >
                <div className="flex  items-center gap-3 p-2 ">
                  <img src="/logos/nvidia.png" alt="nvidia" className="h-6 " />
                  <h1 className="text-2xl font-semibold capitalize">
                    {modifyModel(model?.model)}
                  </h1>
                </div>
                <div className="h-px w-full bg-border"></div>
                <div className=" flex  flex-col gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-iconText">vRAM:</p>
                    <p className="text-xs font-semibold">{model?.ram}</p>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-iconText">
                      Interface:
                    </p>
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

      <div
        className={clsx(
          "hidden overflow-x-auto ",
          subCom ? "lg:block" : "md:block",
        )}
      >
        <table
          className={clsx(
            "w-full  border-separate border-spacing-y-1.5 ",
            subCom ? "" : "",
          )}
          cellSpacing={0}
        >
          <thead>
            <tr>
              <th className="px-2 text-left text-sm  font-medium tracking-normal  text-linkText">
                Chipset
              </th>
              <th className="px-2 text-left  text-sm font-medium tracking-normal text-linkText">
                vRAM
              </th>
              <th className="px-2 text-left text-sm font-medium tracking-normal text-linkText">
                Interface
              </th>
              <th className="px-2 text-left  text-sm font-medium tracking-normal text-linkText">
                Availability
              </th>
              <th className="pr-2 text-left  text-sm font-medium tracking-normal text-linkText ">
                Price (USD/hr)
              </th>
            </tr>
          </thead>
          <tbody className="mt-1 ">
            {isLoading
              ? new Array(10).fill(0).map((_, index) => (
                  <tr
                    key={index}
                    className=" overflow-hidden rounded-lg  bg-background2 shadow-sm"
                  >
                    <td
                      className={clsx(
                        " rounded-l-lg  border-y border-l px-2 py-2 text-base font-semibold  xl:px-4  xl:text-lg",
                        subCom
                          ? "w-[30%] lg:w-[27%] xl:w-[35%] 2xl:w-[38%] "
                          : "w-[30%] lg:w-[38%] xl:w-[39%]",
                      )}
                    >
                      <div className="flex items-center gap-3 capitalize">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </td>

                    <td className=" w-[14%]  border-y px-2 py-2 text-left text-sm font-medium text-para">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className=" w-[14%] border-y px-2 py-2 text-left  text-sm font-medium text-para">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="w-[14%]  border-y px-2 py-2 text-left">
                      <p className="flex items-center gap-1.5">
                        <Skeleton className="h-5 w-20" />
                      </p>
                    </td>

                    <td className="  rounded-r-lg border-y border-r   pr-2 ">
                      <div className="flex flex-col items-start gap-1 ">
                        <div className="rounded-x-md relative min-w-[170px]  rounded-b-md border-x border-b px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="flex  w-full items-center justify-center gap-2.5   rounded-md bg-black px-2 py-2 dark:bg-[#EDEDED] md:w-auto ">
                          <div className="flex items-center gap-1">
                            <HoverCard openDelay={2} closeDelay={2}>
                              <HoverCardTrigger className="flex cursor-pointer items-center gap-1">
                                <p className="flex items-center">
                                  <span
                                    className="dark:text-[#3 E3E3E] text-base
                        text-[#D7DBDF] md:text-xs"
                                  >
                                    Avg:
                                  </span>
                                  <span className="pl-1 text-base font-bold text-white dark:text-black  md:text-xs">
                                    <Skeleton className="h-5 w-20" />
                                  </span>
                                </p>
                                <Info
                                  size={12}
                                  className="text-[#D7DBDF] dark:text-[#3E3E3E]"
                                />
                              </HoverCardTrigger>
                            </HoverCard>
                          </div>
                        </div>
                        <div className="rounded-x-md relative min-w-[170px]  rounded-t-md border-x border-t px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              : filteredData?.map((model, index) => (
                  <tr
                    key={index}
                    className=" overflow-hidden rounded-lg  bg-background2 shadow-sm"
                  >
                    <td
                      className={clsx(
                        " rounded-l-lg  border-y border-l px-2 py-2 text-base font-semibold  xl:px-4  xl:text-lg",
                        subCom
                          ? "w-[30%] lg:w-[27%] xl:w-[35%] 2xl:w-[38%] "
                          : "w-[30%] lg:w-[38%] xl:w-[39%]",
                      )}
                    >
                      <div className="flex items-center gap-3 capitalize">
                        <img
                          src="/logos/nvidia.png"
                          alt="nvidia"
                          className="h-5 "
                        />
                        {modifyModel(model?.model)}
                      </div>
                    </td>

                    <td className=" w-[14%]  border-y px-2 py-2 text-left text-sm font-medium text-para">
                      {model?.ram}
                    </td>
                    <td className=" w-[14%] border-y px-2 py-2 text-left  text-sm font-medium text-para">
                      {model?.interface}
                    </td>
                    <td className="w-[14%]  border-y px-2 py-2 text-left">
                      <p className="flex items-center gap-1.5">
                        <span className="text-sm  font-semibold text-foreground">
                          {model?.availability?.available}
                        </span>
                        <span className=" text-xs text-iconText">
                          (of {model?.availability?.total})
                        </span>
                      </p>
                    </td>

                    <td className="  rounded-r-lg border-y border-r   pr-2 ">
                      <CustomHoverCard model={model} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-linkText">
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
      <div className="rounded-x-md relative min-w-[170px]  rounded-b-md border-x border-b px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        {/* <div className="absolute inset-0 bg-gradient-to-b from-white to-white/20 dark:from-background2 dark:to-background2/20"></div> */}
        Min: {price(model?.price?.min)}
      </div>
      <div className="flex  w-full items-center justify-center gap-2.5   rounded-md bg-black px-2 py-2 dark:bg-[#EDEDED] md:w-auto ">
        <div className="flex items-center gap-1">
          <HoverCard openDelay={2} closeDelay={2}>
            <HoverCardTrigger className="flex cursor-pointer items-center gap-1">
              <p className="flex items-center">
                <span className="text-base text-[#D7DBDF] dark:text-[#3E3E3E] md:text-xs">
                  Avg:
                </span>
                <span className="pl-1 text-base font-bold text-white dark:text-black  md:text-xs">
                  {price(model?.price?.weightedAverage)}
                </span>
              </p>
              <Info size={12} className="text-[#D7DBDF] dark:text-[#3E3E3E]" />
            </HoverCardTrigger>
            <HoverCardContent align="center">
              <div className="flex flex-col">
                <div className="flex flex-col px-4 py-3">
                  <h1 className="text-sm font-medium ">
                    {model?.providerAvailability?.available || 0} providers{" "}
                    <br />
                    offering this model
                  </h1>
                  <div className="mt-4  flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-xs text-iconText">Max:</h1>
                      <div className="text-base font-bold ">
                        {price(model?.price?.max)}/hr
                      </div>
                    </div>
                    <div className="h-8 w-px border-r "></div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <h1 className="text-xs text-iconText">Min:</h1>
                      <div className="text-base font-bold ">
                        {price(model?.price?.min)}/hr
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center  justify-between gap-2 rounded-b-md border-t bg-badgeColor px-4 py-3">
                  <p className="text-base  text-para">Avg:</p>
                  <div className="text-base font-bold  ">
                    {price(model?.price?.weightedAverage)}/hr
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="h-4 w-px  bg-para"></div>
        <a
          id={`${model?.model}-(gpu-rent)`}
          href={`https://console.akash.network/rent-gpu?vendor=${model?.vendor}&gpu=${model?.model}&interface=${model?.interface}&vram=${model?.ram}`}
          target="_blank"
          className=" text-base font-medium text-white dark:text-black md:text-xs"
        >
          Rent Now
        </a>
      </div>
      <div className=" rounded-x-md relative min-w-[170px]  rounded-t-md border-x border-t px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
        Max: {price(model?.price?.max)}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-white to-white/20 dark:from-background2 dark:to-background2/20"></div> */}
      </div>
    </div>
  );
};
