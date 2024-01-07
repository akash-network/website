export const USDLabel = () => {
  return <span>$USD</span>;
};

export const USDCLabel = () => {
  return <span className="ml-2 ">USDC</span>;
};

export const USD = () => {
  return <span className=""> $</span>;
};

export const AKTLabel = () => {
  return <span className="ml-2 ">AKT</span>;
};

export const CpuLabel = () => {
  return <span className="ml-2 ">CPU</span>;
};

export const GpuLabel = () => {
  return <span className="ml-2 ">GPU</span>;
};

export const UnitLabel = ({ label }: { label: string }) => {
  return <span className="ml-2 ">{label}</span>;
};
