import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { XMarkIcon } from "../header/icons.tsx";
import { useLockBody } from "../use-lock-body.ts";

export default function MobileNav({
  currentPath,
  pageName,
  nav,
  link = "",
}: {
  currentPath: string;
  pageName: string;
  nav: any;
  link?: string;
}) {
  return (
    <Disclosure as="nav" className="overflow-hidden">
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
  link = "",
}: {
  currentPath: string;
  open: any;
  nav: any;
  link: string;
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
  link: string;
}) {
  return (
    <div className="flex w-full flex-col gap-y-3 ">
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

      <div className="mt-3">
        <a href="https://shop.akash.network/" target="_blank">
          <div className="rounded-[8px] border bg-background2 p-4">
            <div className="flex items-center justify-center rounded-[8px] bg-[#FFDEDE] py-[6px] dark:bg-darkGray">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary dark:text-white"
                stroke="currentColor"
              >
                <path d="M2.5 7.5V15.5C2.5 16.6046 3.39543 17.5 4.5 17.5H15.5C16.6046 17.5 17.5 16.6046 17.5 15.5V7.5"></path>
                <path d="M16.9839 2.5H13.7422L14.1589 6.66667C14.1589 6.66667 14.9922 7.5 16.2422 7.5C17.1037 7.5 17.7013 7.10419 17.9895 6.85814C18.1224 6.74474 18.1701 6.56758 18.1414 6.39528L17.5757 3.00136C17.5275 2.71205 17.2772 2.5 16.9839 2.5Z"></path>
                <path d="M13.7422 2.5L14.1589 6.66667C14.1589 6.66667 13.3255 7.5 12.0755 7.5C10.8255 7.5 9.99219 6.66667 9.99219 6.66667V2.5H13.7422Z"></path>
                <path d="M9.99479 2.5V6.66667C9.99479 6.66667 9.16146 7.5 7.91146 7.5C6.66146 7.5 5.82812 6.66667 5.82812 6.66667L6.24479 2.5H9.99479Z"></path>
                <path d="M6.24132 2.5H2.9996C2.70629 2.5 2.45598 2.71205 2.40776 3.00136L1.84211 6.39528C1.81339 6.56758 1.86111 6.74474 1.99396 6.85814C2.28222 7.10419 2.87982 7.5 3.7413 7.5C4.9913 7.5 5.82465 6.66667 5.82465 6.66667L6.24132 2.5Z"></path>
              </svg>
            </div>

            <h4 className="mt-3 flex items-center gap-x-2 font-bold text-foreground">
              Akash Swag Shop{" "}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.08594 9.91536L9.91927 4.08203"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M4.08594 4.08203H9.91927V9.91536"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </h4>
            <p className="mt-3 text-xs">
              Visit our Akash Swag Shop and represent the community
            </p>
          </div>
        </a>
      </div>

      <div className="mt-3 flex flex-col  rounded-[8px] border  bg-background2 p-4">
        <a
          href={link}
          target="_blank"
          className="inline-flex cursor-pointer items-center  gap-x-2 text-xs font-medium hover:text-primary"
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
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8.15049 3.88559L10.0361 1.99997L13.3359 5.2998L11.4503 7.18542M8.15049 3.88559L4.51039 7.52569C4.32285 7.71323 4.21749 7.96758 4.21749 8.2328L4.21749 11.1184L7.10311 11.1184C7.36833 11.1184 7.62268 11.0131 7.81022 10.8255L11.4503 7.18542M8.15049 3.88559L11.4503 7.18542"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Edit page on github
        </a>

        <p className="mt-2  text-2xs">Last modified on April 18, 2023</p>
      </div>
    </div>
  );
}
