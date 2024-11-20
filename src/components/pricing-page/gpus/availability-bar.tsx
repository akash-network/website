import clsx from "clsx";
import React, { useEffect, useState } from "react";

interface AvailabilityBarProps {
  available: number;
  total: number;
  className?: string;
}

const AvailabilityBar: React.FC<AvailabilityBarProps> = ({
  available,
  total,
  className,
}) => {
  const [maxDots, setMaxDots] = useState(25);
  const filledDots = Math.round(((total - available) / total) * maxDots);
  const emptyDots = maxDots - filledDots;

  useEffect(() => {
    const handleResize = () => {
      const isMediumScreen = window.matchMedia(
        "(min-width: 768px) and (max-width: 1023px)",
      ).matches;
      setMaxDots(isMediumScreen ? 15 : 25);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={clsx("my-5 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground md:text-sm lg:text-base">
          {available} Available
        </span>
        <span className="text-sm text-para lg:text-base">({total} total)</span>
      </div>
      <div className="flex justify-between">
        {Array.from({ length: filledDots }).map((_, i) => (
          <div
            key={i}
            className="mx-[2px] h-[6px] w-[6px] rounded-full bg-foreground "
          />
        ))}
        {Array.from({ length: emptyDots }).map((_, i) => (
          <div
            key={i + filledDots}
            className="mx-[2px] h-[6px] w-[6px] rounded-full bg-[#DADADA] dark:bg-zinc-700"
          />
        ))}
      </div>
    </div>
  );
};

export default AvailabilityBar;
