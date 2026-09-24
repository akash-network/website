import {
  gpuDisplayName,
  gpuHourlyPrice,
  isBlackwellModel,
  parseRamGb,
  type GpuModel,
} from "./gpu-models";

export type InterfaceFamily = "sxm" | "pcie" | "other";

/** A GPU model from `/v1/gpu-prices`, flattened for display. */
export interface GpuRow {
  key: string;
  model: string;
  name: string;
  vendorKey: string;
  vendor: string;
  ramGb: number;
  ramLabel: string;
  interface: string;
  interfaceFamily: InterfaceFamily;
  hourly: number | null;
  isBlackwell: boolean;
}

export function toGpuRow(model: GpuModel): GpuRow {
  const ramGb = parseRamGb(model.ram);
  const iface = model.interface ?? "";
  return {
    key: `${model.vendor}-${model.model}-${model.ram}-${iface}`,
    model: model.model,
    name: gpuDisplayName(model.model),
    vendorKey: (model.vendor ?? "").toLowerCase(),
    vendor: (model.vendor ?? "").toUpperCase(),
    ramGb,
    // Non-breaking space keeps "80 GB" together when labels wrap.
    ramLabel: ramGb ? `${ramGb.toLocaleString("en-US")}\u00a0GB` : model.ram,
    interface: iface,
    interfaceFamily: /^sxm/i.test(iface)
      ? "sxm"
      : /^pcie/i.test(iface)
        ? "pcie"
        : "other",
    hourly: gpuHourlyPrice(model),
    isBlackwell: isBlackwellModel(model.model),
  };
}

/** Sorts rows by hourly price in the given direction, always keeping unpriced rows last. */
export const byPrice = (direction: 1 | -1) => (a: GpuRow, b: GpuRow) => {
  if (a.hourly === null) return b.hourly === null ? 0 : 1;
  if (b.hourly === null) return -1;
  return (a.hourly - b.hourly) * direction;
};

/** The variant that represents a model in summaries: largest VRAM, then lowest price. */
export function pickHeadlineRow(
  rows: GpuRow[],
  model: string,
): GpuRow | undefined {
  return rows
    .filter((row) => row.model.toLowerCase() === model && row.hourly !== null)
    .sort((a, b) => b.ramGb - a.ramGb || byPrice(1)(a, b))[0];
}

/** Headline rows for the given models, in order, skipping any without a live price. */
export function pickHeadlineRows(
  rows: GpuRow[],
  models: string[],
  limit = Infinity,
) {
  const picked: GpuRow[] = [];
  for (const model of models) {
    if (picked.length >= limit) break;
    const row = pickHeadlineRow(rows, model);
    if (row) picked.push(row);
  }
  return picked;
}
