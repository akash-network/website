type MonthEarning = {
    size?: 20 | 24;
    className?: string;
    value?: string;
    title?: string;
}

const MonthEarning = ({ size, className, value, title }: MonthEarning) => {
    return (
        <div className="">
            <p className={`pb-2 border-b font-medium text-sm text-black`}>{title}</p>
            <p className={`pt-2 font-semibold text-black ${size === 20 ? "text-xl" : "text-2xl"}`}>{value}/month</p>
        </div>
    );
};

export default MonthEarning;
