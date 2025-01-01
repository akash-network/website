import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<"a"> {
  currentPath?: string;
  children: React.ReactNode;
}

const RoadmapLink: React.FC<Props> = ({ currentPath, children }) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const isBeforeJan10 = today.getMonth() === 0 && today.getDate() <= 10;

  const yearToUse = isBeforeJan10 ? currentYear - 1 : currentYear;

  return (
    <a
      href={`/roadmap/${yearToUse}/`}
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
