import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { ArrowRightCircle, BadgeHelp, Codesandbox } from "lucide-react";

const networkItems = [
  {
    icon: BadgeHelp,
    title: "About Akash",
    description: "Discover how Akash works",
    link: "/about/general-information/",
  },
  {
    icon: Codesandbox,
    title: "Providers",
    description: "Your customers' data will be safe and secure",
    link: "/about/providers/",
  },
  {
    customIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M18.09 13.63C19.0353 13.2776 19.8765 12.6925 20.5358 11.9288C21.195 11.1651 21.6511 10.2476 21.8617 9.26093C22.0724 8.2743 22.0309 7.25048 21.741 6.28415C21.4512 5.31782 20.9223 4.44018 20.2034 3.73239C19.4845 3.0246 18.5987 2.50951 17.628 2.23477C16.6572 1.96003 15.6329 1.9345 14.6497 2.16054C13.6665 2.38658 12.7561 2.8569 12.0028 3.528C11.2495 4.1991 10.6776 5.04931 10.34 6M14 16C14 12.6863 11.3137 10 8 10C4.68629 10 2 12.6863 2 16C2 19.3137 4.68629 22 8 22C11.3137 22 14 19.3137 14 16Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "$AKT Token",
    description: "Understand the role of $AKT token",
    link: "/token",
  },
];

const PopOverNavItemNetwork = () => {
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
        <Menu.Items className="absolute left-1/2 z-10 mt-4 flex w-[456px] origin-top-right translate-x-[-40%] flex-col   overflow-hidden rounded-3xl border  bg-background2 shadow focus:outline-none 2xl:-translate-x-1/2">
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

export default PopOverNavItemNetwork;

export const NetworkNavbar = ({ pathname }: { pathname: string }) => {
  return (
    <div className="border-y">
      <div className="container flex">
        {networkItems.map((item, i: any) => {
          return (
            <a
              key={i}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : "_self"}
              className={clsx(
                "flex cursor-pointer items-center gap-2  p-4 text-para    ",
                pathname === item.link ||
                  pathname?.split("/")[2] === item.link?.split("/")[2]
                  ? "border-b-2 border-foreground "
                  : "",
              )}
            >
              {item.icon ? (
                <item.icon size={24} strokeWidth={1.5} />
              ) : (
                item.customIcon
              )}
              <h1 className="text-sm font-medium text-foreground">
                {item.title}
              </h1>
            </a>
          );
        })}
      </div>
    </div>
  );
};
