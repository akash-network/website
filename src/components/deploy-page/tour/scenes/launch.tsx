import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Cpu,
  HardDrive,
  LayoutGrid,
  List,
  MemoryStick,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BIDDERS } from "../data";
import { ProvidersGlobe } from "../globe";
import { HOST } from "../missions";
import {
  ConsoleNav,
  Overline,
  StatusBadge,
  Toast,
  type SceneProps,
} from "../ui";

// Console's deploy phases (hooks/useAutoDeploymentFlow/deployPhases).
const PHASES = [
  ["Creating deployment", "Deployment created"],
  ["Matching with providers", "Providers matched"],
  ["Preparing deployment", "Deployment prepared"],
];
const CHECKPOINTS = [100 / 3, 200 / 3, 100];
/** While a phase runs, Console's bar creeps 95% of the way to its checkpoint. */
const CREEP = 0.95;

// Console sizes the globe to min(220vh, 120vw) so only its top cap shows.
const GLOBE_SIZE = 1344;
const MATCHED = {
  id: "matched",
  label: BIDDERS[0].name,
  lat: BIDDERS[0].lat,
  lng: BIDDERS[0].lng,
};

/** Console's one-click deploy screen: three phases over a globe of providers. */
export function AutoDeployScene(props: SceneProps) {
  const { stage, reduced } = props;
  const done = Math.min(stage, 3);
  const points = useMemo(
    () => props.data.points.map(([lat, lng]) => ({ lat, lng })),
    [props.data.points],
  );
  // The bar fills from empty when the screen opens.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const from = done > 0 ? CHECKPOINTS[done - 1] : 0;
  const fill =
    done >= 3
      ? 100
      : started || reduced
        ? from + (CHECKPOINTS[done] - from) * CREEP
        : 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-tc-bg">
      <ConsoleNav active="Deployments" />
      <div className="relative mx-auto flex w-[632px] shrink-0 flex-col gap-6 px-5 pt-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase leading-4 text-tc-fg/60">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Deploying
          </div>
          <div className="text-[30px] font-bold leading-9 tracking-tight">
            Deploying Hello world
          </div>
          <div className="text-[14px] leading-5 text-tc-fg/60">
            We&apos;ll pick the best host for you. Typical deploys take 15–30
            seconds. When your deployment is ready, we&apos;ll automatically
            redirect you.
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-tc-fg/10 bg-tc-card p-4">
          {/* Room for the last checkpoint inside the card. */}
          <div className="pr-[11px]">
            <div className="relative h-2 w-full">
              <div className="absolute inset-0 overflow-hidden rounded-full bg-tc-muted">
                <div
                  className="h-full rounded-full bg-tc-primary"
                  style={{
                    width: `${fill}%`,
                    transition: reduced
                      ? undefined
                      : "width 1300ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              {CHECKPOINTS.map((at, i) => (
                <Checkpoint
                  key={at}
                  at={at}
                  status={
                    done > i ? "completed" : done === i ? "active" : "pending"
                  }
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3">
            {PHASES.map(([active, finished], i) => (
              <span
                key={active}
                className={cn(
                  "text-right text-[12px] font-medium leading-5 transition-colors duration-300",
                  done > i
                    ? "text-emerald-600 dark:text-emerald-400"
                    : done === i
                      ? "text-tc-fg"
                      : "text-tc-fg/50",
                )}
              >
                {done > i ? finished : active}
              </span>
            ))}
          </div>
        </div>
        {done < 2 && (
          <div className="flex items-center gap-3 rounded-xl border border-tc-fg/10 p-4">
            <div className="flex-1 text-[14px] leading-5 text-tc-fg/60">
              Want to choose the provider yourself?
            </div>
            <span className="inline-flex h-8 items-center gap-2 rounded-md border border-tc-fg/15 bg-tc-bg px-3 text-[12px] font-medium">
              Choose my provider
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none relative w-full flex-1 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-50px] -translate-x-1/2">
          <ProvidersGlobe
            size={GLOBE_SIZE}
            still={props.reduced}
            points={points}
            focus={done >= 2 ? MATCHED : null}
          />
        </div>
      </div>
    </div>
  );
}

/** A phase checkpoint on the bar: a tick once done, a pulsing dot while active. */
function Checkpoint({
  at,
  status,
  reduced,
}: {
  at: number;
  status: "pending" | "active" | "completed";
  reduced: boolean;
}) {
  return (
    <span
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at}%` }}
    >
      <span
        className={cn(
          "flex h-[22px] w-[22px] items-center justify-center rounded-full transition-colors duration-300",
          status === "completed"
            ? "border border-tc-primary-fg bg-tc-primary text-tc-primary-fg"
            : "border-2 border-tc-fg/15 bg-tc-bg",
        )}
      >
        {status === "completed" ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : (
          <span
            className={cn(
              "block h-2 w-2 rounded-full bg-tc-fg",
              status === "active" && !reduced && "animate-pulse",
            )}
          />
        )}
      </span>
    </span>
  );
}

/** Console's Deployments page, landing right after a one-click deploy. */
export function DeploymentsScene(props: SceneProps) {
  const running = props.at("web-ready", 1);

  return (
    <div className="relative flex h-full flex-col bg-tc-bg">
      <ConsoleNav active="Deployments" />
      <div className="flex items-center gap-3 border-b border-tc-fg/10 px-10 py-3">
        <div className="text-[20px] font-bold tracking-tight">Deployments</div>
        <span className="ml-auto flex h-8 w-[220px] items-center gap-2 rounded-md border border-tc-fg/15 px-2.5 text-[11.5px] text-tc-fg/40">
          <Search className="h-3.5 w-3.5" /> Search deployments
        </span>
        <span className="flex h-8 items-center rounded-md border border-tc-fg/15">
          <LayoutGrid className="mx-2 h-3.5 w-3.5 text-tc-fg/50" />
          <span className="flex h-full items-center rounded-r-md bg-tc-fg/[0.07] px-2">
            <List className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="flex h-8 items-center gap-1 rounded-md bg-tc-primary px-3 text-[12px] font-medium text-tc-primary-fg">
          New deployment <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_280px] gap-6 bg-[radial-gradient(circle,rgb(var(--tc-fg)/0.035)_2px,transparent_2px)] px-10 py-6 [background-size:26px_26px]">
        <div>
          <div className="flex items-center">
            <Overline>My deployments</Overline>
            <span className="ml-auto text-[11.5px] text-tc-fg/55">
              1 active
            </span>
          </div>
          <div className="mt-2 overflow-hidden rounded-[14px] border border-tc-fg/10 bg-tc-card shadow-sm">
            <div className="grid grid-cols-[110px_1fr_1.3fr_1fr_28px] border-b border-tc-fg/10 px-4 py-2.5 text-[11px] text-tc-fg/50">
              <span>Status</span>
              <span>Deployment</span>
              <span>Endpoint</span>
              <span>Hardware</span>
              <span />
            </div>
            <div className="grid grid-cols-[110px_1fr_1.3fr_1fr_28px] items-center px-4 py-3.5 text-[12px]">
              <span>
                <StatusBadge status={running ? "Running" : "Spinning up"} />
              </span>
              <span>
                <span className="block font-semibold">Hello world</span>
                <span className="mt-1 inline-block rounded-full border border-tc-fg/10 px-1.5 py-0.5 text-[10px] text-tc-fg/60">
                  default
                </span>
              </span>
              <span className="truncate font-jetBrainsMono text-[10.5px] text-tc-fg/70">
                {running ? (
                  <>
                    WEB&nbsp;&nbsp;{HOST.slice(0, 22)}… :80{" "}
                    <ArrowUpRight className="inline h-3 w-3" />
                  </>
                ) : (
                  "no endpoint yet · spinning up"
                )}
              </span>
              <span className="flex flex-col gap-0.5 text-[10.5px] text-tc-fg/60">
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> 0.5 ·{" "}
                  <MemoryStick className="h-3 w-3" /> 512 MiB
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> 512 MiB
                </span>
              </span>
              <MoreHorizontal className="h-4 w-4 text-tc-fg/50" />
            </div>
          </div>
        </div>
        <div>
          <Overline>Recent activity</Overline>
          <div className="mt-2 rounded-[14px] border border-tc-fg/10 bg-tc-card p-3 text-[11.5px] shadow-sm">
            {[
              running && ["Deployed “Hello world”", "just now"],
              ["Created “Hello world”", "just now"],
            ]
              .filter((x): x is string[] => Array.isArray(x))
              .map(([what, when]) => (
                <div key={what} className="tour-rise flex gap-2.5 py-1.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tc-fg/10 text-[9px] font-semibold">
                    S
                  </span>
                  <span>
                    <span className="block font-medium">{what}</span>
                    <span className="text-tc-fg/50">{when}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Toast
        show={running}
        title="Hello world is ready"
        body="Its services are up and running."
        action="View deployment"
        actionTt="toast-view"
      />
    </div>
  );
}

/** The deployed Hello world app, open in a new browser tab. */
export function HelloWorldApp() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white text-[#111] dark:bg-black dark:text-white">
      <div className="tour-rise text-center">
        <div className="font-jetBrainsMono text-[12px] text-neutral-500">
          Hello world · Next.js
        </div>
        <div className="mt-4 text-[64px] font-bold leading-none tracking-tighter">
          Hello, world.
        </div>
        <div className="mt-5 text-[14px] text-neutral-500">
          Served from a container on{" "}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            provider.northwind.example
          </span>
        </div>
      </div>
    </div>
  );
}
