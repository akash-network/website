import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { CollectionEntry } from "astro:content";
import { ArrowRightCircle } from "lucide-react";
import { ecosystemNavItems } from "./links";

const PopOverNavItemEcosystem = ({
  posts,
}: {
  posts: CollectionEntry<"Blog">[];
}) => {
  const [open2, setOpen] = useState(false);
  return (
    <Menu
      onMouseLeave={() => setOpen(false)}
      as="div"
      className="relative inline-block text-left"
    >
      <div>
        <a
          href={ecosystemNavItems[0].link}
          className="group inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm "
          onMouseEnter={() => {
            setOpen(true);
          }}
        >
          Ecosystem
          <ChevronDownIcon
            className="text-gra -mr-1 ml-1 h-4 w-4 transition-all group-hover:rotate-180"
            aria-hidden="true"
          />
        </a>
      </div>

      <Transition
        show={open2}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute  left-1/2 z-[35] w-[303px]  origin-top-right translate-x-[-40%]  pt-4       focus:outline-none 2xl:-translate-x-1/2">
          <div className="flex flex-col overflow-hidden rounded-3xl border bg-background2 shadow-lg">
            <div className="flex gap-2.5 p-5 ">
              <div className="flex w-full flex-1 flex-col">
                {ecosystemNavItems
                  .filter((item) => !item.external && !item.internal)
                  .map((item, i) => {
                    return (
                      <Menu.Item key={i}>
                        {({ active }) => (
                          <a
                            href={item.link}
                            target={
                              item.link.startsWith("http") ? "_blank" : "_self"
                            }
                            className={`group flex cursor-pointer items-center gap-6 rounded-lg px-4 py-3  transition-all hover:bg-gray-50 dark:hover:bg-black/10    ${
                              active ? "" : ""
                            } `}
                          >
                            <div className="text-[#9CA3AF] transition-all group-hover:text-primary dark:text-para ">
                              {item.icon ? (
                                <item.icon size={24} strokeWidth={1.5} />
                              ) : (
                                item.customIcon
                              )}
                            </div>
                            <div className="font-semibold">
                              <p className="flex items-center text-sm font-semibold text-foreground ">
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
                            </div>
                          </a>
                        )}
                      </Menu.Item>
                    );
                  })}
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverNavItemEcosystem;
