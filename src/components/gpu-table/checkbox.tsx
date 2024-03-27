import clsx from "clsx";
import React, { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const CheckBox = (props: InputProps) => {
  const ref = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        type="checkbox"
        {...props}
        ref={ref}
        hidden
        className="sr-only"
        id={props.name}
      />
      <label htmlFor={props.name} className="flex cursor-pointer items-center">
        <div className="relative">
          <div className="block h-4 w-4 rounded  border bg-background2" />
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center rounded transition-transform duration-300",
              props?.checked
                ? "scale-100 transform bg-primary  "
                : "scale-0 transform",
            )}
          >
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <div className="ml-2 text-sm font-medium text-foreground">
          {props.label}
        </div>
      </label>
    </div>
  );
};

export default CheckBox;
