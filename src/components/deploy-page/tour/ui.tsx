// Building blocks of the mock Akash Console used by the tour. They mirror
// Console's UI at a fixed design size, in the site's light or dark theme
// (tc-* colors, see tour.css); nothing here is interactive on its own.
import { useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsoleLogo } from "./ConsoleLogo";
import type { Bid, GpuOption, NetworkData } from "./data";
import type { MissionId, Step } from "./missions";

export type TourContext = { gpu: GpuOption | null; bid: Bid | null };

export type SceneProps = {
  mission: MissionId;
  step: Step;
  stage: number;
  reduced: boolean;
  ctx: TourContext;
  data: NetworkData;
  /** True once the mission has reached `stage` of step `id`, or a later step. */
  at: (id: string, stage?: number) => boolean;
};

export type TypeState = "empty" | "typing" | "full";

export const typeState = (
  props: SceneProps,
  id: string,
  start: number,
  end: number,
): TypeState =>
  props.at(id, end) || (props.reduced && props.at(id, start))
    ? "full"
    : props.at(id, start)
      ? "typing"
      : "empty";

export function Typed({
  text,
  state,
  speed = 42,
}: {
  text: string;
  state: TypeState;
  speed?: number;
}) {
  const [n, setN] = useState(state === "full" ? text.length : 0);

  useEffect(() => {
    if (state !== "typing") {
      setN(state === "full" ? text.length : 0);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [state, text, speed]);

  return (
    <>
      {text.slice(0, n)}
      {state === "typing" && <Caret />}
    </>
  );
}

export const Caret = () => (
  <span className="ml-px inline-block h-[1.1em] w-px translate-y-[0.2em] bg-current motion-safe:animate-pulse" />
);

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-3.5 w-3.5 motion-safe:animate-spin", className)}
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Toggle({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-300",
        on ? "bg-tc-primary" : "bg-tc-fg/15",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-tc-bg shadow transition-all duration-300",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </span>
  );
}

export function Avatar({ letter = "S" }: { letter?: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tc-fg/10 text-[12px] font-semibold">
      {letter}
    </span>
  );
}

export function OrgSwitcher({ org, open }: { org: string; open?: boolean }) {
  return (
    <span
      data-tt="org-switcher"
      className={cn(
        "flex h-8 items-center gap-2 rounded-[10px] border px-2 text-[12.5px] font-semibold transition-colors",
        open ? "border-tc-fg/30 bg-tc-fg/[0.06]" : "border-tc-fg/10",
      )}
    >
      <span
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded-md text-[9.5px] font-bold",
          org === "Personal" ? "bg-tc-fg/10" : "bg-[#FF414C] text-white",
        )}
      >
        {org === "Personal" ? "S" : org[0]}
      </span>
      {org === "Personal" ? "sam" : org}
      <ChevronsUpDown className="h-3.5 w-3.5 text-tc-fg/50" />
    </span>
  );
}

const NAV = [
  "Projects",
  "Deployments",
  "Providers",
  "Templates",
  "Settings",
] as const;

export function ConsoleNav({
  active,
  org = "Personal",
  orgOpen = false,
}: {
  active?: (typeof NAV)[number];
  org?: string;
  orgOpen?: boolean;
}) {
  return (
    <div className="relative z-20 flex h-14 shrink-0 items-center border-b border-tc-fg/10 bg-tc-bg px-6">
      <ConsoleLogo className="h-[17px] text-tc-fg" />
      <nav className="ml-7 flex items-center gap-1 text-[13px]">
        {NAV.map((item) => (
          <span
            key={item}
            data-tt={`nav-${item.toLowerCase()}`}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1.5",
              item === active ? "font-medium text-tc-fg" : "text-tc-fg/55",
            )}
          >
            {item}
            {item === "Settings" && <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2.5">
        <span className="flex h-8 items-center gap-2 rounded-[10px] border border-tc-fg/10 px-2.5 text-[11.5px] text-tc-fg/55">
          <Search className="h-3.5 w-3.5" /> ⌘K
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-tc-fg/10">
          <Bell className="h-3.5 w-3.5 text-tc-fg/70" />
        </span>
        <OrgSwitcher org={org} open={orgOpen} />
        <Avatar />
      </div>
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-tc-fg/10 bg-tc-card shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Mono, uppercase overline used across Console. */
export function Overline({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "font-jetBrainsMono text-[10.5px] font-medium uppercase tracking-[0.08em] text-tc-fg/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "Running" | "Starting" | "Spinning up" | "Updating";
}) {
  const running = status === "Running";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-500",
        running
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          running ? "bg-emerald-500" : "bg-amber-500 motion-safe:animate-pulse",
        )}
      />
      {status}
    </span>
  );
}

/** Console's toast: a light card with a green check, bottom right. */
export function Toast({
  show,
  title,
  body,
  action,
  actionTt,
}: {
  show: boolean;
  title: string;
  body?: string;
  action?: string;
  actionTt?: string;
}) {
  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 z-30 flex w-[340px] items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-500 dark:border-green-900/40 dark:bg-[hsl(150_100%_6%)]",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium">{title}</div>
        {body && (
          <div className="mt-0.5 text-[11.5px] leading-snug text-tc-fg/70">
            {body}
          </div>
        )}
        {action && (
          <span
            data-tt={actionTt}
            className="mt-2 inline-flex rounded-md border border-tc-fg/15 bg-tc-bg px-2.5 py-1 text-[11.5px] font-medium"
          >
            {action}
          </span>
        )}
      </div>
    </div>
  );
}
