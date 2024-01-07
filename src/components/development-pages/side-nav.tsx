import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { nav } from "./nav-config.ts";

export function SideNav({ currentPath }: { currentPath: string }) {
  return (
    <div className="space-y-2 rounded-lg border border-[#D9D9D9] px-4 py-2">
      {nav.map((navitem, index) => {
        return (
          <Disclosure key={index} defaultOpen>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full  items-center justify-between text-base font-bold leading-normal">
                  <span>{navitem.label}</span>
                  <ChevronDownIcon
                    className={`${
                      open ? "rotate-180 transform" : ""
                    } h-5 w-5 text-foreground `}
                  />
                </Disclosure.Button>

                {navitem.items.map((item, index) => {
                  return (
                    <Disclosure.Panel key={index}>
                      <a
                        href={item.link}
                        className={` ${
                          currentPath.startsWith(item.link)
                            ? "bg-primary/10"
                            : null
                        }  block rounded-md px-2  py-1 text-xs
                        font-medium leading-[18px] text-[#808080] hover:bg-primary/10`}
                      >
                        {item.label}
                      </a>
                    </Disclosure.Panel>
                  );
                })}
              </>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
}
