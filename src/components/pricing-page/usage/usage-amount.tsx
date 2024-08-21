import React, { useEffect, useState } from "react";
import ProgressBar from "./progress-bar";

type UsageAmountProps = {
    title: string;
    content: string;
};

function UsageAmount({ title, content }: UsageAmountProps) {


    const [progress, setProgress] = useState<number>(60);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProgress(Number(event.target.value));
    };


    return (
        <div className="flex flex-col gap-5">
            <div className="">
                <h2 className="text-2xl font-semibold text-black">{title}</h2>
                <p className="text-sm font-medium">{content}</p>
            </div>
            <div className="flex justify-between items-center gap-5 ">
                <div className="relative w-full">
                    <ProgressBar
                        progress={progress} />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleInputChange}
                        className="w-full top-0 left-0 absolute opacity-0 cursor-pointer"
                    />
                </div>
                <div className="rounded-md border px-5 py-3 shadow-sm  text-center bg-white text-[21px] leading-[28px] font-semibold text-black">
                    240
                </div>
            </div>
        </div>
    );
}

export default UsageAmount;
