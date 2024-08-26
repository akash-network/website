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
        <div className="flex flex-col gap-5 w-full">
            <div className={`flex justify-between ${position ? position : 'items-start'}`}>
                <div className="">
                    <p className="font-semibold text-foreground">
                        {title}
                    </p>
                    <p className="font-medium">
                        {content}
                    </p>
                </div>
                <input
                    className="rounded-md border w-[90px] py-1.5 px-3 shadow-sm bg-transparent font-bold text-foreground focus:outline-primary dark:outline-none"
                    value={flag ? `${progress} ${suffix}` : `${progress}`}
                    onChange={(e) => { setProgress(parseInt(e.target.value)) }}
                />
            </div>
            <div className="relative w-full py-5">
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
