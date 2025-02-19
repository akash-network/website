import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { CalendarModal } from "@/components/development-pages/calendar-modal";
import { getYearToUse } from "@/utils/redirects";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { ArrowRightCircle } from "lucide-react";
import {
  communityItems,
  developmentItems,
  ecosystemNavItems,
  networkItems,
  pricingItems,
} from "./links";

const PopOverSmall = ({
  type,
  latestRoadmapYear,
}: {
  type: "community" | "development";
  latestRoadmapYear?: number;
}) => {
  const items = type === "community" ? communityItems : developmentItems;
  const external = items.find((item) => item.external);
  const [open2, setOpen] = useState(false);

  return (
    <Menu
      as="div"
      className="relative inline-block text-left"
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={
          type === "community"
            ? communityItems[0].link
            : developmentItems[0].link
        }
        onMouseEnter={() => {
          setOpen(true);
        }}
        className="inline-flex cursor-pointer items-center justify-center text-sm font-medium capitalize leading-normal hover:text-primary xl:text-sm "
      >
        {type}
        <ChevronDownIcon
          className="text-gra -mr-1 ml-1 h-4 w-4"
          aria-hidden="true"
        />
      </a>

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
        <Menu.Items className="absolute left-1/2 z-[35] w-[303px]   origin-top-right -translate-x-1/2     pt-4  focus:outline-none">
          <div className="flex flex-col overflow-hidden  rounded-3xl border  bg-background2 shadow-lg">
            <div className="  p-5 ">
              {items
                .filter((item) => !item.external)
                .map((item, i) => {
                  return (
                    <Menu.Item key={i}>
                      {({ active }) => (
                        <a
                          href={
                            item.link === "roadmap"
                              ? `/roadmap/${latestRoadmapYear}`
                              : item.link
                          }
                          target={
                            item.link.startsWith("http") ? "_blank" : "_self"
                          }
                          className="dark:hover:bg- group flex  cursor-pointer items-center gap-6 rounded-lg px-4 py-3 transition-all hover:bg-gray-50 dark:hover:bg-black/10"
                        >
                          <div className="text-[#9CA3AF] transition-all group-hover:text-primary dark:text-para">
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
            <a
              href={external?.link}
              target={external?.link.startsWith("http") ? "_blank" : "_self"}
              className="border-t bg-gray-50 px-7 py-3 font-semibold transition-all hover:bg-gray-100 dark:bg-background hover:dark:bg-darkGray"
            >
              <p className="inline-flex items-center text-sm font-semibold text-foreground ">
                {external?.title}
                <ArrowRightCircle
                  className="ml-1 inline-block -rotate-45 stroke-[1.5px]"
                  size={16}
                />
              </p>
              <p className="mt-1 text-sm font-normal text-para">
                {external?.description}
              </p>
            </a>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverSmall;

export const SubNavbar = ({
  pathname,
  type,
}: {
  pathname: string;
  type: "community" | "development" | "network" | "ecosystem" | "pricing";
}) => {
  const items =
    type === "community"
      ? communityItems
      : type === "development"
        ? developmentItems
        : type === "ecosystem"
          ? ecosystemNavItems
          : type === "pricing"
            ? pricingItems
            : networkItems.map((item) => ({ ...item, external: false }));

  const external = items.find((item) => item?.external);
  return (
    <div className=" border-y">
      <div className="container-nav flex items-center gap-2 overflow-x-auto  md:justify-between">
        <div className="flex">
          {items
            .filter((item) => !item?.external)
            .map((item, i) => {
              return (
                <a
                  key={i}
                  href={
                    item.link === "roadmap"
                      ? `/roadmap/${getYearToUse()}`
                      : item.link
                  }
                  target={item.link.startsWith("http") ? "_blank" : "_self"}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2  border-b-2   p-4 text-para    ",
                    pathname === item.link ||
                      (item.link === "roadmap" &&
                        pathname?.split("/")[1] === "roadmap") ||
                      pathname?.split("/")[2] === item.link?.split("/")[2]
                      ? " border-foreground "
                      : "border-transparent",
                  )}
                >
                  {item.icon ? (
                    <item.icon size={24} strokeWidth={1.5} />
                  ) : (
                    item.customIcon
                  )}
                  <p className="flex-1 whitespace-nowrap text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                </a>
              );
            })}
        </div>
        {type === "development" ? (
          <CalendarModal />
        ) : (
          external && (
            <a
              href={external.link}
              target="_blank"
              className=" flex items-center whitespace-nowrap rounded-full  border bg-background px-3 py-1.5 text-sm font-semibold  "
            >
              {external.title}
              <ArrowRightCircle
                className="ml-1 inline-block -rotate-45 stroke-[1.5px]"
                size={16}
              />
            </a>
          )
        )}
      </div>
    </div>
  );
};
