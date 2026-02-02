import type { NavConfig } from "@/types/navigation";

// Define an array named 'nav' that represents a navigation menu.
export const nav: NavConfig = [
  // Create an item for 'Product Strategy' with sub-items.
  {
    label: "Welcome", // Label for the main menu item.
    link: "/development/welcome/", // Link associated with the sub-item.
    enabled: true, // A flag indicating whether the sub-item is enabled.
  },
  {
    label: "Community Groups",
    link: "/development/community-groups/",
    enabled: true,
  },
  {
    label: "Current Projects",
    link: "/development/current-projects/",
    enabled: true,
  },

  {
    label: "Bounties",
    link: "/development/bounties/",
    enabled: true,
  },
  {
    label: "Funding Programs",
    link: "/development/funding-program/",
    enabled: true,
  },
];
