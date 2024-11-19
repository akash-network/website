import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowRightCircle } from "lucide-react";
import { networkItems } from "./links";

const PopOverNavItemNetwork = () => {
  const [open2, setOpen] = useState(false);

  return (
    <Menu
      onMouseLeave={() => setOpen(false)}
      as="div"
      className="relative inline-block text-left"
    >
      <div>
        <Menu.Button
          onMouseEnter={() => {
            setOpen(true);
          }}
          className="inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm "
        >
          Network
          <ChevronDownIcon
            className="text-gra -mr-1 ml-1 h-4 w-4"
            aria-hidden="true"
          />
        </Menu.Button>
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
        <Menu.Items className="absolute left-1/2 z-[35] w-[456px]  origin-top-right translate-x-[-40%]    pt-4  focus:outline-none ">
          <div className="flex flex-col overflow-hidden rounded-3xl  border bg-background2  shadow-lg">
            <div className="p-5">
              {networkItems.map((item, i: any) => {
                return (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <a
                        href={item.link}
                        target={
                          item.link.startsWith("http") ? "_blank" : "_self"
                        }
                        className={`group flex cursor-pointer  items-center gap-6 px-4 py-5 transition-all hover:rounded-lg hover:bg-gray-50 dark:hover:bg-black/10   ${
                          active ? "" : ""
                        } `}
                      >
                        <div className="rounded-lg bg-background p-2.5 text-para transition-all group-hover:bg-background2 group-hover:text-primary">
                          {item.icon ? (
                            <item.icon size={24} />
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
            <a
              href="https://stats.akash.network/"
              target="_blank"
              className="border-t bg-gray-50 px-8 py-4 font-semibold transition-all hover:bg-gray-100 dark:bg-background hover:dark:bg-darkGray"
            >
              <p className="flex items-center text-sm font-semibold text-foreground ">
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

export default PopOverNavItemNetwork;
