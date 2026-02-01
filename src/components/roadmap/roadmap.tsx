import QuarterNavigation from "@/components/QuarterNavigation";
import RoadmapCard from "@/components/roadmap/roadmap-card";
import YearSelector from "@/components/roadmap/YearSelector";
import type { CollectionEntry } from "astro:content";
import { useMemo, useState } from "react";

type Roadmap = CollectionEntry<"aeps">;

type Props = {
  year: number;
  quarters: {
    Q1: Roadmap[];
    Q2: Roadmap[];
    Q3: Roadmap[];
    Q4: Roadmap[];
  };
  years: number[];
};

type FilterType = "all" | "major";

export default function Roadmap({ year, quarters, years }: Props) {
  const title = `Akash Network Roadmap`;
  const [filter, setFilter] = useState<FilterType>("major");

  const filteredQuarters = useMemo(() => {
    if (filter === "all") {
      return quarters;
    }

    const filtered = {
      Q1: quarters.Q1.filter(
        (roadmap: Roadmap) => roadmap.data.roadmap === "major",
      ),
      Q2: quarters.Q2.filter(
        (roadmap: Roadmap) => roadmap.data.roadmap === "major",
      ),
      Q3: quarters.Q3.filter(
        (roadmap: Roadmap) => roadmap.data.roadmap === "major",
      ),
      Q4: quarters.Q4.filter(
        (roadmap: Roadmap) => roadmap.data.roadmap === "major",
      ),
    };
    return filtered;
  }, [quarters, filter]);

  return (
    <>
      <section className="container-reader w-full">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-6">
            Akash's roadmap outlines the high-level goals and priorities for the
            Akash Network.
          </p>
        </div>
      </section>
      <section className="container-reader sticky top-[57px] z-[20] w-full bg-background pb-4 md:top-[43px] md:pb-6">
        <div className=" flex flex-col items-start  gap-3 md:justify-between  md:gap-4 lg:flex-row lg:items-end">
          <YearSelector years={years} currentYear={year} />
          <div className="flex items-center   rounded-xl bg-gray-100 p-1 dark:bg-background2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                filter === "all"
                  ? " bg-primary text-white"
                  : " text-gray-700   dark:bg-background2  dark:text-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("major")}
              className={` rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                filter === "major"
                  ? " bg-primary text-white"
                  : "dark:hover:back bg-gray-100 text-gray-700   dark:bg-background2  dark:text-gray-300"
              }`}
            >
              Major
            </button>
          </div>
        </div>
      </section>
      <section className="md:container-reader flex w-full flex-col gap-6 md:mt-14 md:flex-row md:gap-14">
        <QuarterNavigation quarters={filteredQuarters} />
        <div className="relative w-full border-[#F0F1F2] px-5 pb-44 dark:border-[#2E2E2E] md:border-l md:px-0">
          <div className="absolute -top-9 left-5 right-0 flex h-full bg-line-dashed bg-center bg-repeat-y dark:bg-line-dashed-dark md:-top-3 md:left-0 md:right-auto md:w-full"></div>
          <div className="relative z-[1] flex flex-col gap-6 border-l border-[#F0F1F2] md:gap-10 md:border-l-0 md:pt-10">
            {Object.entries(filteredQuarters).map(
              ([quarter, roadmaps]) =>
                roadmaps.length > 0 && (
                  <div
                    key={quarter}
                    className="flex w-full flex-col gap-6 md:-ml-3 md:flex-row md:gap-10"
                    data-quarter={quarter}
                  >
                    <div className="flex w-full flex-col gap-10">
                      {roadmaps.map((roadmap: Roadmap) => (
                        <div
                          key={roadmap.slug}
                          className="flex flex-col items-start gap-4 md:flex-row md:gap-10"
                        >
                          <div className="-ml-3 flex items-center gap-3 md:ml-0 md:pt-6">
                            <div className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-badgeColor">
                              <div className="size-1.5 rounded-full bg-black dark:bg-white" />
                            </div>
                            <p className="whitespace-nowrap text-sm font-medium text-[#7E868C99] dark:text-para">
                              {roadmap.slug.split("/")[0]}
                            </p>
                          </div>

                          <RoadmapCard roadmap={roadmap} />
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}
