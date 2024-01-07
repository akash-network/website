import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";

export default function SortDropDown({ currentPath }: { currentPath: string }) {
  // Use state to track the currently selected sort option.
  const [currentSort, setCurrentSort] = useState(
    // Parse the current path and capitalize the first letter.
    currentPath.split("/")[3].charAt(0).toUpperCase() +
      currentPath.split("/")[3].slice(1),
  );

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center gap-x-2">
        <p className="text-sm font-medium">Sort:</p>
        <Menu.Button className="dark:hover:bg-darkGray inline-flex  w-full justify-center gap-x-1.5 rounded-md border bg-background2 px-3 py-2 text-sm  font-semibold text-sortText shadow-sm hover:bg-gray-50">
          {currentSort}
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
        <Menu.Items className="absolute right-0 z-10 mt-4 w-40 origin-top-right divide-y divide-gray-100 rounded-lg border  bg-background2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="space-y-1 px-2 py-3">
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/ecosystem/${currentPath.split("/")[2]}/latest`}
                  className="block"
                >
                  <button
                    onClick={() => setCurrentSort("Latest")}
                    className={`${
                      currentSort === "Latest"
                        ? "dark:bg-darkGray bg-gray-100"
                        : "text-foreground"
                    } group flex w-full items-center justify-start rounded-md px-2 py-2 text-sm font-medium`}
                  >
                    <CheckIcon
                      className={`${
                        currentSort === "Latest" ? "visible" : "invisible"
                      } mr-1 h-4 w-4`}
                      aria-hidden="true"
                    />
                    Latest
                  </button>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/ecosystem/${currentPath.split("/")[2]}/oldest`}
                  className="block"
                >
                  <button
                    onClick={() => setCurrentSort("Oldest")}
                    className={`${
                      currentSort === "Oldest"
                        ? "dark:bg-darkGray bg-gray-100"
                        : "text-foreground"
                    } group flex w-full items-center justify-start rounded-md px-2 py-2 text-sm font-medium`}
                  >
                    <CheckIcon
                      className={`${
                        currentSort === "Oldest" ? "visible" : "invisible"
                      } mr-1 h-4 w-4`}
                      aria-hidden="true"
                    />
                    Oldest
                  </button>
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
