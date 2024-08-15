import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowRightCircle } from "lucide-react";
import { networkItems } from "./links";

const PopOverNavItemEcosystem = () => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm ">
          Ecosystem
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
        <Menu.Items className="absolute left-1/2 z-10 mt-4 flex w-[593px] origin-top-right translate-x-[-40%] flex-col   overflow-hidden rounded-3xl border  bg-background2 shadow focus:outline-none 2xl:-translate-x-1/2">
          <div className="p-5">
            {networkItems.map((item, i: any) => {
              return (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <a
                      href={item.link}
                      target={item.link.startsWith("http") ? "_blank" : "_self"}
                      className={`flex cursor-pointer items-center  gap-6 px-4 py-5    ${
                        active ? "" : ""
                      } `}
                    >
                      <div className="rounded-lg bg-background p-2.5 text-para">
                        {item.icon ? <item.icon size={24} /> : item.customIcon}
                      </div>
                      <div className="font-semibold">
                        <p className="flex items-center text-sm font-bold text-foreground ">
                          {item.title}
                          {item.link.startsWith("http") ? (
                            <ArrowRightCircle
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
                      </div>
                    </a>
                  )}
                </Menu.Item>
              );
            })}
          </div>
          <div className="border-t bg-gray-50 px-8 py-4 dark:bg-background">
            <a
              href="https://stats.akash.network/"
              target="_blank"
              className="font-semibold"
            >
              <p className="flex items-center text-sm font-bold text-foreground ">
                Akash Stats
                <ArrowRightCircle
                  className="ml-1 inline-block -rotate-45 stroke-[1.5px]"
                  size={16}
                />
              </p>
              <p className="mt-1 text-sm font-normal text-para">
                Insights into the latest statistics about the Akash Network
              </p>
            </a>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverNavItemEcosystem;
