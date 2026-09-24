// Shared GPU helpers for the pricing pages. Model data comes from the Akash Console API
// (`/v1/gpu-prices`), which derives per-GPU-hour USD prices from recent provider bids.

export interface GpuPrice {
  currency?: string;
  min: number;
  max: number;
  avg: number;
  med: number;
  weightedAverage: number;
}

export interface GpuModel {
  vendor: string;
  model: string;
  ram: string;
  interface: string;
  availability: { total: number; available: number };
  providerAvailability: { total: number; available: number };
  price: GpuPrice | null;
}

export interface GpuPricesResponse {
  availability: { total: number; available: number };
  models: GpuModel[];
}

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
  if (model === "pro6000we") return "Pro 6000 WE";
  if (model === "pro6000mq") return "Pro 6000 Max-Q";
  if (model === "rtxpro6000blackwellmaxqworkstationedition")
    return "RTX Pro 6000 Blackwell Max-Q";
  return formatText(model);
};

/** Display name with a leading capital, e.g. "h100" → "H100", "rtx4090" → "RTX 4090". */
export const gpuDisplayName = (model: string) => {
  const name = modifyModel(model ?? "");
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// B300 and B200 aren't priced from open bids: the pricing tables list them at fixed hourly
// rates and send visitors to /nvidia-blackwell-gpus to request access.
const BLACKWELL_HOURLY_PRICES = new Map<string, number>([
  ["b300", 6],
  ["b200", 5],
]);

export const BLACKWELL_ACCESS_URL = "/nvidia-blackwell-gpus";

export const isBlackwellModel = (model: string) =>
  BLACKWELL_HOURLY_PRICES.has((model ?? "").toLowerCase());

export const normalizeGpuModel = <T extends GpuModel>(model: T): T => {
  const hardcodedPrice = BLACKWELL_HOURLY_PRICES.get(
    model?.model?.toLowerCase() ?? "",
  );

  if (hardcodedPrice === undefined) return model;

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
  } as T;
};

// Listed even when the API has no entry for them yet.
const BLACKWELL_FALLBACKS: GpuModel[] = ["b300", "b200"].map((model) => ({
  vendor: "nvidia",
  model,
  ram: "180GB",
  interface: "HBM3e",
  availability: { total: 1, available: 1 },
  providerAvailability: { total: 1, available: 1 },
  price: null,
}));

/** Applies the fixed B300/B200 prices and adds either model if the API omitted it. */
export const withBlackwellFallbacks = <T extends GpuModel>(
  models: T[],
): T[] => {
  const normalized = models.map((model) => normalizeGpuModel(model));

  for (const fallback of BLACKWELL_FALLBACKS) {
    const present = normalized.some(
      (m) => m?.model?.toLowerCase() === fallback.model,
    );
    if (!present) normalized.push(normalizeGpuModel(fallback as T));
  }

  return normalized;
};

/** Parses API RAM strings like "80Gi" or "180GB" into a number of GB. */
export const parseRamGb = (ram: string): number => {
  const match = (ram ?? "").match(/(\d+(?:\.\d+)?)\s*(Gi|GB)/i);
  return match ? parseFloat(match[1]) : 0;
};

/** Hourly USD price shown across the site for a model (provider-weighted average of bids). */
export const gpuHourlyPrice = (model: GpuModel): number | null =>
  model?.price?.weightedAverage ?? null;
