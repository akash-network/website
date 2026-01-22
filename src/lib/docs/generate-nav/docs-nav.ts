import { docsSequence } from "@/content/Docs/_sequence";

const abriviations:
  | {
      [key: string]: string;
    }
  | any = {
  cli: "CLI",
  api: "API",
  sdk: "SDK",
  sdl: "SDL",
};

export function addNavItem(nav: any, label: any, link: any, isLastLevel: any, weight?: number) {
  const existingItem = nav.find((navItem: any) => navItem.link === link);
  if (existingItem) {
    // Update weight if provided (replace default 999 with actual weight)
    if (weight !== undefined) {
      existingItem.weight = weight;
    }
    return existingItem;
  }

  const newItem = {
    label: label,
    link: `${link}`,
    enabled: true,
    subItems: isLastLevel ? [] : [],
    weight: weight ?? 999, // Default weight for items without weight
  };

  nav.push(newItem);
  return newItem;
}

export function processPage(
  nav: any,
  idParts: any,
  currentIndex: any,
  linkPrefix: any,
  linkTitle: any,
  weight?: number,
  indexLinkTitles?: Map<string, string>,
) {
  if (currentIndex >= idParts.length - 1) {
    return; // End of recursion for the second-to-last level
  }

  const label = idParts[currentIndex];
  const link = `${linkPrefix}/${label}`;
  const isLastLevel = currentIndex === idParts.length - 2;
  
  // Check if this is an actual page - last part should be "index" (without extension)
  // or contain "index." (with extension like index.md, index.mdx)
  const lastPart = idParts[idParts.length - 1];
  const isActualPage = lastPart === "index" || lastPart.startsWith("index.");
  

  // Check if this folder has an index file with a linkTitle
  const folderPath = idParts.slice(0, currentIndex + 1).join("/");
  const indexLinkTitle = indexLinkTitles?.get(folderPath);

  let capitalizedLabel: string;
  // Priority: 1) indexLinkTitle for folders, 2) linkTitle for pages, 3) capitalize folder name
  if (indexLinkTitle && !isLastLevel) {
    // Use the linkTitle from the index file for parent folders (highest priority)
    capitalizedLabel = indexLinkTitle;
  } else if (currentIndex > idParts.slice(0, -2).length - 1 && linkTitle) {
    // Use linkTitle for the actual page
    capitalizedLabel = linkTitle;
  } else {
    // Capitalize folder name as fallback
    const splitLabel = label.split("-");
    capitalizedLabel = splitLabel
      .map((word: any) => {
        if (abriviations[word]) {
          return abriviations[word];
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  // Use weight for actual pages (files with index), not for folder containers
  const itemWeight = (isLastLevel && isActualPage) ? weight : undefined;
  const currentItem = addNavItem(nav, capitalizedLabel, link, isLastLevel, itemWeight);
  
  // Always update the label if we have an indexLinkTitle (in case item was created earlier with wrong label)
  if (indexLinkTitle && !isLastLevel) {
    currentItem.label = indexLinkTitle;
  }

  processPage(currentItem.subItems, idParts, currentIndex + 1, link, linkTitle, weight, indexLinkTitles);
}

export const generateDocsNav = (pages: any) => {
  const nav: any = [];

  // Filter out pages that should be hidden from navigation
  const visiblePages = pages.filter((item: any) => !item.data.hideFromNav);

  // Create a map of folder paths to their index file linkTitles
  const indexLinkTitles = new Map<string, string>();
  visiblePages.forEach((item: any) => {
    const idParts = item.id.split("/");
    // If this is an index file, store its linkTitle for the parent folder
    if (idParts[idParts.length - 1] === "index" && item.data.linkTitle) {
      const folderPath = idParts.slice(0, -1).join("/");
      indexLinkTitles.set(folderPath, item.data.linkTitle);
      // Also store with "/docs/" prefix for matching against links
      indexLinkTitles.set(`/docs/${folderPath}`, item.data.linkTitle);
      indexLinkTitles.set(`/docs/${folderPath}/`, item.data.linkTitle);
    }
  });

  visiblePages.forEach((item: any) => {
    const idParts = item.id.split("/");
    const linkPrefix = "/docs";
    const linkTitle = item.data.linkTitle;
    const weight = item.data.weight;

    processPage(nav, idParts, 0, linkPrefix, linkTitle, weight, indexLinkTitles);
  });

  function updateLinks(navArray: any) {
    return navArray.map((item: any) => ({
      ...item,
      link: item.link.endsWith("/") ? item.link : `${item.link}/`,
      subItems: updateLinks(item.subItems),
    }));
  }

  const newNav = updateLinks(nav);

  // Post-process: update all labels using indexLinkTitles (PRESERVES ALL PROPERTIES INCLUDING WEIGHT)
  function updateLabelsFromIndex(navArray: any): any {
    return navArray.map((item: any) => {
      if (!item.link) {
        return item;
      }
      
      // Try multiple path formats to match
      const linkPath1 = item.link.replace("/docs/", "").replace(/\/$/, "");
      const linkPath2 = item.link.replace("/docs/", "");
      const linkPath3 = item.link;
      
      // Check if we have an indexLinkTitle for any of these paths
      const indexLinkTitle = indexLinkTitles.get(linkPath1) || 
                            indexLinkTitles.get(linkPath2) || 
                            indexLinkTitles.get(linkPath3);
      
      // Only update label if we found a matching indexLinkTitle for a folder
      if (indexLinkTitle && item.subItems && item.subItems.length > 0) {
        item.label = indexLinkTitle;
      }
      
      // Recursively update sub-items
      if (item.subItems && item.subItems.length > 0) {
        item.subItems = updateLabelsFromIndex(item.subItems);
      }
      
      return item;
    });
  }

  function sortByWeight(navItem: any): any {
    if (!navItem || navItem.length === 0) return navItem;
    
    // First recursively sort all subItems
    const withSortedSubItems = navItem.map((item: any) => ({
      ...item,
      subItems: item.subItems && item.subItems.length > 0 
        ? sortByWeight(item.subItems) 
        : item.subItems,
    }));
    
    // Then sort the current level by weight
    const sorted = withSortedSubItems.sort((a: any, b: any) => {
      const aWeight = a.weight ?? 999;
      const bWeight = b.weight ?? 999;
      return aWeight - bWeight;
    });
    
    return sorted;
  }

  function reorderNav(navItem: any, navSequence: any) {
    const navMap = new Map();
    navItem.forEach((item: any) => navMap.set(item.label, item));

    const orderedNav = navSequence
      .map((seqItem: any) => {
        // Skip headers in the output
        if (seqItem.type === "Header") {
          return null;
        }
        
        if (navMap.has(seqItem.label)) {
          const item = navMap.get(seqItem.label);
          navMap.delete(seqItem.label);
          if (item.subItems && item.subItems.length > 0) {
            if (seqItem.subItems && seqItem.subItems.length > 0) {
              // Recursively reorder subItems based on sequence, then sort by weight
              item.subItems = reorderNav(item.subItems, seqItem.subItems);
            }
            // Always sort by weight, regardless of whether sequence has subItems
            item.subItems = sortByWeight(item.subItems);
          }
          return item;
        }
      })
      .filter((item: any) => item !== null && item !== undefined);

    // Add items not present in navSequence to the end of orderedNav
    // Sort them by weight before adding
    const remainingItems = Array.from(navMap.values());
    remainingItems.forEach((item: any) => {
      // Sort subItems by weight before adding
      if (item.subItems && item.subItems.length > 0) {
        item.subItems = sortByWeight(item.subItems);
      }
    });
    // Sort remaining items by weight, then add to orderedNav
    const sortedRemaining = sortByWeight(remainingItems);
    sortedRemaining.forEach((item: any) => orderedNav.push(item));

    return orderedNav;
  }

  // First, sort all sub-items by weight (recursively)
  const navWithSortedSubItems = newNav.map((item: any) => ({
    ...item,
    subItems: item.subItems && item.subItems.length > 0 
      ? sortByWeight(item.subItems) 
      : item.subItems,
  }));
  
  // Then order top-level items by sequence
  const navMap = new Map();
  navWithSortedSubItems.forEach((item: any) => navMap.set(item.label, item));
  
  const orderedTopLevel: any[] = [];
  const { subItems: docsSeq } = docsSequence[0];
  
  // Add items in sequence order
  docsSeq.forEach((seqItem: any) => {
    if (seqItem.type === "Header") return; // Skip headers
    if (navMap.has(seqItem.label)) {
      orderedTopLevel.push(navMap.get(seqItem.label));
      navMap.delete(seqItem.label);
    }
  });
  
  // Add any remaining items (sorted by weight)
  const remaining = Array.from(navMap.values());
  const sortedRemaining = sortByWeight(remaining);
  orderedTopLevel.push(...sortedRemaining);
  
  // Update labels AFTER ordering
  const navWithLabels = updateLabelsFromIndex(orderedTopLevel);

  return [
    {
      label: "Docs",
      link: "/docs/",
      subItems: navWithLabels,
    },
  ];
};
