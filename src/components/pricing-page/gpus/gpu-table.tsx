import OFilter from "@/components/gpu-table/filter";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { gpus } from "@/utils/api";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import { Info } from "lucide-react";
import React from "react";
import { Skeleton } from "../../ui/skeleton";
import AvailabilityBar from "./availability-bar";
import DesktopTableGpu from "./desktop-table-gpu";
import Filter, { defaultFilters, type Filters } from "./filter";
import GpuAvailability from "./gpu-availability";
import Sort from "./sort";
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

const modelTexts: Record<string, string> = {
  rtx: "RTX ",
  gtx: "GTX ",
  ti: " Ti",
  ada: " Ada",
};

const formatText = (model: string) => {
  let formattedText = model;
  for (const key in modelTexts) {
    const regex = new RegExp(key, "gi");
    formattedText = formattedText.replace(regex, modelTexts[key]);
  }

  return formattedText;
};
export const modifyModel = (model: string) => {
  return model === "rtxa6000" ? "A6000" : formatText(model);
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
  const totalGpus =
    filteredData?.length > 0
      ? filteredData?.reduce(
          (prev, curr) => prev + (curr?.availability?.total ?? 0),
          0,
        )
      : data?.availability?.total || 0;

  const totalAvailableGpus =
    filteredData?.length > 0
      ? filteredData?.reduce(
          (prev, curr) => prev + (curr?.availability?.available ?? 0),
          0,
        )
      : data?.availability?.available || 0;

  return (
    <section
      className={clsx(
        " mx-auto flex w-full  !max-w-[1250px] flex-col gap-0 md:gap-4  ",
        subCom ? "" : "md:container",
      )}
    >
      <div className={clsx("hidden flex-col gap-10 xl:flex")}>
        <GpuAvailability
          totalGpus={totalGpus}
          totalAvailableGpus={totalAvailableGpus}
          isLoading={isLoading || false}
        />

        <Filter
          filters={filters}
          setFilters={setFilters}
          setFilteredData={setFilteredData}
          res={data}
        />
      </div>
      <div className="flex flex-col gap-1 xl:hidden">
        <p className="text-sm text-[#7E868C] md:text-base">
          Total Available GPUs
        </p>
        <div className="my-2 flex justify-between">
          <Card className="px-2 py-1">
            <span className="font-bold text-[#09090B] dark:text-[#EDEDED]">
              {totalAvailableGpus || 0}{" "}
            </span>
            <span className="text-sm text-[#71717A]">
              (of {totalGpus || 0})
            </span>
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
          "flex w-full flex-col gap-4",
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
                <div className="h-px w-full bg-defaultBorder"></div>
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
                <div className="h-px w-full bg-defaultBorder"></div>
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
              <Card className="my-2 flex w-full flex-col p-6" key={index}>
                <div className="flex items-center gap-3 ">
                  <div className="rounded-md border p-[14px_10px]">
                    <img
                      src="/logos/nvidia.png"
                      alt="nvidia"
                      className="h-4 w-6"
                    />
                  </div>
                  <div className="">
                    <p className="text-xl font-semibold capitalize text-foreground">
                      {modifyModel(model?.model)}
                    </p>
                    <p className="text-sm font-medium text-[#71717A] dark:text-[#E4E4EB]">
                      {model?.ram} {model?.interface}
                    </p>
                  </div>
                </div>

                <AvailabilityBar
                  available={model?.availability?.available}
                  total={model?.availability?.total}
                  className="my-0 border-y py-5"
                />

                <div className="flex flex-col  justify-center gap-1 border-b pb-6 pt-2">
                  <div className="flex justify-between border-b pb-1.5 text-lg">
                    <span className="text-lg font-semibold md:text-base">
                      Average price:
                    </span>
                    <span className="font-semibold">
                      {price(model?.price?.weightedAverage)}
                    </span>
                  </div>
                  <HoverCard openDelay={2} closeDelay={2}>
                    <HoverCardTrigger className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-[#71717A] dark:text-para">
                          Min: {price(model?.price?.min)}
                        </span>
                        <span className="text-sm font-medium text-[#71717A] dark:text-para">
                          -
                        </span>
                        <span className="text-sm font-medium text-[#71717A] dark:text-para">
                          Max: {price(model?.price?.max)}
                        </span>
                      </div>
                      <Info size={12} className="text-[#71717A]" />
                    </HoverCardTrigger>
                    <HoverCardContent align="center">
                      <div className="flex flex-col">
                        <div className="flex flex-col px-4 py-3">
                          <h2 className="text-sm font-medium text-black dark:text-white">
                            {model?.providerAvailability?.available || 0}{" "}
                            {model?.providerAvailability?.available > 1
                              ? "providers"
                              : "provider"}
                            <br />
                            offering this model:
                          </h2>
                          <div className="border-1 mt-3 rounded-md bg-[#F1F1F1] px-4 py-3 dark:bg-background ">
                            <div className="flex items-center  justify-between gap-2 border-b border-[#E4E4E7] pb-2 dark:border-defaultBorder">
                              <p className="text-4  text-base font-semibold text-foreground">
                                Avg price:
                              </p>
                              <div className="text-base font-bold  ">
                                {price(model?.price?.weightedAverage)}/hr
                              </div>
                            </div>
                            <div className="mt-2  flex items-center justify-between gap-2">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <h3 className="text-sm text-[#71717A] dark:text-para">
                                  Max:{" "}
                                  <span>{price(model?.price?.max)}/hr</span>
                                </h3>
                              </div>
                              <div className="">-</div>
                              <div className="flex flex-col items-center justify-center gap-1">
                                <h3 className="text-sm text-[#71717A] dark:text-para">
                                  Min:{" "}
                                  <span>{price(model?.price?.min)}/hr</span>
                                </h3>
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
                    className="inline-flex justify-center gap-1.5 rounded-md bg-foreground py-3 text-white hover:bg-primary dark:text-black dark:hover:text-inherit"
                  >
                    <p className="text-sm font-medium text-inherit">Rent Now</p>
                    <ArrowUpRightIcon className="w-[15px]" />
                  </a>
                </div>
              </Card>
            ))}
      </div>

      <DesktopTableGpu
        subCom={subCom || false}
        isLoading={isLoading || false}
        filteredData={filteredData}
      />
    </section>
  );
};
