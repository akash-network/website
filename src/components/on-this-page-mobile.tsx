import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function OnThisPageDropdown({ nav }: { nav: any }) {
  return (
    <Menu as="div" className="relative inline-block text-left md:hidden">
      <div>
        <Menu.Button className="inline-flex w-full items-center justify-center gap-x-1.5 text-xs  ">
          On this page
          <ChevronDownIcon className="-mr-1 h-4 w-4 " aria-hidden="true" />
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
            {nav?.map((item: any, index: number) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <a
                    href={item.link}
                    className={classNames(
                      active
                        ? "bg-gray-100 text-foreground dark:bg-darkGray"
                        : "text-textGray",
                      "block px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary hover:dark:bg-darkGray",
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
