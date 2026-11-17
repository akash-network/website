import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Download,
  HardDrive,
  Info,
  Layers,
  Lock,
  MapPin,
  MemoryStick,
  MessageSquare,
  Minus,
  LayoutPanelLeft,
  Pencil,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ESCROW_HOURS,
  hourly,
  money,
  monthly,
  simulateBids,
  type GpuOption,
} from "../data";
import { BidGlobe } from "../globe";
import {
  ConsoleNav,
  Overline,
  Spinner,
  Toggle,
  Typed,
  typeState,
  type SceneProps,
} from "../ui";

export const IMAGE = "vllm/vllm-openai:v0.9.2";
const SPEC = { cpu: 8, memory: 32, storage: 100 };
const BALANCE = 500;

function Field({
  tt,
  active,
  className,
  children,
}: {
  tt?: string;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-tt={tt}
      className={cn(
        "flex h-9 items-center rounded-md border bg-tc-bg px-3 text-[12.5px] transition-colors",
        active ? "border-tc-fg/60" : "border-tc-fg/15",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-tc-fg/10 bg-tc-card">
      <div className="flex h-11 items-center gap-2 px-3.5">
        <span className="text-tc-fg/50">{icon}</span>
        <span className="text-[13.5px] font-semibold">{title}</span>
        <Info className="h-3.5 w-3.5 text-tc-fg/40" />
        <div className="ml-auto flex items-center gap-2 text-[11.5px] text-tc-fg/55">
          {aside}
          {children ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
      {children && <div className="px-3.5 pb-3.5">{children}</div>}
    </div>
  );
}

function Uptime({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-2 font-jetBrainsMono text-[11.5px] tabular-nums text-emerald-600 dark:text-emerald-400">
      {value === 100 ? "100%" : `${value.toFixed(2)}%`}
      <span className="flex h-4 items-end gap-[2px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="h-4 w-[2px] rounded-full bg-emerald-500" />
        ))}
      </span>
    </span>
  );
}

