import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { GPU_PRIORITY_MODELS } from "../gpus/gpu-priority";
import { toGpuRow, type GpuRow } from "../gpus/gpu-rows";
import {
  HOURS_PER_MONTH,
  useAktPrice,
  useGpuPrices,
} from "../shared/pricing-api";
import {
  CONTACT_URL,
  FieldLabel,
  NumberInput,
  Panel,
  PricingQueryProvider,
  RangeSlider,
  SectionLabel,
  SegmentedControl,
  Skeleton,
  buttonClass,
  formatNumber,
  formatUsd,
} from "../shared/ui";
import ProviderChoiceDialog from "./ProviderChoiceDialog";

type ResourceKey =
  | "cpu"
  | "memory"
  | "ephemeral"
  | "persistent"
  | "ip"
  | "endpoint";

interface ResourceConfig {
  key: ResourceKey;
  label: string;
  hint: string;
  unit: string;
  priceUnit: string;
  quantity: number;
  price: number;
}

// Default prices are the defaults in Akash's provider bid-pricing script
// (akash-network/helm-charts: charts/akash-provider/scripts/price_script_generic.sh), with
// persistent storage at its NVMe (beta3) rate.
const RESOURCES: ResourceConfig[] = [
  {
    key: "cpu",
    label: "CPU",
    hint: "threads offered",
    unit: "vCPU",
    priceUnit: "thread-month",
    quantity: 10,
    price: 1.6,
  },
  {
    key: "memory",
    label: "Memory",
    hint: "GiB offered",
    unit: "Gi",
    priceUnit: "GB-month",
    quantity: 256,
    price: 0.8,
  },
  {
    key: "ephemeral",
    label: "Ephemeral storage",
    hint: "GiB offered",
    unit: "Gi",
    priceUnit: "GB-month",
    quantity: 1024,
    price: 0.02,
  },
  {
    key: "persistent",
    label: "Persistent storage",
    hint: "GiB offered · NVMe",
    unit: "Gi",
    priceUnit: "GB-month",
    quantity: 1024,
    price: 0.04,
  },
  {
    key: "ip",
    label: "Public IPs",
    hint: "leasable IPs",
    unit: "units",
    priceUnit: "IP-month",
    quantity: 1,
    price: 5,
  },
  {
    key: "endpoint",
    label: "Endpoints",
    hint: "exposed ports",
    unit: "ports",
    priceUnit: "port-month",
    quantity: 1,
    price: 0.05,
  },
];

// The same script's GPU rate when no per-model pricing is configured. Only used if live GPU
// prices can't be loaded; otherwise each GPU defaults to its model's current network price.
const GPU_FALLBACK_PRICE = 100;

type Values = Record<ResourceKey, number>;

const DEFAULT_QUANTITIES = Object.fromEntries(
  RESOURCES.map((resource) => [resource.key, resource.quantity]),
) as Values;

const DEFAULT_PRICES = Object.fromEntries(
  RESOURCES.map((resource) => [resource.key, resource.price]),
) as Values;

interface GpuLine {
  id: number;
  /** null follows the first model in the list. */
  modelKey: string | null;
  quantity: number;
  /** null follows the selected model's live network price. */
  price: number | null;
}

const gpuOptionRank = (row: GpuRow) => {
  const index = GPU_PRIORITY_MODELS.indexOf(row.model.toLowerCase());
  return index === -1 ? GPU_PRIORITY_MODELS.length : index;
};

const tableColumns =
  "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)]";
const tableRowClass = `grid grid-cols-2 items-start gap-x-4 gap-y-3 px-5 py-4 sm:px-6 ${tableColumns}`;
const hintClass =
  "mt-1.5 font-jetBrainsMono text-[11px] text-zinc-500 dark:text-zinc-400";
const footnoteClass =
  "text-xs leading-relaxed text-zinc-500 dark:text-zinc-400";

export default function ProviderCalculator() {
  return (
    <PricingQueryProvider>
      <ProviderCalculatorContent />
    </PricingQueryProvider>
  );
}

