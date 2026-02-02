/**
 * GPU model structure
 */
export interface GpuModel {
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
}

/**
 * GPU data structure
 */
export interface Gpus {
  availability: { total: number; available: number };
  models: GpuModel[];
  time?: number;
}

/**
 * Pricing specification
 */
export interface PricingSpec {
  cpu: number;
  memory: number;
  storage: number;
}

/**
 * Custom pricing data structure
 */
export interface CustomPricingData {
  spec: PricingSpec;
  akash: number;
  aws: number;
  gcp: number;
  azure: number;
}

/**
 * Initial data for GPU table
 */
export interface GpuTableInitialData {
  data: Gpus;
}

/**
 * Initial data for usage table
 */
export interface UsageTableInitialData {
  data: Gpus;
}

/**
 * Initial data for provider table
 */
export interface ProviderTableInitialData {
  data: Gpus;
}

/**
 * Pricing component props
 */
export interface PricingProps {
  page: string;
  pathName: string;
  initialData?: Gpus;
}

/**
 * Price compare component props
 */
export interface PriceCompareProps {
  initialData: Gpus;
}

/**
 * Dashboard component props
 */
export interface PricingDashboardProps {
  page: string;
  pathName: string;
  initialData?: Gpus;
}

/**
 * Table component props (generic)
 */
export interface TableProps {
  initialData?: GpuTableInitialData | UsageTableInitialData | ProviderTableInitialData;
  pathName?: string;
  subCom?: boolean;
}
