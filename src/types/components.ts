import type React from "react";
import type { NavItem } from "./navigation";
import type { ApiProviderList } from "./provider";

/**
 * Generic children prop type
 */
export type ReactChildren = React.ReactNode;

/**
 * Class names utility function type
 */
export type ClassNamesFunction = (...classes: Array<string | boolean | undefined | null>) => string;

/**
 * Tag component props
 */
export interface TagProps {
  children: ReactChildren;
  className?: string;
  href?: string;
  active?: boolean;
}

/**
 * Navigation component props
 */
export interface NavProps {
  pathName: string[];
}

/**
 * Tabs wrapper component props
 */
export interface TabsWrapperProps {
  defaultTab?: string;
  children: ReactChildren;
}

/**
 * Tab content component props
 */
export interface TabContentProps {
  children: ReactChildren;
  value: string;
}

/**
 * On this page dropdown props
 */
export interface OnThisPageDropdownProps {
  nav: NavItem[] | undefined;
}

/**
 * FAQ item structure
 */
export interface FAQItem {
  title: string;
  description: string;
}

/**
 * FAQ component props
 */
export interface FAQProps {
  faqs: FAQItem[];
}

/**
 * Description expand component props
 */
export interface DescriptionExpandProps {
  description: string;
}

/**
 * How to contribute dropdown props
 */
export interface HowToContributeDropdownProps {
  heading: string;
  children: React.ReactElement<{ value: string }>;
}

/**
 * Provider card props
 */
export interface ProviderCardProps {
  provider: ApiProviderList;
}

/**
 * Stats component props
 */
export interface StatsProps {
  componentName: string;
  value: string | number;
  isOver60Percent?: boolean;
}

/**
 * Button props (for provider card)
 */
export interface ButtonProps {
  label: string;
  link: string;
  enable: boolean;
}

/**
 * Provider card with button props
 */
export interface ProviderCardWithButtonProps {
  provider: ApiProviderList;
  button: ButtonProps;
}

/**
 * Link item structure
 */
export interface LinkItem {
  label: string;
  link: string;
}

/**
 * Custom pricing data structure
 */
export interface CustomPricingData {
  spec: {
    cpu: number;
    memory: number;
    storage: number;
  };
  akash: number;
  aws: number;
  gcp: number;
  azure: number;
}

/**
 * Custom pricing context props
 */
export interface CustomPricingContextProps {
  customPricing: CustomPricingData;
  setCustomPricing: React.Dispatch<React.SetStateAction<CustomPricingData>>;
}

/**
 * Column component props (for price chart)
 */
export interface ColumnProps {
  children: ReactChildren;
}

/**
 * Provider icon props
 */
export interface ProviderIconProps {
  providerIcon: string;
}

/**
 * Token page section types (from Token_Homepage collection schema)
 */
export interface AktFeaturesSection {
  title: string;
  description: string;
}

export interface BuyingAKTSection {
  title: string;
  description: string;
  categories: Array<{
    title: string;
    items: Array<{
      title: string;
      link: string;
      icon: string;
    }>;
  }>;
}

export interface FAQsSection {
  title: string;
  faqs: Array<{
    title: string;
    description: string;
  }>;
}

/**
 * Token page sections component props
 */
export interface TokenSectionsProps {
  aktFeaturesSection: AktFeaturesSection;
  buyingAKTSection: BuyingAKTSection;
  faqsSection: FAQsSection;
  url: string;
}

/**
 * CoinGecko API response type for token metrics
 */
export interface CoinGeckoTokenData {
  time?: number;
  market_data?: {
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    current_price?: {
      usd?: number;
    };
    market_cap?: {
      usd?: number;
    };
    total_volume?: {
      usd?: number;
    };
    last_updated?: string;
  };
}
