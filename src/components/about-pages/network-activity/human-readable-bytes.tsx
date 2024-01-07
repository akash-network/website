import { bytesToShrink } from "@/lib/unit-utils";
import React from "react";
import { FormattedNumber } from "react-intl";
import { UnitLabel } from "./usd-label";

export interface HumanReadableBytesProps {
  value: number;
}

export const HumanReadableBytes: React.FunctionComponent<
  HumanReadableBytesProps
> = ({ value }) => {
  if (typeof value !== "number") return null;

  const result = bytesToShrink(value);

  return (
    <>
      <FormattedNumber value={result.value} maximumFractionDigits={0} />
      {/* <UnitLabel label={result.unit} /> */}
    </>
  );
};
