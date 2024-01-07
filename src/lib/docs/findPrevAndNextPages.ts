export function findPrevAndNextPages(nav, pathname) {
  let allItems = [];

  // Extract all the items from the 'nav' array
  function flattenNav(nav) {
    nav.forEach((item) => {
      allItems.push(item);
      if (item.subItems && item.subItems.length > 0) {
        flattenNav(item.subItems);
      }
    });
  }

  flattenNav(nav);

  // Find the index of the current page in the items array

  const currentIndex = allItems.findIndex(
    (item) => `${item.link}/` === `${pathname}/`,
  );

  // Calculate the index of the previous and next pages
  const prevIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  // Determine the previous and next pages
  let prevPage = prevIndex >= 0 ? allItems[prevIndex] : null;
  let nextPage =
    nextIndex < allItems.length ? findFirstSubitem(allItems[nextIndex]) : null;

  // If the current page is a subitem and its parent has subitems, find the level back item
  if (currentIndex > 0 && hasSubItems(allItems[currentIndex - 1])) {
    prevPage = findLevelBackItem(allItems, currentIndex - 2);
  }

  return { prevPage, nextPage };
}

// Helper function to check if an item has subitems
function hasSubItems(item) {
  return item.subItems && item.subItems.length > 0;
}

// Helper function to find the first subitem
function findFirstSubitem(item) {
  if (hasSubItems(item)) {
    return findFirstSubitem(item.subItems[0]);
  }
  return item;
}

// Helper function to find the level back item
function findLevelBackItem(allItems, index) {
  if (index >= 0) {
    const currentItem = allItems[index];
    if (hasSubItems(currentItem)) {
      return findLevelBackItem(allItems, index - 1);
    }
    return currentItem;
  }
  return null;
}
