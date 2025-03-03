interface NavItem {
  link: string;
  subItems?: NavItem[];
}

interface PrevNextPages {
  prevPage: NavItem | null;
  nextPage: NavItem | null;
}

export function findPrevAndNextPages(
  nav: NavItem[],
  pathname: string,
): PrevNextPages {
  let allItems: NavItem[] = [];

  function flattenNav(nav: NavItem[]): void {
    nav.forEach((item) => {
      allItems.push(item);
      if (item.subItems && item.subItems.length > 0) {
        flattenNav(item.subItems);
      }
    });
  }

  flattenNav(nav);

  const currentIndex = allItems.findIndex(
    (item) => `${item.link}/` === `${pathname}/`,
  );

  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  let prevPage = prevIndex >= 0 ? allItems[prevIndex] : null;
  let nextPage =
    nextIndex < allItems.length ? findFirstSubitem(allItems[nextIndex]) : null;
  if (currentIndex > 0 && hasSubItems(allItems[currentIndex - 1])) {
    prevPage = findLevelBackItem(allItems, currentIndex - 2);
  }

  return { prevPage, nextPage };
}
function hasSubItems(item: NavItem): boolean {
  return item.subItems !== undefined && item.subItems.length > 0;
}

function findFirstSubitem(item: NavItem): NavItem {
  if (hasSubItems(item)) {
    return findFirstSubitem(item.subItems![0]);
  }
  return item;
}

function findLevelBackItem(allItems: NavItem[], index: number): NavItem | null {
  if (index >= 0) {
    const currentItem = allItems[index];
    if (hasSubItems(currentItem)) {
      return findLevelBackItem(allItems, index - 1);
    }
    return currentItem;
  }
  return null;
}
