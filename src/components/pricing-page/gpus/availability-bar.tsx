import { cn } from "@/lib/utils";
import clsx from "clsx";
import React from "react";

interface AvailabilityBarProps {
  available: number;
  total: number;
  className?: string;
}

const AvailabilityBar: React.FC<AvailabilityBarProps> = ({
  available,
  total,
  className,
}) => {
  const percentageFilled = Math.round(((total - available) / total) * 100);

  return (
    <div className={clsx("my-5 flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground md:text-sm lg:text-base">
          {available} Available
        </span>
        <span className="rounded border px-1.5 py-[1px] text-xs font-medium text-para">
          Total: {total}
        </span>
      </div>
      <div className="relative h-[3px] w-full rounded-full border border-[#8F8F8F] bg-[#A8A8A8] dark:border-zinc-700 dark:bg-zinc-500">
        <div
          className="absolute -top-[1px] bottom-[-1px] left-[-1px]  bg-background"
          style={{
            width: `calc(${percentageFilled}% + 2px)`,
          }}
        >
          <div
            className={cn(
              "h-full  rounded-l-full border border-primary bg-[#FF8289] dark:border-primary/90 dark:bg-primary/40",
              percentageFilled === 100 ? "rounded-r-full" : "",
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AvailabilityBar;
