import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { CollectionEntry } from "astro:content";
import { ArrowRightCircle } from "lucide-react";
import { ecosystemNavItems } from "./links";

const PopOverNavItemEcosystem = ({
  posts,
}: {
  posts: CollectionEntry<"Blog">[];
}) => {
  const [open2, setOpen] = useState(false);
  return (
    <Menu
      onMouseLeave={() => setOpen(false)}
      as="div"
      className="relative inline-block text-left"
    >
      <div>
        <a
          href={ecosystemNavItems[0].link}
          className="inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm "
          onMouseEnter={() => {
            setOpen(true);
          }}
        >
          Ecosystem
          <ChevronDownIcon
            className="text-gra -mr-1 ml-1 h-4 w-4"
            aria-hidden="true"
          />
        </a>
      </div>

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
        <Menu.Items className="absolute  left-1/2 z-[35] w-[593px]  origin-top-right translate-x-[-40%]  pt-4       focus:outline-none 2xl:-translate-x-1/2">
          <div className="flex flex-col overflow-hidden rounded-3xl border bg-background2 shadow-lg">
            <div className="flex gap-2.5 p-5 ">
              <div className="flex w-full flex-1 flex-col">
                {ecosystemNavItems
                  .filter((item) => !item.external)
                  .map((item, i) => {
                    return (
                      <Menu.Item key={i}>
                        {({ active }) => (
                          <a
                            href={item.link}
                            target={
                              item.link.startsWith("http") ? "_blank" : "_self"
                            }
                            className={`group flex cursor-pointer items-center gap-6 rounded-lg px-4 py-3  transition-all hover:bg-gray-50 dark:hover:bg-black/10    ${
                              active ? "" : ""
                            } `}
                          >
                            <div className="text-[#9CA3AF] transition-all group-hover:text-primary dark:text-para ">
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

              <div className="flex w-full flex-1 flex-col border-l pl-2.5">
                <a
                  href="/blog/case-studies/1"
                  className="flex items-center gap-1.5 px-8 py-1.5 text-sm font-medium text-[#939393] transition-all hover:text-foreground dark:text-para"
                >
                  Case Studies{" "}
                  <svg
                    width="5"
                    height="8"
                    viewBox="0 0 5 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.181065 7.8262C0.0706915 7.71148 0.0103791 7.55763 0.0133823 7.39847C0.0163854 7.2393 0.0824583 7.08784 0.197081 6.97736L3.35061 4.00641L0.197081 1.03546C0.137546 0.981454 0.0894565 0.91605 0.0556622 0.843121C0.021868 0.770192 0.00305651 0.691221 0.000342236 0.610888C-0.00237204 0.530555 0.011066 0.450494 0.0398605 0.37545C0.0686551 0.300406 0.11222 0.231906 0.167974 0.174007C0.223728 0.116109 0.290537 0.0699911 0.364441 0.0383859C0.438345 0.00678061 0.517842 -0.00966837 0.59822 -0.00998595C0.678598 -0.0103035 0.758222 0.00551602 0.832374 0.0365347C0.906526 0.067554 0.973698 0.113142 1.02991 0.170598L4.63349 3.57398C4.69162 3.63 4.73785 3.69717 4.76943 3.77147C4.80101 3.84577 4.81729 3.92568 4.81729 4.00641C4.81729 4.08714 4.80101 4.16704 4.76943 4.24134C4.73785 4.31564 4.69162 4.38281 4.63349 4.43884L1.02991 7.84222C0.915188 7.95259 0.761339 8.01291 0.602172 8.0099C0.443004 8.0069 0.291541 7.94083 0.181065 7.8262Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                {posts
                  ?.filter(({ data }) =>
                    data.categories.includes("Case Studies"),
                  )
                  ?.slice(0, 2)
                  ?.map(({ data, slug }, i) => {
                    return (
                      <a
                        key={i}
                        href={`/blog/${slug}`}
                        className="group  flex cursor-pointer flex-col gap-0.5 rounded-lg px-8  py-1.5 text-sm transition-all hover:bg-gray-50 dark:hover:bg-black/10    "
                      >
                        <p className="line-clamp-1 font-medium group-hover:text-foreground ">
                          {data.title}
                        </p>
                        <p className="line-clamp-1 text-para">
                          {data.description}
                        </p>
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PopOverNavItemEcosystem;
