import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

// Shared building blocks for the pricing pages, styled after shadcn/ui's default (neutral,
// monochrome) theme so the three pages read as one system.
//
// Type rule: labels, captions and helper text use the sans font in sentence case (as shadcn
// does); the mono font is reserved for values such as prices, sizes, units and spec codes.

export const CONTACT_URL = "/gpus-on-demand";
export const CONSOLE_URL = "https://console.akash.network/";

export function PricingQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** shadcn Label type for captions that aren't tied to a single input (filters, groups). */
export function FieldLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium leading-none text-zinc-900 dark:text-zinc-50",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Muted caption at the top of a card section, e.g. "Your estimate". */
export function SectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium text-zinc-500 dark:text-zinc-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

export const Panel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.02]",
      className,
    )}
    {...props}
  />
));
Panel.displayName = "Panel";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse rounded-md bg-zinc-100 dark:bg-white/[0.06]",
        className,
      )}
    />
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary:
    "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  outline:
    "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-white/15 dark:bg-transparent dark:text-zinc-50 dark:hover:bg-white/[0.06]",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50",
};

const buttonSizes = {
  default: "h-10 px-4",
  sm: "h-8 px-3 text-xs",
};

export function buttonClass(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "default",
  className?: string,
) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export const inputClass =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 font-jetBrainsMono text-sm tabular-nums text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/10 dark:border-white/10 dark:bg-black/40 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-white/30 dark:focus-visible:ring-white/10";

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "min" | "max" | "type"
> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  /** Short unit shown inside the field before the value, e.g. "$". */
  prefix?: string;
}

/**
 * Text input for numbers that tolerates in-progress edits ("", "1.") and accepts either "."
 * or "," as the decimal separator. Values are clamped to [min, max].
 */
export function NumberInput({
  value,
  onValueChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  allowDecimal = false,
  prefix,
  className,
  onFocus,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  if (prefix) {
    return (
      <span className={cn("relative block", className)}>
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-jetBrainsMono text-sm text-zinc-400 dark:text-zinc-500"
        >
          {prefix}
        </span>
        <NumberInput
          value={value}
          onValueChange={onValueChange}
          min={min}
          max={max}
          allowDecimal={allowDecimal}
          className="pl-7"
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
      </span>
    );
  }

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      autoComplete="off"
      className={cn(inputClass, className)}
      value={draft ?? String(value)}
      onFocus={(event) => {
        setDraft(String(value));
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
      onChange={(event) => {
        const raw = event.target.value.replace(",", ".");
        const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
        if (!pattern.test(raw)) return;

        setDraft(raw);
        const parsed = Number(raw);
        if (raw !== "" && raw !== "." && Number.isFinite(parsed)) {
          onValueChange(Math.min(Math.max(parsed, min), max));
        }
      }}
      {...props}
    />
  );
}

export function RangeSlider({
  value,
  onValueChange,
  min = 0,
  max,
  step = 1,
  label,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max: number;
  step?: number;
  label: string;
  className?: string;
}) {
  return (
    <SliderPrimitive.Root
      value={[Math.min(Math.max(value, min), max)]}
      onValueChange={([next]) => onValueChange(next)}
      min={min}
      max={max}
      step={step}
      className={cn(
        "relative flex h-5 w-full cursor-pointer touch-none select-none items-center",
        className,
      )}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
        <SliderPrimitive.Range className="absolute h-full bg-zinc-900 dark:bg-zinc-100" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        className="block h-4 w-4 rounded-full border border-zinc-300 bg-white shadow-sm ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-950/15 dark:border-white dark:focus-visible:ring-white/25"
      />
    </SliderPrimitive.Root>
  );
}

export interface ToggleOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/** Row of outline toggle buttons (shadcn ToggleGroup, outline variant). */
export function ToggleChips<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: {
  label: string;
  options: ToggleOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-9 whitespace-nowrap rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25",
              active
                ? "border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-white/60 dark:bg-white/10 dark:text-zinc-50"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Pill-shaped segmented control (shadcn Tabs list look) for binary view switches. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: {
  label: string;
  options: ToggleOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-white/10 dark:bg-white/[0.04]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25",
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const usdFormatters = new Map<number, Intl.NumberFormat>();

export function formatUsd(value: number, decimals = 2) {
  let formatter = usdFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    usdFormatters.set(decimals, formatter);
  }
  return formatter.format(value);
}

/** Sub-dollar hourly amounts get a third decimal so small line items don't round to $0.00. */
export function formatUsdRate(value: number, period: "month" | "hour") {
  if (period === "hour" && Math.abs(value) < 1) return formatUsd(value, 3);
  return formatUsd(value, 2);
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-US", { maximumFractionDigits });
}
