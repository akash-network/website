import React, { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import clsx from "clsx";

type PricingUnitProps = {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  max: number;
  title: string;
  content: string | React.ReactNode;
  position?: string;
  suffix?: string;
  step?: number;
  flag?: boolean;
  inputClass?: string;
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
  inputClass,
}: PricingUnitProps) {
  useEffect(() => {
    if (!progress) {
      setProgress(0);
    }
  }, [progress]);

  return (
    <div className="flex w-full flex-col justify-between gap-4 md:gap-5 ">
      <div
        className={`md:space-x-2 lg:flex lg:justify-between ${position ? position : "items-start"}`}
      >
        <div className="">
          <p className="whitespace-nowrap font-semibold text-foreground md:whitespace-normal">
            {title}
          </p>
          <p className="whitespace-nowrap text-sm font-medium md:whitespace-normal md:text-base">
            {content}
          </p>
        </div>
        <input
          className={clsx(
            inputClass,
            "mt-4 w-[63px] rounded-md border bg-transparent px-1 py-1.5 font-bold text-foreground shadow-sm focus:outline-primary dark:outline-none md:w-[90px] md:px-3",
          )}
          value={flag ? `${progress} ${suffix}` : `${progress}`}
          onChange={(e) => {
            setProgress(parseInt(e.target.value));
          }}
        />
      </div>
      <div className="relative w-full  md:py-5">
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
