import { useState } from "react";
import { Slider } from "@/components/ui/slider";

type UsageAmountProps = {
    title: string;
    content: string;
    max: number;
    defaultValue: number;
    suffix?: string;
};

function UsageAmount({ title, content, max, defaultValue, suffix }: UsageAmountProps) {
    const [value, setValue] = useState<number[]>([defaultValue]);

    return (
        <div className="flex flex-col gap-5">
            <div className="">
                <h2 className="text-2xl font-semibold text-black">{title}</h2>
                <p className="text-sm font-medium">{content}</p>
            </div>
            <div className="flex justify-between items-center gap-5 ">
                <div className="relative w-full">
                    <Slider
                        defaultValue={[defaultValue]}
                        max={max}
                        step={1}
                        className={"w-[100%] z-10"}
                        onValueChange={setValue}
                        sliderLabel={`${value} ${suffix}`}
                        draggable
                    />
                </div>
                <div className="w-[80px] relative rounded-md border py-2 shadow-sm  text-center bg-white text-[21px] font-semibold text-black">
                    {value[0]}
                </div>
            </div>
        </div>
    );
}

export default UsageAmount;
