import { Disclosure, Transition } from "@headlessui/react";
import { XMarkIcon } from "../header/icons";
import { useLockBody } from "../use-lock-body";

/* ===================== TYPES ===================== */

type Meeting = {
  title: string;
  link: string;
};

type SubItem = {
  label: string;
  link: string;
  meetings?: Meeting[];
};

type NavItem = {
  label: string;
  link: string;
  subItems: SubItem[];
};

type MobileNavProps = {
  currentPath: string;
  nav: NavItem[];
  pageName: string;
  link?: string;
};

/* ===================== HELPERS ===================== */

const withDate = (meeting: Meeting) => {
  const dateString = meeting.title.split("-").slice(1).join("-");
  return { ...meeting, date: new Date(dateString) };
};

/* ===================== COMPONENT ===================== */

export default function MobileNav({
  currentPath,
  nav,
  pageName,
  link,
}: MobileNavProps) {
  return (
    <Disclosure as="nav" className="overflow-hidden">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center gap-x-1 rounded-full border bg-background2 px-3 py-2 text-xs">
            {pageName}
            <ChevronIcon />
          </Disclosure.Button>

          <Transition
            enter="transition duration-500 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
            className="fixed inset-0 z-40 w-full bg-background lg:hidden"
          >
            <Panel
              open={open}
              currentPath={currentPath}
              nav={nav}
              link={link}
            />
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

/* ===================== PANEL ===================== */

type PanelProps = {
  open: boolean;
  currentPath: string;
  nav: NavItem[];
  link?: string;
};

const Panel = ({ open, currentPath, nav, link }: PanelProps) => {
  useLockBody(open);

  return (
    <Disclosure.Panel className="z-50 lg:hidden">
      <div className="container flex h-full flex-col gap-6 py-10">
        <Disclosure.Button className="ml-auto">
          <XMarkIcon />
        </Disclosure.Button>

        <SideNav currentPath={currentPath} nav={nav} link={link} />
      </div>
    </Disclosure.Panel>
  );
};

/* ===================== SIDENAV ===================== */

type SideNavProps = {
  currentPath: string;
  nav: NavItem[];
  link?: string;
};

function SideNav({ currentPath, nav, link }: SideNavProps) {
  return (
    <div className="flex flex-col gap-y-3 overflow-auto">
      <a
        href="/development/community-groups/"
        className="flex items-center gap-x-1 rounded-lg py-1.5 text-base font-medium text-para hover:bg-[#F4F1F1] hover:text-primary"
      >
        <BackIcon />
        Back
      </a>

      {nav.map((navItem) => (
        <div key={navItem.label} className="flex flex-col gap-y-3">
          <a className="border-b pb-3 pt-2 text-base font-medium">
            {navItem.label}
          </a>

          {currentPath.includes(navItem.link) &&
            navItem.subItems.map((subItem) => (
              <div key={subItem.link} className="flex flex-col gap-y-2">
                <a
                  href={subItem.link}
                  className={`ml-3 text-base font-medium ${
                    currentPath === subItem.link
                      ? "text-primary"
                      : "text-para"
                  }`}
                >
                  {subItem.label}
                </a>

                {subItem.meetings &&
                  currentPath.includes(subItem.link) &&
                  subItem.meetings
                    .map(withDate)
                    .sort(
                      (a, b) => b.date.getTime() - a.date.getTime()
                    )
                    .map((meeting) => (
                      <a
                        key={meeting.link}
                        href={`/current-groups/meetings/${meeting.link}`}
                        className="ml-6 py-1 text-base text-para"
                      >
                        {meeting.title.split("-").slice(1).join("-")}
                      </a>
                    ))}
              </div>
            ))}
        </div>
      ))}

      <div className="mt-3 rounded-lg border bg-background2 p-4">
        <a
          href={link}
          className="flex items-center justify-center gap-x-2 text-xs font-medium hover:text-primary"
        >
          <EditIcon />
          Edit page on github
        </a>
        <p className="mt-2 text-center text-2xs">
          Last modified on April 18, 2023
        </p>
      </div>
    </div>
  );
}

/* ===================== ICONS ===================== */

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <path
      d="M6 2.5L9.5 6L6 9.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.7071 5.29289C13.0976 5.68342 13.0976 6.31658 12.7071 6.70711L9.41421 10L12.7071 13.2929C13.0976 13.6834 13.0976 14.3166 12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L7.29289 10.7071C6.90237 10.3166 6.90237 9.68342 7.29289 9.29289L11.2929 5.29289C11.6834 4.90237 12.3166 4.90237 12.7071 5.29289Z"
      fill="currentColor"
    />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path
      d="M2 14H14"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <path
      d="M8.15 3.89L10.04 2L13.34 5.3L11.45 7.19"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
