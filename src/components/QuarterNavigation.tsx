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
  const [activeQuarter, setActiveQuarter] = useState<string>("Q1");

  useEffect(() => {
    const handleScroll = () => {
      const quarterElements = document.querySelectorAll("[data-quarter]");
      // Get viewport height to calculate better thresholds
      const viewportHeight = window.innerHeight;
      // Use 1/3 of viewport height as threshold
      const threshold = viewportHeight / 3;

      // Convert NodeList to Array and reverse it to check from bottom to top
      const quartersArray = Array.from(quarterElements).reverse();

      for (const element of quartersArray) {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const quarterTop = rect.top;

          // Check if the element's top is within the threshold of the viewport
          if (quarterTop <= threshold) {
            const quarter = element.getAttribute("data-quarter");
            if (quarter && quarter !== activeQuarter) {
              setActiveQuarter(quarter);
            }
            break; // Stop checking once we find the first matching quarter
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeQuarter]); // Add activeQuarter as dependency

  const scrollToQuarter = (quarter: string) => {
    const element = document.querySelector(`[data-quarter="${quarter}"]`);
    if (element) {
      const headerOffset = 120; // Match your sticky top offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sticky left-0 top-[120px] col-span-3 h-[30dvh]">
      <div className="flex flex-col gap-8">
        {Object.entries(quarters).map(([quarter, roadmaps]) =>
          roadmaps.length > 0 ? (
            <button
              key={quarter}
              onClick={() => scrollToQuarter(quarter)}
              className={clsx(
                "flex size-20 items-center justify-center rounded border bg-background font-instrument text-[40px] shadow-sm transition-all",
                activeQuarter === quarter
                  ? "text-foreground"
                  : "text-[#11182733] dark:text-[#ffffff33]",
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
