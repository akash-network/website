import { useEffect, useId, useState } from "react";
import type { ReactChildren, ClassNamesFunction } from "@/types/components";

function classNames(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function TabsWrapper({
  defaultTab,
  children,
}: {
  defaultTab?: string;
  children: ReactChildren;
}) {
  const [currentTab, setCurrentTab] = useState<string | undefined>(defaultTab);
  const [alltabs, setAllTabs] = useState<string[]>([]);
  const mainId = useId();

  useEffect(() => {
    const main = document.getElementById(mainId);
    const tabs = main?.querySelectorAll("section");
    tabs?.forEach((tab) => {
      if (tab.id === currentTab) {
        tab.classList.remove("hidden");
      } else {
        tab.classList.add("hidden");
      }
    });
  }, [currentTab]);

  useEffect(() => {
    const main = document.getElementById(mainId);

    const tabs = main?.querySelectorAll("section");

    const allTabs: string[] = [];
    tabs?.forEach((tab) => {
      allTabs.push(tab.id);
    });
    setAllTabs(allTabs);

    if (!defaultTab) {
      setCurrentTab(allTabs[0]);
    }
  }, []);

  return (
    <div className="bg-background2 p-5 ">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {alltabs.map((tab) => (
            <button
              onClick={() => setCurrentTab(tab)}
              key={tab}
              className={classNames(
                currentTab === tab
                  ? "border-black text-black dark:border-white dark:text-white"
                  : "border-transparent text-[#889096] hover:border-gray-300 hover:text-gray-700 dark:hover:text-white",
                " border-b-2 px-3 py-2 text-center text-sm font-medium",
              )}
              aria-current={tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div id={mainId}>{children}</div>
    </div>
  );
}

export const TabContent = ({
  children,
  value,
}: {
  children: ReactChildren;
  value: string;
}) => {
  return (
    <section id={value} className="hidden">
      {children}
    </section>
  );
};
