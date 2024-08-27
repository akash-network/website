type CompareItemProps = {
  title: string;
  cost: number;
  logo: string;
};

const CompareItem = ({ title, cost, logo }: CompareItemProps) => {
  return (
    <div className="rounded-md border bg-background p-3 drop-shadow-sm">
      <div className="flex items-center gap-4 border-b pb-2">
        <img src={logo} alt="akash-logo" />
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm font-medium">Estimated Cost:</p>
        <p className="text-[21px] font-semibold leading-[28px] text-black dark:text-white">
          ${cost.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CompareItem;
