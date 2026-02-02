/**
 * Navigation item structure used across docs, development, community, and about pages
 */
export interface NavItem {
  label: string;
  link: string;
  meetings?: Meeting[];
  enabled: boolean;
  subItems?: NavItem[];
  weight?: number;
  type?: string;
}

export interface Meeting {
  title: string;
  link: string;
  label: string;
  date: Date;
}

/**
 * Navigation configuration array type
 */
export type NavConfig = NavItem[];
