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
  if (model === "rubin") return "Vera Rubin";
  if (model === "rtxpro6000blackwellmaxqworkstationedition")
    return "RTX Pro 6000 Blackwell Max-Q";
  return formatText(model);
};

/** Display name with a leading capital, e.g. "h100" → "H100", "rtx4090" → "RTX 4090". */
export const gpuDisplayName = (model: string) => {
  const name = modifyModel(model ?? "");
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Next-generation NVIDIA GPUs. Like every other model, their prices come only from the
// Console API: when it has no bids for one, the tables show "Request access" in place of a
// price and send visitors to the next-gen page instead of the console.
export const NEXT_GEN_ACCESS_URL = "/next-gen-gpus";

/** The access page with this model preselected in its request form, scrolled to the form. */
export const nextGenAccessHref = (model: string) =>
  `/next-gen-gpus/?gpu=${encodeURIComponent((model ?? "").toLowerCase())}#request-access`;

// Listed even when the API has no entry for them yet, so the tables can offer access. Vera
// Rubin's id is a placeholder until a provider lists it; rename it to the id the API uses.
const NEXT_GEN_LISTED: { model: string; ram: string; interface: string }[] = [
  { model: "b300", ram: "288GB", interface: "HBM3e" },
  { model: "b200", ram: "180GB", interface: "HBM3e" },
  { model: "rubin", ram: "288GB", interface: "HBM4" },
];

const NEXT_GEN_MODELS = new Set([
  ...NEXT_GEN_LISTED.map(({ model }) => model),
  "gb300",
  "gb200",
]);

export const isNextGenModel = (model: string) =>
  NEXT_GEN_MODELS.has((model ?? "").toLowerCase());

/** Adds a placeholder (no price, nothing available) for each listed next-gen model the API
 *  doesn't return, so it still shows up with a "Request access" link. */
export const withNextGenModels = <T extends GpuModel>(models: T[]): T[] => {
  const present = new Set(models.map((m) => m?.model?.toLowerCase()));
  const missing = NEXT_GEN_LISTED.filter(
    ({ model }) => !present.has(model),
  ).map(
    (entry) =>
      ({
        vendor: "nvidia",
        ...entry,
        availability: { total: 0, available: 0 },
        providerAvailability: { total: 0, available: 0 },
        price: null,
      }) as GpuModel as T,
  );
  return [...models, ...missing];
};

/** Parses API RAM strings like "80Gi" or "180GB" into a number of GB. */
export const parseRamGb = (ram: string): number => {
  const match = (ram ?? "").match(/(\d+(?:\.\d+)?)\s*(Gi|GB)/i);
  return match ? parseFloat(match[1]) : 0;
};

/** Hourly USD price shown across the site for a model (provider-weighted average of bids). */
export const gpuHourlyPrice = (model: GpuModel): number | null =>
  model?.price?.weightedAverage ?? null;
