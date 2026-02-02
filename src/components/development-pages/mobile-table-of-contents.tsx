import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import type { TocItem } from "../../lib/generateToc";

interface Props {
  toc: TocItem[];
  labels: {
    onThisPage: string;
  };
}

const TableOfContents = ({ toc = [], labels }: Props) => {
  const [currentHeading, setCurrentHeading] = useState({
    slug: toc[0].slug,
    text: toc[0].text,
  });

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setCurrentHeading({
      slug: e.currentTarget.getAttribute("href")!.replace("#", ""),
      text: e.currentTarget.textContent || "",
    });
  };

  const TableOfContentsItem = ({ heading }: { heading: TocItem }) => {
    const { depth, slug, text, children } = heading;
    return (
      <li>
        <a
          className={`block rounded-md px-3 py-2 text-sm hover:bg-gray-100 hover:text-primary depth-${depth} ${
            currentHeading.slug === slug
              ? "dark:bg-darkGray bg-gray-100  text-gray-900 dark:text-white"
              : "text-textGray"
          }`.trim()}
          href={`#${slug}`}
          onClick={onLinkClick}
        >
          {text}
        </a>
        {children.length > 0 ? (
          <ul className="text-xs">
            {children.map((heading) => (
              <TableOfContentsItem key={heading.slug} heading={heading} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <>
      <ul>
        {toc.map((heading2) => (
          <TableOfContentsItem key={heading2.slug} heading={heading2} />
        ))}
      </ul>
    </>
  );
};

const MobileTableOfContents = ({ toc = [], labels }: Props) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-md text-xs leading-[18px]  ">
          On This Page
          <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
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
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="space-y-1 px-2 py-3">
            <Menu.Item>
              {({ active }) => (
                <TableOfContents
                  toc={toc}
                  labels={{
                    onThisPage: "onThisPage",
                  }}
                />
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MobileTableOfContents;
