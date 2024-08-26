"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { sliderLabel?: string }
>(({ className, sliderLabel, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center cursor-pointer",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#E6E6E6] dark:bg-background">
            <SliderPrimitive.Range className="absolute h-full bg-[#272626] dark:bg-lightForeground" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-[#272626] dark:border-lightForeground  bg-background2 font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {sliderLabel &&
                <SliderPrimitive.SliderTrack className="whitespace-nowrap p-[3px_13px] text-sm leading-6 bg-transparent rounded-md text-center text-black dark:text-white inline-block absolute top-[-35px] transform translate-x-[calc(-50%+10px)] shadow-[0px_2px_4px_0px_rgba(30,41,59,0.25)] dark:shadow-black">{sliderLabel}</SliderPrimitive.SliderTrack>
            }
        </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
