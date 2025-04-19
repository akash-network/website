import { Skeleton } from "@/components/ui/skeleton";

const GpuAvailability = ({
  totalGpus,
  totalAvailableGpus,
  isLoading,
}: {
  totalGpus: number;
  totalAvailableGpus: number;
  isLoading: boolean;
}) => {
  const usedGpus = totalGpus - totalAvailableGpus;
  const usedPercentage = (usedGpus / totalGpus) * 100;
  const availablePercentage = (totalAvailableGpus / totalGpus) * 100;
  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <Skeleton className="h-9 w-64 dark:bg-darkGray" />
      ) : (
        <h1 className="text-2xl !font-semibold">
          GPU Pricing and Availability
        </h1>
      )}
      <div className="flex gap-1">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-32 rounded-full dark:bg-darkGray" />
            <Skeleton className="h-8 w-64 rounded-full dark:bg-darkGray" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 rounded-full  border border-darkGrayBorder bg-lightGray px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
              <p className="text-xs font-medium text-darkGrayText dark:text-para">
                Total GPUs:
              </p>
              <p className="text-sm font-semibold text-foreground">
                {totalGpus}
              </p>
            </div>
            <div className="flex items-center  gap-1.5 rounded-full border border-darkGrayBorder bg-lightGray px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
              <div className="flex items-center gap-1.5">
                <p className="text-xs  font-medium text-darkGrayText dark:text-para">
                  Available GPUs:
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {availablePercentage.toFixed(2)}%
                </p>
              </div>
              <div className="h-full w-[1.5px] bg-darkGrayBorder" />
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-darkGrayText dark:text-para">
                  Used:
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {usedPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GpuAvailability;
