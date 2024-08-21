import React, { useEffect, useState } from "react";
import ProgressBar from "./progress-bar";

type PricingUnitProps = {
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    max: number;
    title: string;
    content: string;
    position?: string;
}

function PricingUnit({ title, content, position, progress, setProgress, max }: PricingUnitProps) {

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProgress(Number(event.target.value));
    };

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
                <ProgressBar
                    progress={progress}
                    max={max} />
                <input
                    type="range"
                    min="0"
                    max={max}
                    value={progress}
                    onChange={handleInputChange}
                    className="w-full top-1/2 left-0 -translate-y-1/2  absolute opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
}

export default PricingUnit;
