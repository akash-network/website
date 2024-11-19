import DarkModeToggle from "@/components/dark-mode-toggle";
import { cn } from "@/lib/utils";
import { Disclosure, Transition } from "@headlessui/react";
import {
  AkashLogo,
  DiscordIcon,
  GithubIcon,
  HamburgerIcon,
  TwitterIcon,
  XMarkIcon,
} from "./icons";
import { useLockBody } from "./use-lock-body";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-arrow";
import clsx from "clsx";
import { ArrowRightCircle, ChevronDown } from "lucide-react";
import { Fragment } from "react";
import {
  communityItems,
  developmentItems,
  ecosystemNavItems,
  networkItems,
} from "./popovers/links";
const navigation = [
  {
    name: "Network",

    subCategories: networkItems,
  },

  {
    name: "Development",
    subCategories: developmentItems,
  },
  { name: "Ecosystem", subCategories: ecosystemNavItems },
  { name: "Community", subCategories: communityItems },
  { name: "Blog", href: "/blog" },
  { name: "Docs", href: "/docs" },
  { name: "Pricing & Earnings", href: "/pricing/gpus" },
];

export default function HamburgerMenu({
  currentPath,
}: {
  currentPath: string;
}) {
  return (
    <Disclosure as="nav" className=" overflow-hidden">
      {({ open }) => (
        <>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-[51] hidden bg-slate-900/25 opacity-100 backdrop-blur transition-opacity md:block" />
          </Transition.Child>
          <Disclosure.Button className="mt-1.5 inline-flex items-center justify-center">
            <span className="sr-only">Open main menu</span>
            {open ? <XMarkIcon /> : <HamburgerIcon />}
          </Disclosure.Button>
          <Transition
            enter="transition ease duration-500 transform"
            enterFrom="opacity-100 translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="transition ease duration-300 transform"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-100 translate-x-full"
            className="slg:hidden  fixed inset-0  z-[52] w-full  overflow-y-auto bg-background md:left-auto  md:right-0 md:w-1/2"
          >
            <Panel currentPath={currentPath} open={open} />
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

const Panel = ({ currentPath, open }: { currentPath: string; open: any }) => {
  useLockBody(open);

  const currentOpen = navigation.find((item) => {
    if (item.subCategories) {
      if (
        item.subCategories.find(
          (subItem) =>
            subItem.link?.split("/")[1] === currentPath?.split("/")[1],
        ) &&
        currentPath !== "/"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  });

  return (
    <Disclosure.Panel className="slg:hidden h-full">
      <div className="box-border flex h-full  flex-col justify-between gap-y-6  px-6">
        <div className="flex flex-col gap-10">
          <div className="flex justify-between pb-4 pt-4 md:pt-6">
            <a href="/">
              <AkashLogo />
            </a>

            <div className="flex items-center gap-5">
              {/* <Disclosure.Button
                as="a"
                href={"/#getting-started"}
                className="flex items-center justify-center rounded-[4px] bg-[#FF414C] px-[11px] py-[7px] text-xs text-white"
              >
                Get Started
              </Disclosure.Button> */}

              <Disclosure.Button className="inline-flex items-center justify-center">
                <span className="sr-only">Open main menu</span>
                {open ? <XMarkIcon /> : <HamburgerIcon />}
              </Disclosure.Button>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full "
            defaultValue={currentOpen?.name}
          >
            <div className="flex flex-col gap-4">
              {navigation.map((item, index) => (
                <div key={item.name}>
                  {item.subCategories ? (
                    <AccordionItem
                      key={index}
                      value={item.name}
                      className="border-b-0 "
                    >
                      <AccordionTrigger
                        notClose
                        className="text-base  font-medium text-foreground"
                      >
                        <div className="flex items-center gap-2 text-lg font-medium">
                          {item.name}
                          <ChevronDown className="text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200 " />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className2="!pb-0">
                        <div className="my-2.5 flex flex-col gap-2.5">
                          {item.subCategories.map(
                            (
                              subItem: (typeof item.subCategories)[0] & {
                                external?: boolean;
                              },
                              i,
                            ) => (
                              <a
                                key={i}
                                href={subItem.link}
                                target={
                                  subItem.link.startsWith("http")
                                    ? "_blank"
                                    : "_self"
                                }
                                className={clsx(
                                  subItem?.external
                                    ? "flex w-full items-center justify-center rounded-full bg-[#F2F2F2] p-3 text-base dark:bg-background2"
                                    : "flex cursor-pointer items-center gap-2 p-2 text-base text-para     ",
                                )}
                              >
                                {!subItem?.external &&
                                  (subItem.icon ? (
                                    <subItem.icon size={24} strokeWidth={1.5} />
                                  ) : (
                                    subItem.customIcon
                                  ))}
                                <p
                                  className={clsx(
                                    "flex-1 whitespace-nowrap  font-medium text-foreground",
                                    subItem?.external && "text-center",
                                  )}
                                >
                                  {subItem.title}
                                  {subItem.external && (
                                    <ArrowRightCircle
                                      className="ml-1 inline-block -rotate-45 stroke-[1.5px]"
                                      size={16}
                                    />
                                  )}
                                </p>
                              </a>
                            ),
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Disclosure.Button
                      as="a"
                      href={item.href}
                      className={cn(
                        item.href.startsWith(currentPath as string) &&
                          currentPath !== "/"
                          ? "text-base font-medium text-foreground"
                          : "inline-flex items-center text-lg font-medium hover:font-semibold hover:text-foreground",
                      )}
                      // aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                      {/* {item.icon} */}
                    </Disclosure.Button>
                  )}{" "}
                </div>
              ))}
            </div>
          </Accordion>
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-6">
            {/* <a
              href="https://akashnet.typeform.com/to/rhR4cWxQ?typeform-source=akash.network"
              target="_blank"
              className="flex cursor-pointer items-center justify-center gap-1 rounded-[4px] border border-border px-[9px] py-[7px] text-xs font-medium leading-none text-foreground hover:bg-darkGray"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 23 24"
                fill="none"
                stroke="currentColor"
              >
                <g clipPath="url(#clip0_1797_72752)">
                  <path
                    d="M9.49934 13.7593L13.5077 10.2411M13.5077 10.2411L10.2148 10.0267M13.5077 10.2411L13.2932 13.534"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.8997 17.0105C18.6668 14.5816 18.9411 10.3695 16.5123 7.6023C14.0835 4.83514 9.87131 4.56086 7.10414 6.98968C4.33698 9.4185 4.0627 13.6307 6.49152 16.3978C8.92034 19.165 13.1325 19.4393 15.8997 17.0105Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1797_72752">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(0.210938 11.2649) rotate(-41.2744)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <span>Reach Out</span>
            </a> */}
            <a
              href="https://console.akash.network/"
              id="console-header"
              className="flex cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-[17px] py-[9px] text-sm font-medium leading-[20px] text-white hover:bg-darkGray"
            >
              Deploy Now
            </a>
          </div>

          <div className="flex items-center justify-between border-t border-border py-7 text-para">
            <div className="flex gap-x-[20px] px-2">
              <a
                href="https://twitter.com/akashnet_"
                target="_blank"
                className="hover:text-primary"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://github.com/akash-network"
                target="_blank"
                className="hover:text-primary"
              >
                <GithubIcon />
              </a>
              <a
                href="https://discord.com/invite/akash"
                target="_blank"
                className="hover:text-primary"
              >
                <DiscordIcon />
              </a>
            </div>

            <div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>
    </Disclosure.Panel>
  );
};
