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
}

function PricingUnit({ title, content, position, progress, setProgress, max, suffix, step = 1, flag }: PricingUnitProps) {

    useEffect(() => {
        if (!progress) {
            setProgress(0);
        }
    }, [progress])

    return (
        <div className={`flex flex-col justify-between md:gap-6 w-full ${flag ? 'gap-0' : 'gap-4'}`}>
            <div className={`lg:flex lg:justify-between ${position ? position : 'items-start'} ${flag ? 'flex justify-between items-baseline' : ''}`}>
                <div className={flag ? 'mb-4' : ''}>
                    <p className="font-semibold text-foreground whitespace-nowrap md:whitespace-normal">
                        {title}
                    </p>
                    {flag ? (<>
                        <p className="font-medium text-sm md:text-base whitespace-nowrap md:whitespace-normal sm:hidden">
                            Usage %<br />(Leases in your provider)
                        </p>
                        <p className="font-medium text-sm md:text-base whitespace-nowrap md:whitespace-normal hidden sm:block">
                            Usage % (Leases in your provider)
                        </p>
                    </>) : <p className="font-medium text-sm md:text-base whitespace-nowrap md:whitespace-normal">
                        {content}
                    </p>}
                </div>
                <input
                    className={`rounded-md border w-[63px] md:w-[90px] py-1.5 px-1 md:px-3 shadow-sm bg-transparent font-bold text-foreground focus:outline-primary dark:outline-none ${flag ? 'mt-0' : 'mt-4'}`}
                    value={flag ? `${progress} ${suffix}` : `${progress}`}
                    onChange={(e) => { setProgress(parseInt(e.target.value)) }}
                />
            </div>
            <div className="relative w-full md:py-5">
                <Slider
                    defaultValue={[progress]}
                    value={[progress]}
                    max={max}
                    step={step}
                    className={"w-[100%] z-10"}
                    onValueChange={(value) => setProgress(value[0])}
                    sliderLabel={suffix ? `${progress} ${suffix}` : `${progress}`}
                    draggable
                />
            </div>
        </div>
    );
}

export default PricingUnit;
