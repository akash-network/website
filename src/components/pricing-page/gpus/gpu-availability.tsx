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
      <h1 className="  text-2xl !font-semibold">
        GPU Pricing and Availability
      </h1>
      <div className="flex gap-1">
        <div className="bg-lightGray border-darkGrayBorder flex items-center  gap-1.5 rounded-full border px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
          <p className="text-darkGrayText text-xs font-medium dark:text-para">
            Total GPUs:
          </p>
          <p className="text-sm font-semibold text-foreground">{totalGpus}</p>
        </div>
        <div className="bg-lightGray border-darkGrayBorder  flex items-center gap-1.5 rounded-full border px-4 py-1 dark:border-defaultBorder dark:bg-background2 ">
          <div className="flex items-center gap-1.5">
            <p className="text-darkGrayText  text-xs font-medium dark:text-para">
              Available GPUs:
            </p>
            <p className="text-sm font-semibold text-foreground">
              {availablePercentage.toFixed(2)}%
            </p>
          </div>
          <div className="bg-darkGrayBorder h-full w-[1.5px]" />
          <div className="flex items-center gap-1.5">
            <p className="text-darkGrayText text-xs font-medium dark:text-para">
              Used:
            </p>
            <p className="text-sm font-semibold text-foreground">
              {usedPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpuAvailability;
