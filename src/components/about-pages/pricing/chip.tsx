import { cn } from "@/lib/utils";
import React from "react";
import { FormattedNumber } from "react-intl";

export interface DiffPercentageChipProps {
  value: number;
  size?: "small" | "medium";
}

export const Chip: React.FunctionComponent<DiffPercentageChipProps> = ({
  value,
  size = "small",
}) => {
  if (typeof value !== "number") return null;

  const isPositiveDiff = true;

  return (
    <p
      className={cn(
        "w-fit rounded-full  px-1.5 py-0.5 text-3xs font-medium  md:px-[8px] md:py-[4px] md:text-2xs",
        isPositiveDiff
          ? "bg-[#D2F4D9] text-[#36864C]"
          : "bg-[#F4A8A8] text-[#865C36]",
      )}
    >
      {isPositiveDiff ? "+ " : "- "}
      {value}
    </p>
  );
};
