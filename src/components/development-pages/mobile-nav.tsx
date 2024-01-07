import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { XMarkIcon } from "../header/icons";
import { useLockBody } from "../use-lock-body";

const navigation = [
  { name: "Development", href: "#" },
  { name: "Community", href: "#" },
  { name: "Ecosystem", href: "/ecosystem" },
  { name: "Token", href: "/token" },
  { name: "Blog", href: "/blog" },
  { name: "Docs", href: "#" },
  {
    name: "Discussions",
    href: "#",
    current: false,
    icon: (
      <svg
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.80469 10.6569L11.4615 5M11.4615 5H6.5118M11.4615 5V9.94978"
          stroke="#272540"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function MobileNav({
  currentPath,
  nav,
  pageName = "pageName",
  link,
}: {
  currentPath: string;
  nav: any;
  pageName: string;
  link?: string;
}) {
  return (
    <Disclosure as="nav" className=" overflow-hidden">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center gap-x-1 rounded-full border bg-background2 px-3 py-2 text-xs leading-none ">
            {pageName}

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
                stroke-linecap="round"
                stroke-linejoin="round"
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
            <Panel
              currentPath={currentPath}
              open={open}
              nav={nav}
              link={link}
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
  nav,
  link,
}: {
  currentPath: string;
  open: any;
  nav: any;
  link?: string;
}) => {
  useLockBody(open);

  return (
    <Disclosure.Panel className=" z-50 lg:hidden">
      <div className="container   z-50 mt-10 flex h-screen flex-col gap-6 overflow-auto ">
        <Disclosure.Button className="  ml-auto flex items-center justify-center  gap-x-1 rounded-full  text-xs leading-none">
          <XMarkIcon />
        </Disclosure.Button>
        <SideNav currentPath={currentPath} nav={nav} link={link} />
      </div>
    </Disclosure.Panel>
  );
};

function SideNav({
  currentPath,
  nav,
  link,
}: {
  currentPath: string;
  nav: any;
  link?: string;
}) {
  return (
    <div className="w-full space-y-2   px-4 py-2">
      <>
        {nav.map((navItem: any, index: number) => (
          <div className="flex flex-col gap-y-3 " key={navItem.link}>
            <a
              className={`${
                currentPath === navItem.link
                  ? "bg-background2 text-primary dark:text-white"
                  : "text-para"
              }  rounded-lg px-4 py-[6px] text-base font-bold leading-[24px] hover:bg-background2 hover:text-primary dark:hover:text-white`}
              href={navItem.link}
            >
              {navItem.label}
            </a>

            {navItem.subItems &&
              currentPath === navItem.link &&
              navItem.subItems.map((subItem: any) => (
                <a
                  className={`${
                    currentPath === subItem.link
                      ? "bg-background2 text-primary dark:text-white"
                      : "text-para"
                  }  ml-3 rounded-lg px-4 py-[6px] text-base font-normal leading-normal  hover:bg-background2 hover:text-primary dark:hover:text-white`}
                  href={subItem.link}
                >
                  {subItem.label}
                </a>
              ))}
          </div>
        ))}
      </>

      <div className="mt-3 flex flex-col  rounded-[8px] border  bg-background2 p-4">
        <a
          href={link ?? ""}
          className="inline-flex cursor-pointer items-center gap-x-2 text-xs font-medium hover:text-primary"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-foreground"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 14L8 14L14 14"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M8.15049 3.88559L10.0361 1.99997L13.3359 5.2998L11.4503 7.18542M8.15049 3.88559L4.51039 7.52569C4.32285 7.71323 4.21749 7.96758 4.21749 8.2328L4.21749 11.1184L7.10311 11.1184C7.36833 11.1184 7.62268 11.0131 7.81022 10.8255L11.4503 7.18542M8.15049 3.88559L11.4503 7.18542"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          Edit page on github
        </a>

        <p className="mt-2 text-2xs">Last modified on April 18, 2023</p>
      </div>
    </div>
  );
}
