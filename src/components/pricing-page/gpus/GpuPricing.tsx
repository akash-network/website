import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useGpuPrices } from "../shared/pricing-api";
import {
  CONTACT_URL,
  FieldLabel,
  Panel,
  PricingQueryProvider,
  Skeleton,
  ToggleChips,
  buttonClass,
  formatUsd,
  type ToggleOption,
} from "../shared/ui";
import { BLACKWELL_ACCESS_URL, withBlackwellFallbacks } from "./gpu-models";
import { GPU_PRIORITY_MODELS } from "./gpu-priority";
import {
  byPrice,
  toGpuRow,
  type GpuRow,
  type InterfaceFamily,
} from "./gpu-rows";

const RENT_URL = "https://console.akash.network/new-deployment";

type VramBucket = "small" | "mid" | "large";
type SortKey = "featured" | "price-asc" | "price-desc" | "vram-desc";

const FEATURED_ORDER = ["b300", "b200", ...GPU_PRIORITY_MODELS];

const selectTriggerClass =
  "h-9 w-full gap-2 rounded-md border-zinc-200 bg-white px-3 text-left text-sm text-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-950/10 dark:border-white/10 dark:bg-transparent dark:text-zinc-50";
const selectContentClass =
  "border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950";
const selectGroupLabelClass =
  "pl-8 text-xs font-medium text-zinc-500 dark:text-zinc-400";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low → high" },
  { value: "price-desc", label: "Price, high → low" },
  { value: "vram-desc", label: "VRAM, high → low" },
];

const featuredRank = (row: GpuRow) => {
  const index = FEATURED_ORDER.indexOf(row.model.toLowerCase());
  return index === -1 ? FEATURED_ORDER.length : index;
};

function sortRows(rows: GpuRow[], sort: SortKey) {
  const sorted = [...rows];
  switch (sort) {
    case "price-asc":
      return sorted.sort(byPrice(1));
    case "price-desc":
      return sorted.sort(byPrice(-1));
    case "vram-desc":
      return sorted.sort((a, b) => b.ramGb - a.ramGb || byPrice(1)(a, b));
    default:
      return sorted.sort(
        (a, b) =>
          featuredRank(a) - featuredRank(b) ||
          b.ramGb - a.ramGb ||
          byPrice(-1)(a, b),
      );
  }
}

const vramBucket = (ramGb: number): VramBucket =>
  ramGb >= 80 ? "large" : ramGb > 24 ? "mid" : "small";

export default function GpuPricing() {
  return (
    <PricingQueryProvider>
      <GpuPricingContent />
    </PricingQueryProvider>
  );
}

