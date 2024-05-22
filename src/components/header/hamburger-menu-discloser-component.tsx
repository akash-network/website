import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ArrowUpRight } from "lucide-react";

interface IFsubCategories {
  title: string;
  link: string;
  description: string;
  icon: JSX.Element;
}

interface IFitem {
  name: string;
  href: string;
  subCategories: IFsubCategories[];
}

interface IFProps {
  item: IFitem;
}

const HamburgerMenuDiscloserComponent = ({ item }: IFProps) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button>
            <span className="flex items-center gap-1 text-base font-medium hover:font-semibold ">
              {item.name}
              {/* <ChevronDownIcon className="h-5 font-medium text-[#11181C]" /> */}
            </span>
          </Disclosure.Button>

          <Transition
            show={true}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel static>
              <div className="flex flex-col gap-6 px-5 pt-5">
                {item.subCategories.map((subItem, indx) => (
                  <a
                    href={subItem.link}
                    target={
                      subItem.link.startsWith("http") ? "_blank" : "_self"
                    }
                    key={Math.random() + indx}
                    className="flex items-center text-base font-medium text-[#808080]"
                  >
                    <span className="w-[24px] mr-1">{subItem.icon}</span>
                    {subItem.title}{" "}
                    {subItem?.link?.startsWith("http") ? (
                      <ArrowUpRight className="ml-1 inline-block" size={16} />
                    ) : (
                      ""
                    )}
                  </a>
                ))}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};

export default HamburgerMenuDiscloserComponent;
