import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { GPU_PRIORITY_MODELS } from "../gpus/gpu-priority";
import { pickHeadlineRows, toGpuRow, type GpuRow } from "../gpus/gpu-rows";
import {
  HOURS_PER_MONTH,
  useDebouncedValue,
  useGpuPrices,
  usePricingEstimates,
  type PricingSpec,
} from "../shared/pricing-api";
import {
  CONSOLE_URL,
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
  formatUsdRate,
} from "../shared/ui";
import { USAGE_PRESETS, type UsagePreset } from "./presets";

type Period = "month" | "hour";

const GIB = 1024 ** 3;

const RESOURCES = [
  { key: "cpu", label: "CPU", unit: "vCPU", defaultValue: 20, max: 100 },
  {
    key: "memory",
    label: "Memory",
    unit: "GiB",
    defaultValue: 128,
    max: 1024,
  },
  {
    key: "ephemeral",
    label: "Ephemeral storage",
    unit: "GiB",
    defaultValue: 256,
    max: 10240,
  },
  {
    key: "persistent",
    label: "Persistent storage",
    unit: "GiB",
    defaultValue: 256,
    max: 10240,
  },
] as const;

type ResourceKey = (typeof RESOURCES)[number]["key"];
type Usage = Record<ResourceKey, number>;

const DEFAULT_USAGE = Object.fromEntries(
  RESOURCES.map((resource) => [resource.key, resource.defaultValue]),
) as Usage;

const MAX_GPU_COUNT = 64;

/** `/v1/pricing` takes CPU in millicores and memory/storage in bytes. */
const toSpec = (cpu: number, memoryGi: number, storageGi: number) => ({
  cpu: Math.round(cpu * 1000),
  memory: Math.round(memoryGi * GIB),
  storage: Math.round(storageGi * GIB),
});

// The first spec is the full deployment (used for the hyperscaler totals); the rest price each
// resource on its own so the Akash estimate can be broken down line by line.
function toPricingSpecs(usage: Usage): PricingSpec[] {
  return [
    toSpec(usage.cpu, usage.memory, usage.ephemeral + usage.persistent),
    toSpec(usage.cpu, 0, 0),
    toSpec(0, usage.memory, 0),
    toSpec(0, 0, usage.ephemeral),
    toSpec(0, 0, usage.persistent),
  ];
}

const PRESET_SPECS: PricingSpec[] = USAGE_PRESETS.map((preset) =>
  toSpec(preset.cpu, preset.memoryGi, preset.ephemeralGi + preset.persistentGi),
);

const formatAmount = (value: number) => formatNumber(value, 2);

export default function UsageCalculator() {
  return (
    <PricingQueryProvider>
      <UsageCalculatorContent />
    </PricingQueryProvider>
  );
}

