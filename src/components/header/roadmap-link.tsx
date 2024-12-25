import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<"a"> {
  currentPath?: string;

  children: React.ReactNode;
}

const RoadmapLink: React.FC<Props> = ({ currentPath, children }) => {
  const currentYear = new Date().getFullYear();
  return (
    <a
      href={`/roadmap/${currentYear}/`}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center text-sm font-medium leading-normal hover:text-primary xl:text-sm ",
        currentPath?.startsWith(`/roadmap`) ? "text-primary" : "",
      )}
    >
      {children}
    </a>
  );
};

export default RoadmapLink;
