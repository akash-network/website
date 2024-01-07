import { Skeleton } from "@/components/ui/skeleton";
import type React from "react";
import { DiffNumber } from "./diff-number";
import { DiffPercentageChip } from "./diff-percentage-chip";

interface IStatsCardProps {
  number?: React.ReactNode;
  text: string;
  diffNumber?: number;
  diffNumberUnit?: string;
  diffPercent?: number;
  graph?: boolean;
  graphLink?: string;
}

export const StatsCard: React.FunctionComponent<IStatsCardProps> = ({
  number,
  text = "title",
  diffNumber,
  diffPercent,
  diffNumberUnit,
  graph = true,
  graphLink = "https://cloudmos.io/",
}) => {
  return (
    <div className="overflow-hidden  rounded-lg bg-background2    shadow-sm">
      <div className="flex w-full flex-col px-3 py-4   md:px-6  md:py-6 ">
        <p className="text-3xs  font-medium md:text-sm">{text}</p>

        <div className="mt-1 flex items-center">
          <h4 className="text-xs font-medium md:text-2xl">{number}</h4>
          {(!!diffNumber || !!diffPercent) && (
            <div className="ml-2 flex  items-center gap-x-1 md:mt-2">
              {!!diffNumber && (
                <p className="text-3xs font-bold  md:text-sm">
                  <DiffNumber value={diffNumber} unit={diffNumberUnit} />
                </p>
              )}

              {!!diffPercent && <DiffPercentageChip value={diffPercent} />}
            </div>
          )}
        </div>
      </div>
      {graph && (
        <div className="h-full  bg-gray-50 px-3 py-1  dark:bg-[#3C3C3C] md:px-4 md:py-4">
          <a
            href={graphLink}
            className="cursor-pointer  text-2xs font-medium leading-none md:text-sm"
          >
            View Graph
          </a>
        </div>
      )}
    </div>
  );
};

export const StatsCardSkeleton: React.FunctionComponent = () => {
  return (
    <div className="flex h-[88px] w-full flex-col justify-center rounded-lg border border-[#808080] p-3 md:h-[122px]">
      <div>
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="mt-2 h-6 w-[60%]" />
      </div>

      <div className="mt-[14px] flex items-center gap-x-2 md:mt-[19px]">
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[35%]" />
      </div>
    </div>
  );
};

export default StatsCard;

// {(!!diffNumber || !!diffPercent) && (
//   <div className="mt-[14px] flex items-center gap-x-2 md:mt-[19px]">
//     {!!diffNumber && (
//       <p className="text-xs font-medium leading-none md:text-sm ">
//         <DiffNumber value={diffNumber} unit={diffNumberUnit} />
//       </p>
//     )}

//     {!!diffPercent && <DiffPercentageChip value={diffPercent} />}
//   </div>
// )}
