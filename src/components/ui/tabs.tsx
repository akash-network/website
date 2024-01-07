import { useEffect, useId, useState } from "react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function TabsWrapper({
  defaultTab,
  children,
}: {
  defaultTab?: string;
  children: any;
}) {
  const [currentTab, setCurrentTab] = useState<any>(defaultTab);
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

    // get all ids of section and log

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

  console.log(currentTab);

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
  children: any;
  value: string;
}) => {
  return (
    <section id={value} className="hidden">
      {children}
    </section>
  );
};
