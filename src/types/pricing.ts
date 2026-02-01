/**
 * Pricing table data structure
 */
export interface PricingTableData {
  [key: string]: unknown;
}

/**
 * Path name type for pricing pages
 */
export type PathName = string | undefined;

/**
 * Pricing table data that can be null or undefined
 */
export type PricingTableDataNullable = PricingTableData | null | undefined;
