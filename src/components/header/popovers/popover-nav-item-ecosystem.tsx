import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowRight } from "lucide-react";
import { ecosystemNavItems } from "./links";

const PopOverNavItemEcosystem = () => {
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
          className="group inline-flex cursor-pointer items-center justify-center text-[13.4px] leading-[18.6px] font-normal text-zinc-400 hover:text-white transition-colors "
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
        <Menu.Items className="absolute left-1/2 z-[35] w-[280px] origin-top-right translate-x-[-40%] pt-4 focus:outline-none 2xl:-translate-x-1/2">
          <div className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-[#0d0d0f] shadow-xl">
            <div className="p-2">
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
                          className="group flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2.5 outline-none transition-colors hover:bg-white/5"
                        >
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-normal text-foreground">
                              {item.title}
                            </p>
                            <p className="text-xs font-normal text-zinc-500 whitespace-nowrap">
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight className="ml-4 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      )}
                    </Menu.Item>
                  );
                })}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverNavItemEcosystem;
