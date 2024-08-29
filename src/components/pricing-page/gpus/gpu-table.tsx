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
import { gpus } from "@/utils/api";
import clsx from "clsx";
import Filter, { defaultFilters, type Filters } from "./filter";
import OFilter from "@/components/gpu-table/filter";
import Sort from "./sort";
import { Skeleton } from "../../ui/skeleton";
import CircularProgressBar from "./circular-progress-bar";
import AvailabilityBar from "./availability-bar";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import {
  Card,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";

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
  pathName,
  subCom,
  isLoading,
}: {
  data?: Gpus;
  pathName?: any;
  subCom?: boolean;
  isLoading?: boolean;
}) => {
  const [filteredData, setFilteredData] = React.useState<Gpus["models"]>([]);
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  console.log(filteredData)
  return (
    <section
      className={clsx(
        " mx-auto flex flex-col xl:flex-row max-w-[1380px] gap-0 md:gap-10 ",
        subCom ? "" : "md:container",
      )}
    >
      <div
        className={clsx(
          "hidden xl:flex flex-col gap-10"
        )}
      >
        <div className="rounded-md border p-5 shadow-sm  flex gap-8 items-center justify-between mt-8 w-[274px] bg-background2">
          <div className="flex flex-col gap-5">
            <div className="">
              <h2 className="text-sm font-medium text-linkText">
                Total GPUs
              </h2>
              {
                isLoading ?
                  <Skeleton className="h-8 w-20" />
                  :
                  <p className="text-2xl font-bold text-foreground">{data?.availability?.total || 0}</p>
              }
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 w-full">
                <div className="w-3 h-2 rounded-[3px] bg-[#FFD9DB]"></div>
                {
                  isLoading ?
                    <Skeleton className="h-[10px] w-10" />
                    :
                    <p className="text-[10px] font-medium text-foreground"><span className="font-bold">{((data?.availability?.available || 0) / (data?.availability?.total || 1) * 100).toFixed(2)}</span>% Available</p>
                }
              </div>
              <div className="flex items-center gap-1 w-full">
                <div className="w-3 h-2 rounded-[3px] bg-primary"></div>
                {
                  isLoading ?
                    <Skeleton className="h-[10px] w-10" />
                    :
                    <p className="text-[10px] font-medium text-foreground"><span className="font-bold">{(100 - ((data?.availability?.available || 0) / (data?.availability?.total || 1) * 100)).toFixed(2)}</span>% Used</p>
                }
              </div>
            </div>
          </div>
          <CircularProgressBar
            diameter={80}
            strokeWidth={15}
            progressValue={((data?.availability?.available || 0) / (data?.availability?.total || 1) * 100)}
            gapSize={1.5}
          />
        </div>
        <div className="flex gap-4">
          <Filter
            filters={filters}
            setFilters={setFilters}
            setFilteredData={setFilteredData}
            res={data}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 xl:hidden">
        <p className="text-sm md:text-base text-[#7E868C]">Total Available GPUs</p>
        <div className="flex justify-between my-2">
          <Card className="px-2 py-1">
            <span className="text-[#09090B] font-bold dark:text-[#EDEDED]">{data?.availability?.total || 0} </span>
            <span className="text-sm text-[#71717A]">(of {data?.availability?.available || 0})</span>
          </Card>
          <div className="flex gap-1">
            <OFilter
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
          "flex flex-col w-full gap-4",
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
                <div className="rounded-x-md relative min-w-[170px]  rounded-md border px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="rounded-x-md relative min-w-[170px]  rounded-md border px-2 py-1 text-sm font-medium md:min-w-[100px] md:text-xs">
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))
          : filteredData?.map((model, index) => (
            <Card className="flex flex-col w-full p-6 my-3" key={index}>
              <div className="flex items-center gap-3 pb-5">
                <div className="p-[14px_10px] border rounded-md">
                  <img
                    src="/logos/nvidia.png"
                    alt="nvidia"
                    className="w-6 h-4"
                  />
                </div>
                <div className="">
                  <p className="text-xl font-semibold capitalize text-foreground">{modifyModel(model?.model)}</p>
                  <p className="text-sm font-medium text-[#71717A] dark:text-[#E4E4EB]">{model?.ram} {model?.interface}</p>
                </div>
              </div>

              <AvailabilityBar available={model?.availability?.available} total={model?.availability?.total} className="border-y my-0 py-5" />

              <div className="flex flex-col justify-center py-6 border-b">
                <div className="flex justify-between border-b text-lg">
                  <span className="font-semibold">
                    Average price:
                  </span>
                  <span className="font-semibold">
                    ${model?.price?.avg || 0}
                  </span>
                </div>
                <HoverCard openDelay={2} closeDelay={2}>
                  <HoverCardTrigger className="pt-1.5 flex justify-between items-center">
                    <div className="flex justify-center gap-1 items-center">
                      <span className="text-sm font-medium text-[#71717A]">
                        Min: ${model?.price?.min || 0}
                      </span>
                      <span className="text-sm font-medium text-[#71717A]">
                        -
                      </span>
                      <span className="text-sm font-medium text-[#71717A]">
                        Max: ${model?.price?.max || 0}
                      </span>
                    </div>
                    <Info size={12} className="text-[#71717A]" />
                  </HoverCardTrigger>
                  <HoverCardContent align="center">
                    <div className="flex flex-col">
                      <div className="flex flex-col px-4 py-3">
                        <h1 className="text-sm font-medium text-black dark:text-white">
                          {model?.providerAvailability?.available || 0} {model?.providerAvailability?.available > 1 ? "providers" : "provider"}
                          <br />
                          offering this model:
                        </h1>
                        <div className="mt-3 rounded-md border-1 bg-[#F1F1F1] px-4 py-3 ">
                          <div className="flex items-center  justify-between gap-2 pb-2 border-b border-[#E4E4E7]">
                            <p className="text-base  font-semibold text-4 text-black">Avg price:</p>
                            <div className="text-base font-bold  ">
                              {price(model?.price?.weightedAverage)}/hr
                            </div>
                          </div>
                          <div className="mt-2  flex items-center justify-between gap-2">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <h1 className="text-sm text-[#71717A] ">Max: <span>{price(model?.price?.max)}/hr</span></h1>
                            </div>
                            <div className="">-</div>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <h1 className="text-sm text-[#71717A] ">Min: <span>{price(model?.price?.min)}/hr</span></h1>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="flex flex-col justify-center pt-6">
                <a
                  id={`${model?.model}-(gpu-rent)`}
                  href={`https://console.akash.network/rent-gpu?vendor=${model?.vendor}&gpu=${model?.model}&interface=${model?.interface}&vram=${model?.ram}`}
                  target="_blank"
                  className="rounded-md bg-foreground py-3 inline-flex justify-center gap-1.5 hover:bg-primary text-white dark:text-black dark:hover:text-inherit"
                >
                  <p className="text-sm font-medium text-inherit">Rent Now</p>
                  <ArrowUpRightIcon className="w-[15px]" />
                </a>
              </div>
            </Card>
          ))}
      </div>

      <div
        className={clsx(
          "hidden overflow-x-auto w-full",
          subCom ? "lg:block" : "md:block",
        )}
      >
        <table
          className={clsx(
            "w-full  border-separate border-spacing-y-2.5 ",
            subCom ? "" : "",
          )}
          cellSpacing={0}
        >
          <thead>
            <tr className="w-full">
              <th className="w-[26%] px-2 text-left text-sm  font-medium tracking-normal  text-linkText ">
                Chipset
              </th>
              <th className="w-[26%] px-2 text-left  text-sm font-medium tracking-normal text-linkText">
                Availability
              </th>
              <th className="w-[26%] pr-2 text-left  text-sm font-medium whitespace-nowrap tracking-normal text-linkText ">
                Price (USD)
              </th>
              <th className=""></th>
            </tr>
          </thead>
          <tbody className="mt-1">
            {isLoading
              ? new Array(10).fill(0).map((_, index) => (
                <tr
                  key={index}
                  className="border overflow-hidden rounded-lg  bg-background2 shadow-sm"
                >
                  <td
                    className=
                    " rounded-l-lg  border-l text-base font-semibold xl:text-lg w-[24%] p-4"
                  >
                    <div className="flex items-center gap-3 capitalize">
                      <Skeleton className="h-5 w-7" />
                      <div className="">
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-5 w-20 mt-1" />
                      </div>
                    </div>
                  </td>

                  <td className=" w-[27.2%] pr-8">
                    <div className=" flex justify-between items-center">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </td>
                  <td className="w-[27.2%] pl-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="pt-1.5 flex justify-between items-center">
                      <Skeleton className="h-5 w-16"></Skeleton>
                      <Skeleton className="h-5 w-16"></Skeleton>
                      <Skeleton className="h-3 w-3"></Skeleton>
                    </div>
                  </td>
                  <td className="text-center px-8 border-r rounded-r-lg">
                    <Skeleton className="h-8 w-24 mx-auto" />
                  </td>
                </tr>
              ))
              : filteredData?.map((model, index) => (
                <tr
                  key={index}
                  className="overflow-hidden bg-background2 rounded-lg outline-none border-none shadow-sm"
                >
                  <td
                    className="rounded-l-lg border-l border-y text-base font-semibold xl:text-lg w-[24%]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-[11px_5px] ml-6 border rounded-md">
                        <img
                          src="/logos/nvidia.png"
                          alt="nvidia"
                          className="w-6 h-4"
                        />
                      </div>
                      <div className="">
                        <p className="text-xl font-semibold capitalize text-foreground">{modifyModel(model?.model)}</p>
                        <p className="text-sm font-medium text-[#71717A]">{model?.ram} {model?.interface}</p>
                      </div>
                    </div>
                  </td>
                  <td className="w-[27.2%] border-y px-2 xl:px-8">
                    <AvailabilityBar available={model?.availability?.available} total={model?.availability?.total} />
                  </td>
                  <td className="w-[27.2%] border-y px-2 xl:px-8">
                    <div className="flex justify-between border-b text-lg">
                      <span className="font-semibold">
                        Average price:
                      </span>
                      <span className="font-semibold">
                        ${model?.price?.avg || 0}
                      </span>
                    </div>
                    <HoverCard openDelay={2} closeDelay={2}>
                      <HoverCardTrigger className="pt-1.5 flex justify-between items-center">
                        <span className="text-sm font-medium text-[#71717A]">
                          Min: ${model?.price?.min || 0}
                        </span>
                        <span className="text-sm font-medium text-[#71717A]">
                          -
                        </span>
                        <span className="text-sm font-medium text-[#71717A]">
                          Max: ${model?.price?.max || 0}
                        </span>
                        <Info size={12} className="text-[#71717A]" />
                      </HoverCardTrigger>
                      <HoverCardContent align="center">
                        <div className="flex flex-col">
                          <div className="flex flex-col px-4 py-3">
                            <h1 className="text-sm font-medium text-black dark:text-white">
                              {model?.providerAvailability?.available || 0} {model?.providerAvailability?.available > 1 ? "providers" : "provider"}
                              <br />
                              offering this model:
                            </h1>
                            <div className="mt-3 rounded-md border-1 bg-[#F1F1F1] dark:bg-background px-4 py-3 ">
                              <div className="flex items-center  justify-between gap-2 pb-2 border-b border-[#E4E4E7]">
                                <p className="text-base  font-semibold text-4 text-black dark:text-white">Avg price:</p>
                                <div className="text-base font-bold  ">
                                  {price(model?.price?.weightedAverage)}/hr
                                </div>
                              </div>
                              <div className="mt-2  flex items-center justify-between gap-2">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <h1 className="text-sm text-[#71717A] ">Max: <span>{price(model?.price?.max)}/hr</span></h1>
                                </div>
                                <div className="">-</div>
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <h1 className="text-sm text-[#71717A] ">Min: <span>{price(model?.price?.min)}/hr</span></h1>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </td>
                  <td className="rounded-r-lg border-r border-y text-center px-2 xl:px-8">
                    <a
                      id={`${model?.model}-(gpu-rent)`}
                      href={`https://console.akash.network/rent-gpu?vendor=${model?.vendor}&gpu=${model?.model}&interface=${model?.interface}&vram=${model?.ram}`}
                      target="_blank"
                      className="rounded-md bg-foreground py-2 px-4 inline-flex gap-1.5 hover:bg-primary text-white dark:text-black dark:hover:text-inherit"
                    >
                      <p className="text-sm font-medium text-inherit">Rent Now</p>
                      <ArrowUpRightIcon className="w-[15px]" />
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section >
  );
};

const CustomHoverCard = ({ model }: { model: Gpus["models"][0] }) => {
  return (
    <div className="flex flex-col items-start gap-1">
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
