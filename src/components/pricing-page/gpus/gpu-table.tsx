
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

// Helper function to parse RAM value and convert to GB
const parseRamToGB = (ram: string): number => {
  if (!ram) return 0;
  // Handle formats like "80Gi", "180GB", "48Gi", etc.
  const match = ram.match(/(\d+(?:\.\d+)?)\s*(Gi|GB|gb|gi)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  // Convert Gi to GB (1 GiB ≈ 1.074 GB, but we'll use 1:1 for simplicity)
  return unit === "gi" ? value : value;
};

// Categorize VRAM into groups (matching RunPod.io structure)
const getVramCategory = (ram: string): string => {
  const ramGB = parseRamToGB(ram);
  // >80GB group: greater than 80GB (e.g., B200 180GB, B300 180GB, H200 141GB, H100 NVL 94GB, etc.)
  if (ramGB > 80) return ">80GB";
  // 80GB group: exactly 80GB
  if (ramGB === 80) return "80GB";
  // 48GB group: exactly 48GB
  if (ramGB === 48) return "48GB";
  // 32GB group: exactly 32GB
  if (ramGB === 32) return "32GB";
  // 24GB group: exactly 24GB
  if (ramGB === 24) return "24GB";
  // 12GB group: 12GB or less
  if (ramGB <= 12) return "12GB";
  // For values between categories, assign to the nearest lower category
  if (ramGB > 48 && ramGB < 80) return "48GB"; // Between 48 and 80, group with 48GB
  if (ramGB > 32 && ramGB < 48) return "32GB"; // Between 32 and 48, group with 32GB
  if (ramGB > 24 && ramGB < 32) return "24GB"; // Between 24 and 32, group with 24GB
  if (ramGB > 12 && ramGB < 24) return "12GB"; // Between 12 and 24, group with 12GB
  // Fallback (shouldn't happen, but just in case)
  return "12GB";
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
    let normalized =
      filteredData?.map((model) => normalizeGpuModel(model)) ?? [];

    // Ensure B300 and B200 are in the data (add if missing)
    const hasB300 = normalized.some((m) => m?.model?.toLowerCase() === "b300");
    const hasB200 = normalized.some((m) => m?.model?.toLowerCase() === "b200");

    if (!hasB300) {
      normalized.push({
        vendor: "nvidia",
        model: "b300",
        ram: "180GB",
        interface: "HBM3e",
        availability: { total: 1, available: 1 },
        providerAvailability: { total: 1, available: 1 },
        price: {
          min: 6,
          max: 6,
          avg: 6,
          med: 6,
          weightedAverage: 6,
        },
      } as Gpus["models"][number]);
    }

    if (!hasB200) {
      normalized.push({
        vendor: "nvidia",
        model: "b200",
        ram: "180GB",
        interface: "HBM3e",
        availability: { total: 1, available: 1 },
        providerAvailability: { total: 1, available: 1 },
        price: {
          min: 5,
          max: 5,
          avg: 5,
          med: 5,
          weightedAverage: 5,
        },
      } as Gpus["models"][number]);
    }

    // Normalize all models including newly added ones
    normalized = normalized.map((model) => normalizeGpuModel(model));

    // Get B300, B200, and H200 models
    const b300Models = normalized.filter(
      (model) => model?.model?.toLowerCase() === "b300",
    );
    const b200Models = normalized.filter(
      (model) => model?.model?.toLowerCase() === "b200",
    );
    const h200Models = normalized.filter(
      (model) => model?.model?.toLowerCase() === "h200",
    );

    // Priority GPUs: H100, A100 (excluding B200, B300, H200)
    const priorityGpus = normalized.filter((model) => {
      const modelLower = model?.model?.toLowerCase();
      return (
        priorityModels.includes(modelLower) &&
        modelLower !== "b200" &&
        modelLower !== "b300" &&
        modelLower !== "h200"
      );
    });
    const otherModels = normalized.filter((model) => {
      const modelLower = model?.model?.toLowerCase();
      return (
        modelLower !== "b200" &&
        modelLower !== "b300" &&
        modelLower !== "h200" &&
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

    // Combine all models including B300, B200, H200, then group by VRAM
    const allModels = [...b300Models, ...b200Models, ...h200Models, ...priorityGpus, ...otherModels];

    // Group by VRAM category while maintaining current order within each group
    const groupedByVram: Record<string, typeof allModels> = {
      ">80GB": [],
      "80GB": [],
      "48GB": [],
      "32GB": [],
      "24GB": [],
      "12GB": [],
    };

    allModels.forEach((model) => {
      const category = getVramCategory(model?.ram || "");
      groupedByVram[category]?.push(model);
    });

    // Return grouped models
    return {
      groupedByVram,
    };
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
        Looking for Bulk Orders or Custom Configurations?
      </h2>
      <TryAkashForm
        type="customButton"
        linkText="Get a Custom Quote"
        className="h-10 w-full rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-[#fafafa] transition-all hover:bg-[#171717]/90 dark:bg-white dark:text-black dark:hover:bg-white/90 xl:h-9"
      />
    </div>
  );

  // Unified table component that works for both desktop and mobile
  const UnifiedTable = () => {
    const renderRows = () => {
      if (isLoading) {
        return new Array(10)
          .fill(0)
          .map((_, index) => (
            <GpuTableRowSkeleton key={index} isB200={index < 2} />
          ));
      }

      const vramGroups = [">80GB", "80GB", "48GB", "32GB", "24GB", "12GB"];

      return (
        <>
          {/* Render grouped VRAM sections */}
          {vramGroups.map((groupName) => {
            const groupModels = normalizedData?.groupedByVram?.[groupName] || [];
            if (groupModels.length === 0) return null;

            return (
              <React.Fragment key={groupName}>
                {/* VRAM Group Header */}
                <div className="bg-[#F5F5F5] dark:bg-background2 w-fit px-4 py-0.5 md:py-1 font-medium mt-4 !mb-3 md:!mb-5 rounded-full md:!mt-6">
                  <h3 className="text-para text-sm">
                    {groupName} VRAM
                  </h3>
                </div>

                {/* Group Models */}
                {groupModels.map((rawModel, index) => {
                  const model = normalizeGpuModel(rawModel);
                  const modelLower = model?.model?.toLowerCase();
                  const isB200 = modelLower === "b200";
                  const isB300 = modelLower === "b300";
                  const isSpecialModel = isB200 || isB300;
                  const providerCount =
                    model?.providerAvailability?.available || 0;

                  return (
                    <GpuTableRow
                      key={`${groupName}-${index}`}
                      model={modifyModel(model?.model) || ""}
                      ram={model?.ram.replace("Gi", "GB") || ""}
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
              </React.Fragment>
            );
          })}
        </>
      );
    };

    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col">
          {/* Header row - visible on both desktop and mobile */}
          <div className="flex items-center justify-between border-b border-defaultBorder xl:px-4 pb-3 pt-3 text-sm font-light text-para xl:px-0 xl:pb-2 xl:pt-0 xl:text-xs xl:font-normal xl:text-[#71717A] dark:xl:text-[#A1A1AA]">
            <span className="md:text-foreground text-[15px] md:text-xl md:font-medium">GPU</span>
            <span className="text-[15px]">Price (Starting at)</span>
          </div>

          {/* GPU Rows */}
          <div className="flex flex-col">{renderRows()}</div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={clsx(
        "mx-auto flex w-full flex-col gap-0 md:gap-4",
        subCom ? "" : "md:container",
      )}
    >
      {/* Desktop Layout */}
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
          <UnifiedTable />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 px-1 md:px-4 xl:hidden">
        <div className="flex flex-col gap-6">
          <HeaderSection />
          <CtaSection />
        </div>

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

        <UnifiedTable />
      </div>
    </section>
  );
};
