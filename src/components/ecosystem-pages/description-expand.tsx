import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover-card";

const descClass = "text-sm font-normal leading-relaxed text-para";

const DescriptionExpand = ({ description }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [linesGreater, setLinesGreater] = useState(false);

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const el = ref.current;
      const style = window.getComputedStyle(el, null);
      const lineHeight = parseInt(style.getPropertyValue("line-height"));
      const height = parseInt(style.getPropertyValue("height"));
      const lines = height / 20;

      if (lines > 3) {
        setLinesGreater(true);
      }
    }
  }, [ref, description]);

  return (
    <div className="relative">
      <p
        ref={ref}
        className={`pointer-events-none absolute w-full opacity-0 ${descClass}`}
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>

      {/* desktop */}
      <div className="hidden lg:block">
        {linesGreater ? (
          <HoverCard openDelay={500}>
            <HoverCardTrigger>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className={`mt-3 line-clamp-3 cursor-pointer ${descClass}`}
              ></p>
            </HoverCardTrigger>
            <HoverCardContent className="p-5" align="start" alignOffset={50}>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className={`max-w-[16rem] ${descClass}`}
              ></p>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <p
            dangerouslySetInnerHTML={{ __html: description }}
            className={`mt-3 line-clamp-3 ${descClass}`}
          ></p>
        )}
      </div>

      {/* tablet */}
      <div className="hidden md:block lg:hidden">
        {linesGreater ? (
          <Popover>
            <PopoverTrigger>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className={`mt-6 line-clamp-3 cursor-pointer text-left ${descClass}`}
              ></p>
              <p className="mt-2 text-left text-sm font-medium text-primary">
                Show more
              </p>
            </PopoverTrigger>
            <PopoverContent className="max-w-[25rem] bg-card">
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className={descClass}
              ></p>
            </PopoverContent>
          </Popover>
        ) : (
          <p
            dangerouslySetInnerHTML={{ __html: description }}
            className={`mt-6 line-clamp-3 ${descClass}`}
          ></p>
        )}
      </div>

      {/* mobile */}
      <div className="md:hidden">
        <p
          dangerouslySetInnerHTML={{ __html: description }}
          className={`mt-6 ${isExpanded ? "line-clamp-none" : "line-clamp-3"} ${descClass}`}
        ></p>
        {linesGreater && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 inline-flex items-center gap-1 rounded-md border bg-transparent px-2.5 py-1 text-xs font-medium text-para transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {isExpanded ? "Show less" : "Show more"}
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default DescriptionExpand;
