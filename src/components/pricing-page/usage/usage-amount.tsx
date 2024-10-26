import { Slider } from "@/components/ui/slider";
import { useEffect } from "react";

type UsageAmountProps = {
  title: string | React.ReactNode;
  content: string;
  max: number;
  defaultValue: number;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  suffix?: string;
};

function UsageAmount({
  title,
  content,
  max,
  defaultValue,
  amount,
  setAmount,
  suffix,
}: UsageAmountProps) {
  useEffect(() => {
    if (!amount) {
      setAmount(0);
    }
  }, [amount]);

  return (
    <div className="flex flex-col gap-5">
      <div className="">
        <h2 className="text-lg font-semibold text-foreground md:text-2xl">
          {title}
        </h2>
        <p className="text-sm font-medium">{content}</p>
      </div>
      <div className="flex items-center justify-between gap-5 ">
        <div className="relative w-full">
          <Slider
            defaultValue={[defaultValue]}
            value={[amount]}
            max={max}
            step={1}
            className={"z-10 w-[100%]"}
            onValueChange={(value) => setAmount(value[0])}
            sliderLabel={`${amount} ${suffix}`}
            draggable
          />
        </div>
        <input
          className="relative w-[60px] rounded-md border bg-transparent py-1.5 text-center text-[21px]  font-semibold text-foreground shadow-sm focus:outline-primary dark:outline-none md:w-[80px] md:py-2"
          value={amount}
          onChange={(e) => {
            setAmount(parseInt(e.target.value));
          }}
        />
      </div>
    </div>
  );
}

export default UsageAmount;
