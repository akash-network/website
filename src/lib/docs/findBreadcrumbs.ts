interface NavItem {
  label: string;
  link?: string;
  subItems?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  link: string;
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
      
      // Add current item to path if it has a link
      if (item.link) {
        const normalizedItemLink = normalizePath(item.link);
        
        currentPath.push({
          label: item.label,
          link: item.link,
        });
        
        // Check if this is the exact match
        if (normalizedItemLink === normalizedPath) {
          breadcrumbs.push(...currentPath);
          return true;
        }
        
        // Check if pathname is a child of this link
        // We need to ensure it's a proper path segment match, not just a prefix
        if (
          normalizedPath.startsWith(normalizedItemLink + "/") ||
          (normalizedItemLink === "/docs" && normalizedPath.startsWith("/docs/"))
        ) {
          // Recursively search subItems
          if (item.subItems && item.subItems.length > 0) {
            if (searchNav(item.subItems, currentPath)) {
              return true;
            }
          }
        }
      } else if (item.subItems && item.subItems.length > 0) {
        // Item has no link but has subItems, search recursively
        if (searchNav(item.subItems, currentPath)) {
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

