import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";

const PopOverNavItem = ({ subItems }: any) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm ">
          Network
          <ChevronDownIcon
            className="text-gra -mr-1 ml-1 h-4 w-4"
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
        <Menu.Items className="absolute left-0 z-10 mt-4 w-[304px] origin-top-right divide-y rounded-xl border  bg-background2 focus:outline-none">
          <div className="space-y-4 px-6 py-6">
            {subItems.map((item: any, i: any) => {
              return (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <a
                      href={item.link}
                      target={item.link.startsWith("http") ? "_blank" : "_self"}
                      className={`block  cursor-pointer p-2 font-semibold   ${
                        active ? "" : ""
                      } `}
                    >
                      <p className="text-sm font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm font-normal text-para">
                        {item.description}
                      </p>
                    </a>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverNavItem;
