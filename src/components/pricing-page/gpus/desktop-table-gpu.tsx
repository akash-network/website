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
            <th className="w-[22%]  text-left text-sm font-medium tracking-normal text-linkText">
              GPU Model
            </th>
            <th className="w-[30%]  text-left text-sm font-medium tracking-normal text-linkText ">
              Availability
            </th>
            <th className="w-[16%] whitespace-nowrap  text-left text-sm font-medium tracking-normal text-linkText ">
              Price Range
            </th>
            <th className="w-[13%] whitespace-nowrap  text-left text-sm font-medium tracking-normal text-linkText ">
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
                    <div className=" flex items-end gap-3 ">
                      <div className="ml-3 flex aspect-square size-11   items-center justify-center rounded-md border ">
                        <svg
                          width="25"
                          height="16"
                          viewBox="0 0 25 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.4481 4.79767L9.4481 3.3665C9.58944 3.35766 9.73077 3.34883 9.8721 3.34883C13.7941 3.22515 16.3646 6.72356 16.3646 6.72356C16.3646 6.72356 13.5909 10.5753 10.6141 10.5753C10.2166 10.5753 9.82793 10.5135 9.45694 10.3898L9.45694 6.04331C10.9851 6.22883 11.2943 6.90025 12.2041 8.42859L14.2446 6.71473C14.2446 6.71473 12.7517 4.76233 10.2431 4.76233C9.9781 4.75349 9.7131 4.77116 9.4481 4.79767ZM9.4481 0.0624392L9.4481 2.20036L9.8721 2.17386C15.3222 1.98833 18.882 6.64405 18.882 6.64405C18.882 6.64405 14.8011 11.609 10.5523 11.609C10.1813 11.609 9.8191 11.5736 9.45694 11.5118L9.45694 12.837C9.75727 12.8723 10.0664 12.8988 10.3668 12.8988C14.3241 12.8988 17.1861 10.8757 19.9597 8.49044C20.419 8.86148 22.3005 9.75375 22.6892 10.1425C20.0569 12.3511 13.9177 14.1268 10.4374 14.1268C10.1018 14.1268 9.78377 14.1091 9.46577 14.0738L9.46577 15.9378L24.5 15.9378L24.5 0.0624395L9.4481 0.0624392ZM9.4481 10.3898L9.4481 11.5206C5.79113 10.8669 4.7753 7.05927 4.7753 7.05927C4.7753 7.05927 6.53312 5.1157 9.4481 4.79767L9.4481 6.03448L9.43927 6.03448C7.91111 5.84896 6.70979 7.28013 6.70979 7.28013C6.70979 7.28013 7.38995 9.69191 9.4481 10.3898ZM2.95565 6.90025C2.95565 6.90025 5.1198 3.7022 9.45694 3.3665L9.45694 2.20036C4.65164 2.58907 0.5 6.65288 0.5 6.65288C0.5 6.65288 2.84965 13.4554 9.4481 14.0738L9.4481 12.837C4.60747 12.2362 2.95565 6.90025 2.95565 6.90025Z"
                            className="fill-foreground"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-base font-semibold capitalize leading-[1.1] text-foreground ">
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
