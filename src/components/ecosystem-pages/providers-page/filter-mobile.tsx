import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import type { ClassNamesFunction } from "@/types/components";

function classNames(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const FilterMobile = ({
  onIsFilteringActiveClick,
  isFilteringActive,
  onIsFilteringAuditedClick,
  isFilteringAudited,
  className,
}: {
  onIsFilteringActiveClick: (value: boolean) => void;
  onIsFilteringAuditedClick: (value: boolean) => void;
  isFilteringActive: boolean;
  isFilteringAudited: boolean;
  className?: string;
}) => {
  return (
    <Menu
      as="div"
      className={classNames(className, "relative inline-block text-left")}
    >
      <div>
        <Menu.Button className="inline-flex w-full  items-center justify-center gap-x-1.5 rounded-md border  bg-background2 px-3 py-2 text-xs font-medium shadow-sm  ">
          Filter by
          <ChevronDownIcon
            className="-mr-1 h-4 w-4 text-foreground"
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
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <p
                  onClick={() => {
                    onIsFilteringActiveClick(isFilteringActive ? false : true);
                    onIsFilteringAuditedClick(false);
                  }}
                  className={classNames(
                    isFilteringActive ? "bg-gray-100 dark:bg-darkGray" : "",
                    "block px-4 py-2 text-sm text-para",
                  )}
                >
                  Active
                </p>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <p
                  onClick={() => {
                    onIsFilteringAuditedClick(
                      isFilteringAudited ? false : true,
                    );
                    onIsFilteringActiveClick(false);
                  }}
                  className={classNames(
                    isFilteringAudited ? "bg-gray-100  dark:bg-darkGray" : "",
                    "block px-4 py-2 text-sm text-para",
                  )}
                >
                  Audited
                </p>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default FilterMobile;
