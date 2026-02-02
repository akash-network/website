import type { NavConfig } from "@/types/navigation";

// Define an array named 'nav' that represents a navigation menu.
export const nav: NavConfig = [
  // Create an item for 'Product Strategy' with sub-items.
  {
    label: "General Information", // Label for the main menu item.
    link: "/network/general-information/",
    enabled: true,
  },
  {
    label: "Providers", // Label for the main menu item.
    link: "/network/providers/",
    enabled: true,
  },
  {
    label: "Tenants", // Label for the main menu item.
    link: "/network/tenants/",
    enabled: true,
  },
  {
    label: "Roadmap", // Label for the main menu item.
    link: "/network/Roadmap/",
    enabled: true,
  },
  {
    label: "Pricing", // Label for the main menu item.
    link: "/network/pricing/",
    enabled: true,
  },
  {
    label: "Network Activity", // Label for the main menu item.
    link: "/network/network-activity/",
    enabled: true,
  },
];
