interface NavItem {
  label: string;
  link?: string;
  subItems?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  link: string;
}

// Helper function to find the first link in a dropdown item's subItems
// This matches the exact logic from docs-nav.tsx
function getFirstLink(item: NavItem): string | null {
  if (item.link) return item.link;

  if (item.subItems?.length) {
    for (const subItem of item.subItems) {
      if (subItem.link) return subItem.link;
      if (subItem.subItems?.length) {
        const nestedLink = getFirstLink(subItem);
        if (nestedLink) return nestedLink;
      }
    }
  }
  return null;
}

// Helper to get first link from subItems only (ignoring item's own link)
// Used when item has a link that might be a folder path (404), so we use first child link instead
function getFirstLinkFromSubItems(item: NavItem): string | null {
  if (item.subItems?.length) {
    for (const subItem of item.subItems) {
      if (subItem.link) return subItem.link;
      if (subItem.subItems?.length) {
        const nestedLink = getFirstLinkFromSubItems(subItem);
        if (nestedLink) return nestedLink;
      }
    }
  }
  return null;
}

export function findBreadcrumbs(
  nav: NavItem[],
  pathname: string,
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Normalize pathname - remove trailing slash for comparison
  const normalizePath = (path: string): string => {
    return path.replace(/\/$/, "") || "/";
  };

  const normalizedPath = normalizePath(pathname);

  function searchNav(
    items: NavItem[],
    parentPath: BreadcrumbItem[] = [],
  ): boolean {
    for (const item of items) {
      const currentPath = [...parentPath];

      // Determine the link to use for breadcrumbs
      // If item has subItems, use first link from subItems (avoids 404 on folder links)
      // Otherwise use the item's direct link
      let breadcrumbLink: string | null = null;
      if (item.subItems && item.subItems.length > 0) {
        // Item has subItems - use first link from subItems to avoid 404
        // This handles cases where item.link is a folder path that doesn't exist
        breadcrumbLink = getFirstLinkFromSubItems(item) || item.link || null;
      } else if (item.link) {
        // Item has direct link and no subItems - use it
        breadcrumbLink = item.link;
      }

      // If item has a link (for path matching), check if it matches
      if (item.link) {
        const normalizedItemLink = normalizePath(item.link);

        // Use breadcrumbLink for the breadcrumb (first link from subItems if available)
        // but use item.link for path matching
        if (breadcrumbLink) {
          currentPath.push({
            label: item.label,
            link: breadcrumbLink,
          });
        }

        // Check if this is the exact match
        if (normalizedItemLink === normalizedPath) {
          breadcrumbs.push(...currentPath);
          return true;
        }

        // Check if pathname is a child of this link
        // We need to ensure it's a proper path segment match, not just a prefix
        if (
          normalizedPath.startsWith(normalizedItemLink + "/") ||
          (normalizedItemLink === "/docs" &&
            normalizedPath.startsWith("/docs/"))
        ) {
          // Recursively search subItems
          if (item.subItems && item.subItems.length > 0) {
            if (searchNav(item.subItems, currentPath)) {
              return true;
            }
          }
        }
      } else if (item.subItems && item.subItems.length > 0) {
        // Item has no direct link but has subItems (dropdown)
        // Always add dropdown to path with its first link when searching children
        const tempPath = [...currentPath];
        const firstLink = getFirstLink(item);

        // Add dropdown item to path with its first link (so clicking goes to first page)
        // This matches sidebar behavior: dropdown items link to their first page
        if (firstLink) {
          tempPath.push({
            label: item.label,
            link: firstLink,
          });
        } else {
          // If no first link, still search children but don't add dropdown to path
          if (searchNav(item.subItems, currentPath)) {
            return true;
          }
          continue;
        }

        // Recursively search subItems to see if pathname matches any child
        // If a match is found, the tempPath (including dropdown) will be added to breadcrumbs
        if (searchNav(item.subItems, tempPath)) {
          return true;
        }
      }
    }
    return false;
  }

  // Always add "Docs" as the first breadcrumb
  breadcrumbs.push({
    label: "Docs",
    link: "/docs/",
  });

  // Search through navigation
  const actualNav = nav[0]?.label === "Docs" ? nav[0].subItems || [] : nav;
  searchNav(actualNav);

  return breadcrumbs;
}
