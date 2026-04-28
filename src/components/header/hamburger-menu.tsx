import { cn } from "@/lib/utils";
import { Disclosure, Transition } from "@headlessui/react";
import akashLogoDark from "../../assets/akash-logo-dark.svg";
import akashLogoLight from "../../assets/akash-logo.svg";
import {
  DiscordIcon,
  GithubIcon,
  HamburgerIcon,
  TwitterIcon,
  XMarkIcon,
  YoutubeIcon,
} from "./icons";
import { useLockBody } from "./use-lock-body";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-arrow";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import DarkModeToggle from "../dark-mode-toggle";
import TryAkashForm from "../ui/try-akash-form";
import {
  communityItems,
  developmentItems,
  ecosystemNavItems,
  networkItems,
} from "./popovers/links";

const navigation = [
  { name: "Development", subCategories: developmentItems },
  { name: "Ecosystem", subCategories: ecosystemNavItems },
  { name: "Community", subCategories: communityItems },
  { name: "Network", subCategories: networkItems },
  { name: "Blog", href: "/blog" },
  { name: "Docs", href: "/docs" },
  { name: "Pricing", href: "/pricing/gpus" },
];

export default function HamburgerMenu({
  currentPath,
  latestRoadmapYear,
  hideDarkToggle,
}: {
  currentPath: string;
  latestRoadmapYear: number;
  hideDarkToggle?: boolean;
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
            className="fixed  inset-0 z-[52]  w-full overflow-y-auto  bg-background md:left-auto md:right-0  md:w-1/2 slg:hidden"
          >
            <Panel
              currentPath={currentPath}
              open={open}
              latestRoadmapYear={latestRoadmapYear}
              hideDarkToggle={hideDarkToggle}
            />
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

const Panel = ({
  currentPath,
  open,
  latestRoadmapYear,
  hideDarkToggle,
}: {
  currentPath: string;
  open: boolean;
  latestRoadmapYear: number;
  hideDarkToggle?: boolean;
}) => {
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
    <Disclosure.Panel className="h-full slg:hidden">
      <div className="box-border flex h-full  flex-col justify-between gap-y-6  px-6">
        <div className="flex flex-col gap-10">
          <div className="flex justify-between pb-4 pt-4 md:pt-6">
            <a href="/">
              <img src={akashLogoDark.src} width={132} height={26} alt="Akash Network" className="dark:hidden" />
              <img src={akashLogoLight.src} width={132} height={26} alt="Akash Network" className="hidden dark:block" />
            </a>

            <div className="flex items-center gap-5">
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
                        <div className="mt-1 flex flex-col">
                          {item.subCategories.map(
                            (
                              subItem: (typeof item.subCategories)[0] & {
                                external?: boolean;
                              },
                              i,
                            ) => {
                              const href =
                                subItem.link === "roadmap"
                                  ? `/roadmap/${latestRoadmapYear}`
                                  : subItem.link;
                              const target = subItem.link.startsWith("http")
                                ? "_blank"
                                : "_self";

                              // External items (e.g. Community Calendar, Swag Shop, Akash Stats)
                              if (subItem.external) {
                                return (
                                  <a
                                    key={i}
                                    href={href}
                                    target={target}
                                    className="group flex items-center justify-between border-t border-zinc-200 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
                                  >
                                    <p className="text-sm text-foreground">
                                      {subItem.title}
                                    </p>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                  </a>
                                );
                              }

                              // Regular items
                              return (
                                <a
                                  key={i}
                                  href={href}
                                  target={target}
                                  className="group flex items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-normal text-foreground">
                                      {subItem.title}
                                    </p>
                                    {subItem.description && (
                                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                        {subItem.description}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </a>
                              );
                            },
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
                    >
                      {item.name}
                    </Disclosure.Button>
                  )}{" "}
                </div>
              ))}
            </div>
          </Accordion>
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-3">
            <a
              id="console-header"
              href="/gpus-on-demand"
              className="flex w-full items-center  justify-center gap-2 rounded-md border bg-gray-50 py-[9px]  text-base font-medium hover:bg-gray-100  dark:bg-background dark:hover:bg-white/10 md:py-2"
            >
              Get in Touch
            </a>
            <TryAkashForm type="hero" fullWidth />
          </div>

          <div className="flex items-center justify-between border-t border-border py-7 text-para">
            <div className="flex gap-x-[20px] px-2">
              <a
                href="https://x.com/akashnet"
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
              <a
                href="https://www.youtube.com/@akashnetwork"
                target="_blank"
                className="flex items-center justify-center hover:text-primary"
              >
                <YoutubeIcon />
              </a>
            </div>

            {!hideDarkToggle && (
              <div>
                <DarkModeToggle />
              </div>
            )}
          </div>
        </div>
      </div>
    </Disclosure.Panel>
  );
};