function UsageCalculatorContent() {
  const [usage, setUsage] = useState<Usage>(DEFAULT_USAGE);
  const [gpuKey, setGpuKey] = useState<string | null>(null);
  const [gpuCount, setGpuCount] = useState(1);
  const [period, setPeriod] = useState<Period>("month");
  const gpuCountId = useId();

  const gpuPrices = useGpuPrices();
  const gpuOptions = useMemo(
    () =>
      pickHeadlineRows(
        (gpuPrices.data?.models ?? []).map(toGpuRow),
        GPU_PRIORITY_MODELS,
      ),
    [gpuPrices.data],
  );
  const selectedGpu =
    gpuOptions.find((option) => option.key === gpuKey) ?? null;

  // Templates that accept any NVIDIA GPU are priced on the model with the most GPUs leased right
  // now (allocated units from the same feed), rather than an arbitrary pick.
  const referenceGpu = useMemo(() => {
    const leased = new Map<string, number>();
    for (const model of gpuPrices.data?.models ?? []) {
      const key = model.model.toLowerCase();
      const inUse = model.availability.total - model.availability.available;
      leased.set(key, (leased.get(key) ?? 0) + Math.max(0, inUse));
    }
    const leasedCount = (option: GpuRow) =>
      leased.get(option.model.toLowerCase()) ?? 0;
    return gpuOptions.reduce<GpuRow | null>(
      (best, option) =>
        !best || leasedCount(option) > leasedCount(best) ? option : best,
      null,
    );
  }, [gpuPrices.data, gpuOptions]);

  const resolvePresetGpu = (preset: UsagePreset) => {
    if (!preset.gpu) return null;
    const model = preset.gpu.model;
    return model
      ? (gpuOptions.find((option) => option.model.toLowerCase() === model) ??
          null)
      : referenceGpu;
  };

  const specs = useMemo(() => toPricingSpecs(usage), [usage]);
  const debouncedSpecs = useDebouncedValue(specs);
  const estimates = usePricingEstimates(debouncedSpecs);
  const presetEstimates = usePricingEstimates(PRESET_SPECS);

  const [total, ...parts] = estimates.data ?? [];
  const lines = RESOURCES.map((resource, index) => ({
    key: resource.key,
    label: resource.label,
    monthly: parts[index]?.akash ?? 0,
  }));
  const computeMonthly = lines.reduce((sum, line) => sum + line.monthly, 0);
  const gpuMonthly = selectedGpu?.hourly
    ? selectedGpu.hourly * HOURS_PER_MONTH * gpuCount
    : 0;
  const akashMonthly = computeMonthly + gpuMonthly;

  const clouds = total
    ? [
        { name: "AWS", monthly: total.aws },
        { name: "GCP", monthly: total.gcp },
        { name: "Azure", monthly: total.azure },
      ]
    : [];
  const cloudAverage =
    clouds.length > 0
      ? clouds.reduce((sum, cloud) => sum + cloud.monthly, 0) / clouds.length
      : 0;
  const savings = cloudAverage > 0 ? 1 - computeMonthly / cloudAverage : null;
  const isSaving = savings !== null && savings >= 0 && !estimates.isLoading;

  const inPeriod = (monthly: number) =>
    period === "month" ? monthly : monthly / HOURS_PER_MONTH;
  const format = (monthly: number) => formatUsdRate(inPeriod(monthly), period);

  const isInitialLoad = estimates.isLoading;
  const isUpdating = estimates.isFetching && estimates.isPreviousData;

  const gpuLabel =
    selectedGpu &&
    `${gpuCount}×\u00a0${selectedGpu.name} ${selectedGpu.ramLabel}`;
  const specSummary = [
    `${formatAmount(usage.cpu)}\u00a0vCPU`,
    `${formatAmount(usage.memory)}\u00a0GiB RAM`,
    `${formatAmount(usage.ephemeral)}\u00a0GiB ephemeral`,
    `${formatAmount(usage.persistent)}\u00a0GiB persistent`,
    gpuLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  const presets = USAGE_PRESETS.map((preset, index) => {
    const gpu = resolvePresetGpu(preset);
    const gpuUnavailable = preset.gpu !== null && gpu === null;
    const compute = presetEstimates.data?.[index]?.akash;
    const monthly =
      compute === undefined || gpuUnavailable
        ? null
        : compute +
          (gpu && preset.gpu
            ? (gpu.hourly ?? 0) * HOURS_PER_MONTH * preset.gpu.units
            : 0);
    const active =
      usage.cpu === preset.cpu &&
      usage.memory === preset.memoryGi &&
      usage.ephemeral === preset.ephemeralGi &&
      usage.persistent === preset.persistentGi &&
      (preset.gpu
        ? gpu !== null && gpuKey === gpu.key && gpuCount === preset.gpu.units
        : gpuKey === null);
    return { preset, gpu, gpuUnavailable, monthly, active };
  });

  const applyPreset = (preset: UsagePreset) => {
    setUsage({
      cpu: preset.cpu,
      memory: preset.memoryGi,
      ephemeral: preset.ephemeralGi,
      persistent: preset.persistentGi,
    });
    setGpuKey(resolvePresetGpu(preset)?.key ?? null);
    setGpuCount(preset.gpu?.units ?? 1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <Panel className="p-6 md:p-8">
          <h2
            id="usage-presets"
            className="text-xl font-medium text-zinc-900 dark:text-zinc-50"
          >
            Popular deployments
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Pick one to load its specs, then adjust anything below.
          </p>

          <div
            role="radiogroup"
            aria-labelledby="usage-presets"
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {presets.map(({ preset, gpu, gpuUnavailable, monthly, active }) => (
              <label key={preset.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="usage-preset"
                  value={preset.id}
                  checked={active}
                  onChange={() => applyPreset(preset)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex h-full flex-col rounded-lg border p-4 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-950/20 dark:peer-focus-visible:ring-white/25",
                    active
                      ? "border-zinc-900 bg-zinc-100 dark:border-white/60 dark:bg-white/10"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/[0.04]",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {preset.name}
                    </span>
                    <RadioDot checked={active} />
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {preset.description}
                  </span>
                  <span className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <span className="whitespace-nowrap font-jetBrainsMono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {preset.gpu
                        ? `${preset.gpu.units}× ${gpu?.name ?? "GPU"}`
                        : "CPU only"}
                    </span>
                    {monthly !== null ? (
                      <span className="whitespace-nowrap font-jetBrainsMono text-sm tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatUsd(monthly, monthly >= 1000 ? 0 : 2)}
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          /mo
                        </span>
                      </span>
                    ) : presetEstimates.isLoading ||
                      (gpuUnavailable && gpuPrices.isLoading) ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Unavailable
                      </span>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Panel>

        <Panel className="p-6 md:p-8">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
            Describe the deployment
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Set the resources you need. The estimate updates as you go.
          </p>

          <FieldLabel className="mt-8">Add a GPU</FieldLabel>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <GpuOption
              selected={selectedGpu === null}
              onSelect={() => setGpuKey(null)}
              title="No GPU"
              details={["CPU only"]}
            />
            {gpuPrices.isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-[76px] rounded-lg" />
                ))
              : gpuOptions.map((option) => (
                  <GpuOption
                    key={option.key}
                    selected={option.key === selectedGpu?.key}
                    onSelect={() => setGpuKey(option.key)}
                    title={option.name}
                    details={[
                      option.ramLabel,
                      `from ${formatUsd(option.hourly ?? 0)}/hr`,
                    ]}
                  />
                ))}
          </div>
          {gpuPrices.isError && !gpuPrices.data && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Live GPU prices couldn&apos;t be loaded, so GPUs can&apos;t be
              added right now.
            </p>
          )}
          {selectedGpu && (
            <div className="mt-5 flex items-center justify-between gap-4">
              <Label
                htmlFor={gpuCountId}
                className="text-zinc-900 dark:text-zinc-50"
              >
                GPU count
              </Label>
              <NumberInput
                id={gpuCountId}
                value={gpuCount}
                onValueChange={setGpuCount}
                min={1}
                max={MAX_GPU_COUNT}
                className="w-24 text-right sm:w-28"
              />
            </div>
          )}

          <div className="my-8 h-px bg-zinc-200 dark:bg-white/10" />

          <div className="flex flex-col gap-7">
            {RESOURCES.map((resource) => (
              <ResourceControl
                key={resource.key}
                label={resource.label}
                unit={resource.unit}
                max={resource.max}
                value={usage[resource.key]}
                onValueChange={(value) =>
                  setUsage((current) => ({
                    ...current,
                    [resource.key]: value,
                  }))
                }
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <Panel className="p-6 md:p-8">
          {/* Label sits on the row's bottom edge, so its gap to the figure below matches the
              provider calculator's. */}
          <div className="flex items-end justify-between gap-4">
            <SectionLabel className="leading-none">Your estimate</SectionLabel>
            <SegmentedControl
              label="Billing period"
              value={period}
              onValueChange={setPeriod}
              options={[
                { value: "month", label: "Monthly" },
                { value: "hour", label: "Hourly" },
              ]}
            />
          </div>

          {estimates.isError && !estimates.data ? (
            <div className="mt-8 flex flex-col items-start gap-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Pricing estimates couldn&apos;t be loaded right now.
              </p>
              <button
                type="button"
                onClick={() => estimates.refetch()}
                className={buttonClass("outline", "sm")}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Same treatment as the provider calculator's earnings figure. */}
              <div
                className={cn(
                  "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 transition-opacity dark:border-emerald-400/20 dark:bg-emerald-400/10",
                  isUpdating && "opacity-60",
                )}
              >
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {period === "month" ? "Per month" : "Per hour"}
                </p>
                {isInitialLoad ? (
                  <Skeleton className="mt-2 h-14 w-56" />
                ) : (
                  <p
                    aria-live="polite"
                    aria-atomic="true"
                    className="mt-1 flex flex-wrap items-baseline gap-x-2"
                  >
                    <span className="text-5xl font-medium tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 md:text-6xl">
                      {format(akashMonthly)}
                    </span>
                    <span className="text-lg text-emerald-700 dark:text-emerald-300">
                      USD
                    </span>
                  </p>
                )}
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                  {specSummary}
                </p>
              </div>

              <dl
                className={cn(
                  "mt-4 flex flex-col gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm transition-opacity dark:border-white/10 dark:bg-black/30 md:px-5",
                  isUpdating && "opacity-60",
                )}
              >
                {lines.map((line) => (
                  <BreakdownLine
                    key={line.key}
                    label={line.label}
                    value={isInitialLoad ? null : format(line.monthly)}
                  />
                ))}
                {gpuLabel && (
                  <BreakdownLine
                    label={`GPU · ${gpuLabel}`}
                    value={format(gpuMonthly)}
                  />
                )}
              </dl>

              <section
                aria-labelledby="usage-compare"
                className="mt-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10"
              >
                <div className="px-4 py-4 md:px-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3
                      id="usage-compare"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      Same spec elsewhere
                    </h3>
                    {selectedGpu && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        CPU, memory &amp; storage only
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "mt-4 flex flex-col gap-3 transition-opacity",
                      isUpdating && "opacity-60",
                    )}
                  >
                    {isInitialLoad
                      ? Array.from({ length: 4 }, (_, index) => (
                          <Skeleton key={index} className="h-5 w-full" />
                        ))
                      : [
                          ...clouds,
                          {
                            name: "Akash",
                            monthly: computeMonthly,
                            highlight: true,
                          },
                        ].map((item) => (
                          <ComparisonBar
                            key={item.name}
                            name={item.name}
                            value={format(item.monthly)}
                            ratio={
                              item.monthly /
                              Math.max(
                                computeMonthly,
                                ...clouds.map((cloud) => cloud.monthly),
                                1e-9,
                              )
                            }
                            highlight={"highlight" in item}
                          />
                        ))}
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between gap-4 border-t px-4 py-3.5 md:px-5",
                    isSaving
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                      : "border-zinc-200 dark:border-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      isSaving
                        ? "font-medium text-emerald-700 dark:text-emerald-300"
                        : "text-zinc-600 dark:text-zinc-300",
                    )}
                  >
                    {savings !== null && savings < 0
                      ? "Difference vs. hyperscaler average"
                      : "Savings vs. hyperscaler average"}
                  </span>
                  {isInitialLoad ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    <span
                      className={cn(
                        "font-jetBrainsMono text-2xl font-medium tabular-nums",
                        isSaving
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-900 dark:text-zinc-50",
                      )}
                    >
                      {savings === null
                        ? "n/a"
                        : savings < 0
                          ? `+${Math.round(-savings * 100)}%`
                          : `${Math.round(savings * 100)}%`}
                    </span>
                  )}
                </div>
              </section>
            </>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a
              id="usage"
              href={CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "default", "w-full")}
            >
              Deploy Now
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
            <a
              href={CONTACT_URL}
              className={buttonClass("outline", "default", "w-full")}
            >
              Get in Touch
            </a>
          </div>
        </Panel>

        <p className="px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Estimates only. CPU, memory and storage prices for Akash, AWS, GCP and
          Azure come from the Akash Console pricing API; hyperscaler figures use
          AWS Fargate, Google Kubernetes Engine and Azure Container Instances
          list prices. GPU prices are derived from recent provider bids and
          aren&apos;t part of the hyperscaler comparison. Hourly figures assume
          about 730 hours per month. What you pay depends on the provider bid
          you accept.
        </p>
      </div>
    </div>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
        checked
          ? "border-zinc-900 dark:border-zinc-50"
          : "border-zinc-300 dark:border-white/30",
      )}
    >
      {checked && (
        <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-50" />
      )}
    </span>
  );
}

function ResourceControl({
  label,
  unit,
  max,
  value,
  onValueChange,
}: {
  label: string;
  unit: string;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId}>
          <span className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-50">
            {label}
          </span>
          <span className="ml-1.5 font-jetBrainsMono text-xs text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        </label>
        <NumberInput
          id={inputId}
          allowDecimal
          value={value}
          onValueChange={onValueChange}
          max={max}
          className="w-24 text-right sm:w-28"
        />
      </div>
      <RangeSlider
        value={value}
        onValueChange={onValueChange}
        max={max}
        label={`${label} (${unit})`}
      />
    </div>
  );
}

function GpuOption({
  selected,
  onSelect,
  title,
  details,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  details: string[];
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-[76px] flex-col items-start justify-center rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25",
        selected
          ? "border-zinc-900 bg-zinc-100 dark:border-white/60 dark:bg-white/10"
          : "border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/[0.04]",
      )}
    >
      <span className="whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </span>
      {details.map((detail) => (
        <span
          key={detail}
          className="mt-0.5 whitespace-nowrap font-jetBrainsMono text-[11px] text-zinc-500 dark:text-zinc-400"
        >
          {detail}
        </span>
      ))}
    </button>
  );
}

function BreakdownLine({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="font-jetBrainsMono tabular-nums text-zinc-900 dark:text-zinc-50">
        {value ?? <Skeleton className="h-4 w-16" />}
      </dd>
    </div>
  );
}

function ComparisonBar({
  name,
  value,
  ratio,
  highlight,
}: {
  name: string;
  value: string;
  ratio: number;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4">
      <span
        className={cn(
          "text-sm",
          highlight
            ? "font-medium text-zinc-900 dark:text-zinc-50"
            : "text-zinc-600 dark:text-zinc-400",
        )}
      >
        {name}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-300",
            highlight
              ? "bg-emerald-500 dark:bg-emerald-400"
              : "bg-zinc-300 dark:bg-zinc-600",
          )}
          style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
        />
      </span>
      <span
        className={cn(
          "min-w-[88px] text-right font-jetBrainsMono text-sm tabular-nums",
          highlight
            ? "font-medium text-emerald-600 dark:text-emerald-400"
            : "text-zinc-600 dark:text-zinc-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}
