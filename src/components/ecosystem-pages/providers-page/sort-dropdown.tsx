import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";

interface SortOption {
  id: string;
  title: string;
}

function getSortTitle(currentSort: string, sortOptions: SortOption[]): string {
  const matchingOption = sortOptions.find(
    (option: SortOption) => option.id === currentSort,
  );

  if (matchingOption) {
    return matchingOption.title;
  } else {
    return "Unknown Sort Option";
  }
}

export default function SortDropDown({
  currentSort,
  sortOptions,
  setSort,
}: {
  currentSort: string;
  sortOptions: SortOption[];
  setSort: (sortId: string) => void;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center gap-x-2">
        <p className="text-sm font-medium">Sort:</p>
        <Menu.Button className="dark:hover:bg-darkGray inline-flex  w-full justify-center gap-x-1.5 rounded-md border bg-background2 px-3 py-2 text-sm  font-semibold text-sortText shadow-sm hover:bg-gray-50">
          {getSortTitle(currentSort, sortOptions)}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-foreground"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-4 w-56 origin-top-right divide-y divide-gray-100 rounded-lg border  bg-background2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="space-y-1 px-2 py-3">
            {sortOptions.map((sort: SortOption) => {
              return (
                <Menu.Item key={sort.id}>
                  {({ active }) => (
                    <button
                      onClick={() => setSort(sort.id)}
                      className={`${
                        currentSort === sort.id
                          ? "dark:bg-darkGray bg-gray-100"
                          : "text-foreground"
                      } group flex w-full items-center justify-start rounded-md px-2 py-2 text-sm font-medium`}
                    >
                      <CheckIcon
                        className={`${
                          currentSort === sort.id ? "visible" : "invisible"
                        } mr-1 h-4 w-4`}
                        aria-hidden="true"
                      />
                      {sort.title}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
