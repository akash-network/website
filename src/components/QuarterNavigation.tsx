import clsx from "clsx";
import { useEffect, useState } from "react";

interface QuarterNavigationProps {
  quarters: {
    Q1: any[];
    Q2: any[];
    Q3: any[];
    Q4: any[];
  };
}

export default function QuarterNavigation({
  quarters,
}: QuarterNavigationProps) {
  const firstAvailableQuarter =
    Object.entries(quarters).find(([_, items]) => items.length > 0)?.[0] ||
    "Q1";

  const [activeQuarter, setActiveQuarter] = useState<string>(
    firstAvailableQuarter,
  );

  useEffect(() => {
    const handleScroll = () => {
      const quarterElements = document.querySelectorAll("[data-quarter]");

      const viewportHeight = window.innerHeight;

      const threshold = viewportHeight / 3;

      const quartersArray = Array.from(quarterElements).reverse();

      for (const element of quartersArray) {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const quarterTop = rect.top;

          if (quarterTop <= threshold) {
            const quarter = element.getAttribute("data-quarter");
            if (quarter && quarter !== activeQuarter) {
              setActiveQuarter(quarter);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeQuarter]);

  const scrollToQuarter = (quarter: string) => {
    const element = document.querySelector(`[data-quarter="${quarter}"]`);
    if (element) {
      const headerOffset = window.innerWidth < 768 ? 244 : 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sticky left-0 top-[141px] z-[10] col-span-3 bg-background px-5 pb-6 md:top-[143px] md:h-[45dvh] md:px-0 md:py-0   ">
      <div className="flex flex-row justify-start  gap-4 md:flex-col md:justify-normal md:gap-8">
        {Object.entries(quarters).map(([quarter, roadmaps]) =>
          roadmaps.length > 0 ? (
            <button
              key={quarter}
              onClick={() => scrollToQuarter(quarter)}
              className={clsx(
                "flex  size-20 items-center justify-center rounded border bg-background font-instrument  text-[40px]  shadow-sm transition-all  duration-300 ",
                activeQuarter === quarter
                  ? "text-foreground"
                  : "text-[#11182733] hover:text-foreground hover:shadow-md dark:text-[#ffffff33] dark:hover:text-foreground",
              )}
            >
              {quarter}
            </button>
          ) : null,
        )}
      </div>
    </div>
  );
}