/** Bid-window countdown, from 5:00 once bids arrive. */
function Countdown() {
  const [left, setLeft] = useState(300);
  useEffect(() => {
    const id = window.setInterval(
      () => setLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums">
      {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
    </span>
  );
}

export function ConfigureScene(props: SceneProps) {
  const { at, ctx, data, stage, step } = props;
  const gpu = ctx.gpu;
  const imageSet = at("gpu-model", 1);
  const gpuSet = at("gpu-choose");
  const picking = at("gpu-auction", 1);
  const auction = step.id === "gpu-auction";
  const collecting = auction && stage >= 1 && stage < 4;
  const firstBid = auction && stage === 4;
  const bidsIn = picking && !collecting && !firstBid;
  const reviewing = at("gpu-review", 1);
  const funding = at("gpu-review", 2);
  const selected = ctx.bid;
  const option: GpuOption = gpu ?? data.gpus[0];
  const bids = useMemo(() => simulateBids(option), [option]);
  const regions = new Set(bids.map((b) => b.region)).size;
  const eligible = gpuSet ? option.providers : data.eligible;
  const maxProviders = Math.max(
    data.eligible,
    ...data.gpus.map((g) => g.providers),
  );
  // The bidders, plus a few other providers the request reaches.
  const globeProviders = useMemo(
    () => [
      ...bids.map((b) => ({ id: b.id, lat: b.lat, lng: b.lng })),
      ...data.points
        .filter((_, i) => i % 4 === 0)
        .slice(0, 6)
        .map(([lat, lng], i) => ({ id: `p${i}`, lat, lng })),
    ],
    [bids, data.points],
  );
  const status = [
    "Posting your request to the network",
    regions > 1
      ? `Sent to ${bids.length} providers across ${regions} regions`
      : `Sent to ${bids.length} ${bids.length === 1 ? "provider" : "providers"} that can run dcloud`,
    "Providers are pricing your spec",
  ][Math.min(Math.max(stage - 1, 0), 2)];
  const escrow = Math.min(BALANCE, (selected?.hr ?? bids[0].hr) * ESCROW_HOURS);

  return (
    <div className="relative flex h-full flex-col bg-tc-bg">
      <ConsoleNav active="Deployments" />

      <div className="px-6 pt-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-tc-fg/10 px-2 py-1 text-[11px] text-tc-fg/60">
          Deploying to
          <span className="rounded bg-tc-fg/10 px-1 text-[9px] font-bold text-tc-fg">
            S
          </span>
          <b className="font-semibold text-tc-fg">sam</b> /
          <span className="rounded bg-tc-fg/10 px-1 text-[9px] font-bold text-tc-fg">
            D
          </span>
          <b className="font-semibold text-tc-fg">default</b>
          <span className="ml-1 rounded bg-tc-fg/[0.07] px-1.5 py-0.5 font-medium text-tc-fg">
            Change
          </span>
        </span>
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-tc-fg/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to deployment types
        </div>
        <div className="mt-2 flex items-end">
          <div>
            <div className="text-[26px] font-bold leading-tight tracking-tight">
              Configure your deployment
            </div>
            <div className="mt-1 text-[12.5px] text-tc-fg/55">
              In some instances, not all providers will submit a bid for your
              deployment.
            </div>
          </div>
          <div className="ml-auto flex items-center gap-5 whitespace-nowrap pb-1">
            <span className="flex items-center gap-4 text-[15px] font-medium tabular-nums">
              {gpuSet && (
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-tc-fg/50" /> 1× {option.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-tc-fg/50" /> {SPEC.cpu} vCPU
              </span>
              <span className="flex items-center gap-1.5">
                <MemoryStick className="h-4 w-4 text-tc-fg/50" /> {SPEC.memory}{" "}
                GiB
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-tc-fg/50" /> {SPEC.storage}{" "}
                GiB
              </span>
            </span>
            {picking && (
              <span
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-5 text-[12.5px] font-medium",
                  at("gpu-review")
                    ? "bg-tc-primary text-tc-primary-fg"
                    : "bg-tc-primary/40 text-tc-primary-fg",
                )}
              >
                {at("gpu-review") ? (
                  <>
                    <Rocket className="h-3.5 w-3.5" /> Deploy
                  </>
                ) : bidsIn ? (
                  "Select providers to deploy"
                ) : (
                  <>
                    <Spinner /> Requesting…
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="mt-4 grid min-h-0 flex-1 border-t border-tc-fg/15 transition-[grid-template-columns] duration-300 ease-out"
        style={{
          gridTemplateColumns: picking
            ? "96px minmax(0,1fr)"
            : "minmax(0,1fr) minmax(0,1fr)",
        }}
      >
        {picking ? (
          // Locked rail
          <aside className="flex flex-col items-center gap-3 border-r border-tc-fg/15 bg-tc-fg/[0.04] px-2.5 py-4 motion-safe:animate-in motion-safe:fade-in-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-tc-fg/10 bg-tc-bg shadow-sm">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <span className="font-jetBrainsMono text-[10px] font-semibold uppercase tracking-[0.15em] text-tc-fg/55">
              Locked
            </span>
            <span className="h-px w-7 bg-tc-fg/15" />
            <span className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-tc-fg bg-tc-bg py-2 text-[12px] font-semibold">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </span>
            <span className="text-center text-[10px] leading-snug text-tc-fg/55">
              unlocks · bids reset
            </span>
            <span className="mt-auto rotate-180 whitespace-nowrap font-jetBrainsMono text-[10px] tracking-wider text-tc-fg/55 [writing-mode:vertical-rl]">
              <b className="font-semibold uppercase">Deployment</b> · llama-chat
            </span>
          </aside>
        ) : (
          // Deployment editor
          <div className="flex min-h-0 flex-col border-r border-tc-fg/15">
            <div className="flex h-11 shrink-0 items-center border-b border-tc-fg/10 px-4">
              <span className="font-jetBrainsMono text-[11.5px] uppercase text-tc-fg/55">
                Deployment
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[11.5px] font-medium">
                <span className="flex h-7 items-center gap-1.5 rounded-md border border-tc-fg/15 px-2">
                  <Upload className="h-3.5 w-3.5" /> Import SDL
                </span>
                <Download className="mx-1 h-3.5 w-3.5 text-tc-fg/60" />
                <RotateCcw className="h-3.5 w-3.5 text-tc-fg/60" />
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <div
                className="px-8 pb-6 pt-4 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateY(${gpuSet ? -508 : imageSet ? -236 : 0}px)`,
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Overline>Name</Overline>
                    <Field className="mt-1.5">llama-chat</Field>
                  </div>
                  <div>
                    <Overline className="flex items-center gap-1">
                      Reclamation <Info className="h-3 w-3" />
                    </Overline>
                    <Field className="mt-1.5 justify-between">
                      Any <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                    </Field>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[12.5px]">
                  <span className="flex items-center gap-1.5 rounded-lg border border-tc-fg/15 bg-tc-bg px-2.5 py-1.5 font-medium shadow-sm">
                    <span className="h-3 w-3 rounded-full border border-dashed border-tc-fg/50" />{" "}
                    dcloud
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Plus className="h-3.5 w-3.5" /> Add placement
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Overline>Placement name</Overline>
                    <Field className="mt-1.5">dcloud</Field>
                  </div>
                  <div>
                    <Overline>Region</Overline>
                    <Field className="mt-1.5 justify-between text-[12px]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-tc-fg/50" /> Any
                        region
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                    </Field>
                  </div>
                </div>
                <div className="mt-2 text-[11.5px] text-tc-fg/55">
                  1 service in this placement
                </div>
                <div className="mt-3 rounded-2xl border border-tc-fg/10 bg-tc-fg/[0.03]">
                  <div className="flex h-11 items-center gap-2 border-b border-tc-fg/10 px-3.5 text-[12.5px] font-semibold">
                    <Box className="h-4 w-4 text-tc-fg/50" /> SERVICE-1{" "}
                    <Pencil className="h-3 w-3 text-tc-fg/40" />
                    <ChevronUp className="ml-auto h-4 w-4 text-tc-fg/50" />
                  </div>
                  <div className="flex flex-col gap-2.5 p-3.5">
                    <Overline>Image</Overline>
                    <Section icon={<Box className="h-4 w-4" />} title="Docker">
                      <div className="text-[12px] font-medium">
                        Docker image <span className="text-red-500">*</span>
                      </div>
                      <Field
                        tt="image"
                        className="mt-1.5 font-jetBrainsMono text-[11.5px]"
                      >
                        {at("gpu-model", 1) ? (
                          <Typed
                            text={IMAGE}
                            state={typeState(props, "gpu-model", 1, 2)}
                            speed={30}
                          />
                        ) : (
                          <span className="font-sans text-[12.5px] text-tc-fg/35">
                            e.g. ghcr.io/your-org/app:latest
                          </span>
                        )}
                      </Field>
                      <div className="mt-2.5 flex items-center gap-2 text-[11.5px]">
                        <span className="h-3.5 w-3.5 rounded-[3px] border border-tc-fg/40" />{" "}
                        Private registry
                      </div>
                    </Section>
                    <Overline className="mt-1">Hardware</Overline>
                    <Section
                      icon={<Layers className="h-4 w-4" />}
                      title="Presets"
                    >
                      <Field className="justify-between text-[12px]">
                        <span>
                          Custom{" "}
                          <span className="text-tc-fg/45">
                            · {SPEC.cpu} vCPU · {SPEC.memory} GiB
                          </span>
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                      </Field>
                    </Section>
                    <Section
                      icon={<Cpu className="h-4 w-4" />}
                      title="GPU"
                      aside={
                        <span
                          className={cn(gpuSet && "font-medium text-tc-fg")}
                        >
                          {gpuSet ? `1× ${option.name}` : "None"}
                        </span>
                      }
                    >
                      <div className="text-[11.5px] text-tc-fg/55">
                        Add accelerators for inference, training or rendering.
                      </div>
                      <div className="mt-2.5 grid grid-cols-[1fr_120px] gap-3">
                        <div>
                          <div className="text-[12px] font-medium">
                            GPU model
                          </div>
                          <Field
                            className={cn(
                              "mt-1.5 justify-between",
                              gpuSet && "border-tc-fg/40",
                            )}
                          >
                            {gpuSet ? (
                              `${option.name} · ${option.ram}`
                            ) : (
                              <span className="text-tc-fg/50">Select</span>
                            )}
                            <ChevronDown className="h-3.5 w-3.5 text-tc-fg/50" />
                          </Field>
                        </div>
                        <div>
                          <div className="text-[12px] font-medium">GPUs</div>
                          <span className="mt-1.5 flex h-9 items-center justify-between rounded-md border border-tc-fg/15 bg-tc-bg">
                            <Minus className="mx-2.5 h-3 w-3 text-tc-fg/50" />
                            <span className="tabular-nums">
                              {gpuSet ? 1 : 0}
                            </span>
                            <Plus className="mx-2.5 h-3 w-3 text-tc-fg/50" />
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center rounded-md border border-tc-fg/10 px-3 py-2">
                        <span>
                          <span className="block text-[12px] font-medium">
                            GPU interconnect
                          </span>
                          <span className="text-[10.5px] text-tc-fg/55">
                            High-bandwidth GPU-to-GPU fabric for multi-node
                            jobs.
                          </span>
                        </span>
                        <Toggle on={false} className="ml-auto" />
                      </div>
                    </Section>
                    <Section icon={<Cpu className="h-4 w-4" />} title="Compute">
                      <div className="grid grid-cols-3 gap-2 text-[12px]">
                        {[
                          ["vCPU", SPEC.cpu, ""],
                          ["Memory", SPEC.memory, "Gi"],
                          ["Storage", SPEC.storage, "Gi"],
                        ].map(([label, value, unit]) => (
                          <div key={label as string}>
                            <div className="font-medium">{label}</div>
                            <Field className="mt-1.5 justify-between tabular-nums">
                              {value}{" "}
                              <span className="text-[11px] text-tc-fg/45">
                                {unit}
                              </span>
                            </Field>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {picking ? (
          // Compute marketplace
          <div className="flex min-h-0 flex-col motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-8">
            <div className="flex h-[52px] shrink-0 items-center border-b border-tc-fg/15 px-4">
              <span className="font-jetBrainsMono text-[12px] font-medium uppercase text-tc-fg/55">
                Compute Marketplace
              </span>
              <span className="ml-auto flex h-8 w-[200px] items-center gap-2 rounded-md border border-tc-fg/15 px-2.5 text-[11.5px] text-tc-fg/40">
                <Search className="h-3.5 w-3.5" /> Search providers...
              </span>
            </div>
            <div className="flex items-center gap-3 border-b border-tc-fg/15 px-4 py-2.5 text-[12px]">
              <span className="font-jetBrainsMono text-[11px] uppercase text-tc-fg/55">
                Selecting provider for
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-0.5",
                  selected
                    ? "border-tc-fg/15"
                    : "border-tc-fg bg-tc-fg/[0.06] font-medium",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5 text-green-600" />}
                dcloud
                {selected && (
                  <span className="text-tc-fg/55">· {selected.name}</span>
                )}
              </span>
              <span className="ml-auto font-jetBrainsMono text-[11px] text-tc-fg/55">
                {selected ? 1 : 0}/1 assigned
              </span>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden p-4">
              {collecting || firstBid ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 pb-6">
                  <BidGlobe
                    providers={globeProviders}
                    bidderId={firstBid ? bids[0].id : null}
                    seed={option.id}
                    still={props.reduced}
                    className="block aspect-square w-[250px]"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                      {firstBid && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {firstBid ? "First bid received" : "Collecting bids"}
                    </div>
                    <div
                      key={firstBid ? "bid" : status}
                      className="min-h-5 text-[12.5px] text-tc-fg/55 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1"
                    >
                      {firstBid ? `From ${bids[0].name}` : status}
                    </div>
                    <div className="mt-2 h-[3px] w-[180px] overflow-hidden rounded-sm bg-tc-fg/10">
                      <div
                        className={cn(
                          "h-full transition-[width] duration-1000 ease-out",
                          firstBid ? "bg-green-500" : "bg-tc-fg",
                        )}
                        style={{
                          width: `${firstBid ? 100 : [0, 34, 62, 80][Math.min(stage, 3)]}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  data-tt="bid-table"
                  className="overflow-hidden rounded-lg border border-tc-fg/15 bg-tc-card shadow-sm motion-safe:animate-in motion-safe:fade-in-0"
                >
                  <div className="grid h-10 grid-cols-[1.6fr_1fr_1.1fr_1fr_1fr] items-center bg-tc-fg/[0.03] px-4 font-jetBrainsMono text-[11px] uppercase text-tc-fg/55">
                    <span>Provider</span>
                    <span>Region</span>
                    <span>Uptime (7D)</span>
                    <span>GPU</span>
                    <span>Cost</span>
                  </div>
                  {bids.map((b, i) => {
                    const isSelected = selected?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        data-tt={`bid-row-${i}`}
                        data-choice={b.id}
                        className={cn(
                          "tour-rise grid h-16 cursor-pointer grid-cols-[1.6fr_1fr_1.1fr_1fr_1fr] items-center border-t border-tc-fg/10 px-4 text-[12.5px] transition-colors hover:bg-tc-fg/[0.04]",
                          isSelected && "bg-tc-fg/[0.06]",
                        )}
                        style={{
                          animationDelay: props.reduced
                            ? undefined
                            : `${i * 120}ms`,
                        }}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                            {isSelected && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            {b.name}
                          </span>
                          <span className="block truncate text-[11px] text-tc-fg/45">
                            {b.host}
                          </span>
                        </span>
                        <span>{b.region}</span>
                        <Uptime value={b.uptime} />
                        <span className="truncate">NVIDIA {option.name}</span>
                        <span className="tabular-nums leading-tight">
                          <b>{hourly(b.hr)}</b>
                          <span className="block text-[11px] font-normal text-tc-fg/45">
                            {monthly(b.hr)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Live view of providers
          <div className="flex min-h-0 flex-col">
            <div className="flex h-11 shrink-0 items-center border-b border-tc-fg/10 px-4">
              <span className="font-jetBrainsMono text-[11.5px] uppercase text-tc-fg/55">
                Providers
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-tc-fg/55">
                {data.live && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                )}{" "}
                Live view
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-6 pt-3">
              <div className="rounded-xl border border-tc-fg/10 bg-tc-card px-4 py-3 shadow-sm">
                <div className="flex items-baseline gap-2">
                  <span
                    key={eligible}
                    className="text-[26px] font-semibold tabular-nums leading-none motion-safe:animate-in motion-safe:fade-in-0"
                  >
                    {eligible}
                  </span>
                  <span className="text-[12.5px] text-tc-fg/60">
                    providers can host your deployment
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-tc-fg/10">
                  <div
                    className="h-full rounded-full bg-tc-primary transition-[width] duration-700"
                    style={{
                      width: `${Math.min(100, (eligible / Math.max(1, data.online)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10.5px] text-tc-fg/55">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-tc-fg" />{" "}
                    eligible
                  </span>
                  <span>{data.online} providers on the network</span>
                </div>
              </div>
              <div
                data-tt="gpu-table"
                className="rounded-xl border border-tc-fg/10 bg-tc-card p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 px-1 text-[12.5px] font-semibold">
                  <Cpu className="h-4 w-4 text-tc-fg/50" /> GPU availability
                  <Info className="ml-auto h-3.5 w-3.5 text-tc-fg/40" />
                </div>
                <div className="mt-2 grid grid-cols-[1fr_1.1fr_64px_44px] px-2 font-jetBrainsMono text-[9.5px] uppercase text-tc-fg/50">
                  <span>If you switch model</span>
                  <span />
                  <span className="text-right">Providers</span>
                  <span className="text-right">GPUs</span>
                </div>
                {[
                  {
                    id: "none",
                    name: "No GPU",
                    providers: data.eligible,
                    gpus: 0,
                  },
                  ...data.gpus,
                ].map((g) => {
                  const isCurrent = g.id === (gpuSet ? option.id : "none");
                  return (
                    <div
                      key={g.id}
                      data-tt={g.id === "none" ? undefined : `gpu-row-${g.id}`}
                      data-choice={g.id}
                      className={cn(
                        "mt-0.5 grid cursor-pointer grid-cols-[1fr_1.1fr_64px_44px] items-center rounded-md px-2 py-[5px] text-[12px] transition-colors",
                        isCurrent
                          ? "bg-tc-fg/[0.07] font-medium"
                          : "hover:bg-tc-fg/[0.04]",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {g.name}
                        {isCurrent && (
                          <span className="rounded bg-tc-primary px-1 py-px text-[8.5px] font-semibold uppercase text-tc-primary-fg">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-tc-fg/10">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            isCurrent ? "bg-tc-fg" : "bg-tc-fg/30",
                          )}
                          style={{
                            width: `${(g.providers / maxProviders) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="text-right tabular-nums">
                        {g.providers}
                      </span>
                      <span className="text-right tabular-nums">
                        {g.gpus || "–"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 border-t border-tc-fg/10 bg-tc-bg px-6 pb-3 pt-2.5">
              <div className="text-[11.5px] text-tc-fg/55">
                {imageSet
                  ? "Ready when you are."
                  : "Add a container image and hardware to every service to deploy."}
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <span className="flex items-center gap-3 rounded-lg border border-tc-fg/15 px-3 py-2">
                  <MessageSquare className="h-4 w-4 text-tc-fg/60" />
                  <span>
                    <span className="block text-[12.5px] font-semibold">
                      Request compute
                    </span>
                    <span className="text-[10.5px] text-tc-fg/55">
                      Don&apos;t see what you need?
                    </span>
                  </span>
                </span>
                <span
                  data-tt="choose-provider"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-opacity",
                    "bg-tc-primary text-tc-primary-fg",
                    !gpuSet && "opacity-60",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tc-primary-fg/15">
                    <LayoutPanelLeft className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold">
                      Choose a provider
                    </span>
                    <span className="text-[10.5px] opacity-70">
                      Compare live bids yourself
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bid window toast */}
      <div
        className={cn(
          "absolute left-1/2 top-[70px] z-20 flex w-[420px] -translate-x-1/2 items-start gap-3 rounded-lg border border-tc-fg/15 bg-tc-card p-3.5 shadow-lg transition-all duration-300",
          picking && !reviewing
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        {bidsIn ? (
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
            <Check className="h-3 w-3" />
          </span>
        ) : (
          <Spinner className="mt-0.5 h-4 w-4 text-tc-fg/60" />
        )}
        <div className="min-w-0 flex-1 text-[12px]">
          <div className="font-semibold">
            {bidsIn ? "Bids collected" : "Collecting bids…"}
          </div>
          <div className="text-tc-fg/55">
            {bidsIn
              ? "Bids stay open for about 5 minutes, so pick your providers before they expire."
              : `Waiting on ${bids.length} ${bids.length === 1 ? "provider" : "providers"}.`}
          </div>
        </div>
        {bidsIn && (
          <span className="font-jetBrainsMono text-[12px] text-tc-fg/55">
            <Countdown />
          </span>
        )}
        <X className="h-4 w-4 text-tc-fg/40" />
      </div>

      {/* Review and deploy */}
      <div
        className={cn(
          "absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          reviewing ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "w-[640px] overflow-hidden rounded-xl border border-tc-fg/10 bg-tc-card shadow-2xl transition-all duration-300",
            reviewing
              ? "translate-y-0 scale-100"
              : "translate-y-2 scale-[0.98]",
          )}
        >
          <div className="border-b border-tc-fg/10 px-6 py-4">
            <div className="text-[17px] font-semibold">Review and deploy</div>
            <div className="mt-1 text-[12.5px] text-tc-fg/60">
              Review your provider selections for each placement before
              deploying.
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-tc-fg/20 text-[11px]">
                1
              </span>
              <div className="ml-4">
                <Overline>Placement</Overline>
                <div className="mt-0.5 text-[13px]">
                  dcloud · {selected?.region ?? bids[0].region}
                </div>
              </div>
              <span className="mx-auto text-tc-fg/50">→</span>
              <div>
                <Overline>Provider</Overline>
                <div className="mt-0.5 text-[13px]">
                  {selected?.name ?? bids[0].name}
                </div>
              </div>
              <div className="ml-auto text-right">
                <Overline>Price</Overline>
                <div className="mt-0.5 text-[13px] font-semibold tabular-nums">
                  {hourly(selected?.hr ?? bids[0].hr)}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center rounded-lg bg-tc-fg/[0.05] p-4">
              <div>
                <Overline>Total deployment cost</Overline>
                <div className="mt-0.5 text-[11px] text-tc-fg/50">
                  1 of 1 placement priced
                </div>
              </div>
              <div className="ml-auto text-[22px] font-bold tabular-nums tracking-tight">
                {hourly(selected?.hr ?? bids[0].hr)}
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-tc-fg/10">
              <div
                data-tt="funding"
                className="flex items-center gap-2 px-4 py-3 text-[12px]"
              >
                <span className="font-medium">Funding impact</span>
                <span className="text-tc-fg/55">
                  Escrow ~{money(escrow)} · available after{" "}
                  {money(BALANCE - escrow)}
                </span>
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 text-tc-fg/50 transition-transform duration-300",
                    funding && "rotate-180",
                  )}
                />
              </div>
              <div
                className="grid transition-[grid-template-rows] duration-500 ease-out"
                style={{ gridTemplateRows: funding ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className="flex h-2 overflow-hidden rounded-full">
                      <span
                        className="bg-tc-fg/30"
                        style={{ width: `${(escrow / BALANCE) * 100}%` }}
                      />
                      <span className="flex-1 bg-emerald-500" />
                    </div>
                    <div className="mt-2.5 text-[11.5px] leading-relaxed text-tc-fg/65">
                      The escrow is held, not charged. You pay for the time your
                      deployment actually runs, and anything it doesn&apos;t use
                      returns to available when the deployment closes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-tc-fg/10 bg-tc-fg/[0.04] px-6 py-4">
            <span className="px-3 text-[12.5px] font-medium">
              Back to marketplace
            </span>
            <span
              data-tt="confirm-deploy"
              className="flex h-9 items-center gap-2 rounded-md bg-tc-primary px-4 text-[12.5px] font-medium text-tc-primary-fg"
            >
              Confirm and deploy <Rocket className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
