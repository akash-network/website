import React, { useEffect, useState } from "react";
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

const DescriptionExpand = ({ description }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [linesGreater, setLinesGreater] = useState(false);
  const [open, setOpen] = useState(false);
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
        className="pointer-events-none absolute w-full text-sm font-medium leading-[20px] opacity-0"
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>
      <div className="hidden lg:block">
        {linesGreater ? (
          <HoverCard openDelay={500}>
            <HoverCardTrigger>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className="mt-6 line-clamp-3 cursor-pointer text-sm font-medium leading-[20px] text-cardGray"
              ></p>
            </HoverCardTrigger>
            <HoverCardContent className="p-5" align="start" alignOffset={50}>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className=" max-w-[16rem] text-sm font-medium leading-[20px] text-cardGray"
              ></p>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <p
            dangerouslySetInnerHTML={{ __html: description }}
            className="mt-6 line-clamp-3 cursor-pointer text-sm font-medium leading-[20px] text-cardGray"
          ></p>
        )}
      </div>

      {/* tablet */}
      <div className="hidden md:block lg:hidden">
        {linesGreater ? (
          <>
            <Popover>
              <PopoverTrigger>
                <p
                  dangerouslySetInnerHTML={{ __html: description }}
                  className="mt-6 line-clamp-3  cursor-pointer text-left text-sm font-medium leading-[20px] text-cardGray"
                ></p>
                <p className="mt-2 text-left text-sm font-medium text-primary">
                  Show more
                </p>
              </PopoverTrigger>
              <PopoverContent className="max-w-[25rem]  bg-background2">
                <p
                  dangerouslySetInnerHTML={{ __html: description }}
                  className=" text-sm font-medium leading-[20px] text-cardGray"
                ></p>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <p
            dangerouslySetInnerHTML={{ __html: description }}
            className="mt-6 line-clamp-3 cursor-pointer text-sm font-medium leading-[20px] text-cardGray"
          ></p>
        )}
      </div>
      {/* mobile */}
      <div className="md:hidden">
        <p
          dangerouslySetInnerHTML={{ __html: description }}
          className={`mt-6 text-sm font-medium leading-[20px] text-cardGray ${
            isExpanded ? "line-clamp-none" : "line-clamp-3"
          }`}
        ></p>
        {linesGreater && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm font-medium text-primary"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
};

export default DescriptionExpand;
