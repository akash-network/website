import type { NavItem } from "@/types/navigation";

/**
 * Docs navigation item with weight for sorting
 */
export interface DocsNavItem extends NavItem {
  weight: number;
  subItems: DocsNavItem[];
}

/**
 * Docs page from Astro content collection
 */
export interface DocsPage {
  id: string;
  data: {
    linkTitle?: string;
    weight?: number;
    hideFromNav?: boolean;
  };
}

/**
 * Sequence item for docs ordering
 */
export interface DocsSequenceItem {
  label: string;
  type?: "Header";
  subItems?: DocsSequenceItem[];
}

/**
 * Docs sequence array type
 */
export type DocsSequence = DocsSequenceItem[];
