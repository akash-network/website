import type { CollectionEntry } from "astro:content";
import clsx from "clsx";
import RoadmapTooltip from "./RoadmapTooltip";

type Props = {
  roadmap: CollectionEntry<"aeps">;
  className?: string;
};

export default function RoadmapCard({ roadmap, className }: Props) {
  const estimatedCompletion =
    roadmap?.data?.["estimated-completion"]?.toLocaleDateString();
  const completionDate = roadmap?.data?.completed?.toLocaleDateString();

  const firstParagraph = roadmap?.body
    ?.split("\n")
    .find(
      (line) => line.trim() && !line.startsWith("#") && !line.startsWith("---"),
    )
    ?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  return (
    <a
      href={`/roadmap/${roadmap?.slug?.split("/")?.[0]}`}
      className={clsx(
        "ml-5 flex flex-col gap-4 rounded-lg border bg-background p-6 shadow transition-all duration-300 hover:shadow-md dark:bg-background2 md:ml-0",
        className ?? "md:w-full",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={clsx(
            roadmap?.data?.roadmap === "major" || className
              ? "font-instrument text-4xl md:text-5xl"
              : "text-2xl font-semibold",
          )}
        >
          {roadmap?.data?.title}
        </h3>
        <RoadmapTooltip isCompleted={!!roadmap?.data?.completed} />
      </div>
      {estimatedCompletion && (
        <p className="text-sm">Estimated Completion: {estimatedCompletion}</p>
      )}
      {completionDate && (
        <p className="text-sm">Completion Date: {completionDate}</p>
      )}
      <div className="my-1 h-px w-full border-b"></div>
      <p
        className="line-clamp-1 text-sm"
        dangerouslySetInnerHTML={{ __html: firstParagraph || "" }}
      />
    </a>
  );
}
