import type { ReactNode } from "react";

/**
 * Disclosure state from Headless UI
 */
export type DisclosureState = boolean;

/**
 * ClassNames utility function parameter type
 * Accepts strings, undefined, null, or objects with boolean values
 */
export type ClassNamesParams = (
  | string
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
)[];

/**
 * ClassNames utility function type
 */
export type ClassNamesFunction = (...classes: ClassNamesParams) => string;

/**
 * Generic component children prop type
 */
export type ComponentChildren = ReactNode;

/**
 * Generic component props with children
 */
export interface ComponentWithChildren {
  children?: ComponentChildren;
}
