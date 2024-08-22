import React from "react";
import { Slider } from "@/components/ui/slider";

type PricingUnitProps = {
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    max: number;
    title: string;
    content: string;
    position?: string;
}

function PricingUnit({ title, content, position, progress, setProgress, max }: PricingUnitProps) {

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className={`flex justify-between ${position ? position : 'items-start'}`}>
                <div className="">
                    <p className="font-semibold text-black">
                        {title}
                    </p>
                    <p className="font-medium">
                        {content}
                    </p>
                </div>
                <div className="rounded-md border w-[90px] py-1.5 px-3 shadow-sm bg-white font-bold text-black">
                    {progress}{title === 'CPU' ? '%' : ''}
                </div>
            </div>
            <div className="relative w-full py-5">
                <Slider
                    defaultValue={[progress]}
                    max={max}
                    step={1}
                    className={"w-[100%]"}
                    onValueChange={(value) => setProgress(value[0])}
                    draggable
                />
            </div>
        </div>
    );
}

export default PricingUnit;
