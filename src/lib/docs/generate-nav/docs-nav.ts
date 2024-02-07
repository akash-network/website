import { docsSequence } from "@/content/Docs/_sequence";

const abriviations:
  | {
      [key: string]: string;
    }
  | any = {
  cli: "CLI",
};

export function addNavItem(nav: any, label: any, link: any, isLastLevel: any) {
  const existingItem = nav.find((navItem: any) => navItem.link === link);
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

export function processPage(
  nav: any,
  idParts: any,
  currentIndex: any,
  linkPrefix: any,
  linkTitle: any,
) {
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

export const generateDocsNav = (pages: any) => {
  const nav: any = [];

  pages.forEach((item: any) => {
    const idParts = item.id.split("/");
    const linkPrefix = "/docs";
    const linkTitle = item.data.linkTitle;
    // Start at the top level
    processPage(nav, idParts, 0, linkPrefix, linkTitle);
  });

  function updateLinks(navArray: any) {
    return navArray.map((item: any) => ({
      ...item,
      link: item.link.endsWith("/") ? item.link : `${item.link}/`,
      subItems: updateLinks(item.subItems),
    }));
  }

  const newNav = updateLinks(nav);

  function reorderNav(navItem: any, navSequence: any) {
    const navMap = new Map();
    navItem.forEach((item: any) => navMap.set(item.label, item));

    const orderedNav = navSequence
      .map((seqItem: any) => {
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
      .filter((item: any) => item !== undefined);

    // Add items not present in navSequence to the end of orderedNav
    navMap.forEach((item: any) => orderedNav.push(item));

    return orderedNav;
  }

  const reorderedNav = reorderNav(
    [
      {
        label: "Docs",
        link: "/docs/",

        subItems: newNav,
      },
    ],
    docsSequence,
  );
  console.log(reorderedNav);

  return reorderedNav;
};
