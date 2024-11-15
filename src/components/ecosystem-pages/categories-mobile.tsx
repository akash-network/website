import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Categories = ({
  tags,
  className,
  page,
}: {
  tags: any;
  page: string;
  className?: string;
}) => {
  console.log(page);

  return (
    <Menu
      as="div"
      className={classNames(className, "relative inline-block text-left")}
    >
      <div>
        <Menu.Button className="inline-flex w-full  items-center justify-center gap-x-1.5 rounded-md border border-[#D7DBDF] bg-background2 px-3 py-2 text-xs font-medium shadow-sm  ">
          Categories
          <ChevronDownIcon
            className="-mr-1 h-4 w-4 text-gray-500"
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
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/ecosystem/${page}`}
                  className={classNames(
                    active
                      ? "bg-gray-100 text-foreground dark:bg-darkGray"
                      : "text-para",
                    "block px-4 py-2 text-sm",
                  )}
                >
                  All
                </a>
              )}
            </Menu.Item>
            {page === "deployed-on-akash" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href={`/ecosystem/deployed-on-akash/showcase/`}
                    className={classNames(
                      active
                        ? "bg-gray-100 text-foreground dark:bg-darkGray"
                        : "text-para",
                      "block px-4 py-2 text-sm",
                    )}
                  >
                    Showcase
                  </a>
                )}
              </Menu.Item>
            )}

            {tags?.map((tag: string) => (
              <Menu.Item key={tag}>
                {({ active }) => (
                  <a
                    href={`/ecosystem/${page}/${tag.toLowerCase()}`}
                    className={classNames(
                      active
                        ? "bg-gray-100 text-foreground  dark:bg-darkGray"
                        : "text-para",
                      "block px-4 py-2 text-sm",
                    )}
                  >
                    {tag === "ai & ml"
                      ? "AI & ML"
                      : tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Categories;
