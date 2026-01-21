
import TryAkashForm from "@/components/ui/try-akash-form";
import { gpus } from "@/utils/api";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import clsx from "clsx";
import React from "react";
import DesktopTableGpu from "./desktop-table-gpu";
import { DUMMY_GPU_DATA } from "./dummy-gpu-data";
import Filter, { defaultFilters, type Filters } from "./filter";
import { GPU_PRIORITY_MODELS } from "./gpu-priority";
import GpuTableRow from "./gpu-table-row";
import GpuTableRowSkeleton from "./gpu-table-row-skeleton";
export interface Gpus {
  availability: { total: number; available: number };
  models: Array<{
    vendor: string;
    model: string;
    ram: string;
    interface: string;
    availability: { total: number; available: number };
    providerAvailability: { total: number; available: number };
    price: {
      min: number;
      max: number;
      avg: number;
      med: number;
      weightedAverage: number;
    };
  }>;
  time?: number;
}

const GpuTable = ({
  initialData,
  subCom,
  counts,
}: {
  initialData?: any;
  subCom?: boolean;
  counts?: boolean;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Table
        initialData={{
          data: initialData,
        }}
        subCom={subCom}
        counts={counts}
      />
    </QueryClientProvider>
  );
};

export default GpuTable;

const Table = ({
  initialData,
  subCom,
  counts,
}: {
  initialData?: {
    data: any;
  };
  subCom?: boolean;
  counts?: boolean;
}) => {
  const fetchInterval = 1000 * 60;

  const {
    data: result,
    isLoading,
    isInitialLoading,
  } = useQuery<
    {
      data: Gpus;
    },
    Error
  >({
    queryKey: ["GPU_TABLE"],
    queryFn: async () => {
      if (
        typeof window !== "undefined" &&
        !window.location.origin.includes("akash.network")
      ) {
        return Promise.resolve({ data: DUMMY_GPU_DATA });
      }

      return axios.get(gpus);
    },
    refetchIntervalInBackground: true,

    refetchInterval: fetchInterval,
  });

  const data = result?.data;
  return (
    <Tables
      data={data}
      subCom={subCom}
      isLoading={isLoading || isInitialLoading}
      counts={counts}
    />
  );
};

const modelTexts: Record<string, string> = {
  rtx: "RTX ",
  gtx: "GTX ",
  ti: " Ti",
  ada: " Ada",
};

const formatText = (model: string) => {
  let formattedText = model;
  for (const key in modelTexts) {
    const regex = new RegExp(key, "gi");
    formattedText = formattedText.replace(regex, modelTexts[key]);
  }

  return formattedText;
};
export const modifyModel = (model: string) => {
  if (model === "rtxa6000") return "A6000";
  if (model === "pro6000se") return "Pro 6000 SE";
  return formatText(model);
};

export const price = (price: number) => {
  if (!price) return "--";
  // Format with comma as decimal separator (European format)
  const formatted = price.toFixed(2);
  return `$${formatted}`;
};

export const normalizeGpuModel = (model: Gpus["models"][number]) => {
  const modelLower = model?.model?.toLowerCase();
  const isB200 = modelLower === "b200";
  const isB300 = modelLower === "b300";

  if (!isB200 && !isB300) return model;

  const hardcodedPrice = isB200 ? 5 : 6; // B200: $5, B300: $6

  return {
    ...model,
    price: {
      ...model.price,
      min: hardcodedPrice,
      max: hardcodedPrice,
      avg: hardcodedPrice,
      med: hardcodedPrice,
      weightedAverage: hardcodedPrice,
    },
    providerAvailability: {
      total: model?.providerAvailability?.total ?? 1,
      available: 1,
    },
  };
};

