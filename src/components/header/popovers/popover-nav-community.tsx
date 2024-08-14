import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { ArrowRightCircle, BadgeHelp, CalendarHeart } from "lucide-react";

const communityItems = [
  {
    icon: CalendarHeart,
    title: "Events",

    link: "/about/general-information/",
  },
  {
    icon: BadgeHelp,
    title: "Akash Insiders",

    link: "/about/providers/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.1488 9.97163V4.11153C14.1488 3.22151 13.4273 2.5 12.5373 2.5V2.5C11.6473 2.5 10.9258 3.22151 10.9258 4.11153V8.94611"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M16.346 13.341L18.5217 6.08862C18.7755 5.24265 18.2886 4.35248 17.4394 4.10984V4.10984C16.5943 3.8684 15.7142 4.3609 15.4779 5.20743L14.1484 9.97149"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M7.61935 9.74985L8.67489 12.0913C9.03961 12.9003 8.68159 13.852 7.87404 14.22C7.06183 14.5901 6.10347 14.2296 5.73663 13.4159L4.68109 11.0745C4.31637 10.2654 4.67439 9.31376 5.48193 8.94574C6.29415 8.57559 7.25251 8.93614 7.61935 9.74985Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M11.7192 12.7615V12.7615C11.9239 12.194 11.8998 11.5692 11.6518 11.0192L10.5787 8.63874C10.2181 7.83892 9.27613 7.48454 8.4778 7.84836V7.84836C7.66469 8.21892 7.31885 9.18832 7.71382 9.98986L7.84946 10.2651"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M13.8566 18.1767L14.3487 17.1927C14.3976 17.0947 14.3461 16.9763 14.241 16.9454L10.6903 15.9011C9.97853 15.6918 9.51797 15.0038 9.59563 14.266V14.266C9.68372 13.4292 10.4284 12.8188 11.2662 12.8968L16.0542 13.3422C16.0542 13.3422 19.8632 13.9282 18.5447 17.7372C17.2262 21.5463 16.7867 22.8648 13.8566 22.8648C11.9521 22.8648 9.16855 22.8648 9.16855 22.8648H8.87555C6.52912 22.8648 4.62697 20.9627 4.62697 18.6163V18.6163L4.48047 10.4121"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    ),
    title: "Community Contributions",

    link: "/about/providers/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3.5H4C3.44772 3.5 3 3.94772 3 4.5V9.5C3 10.0523 3.44772 10.5 4 10.5H9C9.55228 10.5 10 10.0523 10 9.5V4.5C10 3.94772 9.55228 3.5 9 3.5Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 3.5H15C14.4477 3.5 14 3.94772 14 4.5V9.5C14 10.0523 14.4477 10.5 15 10.5H20C20.5523 10.5 21 10.0523 21 9.5V4.5C21 3.94772 20.5523 3.5 20 3.5Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 14.5H15C14.4477 14.5 14 14.9477 14 15.5V20.5C14 21.0523 14.4477 21.5 15 21.5H20C20.5523 21.5 21 21.0523 21 20.5V15.5C21 14.9477 20.5523 14.5 20 14.5Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 14.5H4C3.44772 14.5 3 14.9477 3 15.5V20.5C3 21.0523 3.44772 21.5 4 21.5H9C9.55228 21.5 10 21.0523 10 20.5V15.5C10 14.9477 9.55228 14.5 9 14.5Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          cx="12"
          cy="12.5"
          r="7"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
    ),
    title: "Akash Validators",

    link: "/token",
  },
];

const PopOverCommunity = () => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm ">
          Community
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
            {communityItems.map((item, i: any) => {
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

export default PopOverCommunity;

export const NetworkNavbar = ({ pathname }: { pathname: string }) => {
  return (
    <div className="border-y">
      <div className="container flex">
        {communityItems.map((item, i: any) => {
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
              {item.icon ? <item.icon size={24} /> : item.customIcon}
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
