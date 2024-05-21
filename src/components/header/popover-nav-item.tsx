import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowUpRight } from "lucide-react";

const PopOverNavItem = ({ subItems }: any) => {
  console.log(subItems);

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
          <div className="space-y-4 p-4">
            {subItems.map((item: any, i: any) => {
              return (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <div className="flex items-start p-2 rounded-lg hover:bg-[#f9fafb]">
                      <img src={item.icon} width={18} className="mr-3 mt-1" />
                      <a
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : "_self"}
                        className={`block  cursor-pointer font-semibold   ${active ? "" : ""
                          } `}
                      >
                        <p className="flex items-center text-sm font-bold text-foreground ">
                          {item.title}
                          {item.link.startsWith("http") ? (
                            <ArrowUpRight
                              className="ml-1 inline-block"
                              size={16}
                            />
                          ) : (
                            ""
                          )}
                        </p>
                        <p className="mt-1 text-sm font-normal text-para">
                          {item.description}
                        </p>
                      </a>
                    </div>
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