export const Tables = ({
  data,
  pathName,
  subCom,
  isLoading,
  counts,
}: {
  data?: Gpus;
  pathName?: any;
  subCom?: boolean;
  isLoading?: boolean;
  counts?: boolean;
}) => {
  const [filteredData, setFilteredData] = React.useState<Gpus["models"]>([]);
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);

  // Priority models after B300/B200 (imported from gpu-priority.ts)
  const priorityModels = GPU_PRIORITY_MODELS;

  // Wrapper to always keep B300, B200 at top, then H200, H100, A100
  const setFilteredDataWithB200First = React.useCallback(
    (newData: Gpus["models"] | ((prev: Gpus["models"]) => Gpus["models"])) => {
      setFilteredData((prev) => {
        const dataToProcess =
          typeof newData === "function" ? newData(prev) : newData;
        const b300Models = dataToProcess.filter(
          (model) => model?.model?.toLowerCase() === "b300",
        );
        const b200Models = dataToProcess.filter(
          (model) => model?.model?.toLowerCase() === "b200",
        );
        const priorityGpus = dataToProcess.filter((model) => {
          const modelLower = model?.model?.toLowerCase();
          return (
            priorityModels.includes(modelLower) &&
            modelLower !== "b200" &&
            modelLower !== "b300"
          );
        });
        const otherModels = dataToProcess.filter((model) => {
          const modelLower = model?.model?.toLowerCase();
          return (
            modelLower !== "b200" &&
            modelLower !== "b300" &&
            !priorityModels.includes(modelLower)
          );
        });

        // Sort priority GPUs by their defined order
        priorityGpus.sort((a, b) => {
          const aIndex = priorityModels.indexOf(a?.model?.toLowerCase());
          const bIndex = priorityModels.indexOf(b?.model?.toLowerCase());
          if (aIndex !== bIndex) return aIndex - bIndex;
          // For same model, prefer 80Gi RAM
          if (a?.ram === "80Gi" && b?.ram !== "80Gi") return -1;
          if (b?.ram === "80Gi" && a?.ram !== "80Gi") return 1;
          return 0;
        });

        return [...b300Models, ...b200Models, ...priorityGpus, ...otherModels];
      });
    },
    [priorityModels],
  );
  const totalGpus =
    filteredData?.length > 0
      ? filteredData?.reduce(
        (prev, curr) => prev + (curr?.availability?.total ?? 0),
        0,
      )
      : 0;

  const totalAvailableGpus =
    filteredData?.length > 0
      ? filteredData?.reduce(
        (prev, curr) => prev + (curr?.availability?.available ?? 0),
        0,
      )
      : 0;

  const normalizedData = React.useMemo(() => {
    const normalized =
      filteredData?.map((model) => normalizeGpuModel(model)) ?? [];
    // Hardcode B300 and B200 at the top - separate from others
    const b300Models = normalized.filter(
      (model) => model?.model?.toLowerCase() === "b300",
    );
    const b200Models = normalized.filter(
      (model) => model?.model?.toLowerCase() === "b200",
    );
    // Priority GPUs: H200, H100, A100
    const priorityGpus = normalized.filter((model) => {
      const modelLower = model?.model?.toLowerCase();
      return (
        priorityModels.includes(modelLower) &&
        modelLower !== "b200" &&
        modelLower !== "b300"
      );
    });
    const otherModels = normalized.filter((model) => {
      const modelLower = model?.model?.toLowerCase();
      return (
        modelLower !== "b200" &&
        modelLower !== "b300" &&
        !priorityModels.includes(modelLower)
      );
    });

    // Sort priority GPUs by their defined order
    priorityGpus.sort((a, b) => {
      const aIndex = priorityModels.indexOf(a?.model?.toLowerCase());
      const bIndex = priorityModels.indexOf(b?.model?.toLowerCase());
      if (aIndex !== bIndex) return aIndex - bIndex;
      // For same model, prefer 80Gi RAM
      if (a?.ram === "80Gi" && b?.ram !== "80Gi") return -1;
      if (b?.ram === "80Gi" && a?.ram !== "80Gi") return 1;
      return 0;
    });

    // Always return B300 first, then B200, then priority GPUs, then others
    return [...b300Models, ...b200Models, ...priorityGpus, ...otherModels];
  }, [filteredData, priorityModels]);

  const HeaderSection = () => (
    <div className="flex flex-col gap-2 xl:gap-[18px]">
      <h1 className="text-[28px] font-semibold leading-tight xl:text-[40px] xl:leading-[48px]">
        GPU Pricing
      </h1>
      <p className="text-base leading-relaxed text-para xl:text-base xl:leading-[24px]">
        Real-time availability for high-demand compute. Transparent hourly
        pricing with no hidden fees.
      </p>
    </div>
  );

  const CtaSection = ({ className }: { className?: string }) => (
    <div className={clsx("flex flex-col gap-4 xl:gap-5", className)}>
      <h2 className="text-lg font-semibold leading-snug text-foreground xl:leading-[28px]">
        Looking for Bulk Orders, or Custom Configurations?
      </h2>
      <TryAkashForm
        type="customButton"
        linkText="Get a Custom Quote"
        className="h-10 w-full rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-[#fafafa] transition-all hover:bg-[#171717]/90 dark:bg-white dark:text-black dark:hover:bg-white/90 xl:h-9"
      />
    </div>
  );

  return (
    <section
      className={clsx(
        "mx-auto flex w-full flex-col gap-0 md:gap-4",
        subCom ? "" : "md:container",
      )}
    >
      <div className="hidden flex-row gap-16 xl:flex">
        <div className="flex w-[289px] flex-shrink-0 flex-col gap-[70px]">
          <HeaderSection />
          <CtaSection />
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <Filter
            filters={filters}
            setFilters={setFilters}
            setFilteredData={setFilteredDataWithB200First}
            res={data}
            totalAvailableGpus={totalAvailableGpus}
            totalGpus={totalGpus}
            isLoading={isLoading || false}
          />

          <div className="h-px w-full bg-defaultBorder md:hidden" />
          <DesktopTableGpu
            subCom={subCom || false}
            isLoading={isLoading || false}
            filteredData={normalizedData}
            counts={counts}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 xl:hidden">
        {/* Mobile Header */}
        <div className="flex flex-col gap-6">
          <HeaderSection />
          <CtaSection />
        </div>

        {/* Mobile Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Filter
            filters={filters}
            setFilters={setFilters}
            setFilteredData={setFilteredDataWithB200First}
            res={data}
            totalAvailableGpus={totalAvailableGpus}
            totalGpus={totalGpus}
            isLoading={isLoading || false}
          />
        </div>

        <div className="flex items-center justify-between border-b border-defaultBorder pb-3 pt-3 text-sm font-light text-para">
          <span>GPU Model</span>
          <span>Price (Starting at)</span>
        </div>
      </div>

      <div
        className={clsx(
          "flex w-full flex-col px-4 xl:hidden",

        )}
      >
        {/* Mobile GPU List - Using same GpuTableRow component as desktop */}
        {isLoading ? (
          new Array(10)
            .fill(0)
            .map((_, index) => (
              <GpuTableRowSkeleton key={index} isB200={index < 2} />
            ))
        ) : (
          <>

            <GpuTableRow
              model="B300"
              ram="180GB"
              interface="HBM3e"
              minPrice={6}
              maxPrice={6}
              avgPrice={6}
              providerCount={1}
              isB200={true}
              id="b300-(gpu-rent)-mobile"
              href="/gpus-on-demand"
            />

            <GpuTableRow
              model="B200"
              ram="180GB"
              interface="HBM3e"
              minPrice={5}
              maxPrice={5}
              avgPrice={5}
              providerCount={1}
              isB200={true}
              id="b200-(gpu-rent)-mobile"
              href="/gpus-on-demand"
            />

            {normalizedData
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
                    id={`${model?.model}-(gpu-rent)-mobile`}
                  />
                );
              })}
          </>
        )}
      </div>
    </section>
  );
};
