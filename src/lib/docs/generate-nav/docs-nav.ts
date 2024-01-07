import { docsSequence } from "@/content/Docs/_sequence";

const abriviations:
  | {
      [key: string]: string;
    }
  | any = {
  cli: "CLI",
};

export function addNavItem(nav, label, link, isLastLevel) {
  const existingItem = nav.find((navItem) => navItem.link === link);
  if (existingItem) {
    return existingItem;
  }

  const newItem = {
    label: label,
    link: `${link}`,
    enabled: true,
    subItems: isLastLevel ? [] : [],
  };

  nav.push(newItem);
  return newItem;
}

export function processPage(nav, idParts, currentIndex, linkPrefix, linkTitle) {
  if (currentIndex >= idParts.length - 1) {
    return; // End of recursion for the second-to-last level
  }

  const label = idParts[currentIndex];
  const splitLabel = label.split("-");
  const capitalizedLabel =
    currentIndex > idParts.slice(0, -2).length - 1
      ? linkTitle
      : splitLabel
          .map((word: any) => {
            if (abriviations[word]) {
              return abriviations[word];
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");

  const link = `${linkPrefix}/${label}`;
  const isLastLevel = currentIndex === idParts.length - 2;

  const currentItem = addNavItem(nav, capitalizedLabel, link, isLastLevel);

  processPage(currentItem.subItems, idParts, currentIndex + 1, link, linkTitle);
}

export const generateDocsNav = (pages) => {
  const nav: any = [];

  pages.forEach((item) => {
    const idParts = item.id.split("/");
    const linkPrefix = "/akash-docs";
    const linkTitle = item.data.linkTitle;
    // Start at the top level
    processPage(nav, idParts, 0, linkPrefix, linkTitle);
  });

  function updateLinks(navArray: any) {
    return navArray.map((item) => ({
      ...item,
      link: item.link.endsWith("/") ? item.link : `${item.link}/`,
      subItems: updateLinks(item.subItems),
    }));
  }

  const newNav = updateLinks(nav);

  function reorderNav(navItem, navSequence) {
    const navMap = new Map();
    navItem.forEach((item) => navMap.set(item.label, item));

    const orderedNav = navSequence
      .map((seqItem) => {
        if (navMap.has(seqItem.label)) {
          const item = navMap.get(seqItem.label);
          navMap.delete(seqItem.label);
          if (
            seqItem.subItems &&
            seqItem.subItems.length > 0 &&
            item.subItems
          ) {
            item.subItems = reorderNav(item.subItems, seqItem.subItems);
          }
          return item;
        }
      })
      .filter((item) => item !== undefined);

    // Add items not present in navSequence to the end of orderedNav
    navMap.forEach((item) => orderedNav.push(item));

    return orderedNav;
  }

  const reorderedNav = reorderNav(newNav, docsSequence);
  console.log(reorderedNav);

  return reorderedNav;
};
