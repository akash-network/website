import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

type UsageAmountProps = {
    title: string;
    content: string;
    max: number;
    defaultValue: number;
    amount: number;
    setAmount: React.Dispatch<React.SetStateAction<number>>;
    suffix?: string;
};

function UsageAmount({ title, content, max, defaultValue, amount, setAmount, suffix }: UsageAmountProps) {
    // const [amount, setAmount] = useState<number[]>([defaultValue]);

    useEffect(() => {
        if (!amount) {
            setAmount(0);
        }
    }, [amount])

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
                        value={[amount]}
                        max={max}
                        step={1}
                        className={"w-[100%] z-10"}
                        onValueChange={(value) => setAmount(value[0])}
                        sliderLabel={`${amount} ${suffix}`}
                        draggable
                    />
                </div>
                <input
                    className="w-[80px] relative rounded-md border py-2 shadow-sm  text-center bg-white text-[21px] font-semibold text-black focus:outline-primary"
                    value={amount}
                    onChange={(e) => { setAmount(parseInt(e.target.value)) }}
                />
            </div>
        </div>
    );
}

export default UsageAmount;
