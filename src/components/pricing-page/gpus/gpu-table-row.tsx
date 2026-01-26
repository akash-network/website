import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { price } from "./gpu-table";

interface GpuTableRowProps {
  model: string;
  ram: string;
  interface: string;
  minPrice: string | number;
  maxPrice: string | number;
  avgPrice: string | number;
  providerCount?: number;
  isB200?: boolean;
  href?: string;
  id?: string;
  className?: string;
}

const GpuTableRow = ({
  model,
  ram,
  interface: interfaceType,
  minPrice,
  maxPrice,
  avgPrice,
  providerCount = 1,
  isB200 = false,
  href = "https://console.akash.network/new-deployment",
  id,
  className,
}: GpuTableRowProps) => {

  const formattedAvgPrice =
    typeof avgPrice === "string" ? avgPrice : price(avgPrice);
  const link = isB200 ? '/nvidia-blackwell-gpus' : href
  const isInternalLink = link.startsWith("/");

  return (
    <a
      id={id}
      href={link}
      target={isInternalLink ? undefined : "_blank"}
      className={cn(
        "group flex cursor-pointer items-start xl:items-center justify-between overflow-hidden border-b  xl:px-4 py-3 md:py-5 transition-all duration-200 ",

        className,
      )}
    >
      <div className="flex md:items-center flex-col md:flex-row gap-2 md:gap-4">
        <p className="min-w-[110px] text-base font-medium capitalize text-foreground">
          {model}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border  bg-transparent px-3 py-0.5 text-sm font-normal text-para">
            {ram}
          </span>
          <span className="rounded-full border  bg-transparent px-3 py-0.5 text-sm font-normal text-para">
            {interfaceType}
          </span>
        </div>
      </div>

      {/* Price Range & Avg Price */}
      <div className="flex items-center md:gap-8 gap-2">
        {/* <div className="flex items-start gap-1">
          <span className="rounded-full border px-4 py-1 text-sm font-normal text-para transition-all duration-200">
            min {formattedMinPrice} - max {formattedMaxPrice}
          </span>
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button className="flex cursor-pointer items-center gap-2">
                <Info className="h-4 w-4 text-para" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              align="center"
              className="w-68 rounded-lg bg-black p-4 text-white shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal text-white">
                  {providerCount}{" "}
                  {providerCount === 1 ? "provider" : "providers"} offering this
                  model:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-white">
                    Avg price:
                  </span>
                  <span className="text-base font-bold text-white">
                    {formattedAvgPrice}/h
                  </span>
                </div>
                <div className="mt-1 flex justify-center">
                  <span className="rounded-full border border-[#9ca3af] bg-transparent px-4 py-1.5 text-sm font-normal text-[#d1d5db]">
                    min {formattedMinPrice} - max {formattedMaxPrice}
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div> */}

        <span className="min-w-[70px] text-base font-medium text-foreground">
          {formattedAvgPrice}/hr
        </span>

        <div
          className={cn(
            "flex h-7 items-center justify-center overflow-hidden rounded-full bg-[#F5F5F5] transition-all duration-300 ease-in-out dark:bg-background2",
            isB200
              ? "w-7 group-hover:w-[130px] group-hover:gap-2 group-hover:pl-4 group-hover:pr-3"
              : "w-7 group-hover:w-[90px] group-hover:gap-2 group-hover:pl-4 group-hover:pr-3",
          )}
        >
          {/* Text - hidden by default, shown on hover */}
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap text-sm font-medium text-[#09090b] transition-all duration-300 ease-in-out dark:text-white",
              isB200
                ? "w-0 opacity-0 group-hover:w-[85px] group-hover:opacity-100"
                : "w-0 opacity-0 group-hover:w-[45px] group-hover:opacity-100",
            )}
          >
            {isB200 ? "Get Access" : "Rent"}
          </span>
          {/* Arrow */}
          <ArrowRight className="h-4 w-4 shrink-0 transition-colors duration-300 ease-in-out " />
        </div>
      </div>
    </a>
  );
};

export default GpuTableRow;
