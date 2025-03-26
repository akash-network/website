import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { ArrowUpCircle, Info } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../../ui/skeleton";
import AvailabilityBar from "./availability-bar";
import type { Gpus } from "./gpu-table";
import { modifyModel, price } from "./gpu-table";

const DesktopTableGpu = ({
  subCom,
  isLoading,
  filteredData,
}: {
  subCom: boolean;
  isLoading: boolean;
  filteredData: Gpus["models"];
}) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  return (
    <div
      className={clsx(
        "hidden w-full overflow-x-auto",
        subCom ? "lg:block" : "md:block",
      )}
    >
      <table
        className={clsx(
          "w-full  border-separate border-spacing-y-3 ",
          subCom ? "" : "",
        )}
        cellSpacing={0}
      >
        <thead>
          <tr className="w-full">
            <th className="w-[22%] pr-2 text-left text-sm font-medium tracking-normal text-linkText">
              GPU Model
            </th>
            <th className="w-[30%] px-2 text-left text-sm font-medium tracking-normal text-linkText xl:pl-6">
              Availability
            </th>
            <th className="w-[16%] whitespace-nowrap px-2 text-left text-sm font-medium tracking-normal text-linkText xl:pl-6">
              Price Range
            </th>
            <th className="w-[13%] whitespace-nowrap px-2 text-left text-sm font-medium tracking-normal text-linkText xl:pl-6">
              <p className="relative w-min text-linkText">
                Avg. Price
                <span className="absolute left-full ml-1"> per hour</span>
              </p>
            </th>
            <th className="w-[10%]"></th>
          </tr>
        </thead>
        <tbody className="mt-1">
          {isLoading
            ? new Array(10).fill(0).map((_, index) => (
                <tr
                  key={index}
                  className="overflow-hidden rounded-lg border-none bg-background2 shadow-sm outline-none"
                >
                  <td className="rounded-l-lg border-y border-l border-r text-base font-semibold xl:text-lg">
                    <div className="flex items-center gap-4">
                      <div className="ml-3 flex aspect-square w-11 items-center justify-center rounded-md border">
                        <Skeleton className="h-4 w-6" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <Skeleton className="h-6 w-32 lg:h-7 lg:w-40" />
                        <div className="flex gap-1">
                          <Skeleton className="h-5 w-14 rounded border" />
                          <Skeleton className="h-5 w-14 rounded border" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-y border-r px-2 xl:px-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full rounded-full" />
                    </div>
                  </td>
                  <td className="border-y border-r p-0">
                    <div className="flex h-full flex-col divide-y divide-defaultBorder">
                      <div className="h-full py-2 text-center">
                        <Skeleton className="mx-auto h-5 w-24" />
                      </div>
                      <div className="py-2 text-center">
                        <Skeleton className="mx-auto h-5 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="border-y border-r px-4">
                    <div className="relative flex items-center justify-center gap-1 py-2">
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="absolute -right-2 -top-2 h-4 w-4 rounded-full" />
                    </div>
                  </td>
                  <td className="rounded-r-lg border-y border-r px-2 text-center xl:px-4">
                    <div className="flex items-center justify-center">
                      <Skeleton className="h-6 w-24 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))
            : filteredData?.map((model, index) => (
                <tr
                  key={index}
                  className=" overflow-hidden rounded-lg border-none bg-background2 shadow-sm outline-none transition-all hover:bg-[#FBFBFB] hover:shadow dark:hover:bg-background2/70"
                  onMouseEnter={() => setHoveredRowIndex(index)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                >
                  <td className="rounded-l-lg border-y border-l border-r text-base font-semibold xl:text-lg">
                    <div className=" flex gap-4 ">
                      <div className="ml-3 flex aspect-square w-11 shrink-0 items-center justify-center rounded-md border ">
                        <img
                          src="/logos/nvidia.png"
                          alt="nvidia"
                          className="h-4 w-6"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-base font-semibold capitalize text-foreground ">
                          {modifyModel(model?.model)}
                        </p>
                        <div className="flex gap-1">
                          <p className="rounded border px-1.5 py-0.5 text-xs font-medium text-cardGray dark:text-para">
                            {model?.ram}
                          </p>
                          <p className="rounded border px-1.5 py-0.5 text-xs font-medium text-cardGray dark:text-para">
                            {model?.interface}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-y border-r px-2 xl:px-6">
                    <AvailabilityBar
                      available={model?.availability?.available}
                      total={model?.availability?.total}
                    />
                  </td>
                  <td className="border-y border-r p-0">
                    <div className="flex h-full flex-col divide-y divide-defaultBorder">
                      <p className="h-full py-2 text-center text-sm text-cardGray dark:text-para">
                        Min:{" "}
                        <span className="ml-1 font-medium">
                          {price(model?.price?.min)}
                        </span>
                      </p>

                      <p className="py-2 text-center text-sm text-cardGray dark:text-para">
                        Max:{" "}
                        <span className="ml-1 font-medium">
                          {price(model?.price?.max)}
                        </span>
                      </p>
                    </div>
                  </td>
                  <td className="border-y border-r px-4">
                    <HoverCard openDelay={2} closeDelay={2}>
                      <HoverCardTrigger className="relative flex items-center justify-center gap-1 py-2 text-base">
                        <span className="text-lg font-semibold">
                          {price(model?.price?.avg)}
                        </span>
                        <Info
                          size={16}
                          className="absolute -right-2 -top-2 text-[#DADADB] dark:text-para"
                        />
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
                              <div className="flex items-center justify-between gap-2 border-b border-[#E4E4E7] pb-2 dark:border-defaultBorder">
                                <p className="text-4 text-base font-semibold text-black dark:text-white">
                                  Avg price:
                                </p>
                                <div className="text-base font-bold">
                                  {price(model?.price?.weightedAverage)}/hr
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2">
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
                  </td>
                  <td className="rounded-r-lg border-y border-r px-2 text-center xl:px-4">
                    <div className="flex items-center justify-center">
                      <a
                        id={`${model?.model}-(gpu-rent)`}
                        // href={`https://console.akash.network/rent-gpu?vendor=${model?.vendor}&gpu=${model?.model}&interface=${model?.interface}&vram=${model?.ram}`}
                        href="https://console.akash.network/new-deployment"
                        target="_blank"
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2 py-[1px] font-medium  shadow-sm transition-all duration-300 hover:border-black hover:bg-black hover:text-white  md:px-2 lg:px-3",
                          hoveredRowIndex === index
                            ? "!border-black bg-black text-white "
                            : "text-[#71717A] dark:text-para",
                        )}
                      >
                        <p className="whitespace-nowrap text-xs font-medium text-inherit">
                          Rent Now
                        </p>
                        <ArrowUpCircle className="w-[15px] rotate-45" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopTableGpu;