function GpuPricingContent() {
  const { data, isLoading, isError, refetch, isFetching } = useGpuPrices();

  const [model, setModel] = useState("all");
  const [vendor, setVendor] = useState("all");
  const [vram, setVram] = useState<VramBucket | "all">("all");
  const [iface, setIface] = useState<InterfaceFamily | "all">("all");
  const [sort, setSort] = useState<SortKey>("vram-desc");

  const rows = useMemo(
    () => withBlackwellFallbacks(data?.models ?? []).map(toGpuRow),
    [data],
  );

  // One entry per model (variants such as V100 16 GB and 32 GB share it): featured models in
  // table order first, then everything else alphabetically.
  const modelOptions = useMemo(() => {
    const labels = new Map<string, string>();
    for (const row of sortRows(rows, "featured")) {
      const key = row.model.toLowerCase();
      if (!labels.has(key)) labels.set(key, row.name);
    }
    const options = [...labels].map(([value, label]) => ({ value, label }));
    const isFeatured = (value: string) => FEATURED_ORDER.includes(value);
    return {
      featured: options.filter((option) => isFeatured(option.value)),
      other: options
        .filter((option) => !isFeatured(option.value))
        .sort((a, b) =>
          a.label.localeCompare(b.label, "en", { numeric: true }),
        ),
    };
  }, [rows]);

  const vendorOptions = useMemo<ToggleOption<string>[]>(() => {
    const vendors = [...new Set(rows.map((row) => row.vendorKey))].filter(
      Boolean,
    );
    return [
      { value: "all", label: "All" },
      ...vendors.map((key) => ({
        value: key,
        label: rows.find((row) => row.vendorKey === key)?.vendor ?? key,
      })),
    ];
  }, [rows]);

  const vramOptions = useMemo<ToggleOption<VramBucket | "all">[]>(() => {
    const midSizes = rows
      .map((row) => row.ramGb)
      .filter((ram) => vramBucket(ram) === "mid");
    const minMid = Math.min(...midSizes);
    const maxMid = Math.max(...midSizes);
    const labels: Record<VramBucket, string> = {
      small: "≤ 24 GB",
      mid: minMid === maxMid ? `${minMid} GB` : `${minMid}–${maxMid} GB`,
      large: "80 GB +",
    };
    const present = new Set(rows.map((row) => vramBucket(row.ramGb)));
    return [
      { value: "all", label: "All" },
      ...(["small", "mid", "large"] as VramBucket[])
        .filter((bucket) => present.has(bucket))
        .map((bucket) => ({ value: bucket, label: labels[bucket] })),
    ];
  }, [rows]);

  const interfaceOptions = useMemo<
    ToggleOption<InterfaceFamily | "all">[]
  >(() => {
    const present = new Set(rows.map((row) => row.interfaceFamily));
    const labels = { sxm: "SXM", pcie: "PCIe" } as const;
    return [
      { value: "all", label: "All" },
      ...(["sxm", "pcie"] as const)
        .filter((family) => present.has(family))
        .map((family) => ({ value: family, label: labels[family] })),
    ];
  }, [rows]);

  // A selection can disappear after a refresh (e.g. a bucket empties out); fall back to "all".
  const activeModel = [...modelOptions.featured, ...modelOptions.other].some(
    (o) => o.value === model,
  )
    ? model
    : "all";
  const activeVendor = vendorOptions.some((o) => o.value === vendor)
    ? vendor
    : "all";
  const activeVram = vramOptions.some((o) => o.value === vram) ? vram : "all";
  const activeIface = interfaceOptions.some((o) => o.value === iface)
    ? iface
    : "all";

  const visibleRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (activeModel !== "all" && row.model.toLowerCase() !== activeModel)
        return false;
      if (activeVendor !== "all" && row.vendorKey !== activeVendor)
        return false;
      if (activeVram !== "all" && vramBucket(row.ramGb) !== activeVram)
        return false;
      if (activeIface !== "all" && row.interfaceFamily !== activeIface)
        return false;
      return true;
    });
    return sortRows(filtered, sort);
  }, [rows, activeModel, activeVendor, activeVram, activeIface, sort]);

  const hasFilters =
    activeModel !== "all" ||
    activeVendor !== "all" ||
    activeVram !== "all" ||
    activeIface !== "all";

  const clearFilters = () => {
    setModel("all");
    setVendor("all");
    setVram("all");
    setIface("all");
  };

  if (isError && !data) {
    return (
      <Panel className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Live GPU prices couldn&apos;t be loaded.
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            The pricing service didn&apos;t respond. Please try again.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className={buttonClass("outline")}
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </Panel>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start xl:gap-10">
      <aside
        aria-label="Filter GPUs"
        className="flex flex-col gap-4 lg:sticky lg:top-24"
      >
        <Panel className="flex flex-col gap-6 p-5">
          <FilterGroup label="Sort by">
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as SortKey)}
            >
              <SelectTrigger
                aria-label="Sort GPUs"
                className={selectTriggerClass}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup label="Model">
            <Select value={activeModel} onValueChange={setModel}>
              <SelectTrigger
                aria-label="GPU model"
                className={selectTriggerClass}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="all">All models</SelectItem>
                {[
                  { label: "Featured", options: modelOptions.featured },
                  { label: "Other models", options: modelOptions.other },
                ]
                  .filter((group) => group.options.length > 0)
                  .map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectSeparator className="bg-zinc-200 dark:bg-white/10" />
                      <SelectLabel className={selectGroupLabelClass}>
                        {group.label}
                      </SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          {vendorOptions.length > 2 && (
            <FilterGroup label="Chipset">
              <ToggleChips
                label="Chipset"
                options={vendorOptions}
                value={activeVendor}
                onValueChange={setVendor}
              />
            </FilterGroup>
          )}

          {vramOptions.length > 2 && (
            <FilterGroup label="VRAM">
              <ToggleChips
                label="VRAM"
                options={vramOptions}
                value={activeVram}
                onValueChange={setVram}
              />
            </FilterGroup>
          )}

          {interfaceOptions.length > 2 && (
            <FilterGroup label="Interface">
              <ToggleChips
                label="Interface"
                options={interfaceOptions}
                value={activeIface}
                onValueChange={setIface}
              />
            </FilterGroup>
          )}
        </Panel>

        <CustomQuoteCard className="hidden lg:flex" />
      </aside>

      <div className="flex min-w-0 flex-col gap-3">
        <Panel className="overflow-hidden">
          {/* The price and the row action share one fixed-width cell, sized for the
              action's widest label: when the label slides in, it pushes only the price
              aside and never reflows the model column. */}
          <table className="w-full text-left text-sm md:table-fixed">
            <thead className="border-b border-zinc-200 bg-zinc-50/60 dark:border-white/10 dark:bg-white/[0.02]">
              <tr className="text-sm text-zinc-500 dark:text-zinc-400">
                <th
                  scope="col"
                  className="px-4 py-3 font-medium max-[359px]:px-3 md:px-6"
                >
                  GPU model
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-right font-medium max-[359px]:pr-3 md:w-[248px] md:pr-6"
                >
                  {/* On desktop the price sits beside the arrow, so the label is offset by the
                      arrow and its gap to line up with the prices. */}
                  <span className="md:mr-11">Starting at</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
              {isLoading ? (
                Array.from({ length: 8 }, (_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      No GPUs match these filters.
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className={buttonClass("outline", "sm", "mt-4")}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <GpuTableRow key={row.key} row={row} />
                ))
              )}
            </tbody>
          </table>
        </Panel>

        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Prices are per GPU-hour in USD, derived from recent provider bids on
          the network and weighted by each provider&apos;s GPU count. B200 and
          B300 are listed at fixed rates.
        </p>

        <CustomQuoteCard className="mt-5 lg:hidden" />
      </div>
    </div>
  );
}

function CustomQuoteCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]",
        className,
      )}
    >
      <h2 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
        Looking for Bulk Orders or Custom Configurations?
      </h2>
      <a
        href={CONTACT_URL}
        className={buttonClass("primary", "default", "w-full")}
      >
        Get in Touch
      </a>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function GpuTableRow({ row }: { row: GpuRow }) {
  const href = row.isBlackwell ? BLACKWELL_ACCESS_URL : RENT_URL;
  const external = !row.isBlackwell;

  // The whole row is clickable, but it forwards to the real link so middle-click, keyboard
  // focus, and click tracking on the link's id keep working.
  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if ((event.target as HTMLElement).closest("a, button")) return;
    event.currentTarget
      .querySelector<HTMLAnchorElement>("a[data-row-link]")
      ?.click();
  };

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
    >
      {/* Mobile: two lines per cell, sized alike so they line up across the row (name and
          price, then specs and a labelled action). Desktop: one line, with the specs after
          the name and the action's label revealed on hover. */}
      <td className="px-4 py-4 align-top max-[359px]:px-3 md:px-6 md:align-middle">
        <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
          <p className="text-lg font-medium leading-7 tracking-tight text-zinc-900 dark:text-zinc-50 max-[359px]:text-base/7">
            {row.name}
          </p>
          <div className="flex min-h-7 flex-wrap items-center gap-1.5 md:min-h-0">
            <SpecBadge>{row.ramLabel}</SpecBadge>
            {row.interface && <SpecBadge>{row.interface}</SpecBadge>}
          </div>
        </div>
      </td>
      <td className="py-4 pl-2 pr-4 align-top max-[359px]:pr-3 md:pr-6 md:align-middle">
        <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
          {row.hourly !== null ? (
            <span className="whitespace-nowrap font-jetBrainsMono text-[17px] font-medium tabular-nums leading-7 text-zinc-900 dark:text-zinc-50">
              {formatUsd(row.hourly)}
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                /hr
              </span>
            </span>
          ) : (
            <span className="whitespace-nowrap text-xs leading-7 text-zinc-500 dark:text-zinc-400">
              No recent bids
            </span>
          )}
          <a
            data-row-link
            id={`${row.model}-(gpu-rent)`}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={`${row.isBlackwell ? "Get access to" : "Rent"} ${row.name} ${row.ramLabel}`}
            // Mobile always shows the label. On desktop it's just the arrow at rest; hovering
            // the row or focusing the link slides the label in.
            className="inline-flex h-7 shrink-0 items-center rounded-full bg-zinc-100 pl-3 pr-2 text-zinc-900 transition-all duration-300 ease-out hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15 dark:focus-visible:ring-white/25 md:h-8 md:px-2 md:group-focus-within:pl-3.5 md:group-hover:pl-3.5"
          >
            <span
              aria-hidden
              className="mr-1 max-w-24 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ease-out md:mr-0 md:max-w-0 md:text-sm md:opacity-0 md:group-focus-within:mr-1.5 md:group-focus-within:max-w-24 md:group-focus-within:opacity-100 md:group-hover:mr-1.5 md:group-hover:max-w-24 md:group-hover:opacity-100"
            >
              {row.isBlackwell ? "Get access" : "Rent"}
            </span>
            <ArrowRight
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4"
            />
          </a>
        </div>
      </td>
    </tr>
  );
}

// Equal widths keep the pair tidy; below 360px they shrink to fit beside the row action.
function SpecBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 min-w-[4.5rem] items-center justify-center whitespace-nowrap rounded-md border border-zinc-200 px-2 font-jetBrainsMono text-[13px] tabular-nums text-zinc-600 dark:border-white/15 dark:text-zinc-300 max-[359px]:min-w-0 max-[359px]:px-1.5 max-[359px]:text-xs">
      {children}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-4 align-top max-[359px]:px-3 md:px-6 md:align-middle">
        <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
          <Skeleton className="my-1 h-5 w-24 md:my-0" />
          <div className="flex min-h-7 items-center gap-1.5 md:min-h-0">
            <Skeleton className="h-6 w-[4.5rem]" />
            <Skeleton className="h-6 w-[4.5rem]" />
          </div>
        </div>
      </td>
      <td className="py-4 pl-2 pr-4 align-top max-[359px]:pr-3 md:pr-6 md:align-middle">
        <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
          <Skeleton className="my-1 h-5 w-20 md:my-0" />
          <Skeleton className="h-7 w-16 rounded-full md:h-8 md:w-8" />
        </div>
      </td>
    </tr>
  );
}
