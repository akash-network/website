import { Skeleton } from "@/components/ui/skeleton";
import TryAkashForm from "@/components/ui/try-akash-form";

const GpuAvailability = ({
  totalGpus,
  totalAvailableGpus,
  isLoading,
  counts,
}: {
  totalGpus: number;
  totalAvailableGpus: number;
  isLoading: boolean;
  counts?: boolean;
}) => {
  const usedGpus = totalGpus - totalAvailableGpus;
  const usedPercentage = (usedGpus / totalGpus) * 100;
  const availablePercentage = (totalAvailableGpus / totalGpus) * 100;
  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <Skeleton className="h-9 w-64 dark:bg-darkGray" />
      ) : (
        <div className="flex flex-col ">
          <h1 className="text-2xl !font-semibold">
            GPU Pricing and Availability
          </h1>
          <p className="text-sm text-darkGrayText dark:text-para">
            We are able to access as many GPUs as you request — just ask us!{" "}
            <TryAkashForm
              type="linkButton"
              linkText="Request more."
              className="!px-0"
            />
          </p>
        </div>
      )}
      <div className="flex gap-1">
        {isLoading ? (
          <>
            {counts && (
              <Skeleton className="h-8 w-32 rounded-full dark:bg-darkGray" />
            )}
            <Skeleton className="h-8 w-64 rounded-full dark:bg-darkGray" />
          </>
        ) : (
          <>
            {counts && (
              <div className="flex items-center gap-1.5 rounded-full  border border-darkGrayBorder bg-lightGray px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
                <p className="text-xs font-medium text-darkGrayText dark:text-para">
                  Total GPUs:
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {totalGpus}
                </p>
              </div>
            )}
            <div className="flex items-center  gap-1.5 rounded-full border border-darkGrayBorder bg-lightGray px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
              <div className="flex items-center gap-1.5">
                <p className="text-xs  font-medium text-darkGrayText dark:text-para">
                  Available GPUs:
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {totalAvailableGpus > 0 ? availablePercentage.toFixed(2) : 0}%
                </p>
              </div>
              <div className="h-full w-[1.5px] bg-darkGrayBorder" />
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-darkGrayText dark:text-para">
                  Used:
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {totalGpus > 0 ? usedPercentage.toFixed(2) : 0}%
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
