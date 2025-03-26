import { Skeleton } from "../../ui/skeleton";
import CircularProgressBar from "./circular-progress-bar";

const GpuAvailabilityPie = ({
  totalGpus,
  totalAvailableGpus,
  isLoading,
}: {
  totalGpus: number;
  totalAvailableGpus: number;
  isLoading: boolean;
}) => {
  return (
    <div>
      <h1 className=" mt-3 !font-semibold">GPU Pricing and Availability</h1>
      <div className="mt-[11px] flex w-[274px] flex-col justify-between   gap-8 rounded-md border bg-background2 p-5 shadow ">
        <div className="flex flex-col gap-2">
          <div className="">
            <h2 className="text-sm font-semibold ">Total GPUs</h2>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">
                {totalGpus}
              </p>
            )}
          </div>
          {isLoading ? (
            <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
          ) : (
            <CircularProgressBar
              primaryProgress={
                ((totalAvailableGpus || 0) / (totalGpus || 1)) * 100
              }
              primaryColor="#ff4757"
              secondaryColor="#BDBDBD"
              className="mx-auto h-[150px] w-[150px]"
            />
          )}
          <div className="mt-5  flex items-center justify-center gap-3">
            <div className="flex  items-center justify-center gap-1">
              <div className="size-2.5 rounded-full bg-primary"></div>
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p className="flex gap-1 text-xs font-medium  ">
                  Available:
                  <span>
                    {(
                      ((totalAvailableGpus || 0) / (totalGpus || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </p>
              )}
            </div>
            <div className="flex  items-center gap-1">
              <div className="size-2.5 rounded-full bg-[#BDBDBD]"></div>
              {isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <p className="flex gap-1 text-xs font-medium  ">
                  Used:
                  <span>
                    {(
                      100 -
                      ((totalAvailableGpus || 0) / (totalGpus || 1)) * 100
                    ).toFixed(0)}
                    %
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpuAvailabilityPie;
