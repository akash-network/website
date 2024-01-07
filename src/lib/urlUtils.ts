import { appendSearchParams } from "./utils";

export const priceCompareCustom = (
  cpu: number,
  memory: number,
  storage: number,
  memoryUnit: string,
  storageUnit: string,
) =>
  `/price-compare${appendSearchParams({
    cpu,
    memory,
    storage,
    memoryUnit,
    storageUnit,
  })}`;
