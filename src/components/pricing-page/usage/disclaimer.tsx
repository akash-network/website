import { Info } from "lucide-react";

function Disclaimer() {
  return (
    <div className="flex items-center gap-1">
      <p className="text-sm font-medium text-[#7E868C] dark:text-para">
        Disclaimer
      </p>
      <Info size={14} className="text-[#9D9C9C] dark:text-para" />
    </div>
  );
}

export default Disclaimer;
