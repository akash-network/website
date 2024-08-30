import { Skeleton } from "@/components/ui/skeleton";

type MonthEarning = {
  size?: 20 | 24;
  className?: string;
  value?: string;
  title?: string;
  suffix?: string;
  loading?: boolean;
};

const MonthEarning = ({
  size,
  className,
  value,
  title,
  suffix,
  loading,
}: MonthEarning) => {
  return (
    <div className="">
      <p
        className={`border-b pb-2 text-sm font-medium text-black dark:text-white`}
      >
        {title}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-1/2" />
      ) : (
        <p
          className={`pt-2 font-semibold text-black dark:text-white ${size === 20 ? "text-xl" : "text-2xl"}`}
        >
          {value}
          {suffix ?? "/month"}
        </p>
      )}
    </div>
  );
};

export default MonthEarning;
