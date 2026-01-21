import clsx from "clsx";
import type { Gpus } from "./gpu-table";
import { modifyModel, normalizeGpuModel } from "./gpu-table";
import GpuTableRow from "./gpu-table-row";
import GpuTableRowSkeleton from "./gpu-table-row-skeleton";

const DesktopTableGpu = ({
  subCom,
  isLoading,
  filteredData,
  counts,
}: {
  subCom: boolean;
  isLoading: boolean;
  filteredData: Gpus["models"];
  counts?: boolean;
}) => {
  return (
    <div
      className={clsx(
        "hidden w-full overflow-x-auto",
        subCom ? "lg:block" : "md:block",
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-defaultBorder pb-2 text-xs text-[#71717A] dark:text-[#A1A1AA]">
          <span>GPU Model</span>
          <span>Price (Starting at)</span>
        </div>

        {!isLoading && (
          <>
            <GpuTableRow
              model="B200"
              ram="180GB"
              interface="HBM3e"
              minPrice={5}
              maxPrice={5}
              avgPrice={5}
              providerCount={1}
              isB200={true}
              id="b200-(gpu-rent)"
              href="/gpus-on-demand"
            />
            <GpuTableRow
              model="B300"
              ram="180GB"
              interface="HBM3e"
              minPrice={6}
              maxPrice={6}
              avgPrice={6}
              providerCount={1}
              isB200={true}
              id="b300-(gpu-rent)"
              href="/gpus-on-demand"
            />
          </>
        )}

        {isLoading
          ? new Array(10)
            .fill(0)
            .map((_, index) => (
              <GpuTableRowSkeleton key={index} isB200={index < 2} />
            ))
          : filteredData
            ?.filter(
              (model) =>
                model?.model?.toLowerCase() !== "b200" &&
                model?.model?.toLowerCase() !== "b300",
            )
            ?.map((rawModel, index) => {
              const model = normalizeGpuModel(rawModel);
              const modelLower = model?.model?.toLowerCase();
              const isB200 = modelLower === "b200";
              const isB300 = modelLower === "b300";
              const isSpecialModel = isB200 || isB300;
              const providerCount =
                model?.providerAvailability?.available || 0;

              return (
                <GpuTableRow
                  key={index}
                  model={modifyModel(model?.model) || ""}
                  ram={model?.ram || ""}
                  interface={model?.interface || ""}
                  minPrice={model?.price?.min || 0}
                  maxPrice={model?.price?.max || 0}
                  avgPrice={model?.price?.weightedAverage || 0}
                  providerCount={providerCount}
                  isB200={isSpecialModel}
                  id={`${model?.model}-(gpu-rent)`}
                />
              );
            })}
      </div>
    </div>
  );
};

export default DesktopTableGpu;
