import React, { useEffect } from "react";
import { Slider } from "@/components/ui/slider";

type PricingUnitProps = {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  max: number;
  title: string;
  content: string;
  position?: string;
  suffix?: string;
  step?: number;
  flag?: boolean;
};

function PricingUnit({
  title,
  content,
  position,
  progress,
  setProgress,
  max,
  suffix,
  step = 1,
  flag,
}: PricingUnitProps) {
  useEffect(() => {
    if (!progress) {
      setProgress(0);
    }
  }, [progress]);

  return (
    <div
      className={`flex w-full flex-col justify-between md:gap-6 ${flag ? "gap-0" : "gap-4"}`}
    >
      <div
        className={`lg:flex lg:justify-between ${position ? position : "items-start"} ${flag ? "flex items-baseline justify-between" : ""}`}
      >
        <div className={flag ? "mb-4" : ""}>
          <p className="whitespace-nowrap font-semibold text-foreground md:whitespace-normal">
            {title}
          </p>
          {flag ? (
            <>
              <p className="whitespace-nowrap text-sm font-medium sm:hidden md:whitespace-normal md:text-base">
                Usage %<br />
                (Leases in your provider)
              </p>
              <p className="hidden whitespace-nowrap text-sm font-medium sm:block md:whitespace-normal md:text-base">
                Usage % (Leases in your provider)
              </p>
            </>
          ) : (
            <p className="whitespace-nowrap text-sm font-medium md:whitespace-normal md:text-base">
              {content}
            </p>
          )}
        </div>
        <input
          className={`w-[63px] rounded-md border bg-transparent px-1 py-1.5 font-bold text-foreground shadow-sm focus:outline-primary dark:outline-none md:w-[90px] md:px-3 ${flag ? "mt-0" : "mt-4"}`}
          value={flag ? `${progress} ${suffix}` : `${progress}`}
          onChange={(e) => {
            setProgress(parseInt(e.target.value));
          }}
        />
      </div>
      <div className="relative w-full md:py-5">
        <Slider
          defaultValue={[progress]}
          value={[progress]}
          max={max}
          step={step}
          className={"z-10 w-[100%]"}
          onValueChange={(value) => setProgress(value[0])}
          sliderLabel={suffix ? `${progress} ${suffix}` : `${progress}`}
          draggable
        />
      </div>
    </div>
  );
}

export default PricingUnit;
