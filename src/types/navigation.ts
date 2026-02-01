import type { ReactNode } from "react";

/**
 * Meeting type for navigation items that have meeting schedules
 */
export interface Meeting {
  title: string;
  link: string;
  date?: Date;
}

/**
 * Sub-item type for nested navigation items
 */
export interface SubItem {
  label: string;
  link: string;
  meetings?: Meeting[];
}

/**
 * Main navigation item type
 * Supports both flat navigation (items) and nested navigation (subItems)
 */
export interface NavItem {
  label: string;
  link: string;
  enabled?: boolean;
  subItems?: SubItem[];
  items?: NavItem[];
  weight?: number;
  icon?: ReactNode;
  current?: boolean;
}

/**
 * Navigation configuration array type
 */
export type NavConfig = NavItem[];

/**
 * Simple navigation item for basic nav configs (without subItems)
 */
export interface SimpleNavItem {
  label: string;
  link: string;
  enabled: boolean;
}
