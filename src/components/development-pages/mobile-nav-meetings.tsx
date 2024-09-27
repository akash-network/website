import { Disclosure, Transition } from "@headlessui/react";
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
  link = "",
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
          <Disclosure.Button className="flex items-center gap-x-1 rounded-full border bg-white px-3 py-2 text-xs leading-none ">
            {pageName}

            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 2.5L9.5 6L6 9.5"
                stroke="#11181C"
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
            />{" "}
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
    <>
      <div className="flex w-full flex-col  gap-y-3 overflow-auto">
        <a
          href="/development/current-groups/"
          className={`flex cursor-pointer items-center gap-x-1 rounded-lg  py-[6px] text-base font-medium leading-[24px] text-para hover:bg-[#F4F1F1] hover:text-primary`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12.7071 5.29289C13.0976 5.68342 13.0976 6.31658 12.7071 6.70711L9.41421 10L12.7071 13.2929C13.0976 13.6834 13.0976 14.3166 12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L7.29289 10.7071C6.90237 10.3166 6.90237 9.68342 7.29289 9.29289L11.2929 5.29289C11.6834 4.90237 12.3166 4.90237 12.7071 5.29289Z"
              fill="#687076"
            ></path>
          </svg>
          Back
        </a>
        {nav.map((navItem: any) => (
          <div className="flex flex-col gap-y-3">
            <a
              href={`${navItem.link}${navItem.subItems[0].link.split("/")[3]}/`}
              className={`
                   
              border-b  pb-3 pt-[8px] text-base font-medium leading-[24px]  `}
            >
              {navItem.label}
            </a>

            {navItem.subItems &&
              currentPath.split("/")[3] === navItem.link.split("/")[2] &&
              navItem.subItems.map((subItem: any) => (
                <div className="flex flex-col gap-y-3">
                  <a
                    className={`${
                      currentPath === subItem.link
                        ? " text-primary"
                        : "text-para"
                    }  ml-3 rounded-lg py-1.5   text-base font-medium leading-[24px] `}
                    href={`${subItem.link}`}
                  >
                    {subItem.label}
                  </a>
                  {subItem.meetings &&
                    subItem.link.split("/")[3] === currentPath.split("/")[4] &&
                    subItem.meetings
                      .map((meeting) => {
                        // Extract the date part from the title (assuming the format is '001-2023-01-25')
                        const dateString = meeting.title
                          .split("-")
                          .slice(1)
                          .join("-");

                        // Create a Date object from the formatted date string
                        const dateObject = new Date(dateString);

                        // Add the date object to the meeting object
                        return {
                          ...meeting,
                          date: dateObject,
                        };
                      })
                      .sort((a, b) => b.date - a.date)
                      .map((meeting: any) => (
                        <a
                          href={`${meeting.link}`}
                          className={`${
                            currentPath.split("/")[5] ===
                              `${subItem.link}${meeting.link}`.split("/")[4] &&
                            currentPath.split("/")[4] ===
                              `${subItem.link}${meeting.link}`.split("/")[3]
                              ? "text-primary"
                              : "text-para"
                          }  ml-6   py-[6px] text-base font-medium leading-[24px] `}
                        >
                          {meeting.title.split("-").slice(1).join("-")}
                        </a>
                      ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
