import { CalendarModal } from "@/components/development-pages/calendar-modal";
import { getYearToUse } from "@/utils/redirects";
import clsx from "clsx";
import { ArrowRightCircle } from "lucide-react";
import {
  communityItems,
  developmentItems,
  ecosystemNavItems,
  networkItems,
  pricingItems,
} from "./links";

export const SubNavbar = ({
  pathname,
  type,
}: {
  pathname: string;
  type: "community" | "development" | "network" | "ecosystem" | "pricing";
}) => {
  const latestRoadmapYear = getYearToUse();

  const items =
    type === "community"
      ? communityItems
      : type === "development"
        ? developmentItems
        : type === "ecosystem"
          ? ecosystemNavItems
          : type === "pricing"
            ? pricingItems
            : networkItems;

  const navItems = items.filter((item) => !item?.external && !item?.internal);
  const external = items.find((item) => item?.external && !item?.internal);

  const isActive = (item: (typeof items)[0]) =>
    pathname === item.link ||
    (item.link === "roadmap" && pathname?.split("/")[1] === "roadmap") ||
    pathname?.split("/")[2] === item.link?.split("/")[2] ||
    (pathname?.split("/")[1] === item.link?.split("/")[1] &&
      pathname.includes("case-studies")) ||
    (item.link === "/ecosystem/providers/" &&
      pathname.startsWith("/ecosystem/network-capacity"));

  return (
    <div className="border-b border-zinc-200 bg-background dark:border-white/10">
      <div className="container">
        <div className="flex items-center justify-between overflow-x-auto py-3">
          <div className="flex items-center -mx-3">
            {navItems.map((item, i) => (
              <a
                key={i}
                href={item.link === "roadmap" ? `/roadmap/${latestRoadmapYear}` : item.link}
                target={item.link.startsWith("http") ? "_blank" : "_self"}
                className={clsx(
                  "whitespace-nowrap px-3 py-1.5 text-[13.4px] font-normal transition-colors",
                  isActive(item)
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
                )}
              >
                {item.title}
              </a>
            ))}
          </div>

          {type === "development" ? (
            <CalendarModal />
          ) : (
            (() => {
              const internal = items.find((item) => item?.internal);
              return (
                <>
                  {internal && (
                    <a
                      href={internal.link}
                      target={internal.link.startsWith("http") ? "_blank" : "_self"}
                      className="flex shrink-0 items-center whitespace-nowrap rounded-full border bg-background px-3 py-1.5 text-sm font-semibold"
                    >
                      {internal.title}
                      <ArrowRightCircle className="ml-1 inline-block stroke-[1.5px]" size={16} />
                    </a>
                  )}
                  {external && (
                    <a
                      href={external.link}
                      target="_blank"
                      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[13.4px] font-normal text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {external.title}
                      <ArrowRightCircle className="h-[13px] w-[13px] shrink-0 -rotate-45 stroke-[1.5px]" />
                    </a>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
