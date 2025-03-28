import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    sliderLabel?: string;
  }
>(({ className, sliderLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#E6E6E6] dark:bg-background">
      <SliderPrimitive.Range className="absolute h-full bg-[#272626] dark:bg-lightForeground" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-[#272626]  bg-background2 font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-lightForeground">
      {sliderLabel && (
        <SliderPrimitive.SliderTrack className="absolute top-[-35px] hidden translate-x-[calc(-50%+10px)] transform whitespace-nowrap rounded-md bg-transparent p-[3px_13px] text-center text-sm leading-6 text-black shadow-[0px_2px_4px_0px_rgba(30,41,59,0.25)] dark:border dark:border-defaultBorder dark:text-white dark:shadow-sm dark:shadow-background  lg:inline-block">
          {sliderLabel}
        </SliderPrimitive.SliderTrack>
      )}
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