function ProviderCalculatorContent() {
  const [utilization, setUtilization] = useState(100);
  const [quantities, setQuantities] = useState<Values>(DEFAULT_QUANTITIES);
  const [prices, setPrices] = useState<Values>(DEFAULT_PRICES);
  const [gpuLines, setGpuLines] = useState<GpuLine[]>([
    { id: 0, modelKey: null, quantity: 1, price: null },
  ]);
  const nextGpuId = useRef(1);
  const [aktBasis, setAktBasis] = useState<"average" | "current">("average");

  const gpuPrices = useGpuPrices();
  const akt = useAktPrice();

  const gpuOptions = useMemo(
    () =>
      (gpuPrices.data?.models ?? [])
        .map(toGpuRow)
        .filter((row) => row.hourly !== null && !row.isBlackwell)
        .sort(
          (a, b) =>
            gpuOptionRank(a) - gpuOptionRank(b) ||
            b.ramGb - a.ramGb ||
            (b.hourly ?? 0) - (a.hourly ?? 0),
        ),
    [gpuPrices.data],
  );

  const gpus = gpuLines.map((line) => {
    const option =
      gpuOptions.find((candidate) => candidate.key === line.modelKey) ??
      gpuOptions[0] ??
      null;
    const livePrice = option?.hourly
      ? Math.round(option.hourly * HOURS_PER_MONTH)
      : null;
    return {
      ...line,
      option,
      price: line.price ?? livePrice ?? GPU_FALLBACK_PRICE,
    };
  });

  const updateGpu = (id: number, patch: Partial<GpuLine>) =>
    setGpuLines((lines) =>
      lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );

  const addGpu = () => {
    // Suggest the first model that isn't in the table yet.
    const used = new Set(gpus.map((gpu) => gpu.option?.key));
    const next =
      gpuOptions.find((option) => !used.has(option.key)) ?? gpuOptions[0];
    const id = nextGpuId.current++;
    setGpuLines((lines) => [
      ...lines,
      { id, modelKey: next?.key ?? null, quantity: 1, price: null },
    ]);
  };

  const removeGpu = (id: number) =>
    setGpuLines((lines) => lines.filter((line) => line.id !== id));

  const factor = utilization / 100;
  const lines = [
    ...gpus.map((gpu) => ({
      key: `gpu-${gpu.id}`,
      label: `${gpu.option?.name ?? "GPU"} × ${formatNumber(gpu.quantity)}`,
      monthly: gpu.quantity * gpu.price * factor,
    })),
    ...RESOURCES.map((resource) => ({
      key: resource.key,
      label: resource.label,
      monthly: quantities[resource.key] * prices[resource.key] * factor,
    })),
  ];
  const totalMonthly = lines.reduce((sum, line) => sum + line.monthly, 0);
  const largestLine = Math.max(...lines.map((line) => line.monthly), 0);

  const averageAkt = akt.average30d.data;
  const currentAkt = akt.current.data;
  const basis =
    aktBasis === "average"
      ? averageAkt
        ? "average"
        : "current"
      : currentAkt
        ? "current"
        : "average";
  const aktPrice = basis === "average" ? averageAkt : currentAkt;
  const aktLoading = akt.average30d.isLoading || akt.current.isLoading;

  const setQuantity = (key: ResourceKey) => (value: number) =>
    setQuantities((current) => ({ ...current, [key]: value }));

  const setPrice = (key: ResourceKey) => (value: number) =>
    setPrices((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <Panel className="p-6 md:p-8">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
            Describe your hardware
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            List the hardware you&apos;d offer and the price you&apos;d bid.
            Earnings scale with how much of it gets leased.
          </p>

          <div className="mt-8 flex items-center justify-between gap-4">
            <FieldLabel>Utilization</FieldLabel>
            <span className="font-jetBrainsMono text-sm tabular-nums text-zinc-900 dark:text-zinc-50">
              {utilization}%
            </span>
          </div>
          <RangeSlider
            className="mt-4"
            value={utilization}
            onValueChange={setUtilization}
            max={100}
            label="Utilization, percent of capacity leased"
          />
          <div className="mt-3 flex justify-between font-jetBrainsMono text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <TableHeader labels={["GPU model", "Quantity", "Your price"]} />
          <div className="divide-y divide-zinc-200 dark:divide-white/10">
            {gpus.map((gpu) => {
              const name = gpu.option
                ? `${gpu.option.name} ${gpu.option.ramLabel}`
                : "GPU";
              return (
                <div key={gpu.id} className={tableRowClass}>
                  <div className="col-span-2 flex min-w-0 items-start gap-2 sm:col-span-1">
                    <GpuModelSelect
                      options={gpuOptions}
                      value={gpu.option?.key ?? null}
                      isLoading={gpuPrices.isLoading}
                      onValueChange={(key) =>
                        updateGpu(gpu.id, { modelKey: key, price: null })
                      }
                    />
                    {gpus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGpu(gpu.id)}
                        aria-label={`Remove ${name}`}
                        className={buttonClass(
                          "ghost",
                          "sm",
                          "h-9 w-9 shrink-0 px-0",
                        )}
                      >
                        <X aria-hidden className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="min-w-0">
                    <NumberInput
                      value={gpu.quantity}
                      onValueChange={(quantity) =>
                        updateGpu(gpu.id, { quantity })
                      }
                      aria-label={`${name} quantity`}
                      className="w-full sm:max-w-[8.5rem]"
                    />
                    <p className={hintClass}>units</p>
                  </div>

                  <div className="min-w-0">
                    <NumberInput
                      allowDecimal
                      prefix="$"
                      value={gpu.price}
                      onValueChange={(price) => updateGpu(gpu.id, { price })}
                      aria-label={`${name} price in USD per GPU-month`}
                      className="w-full sm:max-w-[8.5rem]"
                    />
                    {/* Each part stays whole, so narrow columns wrap before the hourly rate. */}
                    <p className={hintClass}>
                      <span className="whitespace-nowrap">per GPU-month</span>
                      {gpu.price > 0 && (
                        <>
                          {" "}
                          <span className="whitespace-nowrap">
                            ({formatUsd(gpu.price / HOURS_PER_MONTH)}/hr)
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-zinc-200 px-5 py-4 dark:border-white/10 sm:px-6">
            {gpuOptions.length > 0 && (
              <button
                type="button"
                onClick={addGpu}
                className={buttonClass("outline", "sm", "mb-4 gap-1.5")}
              >
                <Plus aria-hidden className="h-3.5 w-3.5" />
                Add GPU model
              </button>
            )}
            <p className={footnoteClass}>
              {gpuOptions.length > 0 || gpuPrices.isLoading
                ? "GPU prices default to each model's current network price, derived from recent provider bids."
                : "Live GPU prices are unavailable right now, so GPU prices default to the bid-pricing script's fallback rate."}
            </p>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <TableHeader labels={["Resource", "Quantity", "Your price"]} />
          <div className="divide-y divide-zinc-200 dark:divide-white/10">
            {RESOURCES.map((resource) => (
              <div key={resource.key} className={tableRowClass}>
                {/* Top padding lines the label up with the text inside the inputs. */}
                <div className="col-span-2 min-w-0 sm:col-span-1 sm:pt-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {resource.label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {resource.hint}
                  </p>
                </div>

                <div className="min-w-0">
                  <NumberInput
                    value={quantities[resource.key]}
                    onValueChange={setQuantity(resource.key)}
                    aria-label={`${resource.label} quantity (${resource.unit})`}
                    className="w-full sm:max-w-[8.5rem]"
                  />
                  <p className={hintClass}>{resource.unit}</p>
                </div>

                <div className="min-w-0">
                  <NumberInput
                    allowDecimal
                    prefix="$"
                    value={prices[resource.key]}
                    onValueChange={setPrice(resource.key)}
                    aria-label={`${resource.label} price in USD per ${resource.priceUnit}`}
                    className="w-full sm:max-w-[8.5rem]"
                  />
                  <p className={hintClass}>per {resource.priceUnit}</p>
                </div>
              </div>
            ))}
          </div>
          <p
            className={cn(
              footnoteClass,
              "border-t border-zinc-200 px-5 py-4 dark:border-white/10 sm:px-6",
            )}
          >
            Default prices come from Akash&apos;s default provider bid-pricing
            script (persistent storage at its NVMe rate).
          </p>
        </Panel>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <Panel className="p-6 md:p-8">
          <SectionLabel>Estimated earnings</SectionLabel>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Per month
            </p>
            <p
              aria-live="polite"
              className="mt-1 flex flex-wrap items-baseline gap-x-2"
            >
              <span className="text-5xl font-medium tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 md:text-6xl">
                {formatUsd(totalMonthly, totalMonthly >= 100 ? 0 : 2)}
              </span>
              <span className="text-lg text-emerald-700 dark:text-emerald-300">
                USD
              </span>
            </p>
            {aktLoading ? (
              <Skeleton className="mt-2 h-5 w-32" />
            ) : (
              aktPrice && (
                <p className="mt-2 font-jetBrainsMono text-sm tabular-nums text-emerald-700 dark:text-emerald-300">
                  ≈{" "}
                  {formatNumber(
                    totalMonthly / aktPrice,
                    totalMonthly / aktPrice >= 100 ? 0 : 2,
                  )}{" "}
                  AKT
                </p>
              )
            )}
          </div>

          <dl className="mt-5 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-600 dark:text-zinc-400">Utilization</dt>
              <dd className="font-jetBrainsMono tabular-nums text-zinc-900 dark:text-zinc-50">
                {utilization}%
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-400">AKT price</dt>
              <dd className="flex items-center gap-3">
                {averageAkt && currentAkt ? (
                  <SegmentedControl
                    label="AKT price basis"
                    value={basis}
                    onValueChange={setAktBasis}
                    options={[
                      { value: "average", label: "30-day avg" },
                      { value: "current", label: "Current" },
                    ]}
                  />
                ) : (
                  aktPrice && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {basis === "average" ? "30-day avg" : "Current"}
                    </span>
                  )
                )}
                {aktLoading ? (
                  <Skeleton className="h-5 w-14" />
                ) : aktPrice ? (
                  <span className="font-jetBrainsMono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatUsd(aktPrice, aktPrice < 1 ? 3 : 2)}
                  </span>
                ) : (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Unavailable
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="my-6 h-px bg-zinc-200 dark:bg-white/10" />

          <SectionLabel>Breakdown</SectionLabel>
          <dl className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
              <div
                key={line.key}
                className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-center gap-4 text-sm"
              >
                <dt className="truncate text-zinc-600 dark:text-zinc-400">
                  {line.label}
                </dt>
                <dd className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]"
                  >
                    <span
                      className="block h-full rounded-full bg-zinc-900 transition-[width] duration-300 dark:bg-zinc-100"
                      style={{
                        width: `${largestLine > 0 ? (line.monthly / largestLine) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className="min-w-[88px] text-right font-jetBrainsMono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatUsd(line.monthly)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            <ProviderChoiceDialog>
              <button
                id="become-a-provider-(gpus)"
                type="button"
                className={buttonClass("primary", "default", "w-full")}
              >
                Become a Provider
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </button>
            </ProviderChoiceDialog>
            <a
              href={CONTACT_URL}
              className={buttonClass("outline", "default", "w-full")}
            >
              Get in Touch
            </a>
          </div>
        </Panel>

        <p className="px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Estimates only, before operating costs. Actual earnings depend on the
          leases you win and your uptime. AKT figures convert the USD estimate
          at CoinGecko&apos;s AKT/USD price.
        </p>
      </div>
    </div>
  );
}

function TableHeader({ labels }: { labels: [string, string, string] }) {
  return (
    <div
      className={cn(
        "hidden gap-4 border-b border-zinc-200 bg-zinc-50/60 px-6 py-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400 sm:grid",
        tableColumns,
      )}
    >
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}

function GpuModelSelect({
  options,
  value,
  isLoading,
  onValueChange,
}: {
  options: GpuRow[];
  value: string | null;
  isLoading: boolean;
  onValueChange: (key: string) => void;
}) {
  if (isLoading) return <Skeleton className="h-9 w-full" />;
  if (options.length === 0) {
    return (
      <p className="flex h-9 items-center text-sm text-zinc-500 dark:text-zinc-400">
        GPU models unavailable
      </p>
    );
  }

  // The trigger shows the short name; the list adds the interface to tell variants apart.
  const selected = options.find((option) => option.key === value);

  return (
    <Select value={value ?? undefined} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label="GPU model"
        className="h-9 w-full min-w-0 gap-2 rounded-md border-zinc-200 bg-white px-3 text-left text-sm text-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-950/10 dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
      >
        <SelectValue placeholder="Select a model">
          {selected && `${selected.name} ${selected.ramLabel}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72 border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
        {options.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.name} {option.ramLabel} {option.interface}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
