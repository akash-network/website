type CompareItemProps = {
    title: string;
    cost: number;
    logo: string;
};

const CompareItem = ({ title, cost, logo }: CompareItemProps) => {
    return (
        <div className="rounded-md border p-3 shadow-smbg-white">
            <div className="flex gap-4 items-center pb-2 border-b">
                <img src={logo} alt="akash-logo" />
                <p className="font-semibold text-black dark:text-white">{title}</p>
            </div>
            <div className="flex justify-between pt-2">
                <p className="text-sm font-medium">Estimated Cost:</p>
                <p className="text-[21px] leading-[28px] font-semibold text-black dark:text-white">
                    ${cost.toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default CompareItem;
