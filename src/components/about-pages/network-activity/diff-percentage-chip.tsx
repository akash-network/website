import { cn } from "@/lib/utils";
import React from "react";
import { FormattedNumber } from "react-intl";

export interface DiffPercentageChipProps {
  value: number;
  size?: "small" | "medium";
}

export const DiffPercentageChip: React.FunctionComponent<
  DiffPercentageChipProps
> = ({ value, size = "small" }) => {
  if (typeof value !== "number") return null;

  const isPositiveDiff = value >= 0;

  return (
    <p
      className={cn(
        "flex items-center  text-3xs font-bold md:text-sm",
        isPositiveDiff ? " text-green-600" : " text-primary",
      )}
    >
      {isPositiveDiff ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 md:h-5 md:w-5"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.29315 9.70679C5.10545 9.51926 5 9.26495 5 8.99979C5 8.73462 5.10545 8.48031 5.29315 8.29279L9.29816 4.29279C9.48592 4.10532 9.74055 4 10.006 4C10.2715 4 10.5262 4.10532 10.7139 4.29279L14.7189 8.29279C14.9013 8.48139 15.0022 8.73399 15 8.99619C14.9977 9.25838 14.8924 9.5092 14.7067 9.6946C14.5211 9.88001 14.27 9.98518 14.0074 9.98746C13.7449 9.98974 13.492 9.88894 13.3032 9.70679L11.0073 7.41379V14.9998C11.0073 15.265 10.9018 15.5194 10.714 15.7069C10.5263 15.8944 10.2716 15.9998 10.006 15.9998C9.7405 15.9998 9.48582 15.8944 9.29805 15.7069C9.11028 15.5194 9.00479 15.265 9.00479 14.9998V7.41379L6.70892 9.70679C6.52116 9.89426 6.26653 9.99957 6.00104 9.99957C5.73554 9.99957 5.48092 9.89426 5.29315 9.70679Z"
            fill="#10B981"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 md:h-5 md:w-5"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M14.7068 10.2932C14.8946 10.4807 15 10.735 15 11.0002C15 11.2654 14.8946 11.5197 14.7068 11.7072L10.7018 15.7072C10.5141 15.8947 10.2595 16 9.99396 16C9.72846 16 9.47383 15.8947 9.28607 15.7072L5.28106 11.7072C5.09868 11.5186 4.99776 11.266 5.00004 11.0038C5.00232 10.7416 5.10762 10.4908 5.29326 10.3054C5.4789 10.12 5.73003 10.0148 5.99255 10.0125C6.25508 10.0103 6.508 10.1111 6.69683 10.2932L8.9927 12.5862L8.9927 5.00021C8.9927 4.735 9.09819 4.48064 9.28596 4.29311C9.47374 4.10557 9.72841 4.00021 9.99396 4.00021C10.2595 4.00021 10.5142 4.10557 10.7019 4.29311C10.8897 4.48064 10.9952 4.735 10.9952 5.00021L10.9952 12.5862L13.2911 10.2932C13.4788 10.1057 13.7335 10.0004 13.999 10.0004C14.2645 10.0004 14.5191 10.1057 14.7068 10.2932V10.2932Z"
            fill="#FA5757"
          />
        </svg>
      )}

      <FormattedNumber
        style="percent"
        maximumFractionDigits={2}
        value={Math.abs(value)}
      />
    </p>
  );
};
