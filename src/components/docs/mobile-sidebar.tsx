import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { XMarkIcon } from "../header/icons";
import { useLockBody } from "../use-lock-body";
import { DocsNav, HomeButton } from "./docs-nav";
import ToggleNav from "./toggle-nav";

export default function MobileNav({ catName, docsNav, pathname }: any) {
  return (
    <Disclosure as="nav" className=" overflow-hidden">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center gap-x-1 rounded-full border bg-background2 px-3 py-2 text-xs leading-none ">
            {catName}

            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 2.5L9.5 6L6 9.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </Disclosure.Button>

          <Transition
            enter="transition ease duration-500 transform"
            enterFrom="opacity-100 -translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="transition ease duration-300 transform"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-100 -translate-x-full"
            className="fixed left-0  top-0  z-40  w-full  bg-background   lg:hidden"
          >
            <Panel open={open} nav={docsNav} pathname={pathname} />
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

const Panel = ({ open, nav, pathname }: any) => {
  useLockBody(open);

  return (
    <Disclosure.Panel className=" z-50 lg:hidden">
      <div className="container   z-50 flex h-screen flex-col gap-6 overflow-auto pt-10 ">
        <Disclosure.Button className="  ml-auto flex items-center justify-center  gap-x-1 rounded-full  text-xs leading-none">
          <XMarkIcon />
        </Disclosure.Button>
        <SideNav pathname={pathname} nav={nav} />
      </div>
    </Disclosure.Panel>
  );
};

function SideNav({ nav, pathname }: any) {
  return (
    <div className="w-full px-4 py-2">
      {/* <ToggleNav nav={nav} pathname={pathname} /> */}
      {/* 
      <a
        href={`/docs/`}
        className={`flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1 text-sm font-medium leading-[20px] hover:bg-[#F4F1F1] hover:text-primary  ${
          pathname?.split("/")[3]
            ? ""
            : "bg-[#F4F1F1] text-primary dark:bg-background2 dark:text-white"
        }`}
      >
        Home
      </a> */}
      <HomeButton pathname={pathname} />

      {/* <div className="mt-3 border-b"></div> */}

      <div className="mt-4">
        <DocsNav docsNav={nav} pathName={pathname} />
      </div>

      <div className="mt-4 border-b "></div>

      <div className="mt-2 pb-48">
        <a
          href="/support"
          className={`flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1 text-sm font-medium leading-[20px]  hover:bg-[#F4F1F1] hover:text-primary dark:hover:bg-darkGray dark:hover:text-white   `}
        >
          Support
        </a>
      </div>
    </div>
  );
}
