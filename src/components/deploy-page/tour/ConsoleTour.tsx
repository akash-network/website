import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  FastForward,
  MousePointerClick,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ESCROW_HOURS,
  hourly,
  money,
  monthly,
  simulateBids,
  useNetworkData,
  type NetworkSnapshot,
} from "./data";
import {
  MISSIONS,
  clockAt,
  missionById,
  pathAt,
  type Mission,
  type MissionId,
  type Step,
} from "./missions";
import { Scene, SceneOverlay } from "./scenes";
import { deploymentFacts } from "./scenes/deployment";
import type { SceneProps, TourContext } from "./ui";
import "./tour.css";

// The mock Console is laid out at a fixed design size and scaled to fit. On
// phones it is zoomed in instead, and a camera follows the action.
const DESIGN_W = 1120;
const DESIGN_H = 720;
const MOBILE_ZOOM = 0.56;
const RATIO = DESIGN_W / DESIGN_H;
// Sizing so the whole tour fits under the sticky site header: the coach sits
// beside the mock when that buys a bigger mock, else below it.
const SIDE_COACH_W = 340;
const SIDE_PAD = 20;
const CHAPTERS_H = 48;
const MIN_STAGE_W = 480;
const PHONE_COACH_RESERVE = 230;
const PHONE_STAGE_H: [number, number] = [260, 420];
const CURSOR_TRAVEL = 650;
const CLICK_MS = 180;
/** Pauses before and after a step's intro. */
const INTRO_LEAD = 250;
const INTRO_TAIL = 150;
// Each step stays up long enough to read: a base plus a share per word of its
// title and body, within bounds. Time spent on the intro counts toward it.
const READ_BASE = 2000;
const READ_PER_WORD = 200;
const READ_MIN = 4000;
const READ_MAX = 9000;
/** Least time a step holds after its intro, however long the intro was. */
const MIN_HOLD = 1200;
/** A step's bar never fills faster than this, so it reads as progress. */
const MIN_FILL = 700;
/** How long a finished mission waits before the next one plays on its own. */
const AUTO_NEXT_MS = 10_000;
const IDLE_HINT_MS = 4000;
const MODE_NOTE_MS = 3200;
const CAMERA_EASE = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
const CONSOLE_URL = "https://console.akash.network";
/** Share of the mock that must be on screen before the first mission plays. */
const ARM_VISIBLE = 0.85;

type Point = { x: number; y: number };
type Box = Point & { w: number; h: number };
type Mode = "do" | "watch";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const matches = (target: string, tt: string | undefined) =>
  !!tt &&
  (target.endsWith("*") ? tt.startsWith(target.slice(0, -1)) : tt === target);
const formatClock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;

/**
 * Timeouts that can all be paused and resumed together, so the tour can stop
 * mid-step and carry on where it was.
 */
class Timers {
  private live = new Map<
    number,
    { fn: () => void; left: number; at: number; id: number }
  >();
  private paused = false;
  private seq = 0;

  set(ms: number, fn: () => void) {
    const key = ++this.seq;
    const t = { fn, left: ms, at: 0, id: 0 };
    this.live.set(key, t);
    if (!this.paused) this.arm(key);
    return key;
  }

  clear(key: number) {
    const t = this.live.get(key);
    if (!t) return;
    clearTimeout(t.id);
    this.live.delete(key);
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    const now = performance.now();
    this.live.forEach((t) => {
      clearTimeout(t.id);
      t.left = Math.max(0, t.left - (now - t.at));
    });
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.live.forEach((_, key) => this.arm(key));
  }

  private arm(key: number) {
    const t = this.live.get(key);
    if (!t) return;
    t.at = performance.now();
    t.id = window.setTimeout(() => {
      this.live.delete(key);
      t.fn();
    }, t.left);
  }
}

/** How long a step's intro plays, and how long it then holds for reading. */
function stepTiming(step: Step, watch: boolean, reduced = false) {
  // With reduced motion the intro is skipped: the step shows its end state.
  const intro = reduced
    ? 0
    : (step.intro ?? []).reduce(
        (t, a) =>
          t +
          (a.wait ?? 400) +
          (watch && a.to ? CURSOR_TRAVEL + (a.click ? CLICK_MS : 0) : 0),
        INTRO_LEAD + INTRO_TAIL,
      );
  const words = `${step.title} ${step.body}`.split(/\s+/).length;
  const read = clamp(READ_BASE + words * READ_PER_WORD, READ_MIN, READ_MAX);
  return { intro, hold: Math.max(MIN_HOLD, read - intro) };
}

export function ConsoleTour({ snapshot }: { snapshot?: NetworkSnapshot }) {
  const data = useNetworkData(snapshot);
  const [missionId, setMissionId] = useState<MissionId>(MISSIONS[0].id);
  // The first mission waits until the visitor scrolls the mock into view.
  const [armed, setArmed] = useState(false);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [ctx, setCtx] = useState<TourContext>({ gpu: null, bid: null });
  const [mode, setMode] = useState<Mode>("watch");
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [idle, setIdle] = useState(false);
  const [ring, setRing] = useState<Box | null>(null);
  const [cursor, setCursor] = useState<
    Point & { visible: boolean; clicking: boolean }
  >({
    x: DESIGN_W * 0.6,
    y: DESIGN_H * 0.75,
    visible: false,
    clicking: false,
  });
  const [focus, setFocus] = useState<Point>({
    x: DESIGN_W / 2,
    y: DESIGN_H / 2,
  });
  const [clock, setClock] = useState(0);
  const [viewport, setViewport] = useState({
    w: DESIGN_W,
    h: DESIGN_H,
    mobile: false,
    measured: false,
  });
  const [settled, setSettled] = useState(false);
  // Bumped on every step change, so an intro restarts even when the index
  // doesn't change (replaying a mission from its first step).
  const [visit, setVisit] = useState(0);
  // Arrived by Back, so steps that normally move on by themselves wait.
  const [manual, setManual] = useState(false);
  // Auto-next: the visitor chose to stay, or has focus in the receipt.
  const [stayed, setStayed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  // Shown for a moment after the visitor switches between Watch and Try it.
  const [modeNote, setModeNote] = useState<{ mode: Mode; key: number } | null>(
    null,
  );
  const [nextIn, setNextIn] = useState(AUTO_NEXT_MS / 1000);
  const nextBudget = useRef(AUTO_NEXT_MS);

  const [fit, setFit] = useState<{
    side: boolean;
    width?: number;
    height?: number;
  }>({ side: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coachRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const reducedRef = useRef(false);
  const clockRef = useRef(0);
  const modeRef = useRef<Mode>("watch");
  const manualRef = useRef(false);
  const genRef = useRef(0);
  const pendingRef = useRef<number[]>([]);
  // The tour's step timers; Watch mode can pause them.
  const timersRef = useRef<Timers | null>(null);
  timersRef.current ??= new Timers();
  const sched = timersRef.current;
  const receiptRef = useRef<HTMLParagraphElement>(null);
  const coachDriven = useRef(false);
  reducedRef.current = reduced;
  modeRef.current = mode;
  manualRef.current = manual;

  const mission: Mission = missionById(missionId);
  const next = MISSIONS[(MISSIONS.indexOf(mission) + 1) % MISSIONS.length];
  // After the last mission, the tour waits instead of starting over.
  const startsOver = MISSIONS.indexOf(next) === 0;
  const autoNext = finished && !stayed && !startsOver;
  const nextPaused = holding || !inView;
  const sweep: React.CSSProperties = {
    animationDuration: `${AUTO_NEXT_MS}ms`,
    animationPlayState: nextPaused ? "paused" : "running",
  };
  const step = mission?.steps[index] ?? null;
  // Only Watch mode plays by itself, so only it can be paused.
  const paused = userPaused && mode === "watch" && armed && !finished;
  const zoom = viewport.mobile
    ? Math.max(MOBILE_ZOOM, viewport.w / DESIGN_W)
    : viewport.w / DESIGN_W;
  zoomRef.current = zoom;

  const camera = {
    x: clamp(viewport.w / 2 - focus.x * zoom, viewport.w - DESIGN_W * zoom, 0),
    y: clamp(viewport.h / 2 - focus.y * zoom, viewport.h - DESIGN_H * zoom, 0),
  };
  const cameraTransition = reduced || !settled ? undefined : CAMERA_EASE;

  const order = useMemo(() => mission?.steps.map((s) => s.id) ?? [], [mission]);
  const at = useCallback(
    (id: string, s = 0) => {
      const target = order.indexOf(id);
      if (target < 0) return false;
      return finished || index > target || (index === target && stage >= s);
    },
    [order, index, stage, finished],
  );

  /** Element tagged data-tt; a trailing `*` matches a prefix. */
  const find = useCallback((target: string) => {
    const selector = target.endsWith("*")
      ? `[data-tt^="${target.slice(0, -1)}"]`
      : `[data-tt="${target}"]`;
    return stageRef.current?.querySelector<HTMLElement>(selector) ?? null;
  }, []);

  /** An element's box in design coordinates. */
  const measure = useCallback((el: HTMLElement | null): Box | null => {
    const root = stageRef.current;
    if (!root || !el) return null;
    const r = el.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    const z = zoomRef.current;
    return {
      x: (r.left - o.left) / z,
      y: (r.top - o.top) / z,
      w: r.width / z,
      h: r.height / z,
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () =>
      setViewport({
        w: el.clientWidth,
        h: el.clientHeight,
        mobile: window.innerWidth < 768,
        measured: true,
      });
    update();
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSettled(true)),
    );
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [missionId]);

  // Size the mock so the whole tour fits in the window below the site header.
  const computeFit = useCallback(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const header = document.querySelector("header");
    const headerSpace = header
      ? header.getBoundingClientRect().height + 24
      : 24;
    const room = window.innerHeight - headerSpace - 12;
    const bar = barRef.current?.offsetHeight ?? 0;
    // Padding of the stage area below the coach layout (p-3 sm:p-6 lg:p-8).
    const pad =
      window.innerWidth >= 1024 ? 64 : window.innerWidth >= 640 ? 48 : 24;
    const coach = coachRef.current;

    if (window.innerWidth < 768) {
      const height = clamp(
        room - bar - CHAPTERS_H - pad - PHONE_COACH_RESERVE,
        ...PHONE_STAGE_H,
      );
      setFit({ side: false, height: Math.round(height) });
      return;
    }
    const inner = root.clientWidth;
    const coachBelow = coach && !coach.dataset.side ? coach.offsetHeight : 150;
    const below = Math.min(
      inner - pad,
      (room - bar - CHAPTERS_H - pad - coachBelow) * RATIO,
    );
    // Beside the mock, the coach also carries the chapters.
    const side =
      window.innerWidth >= 1024
        ? Math.min(
            inner - 2 * SIDE_PAD - SIDE_COACH_W,
            (room - bar - 2 * SIDE_PAD) * RATIO,
          )
        : 0;
    const useSide = side > below + 24;
    const width = Math.round(
      Math.max(MIN_STAGE_W, Math.min(useSide ? side : below, inner - pad)),
    );
    setFit({ side: useSide, width, height: Math.round(width / RATIO) });
  }, []);

  useEffect(() => {
    computeFit();
    let lastWidth = rootRef.current?.clientWidth ?? 0;
    const onResize = () => computeFit();
    const ro = new ResizeObserver(() => {
      // Only width changes; the coach's height changes per step and must not
      // resize the mock as you go.
      const width = rootRef.current?.clientWidth ?? 0;
      if (width !== lastWidth) {
        lastWidth = width;
        computeFit();
      }
    });
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [computeFit, missionId]);

  // Reduced motion, and deep links: /deploy?tour=<mission>
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const id = new URLSearchParams(window.location.search).get("tour");
    if (MISSIONS.some((m) => m.id === id)) {
      startMission(id as MissionId);
      setArmed(true);
      rootRef.current?.scrollIntoView({ block: "start" });
    }
    return () => mq.removeEventListener("change", onChange);
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start playing once most of the mock is on screen.
  useEffect(() => {
    const el = viewportRef.current;
    if (armed || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setArmed(true),
      { threshold: ARM_VISIBLE },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [armed]);

  // Auto-next only counts down while the mock is on screen and the tab is open.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let seen = false;
    const update = () =>
      setInView(seen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        seen = entry.isIntersecting;
        update();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const clearPending = useCallback(() => {
    pendingRef.current.forEach((k) => sched.clear(k));
    pendingRef.current = [];
  }, [sched]);

  useEffect(() => clearPending, [clearPending]);

  const goTo = useCallback(
    (i: number, byBack = false) => {
      clearPending();
      genRef.current += 1;
      setIndex(i);
      setStage(0);
      setReady(false);
      setRing(null);
      setIdle(false);
      setBusy(false);
      setFinished(false);
      setStayed(false);
      setHolding(false);
      setManual(byBack);
      setUserPaused(false);
      setVisit((v) => v + 1);
    },
    [clearPending],
  );

  /** Bring the whole tour into view if it isn't already. */
  const reveal = useCallback(() => {
    requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      const header =
        document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      if (r.top < header || r.bottom > window.innerHeight)
        root.scrollIntoView({
          behavior: reducedRef.current ? "auto" : "smooth",
          block: "start",
        });
    });
  }, []);

  const startMission = useCallback(
    (id: MissionId) => {
      setMissionId(id);
      setCtx({ gpu: null, bid: null });
      setCursor((c) => ({ ...c, visible: false }));
      setClock(0);
      clockRef.current = 0;
      setFocus({ x: DESIGN_W / 2, y: DESIGN_H / 2 });
      goTo(0);
      const url = new URL(window.location.href);
      url.searchParams.set("tour", id);
      // Keep Astro's router state on the entry, or Back stops working.
      window.history.replaceState(window.history.state, "", url);
    },
    [goTo],
  );

  const advance = useCallback(() => {
    if (!mission) return;
    if (index < mission.steps.length - 1) {
      goTo(index + 1);
      return;
    }
    setFinished(true);
    setReady(false);
    setRing(null);
    setCursor((c) => ({ ...c, visible: false }));
    setFocus({ x: DESIGN_W / 2, y: DESIGN_H / 2 });
  }, [mission, index, goTo]);

  /** The visitor did the step's action, or picked an option. */
  const perform = useCallback(
    (choice?: string | null) => {
      if (!step?.action) return;
      if (step.action.choice === "gpu") {
        setCtx({
          gpu: data.gpus.find((g) => g.id === choice) ?? data.gpus[0],
          bid: null,
        });
      } else if (step.action.choice === "bid") {
        const bids = simulateBids(ctx.gpu ?? data.gpus[0]);
        setCtx((c) => ({
          ...c,
          bid: bids.find((b) => b.id === choice) ?? bids[0],
        }));
      }
      advance();
    },
    [step, data.gpus, ctx.gpu, advance],
  );

  /** Play the action with the cursor, then perform it. */
  const showMe = useCallback(
    (choice?: string) => {
      if (!step?.action || busy) return;
      const el =
        (choice !== undefined &&
          stageRef.current?.querySelector<HTMLElement>(
            `[data-choice="${choice}"]`,
          )) ||
        find(step.action.target);
      const value = choice ?? el?.dataset.choice ?? null;
      const box = measure(el);
      if (reducedRef.current || !box) {
        perform(value);
        return;
      }
      setBusy(true);
      const point = {
        x: box.x + Math.min(box.w / 2, 60),
        y: box.y + box.h / 2,
      };
      setCursor((c) => ({ ...c, ...point, visible: true }));
      setFocus(point);
      // Dropped if the step changes first (another mission, Back).
      const gen = genRef.current;
      const later = (ms: number, fn: () => void) =>
        pendingRef.current.push(
          sched.set(ms, () => genRef.current === gen && fn()),
        );
      later(CURSOR_TRAVEL, () => {
        setCursor((c) => ({ ...c, clicking: true }));
        later(CLICK_MS, () => {
          setCursor((c) => ({ ...c, clicking: false }));
          setBusy(false);
          perform(value);
        });
      });
    },
    [step, busy, find, measure, perform],
  );

  // Play the step's intro, then wait for the visitor (or continue on our own).
  useEffect(() => {
    if (!step || finished || !armed) return;
    const intro = step.intro ?? [];
    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) =>
      timers.push(sched.set(ms, () => !cancelled && fn()));
    // Steps without an action move on by themselves, unless the visitor came
    // back to them or prefers reduced motion; then they wait for Continue.
    const done = () =>
      step.action || manualRef.current || reducedRef.current
        ? setReady(true)
        : later(stepTiming(step, modeRef.current === "watch").hold, advance);
    const cleanup = () => {
      cancelled = true;
      timers.forEach((k) => sched.clear(k));
    };

    if (reducedRef.current) {
      setStage(intro.length);
      done();
      return cleanup;
    }

    let i = 0;
    const run = () => {
      if (i >= intro.length) {
        later(INTRO_TAIL, done);
        return;
      }
      const action = intro[i];
      const next = () => {
        i += 1;
        setStage(i);
        run();
      };
      later(action.wait ?? 400, () => {
        const box =
          action.to && modeRef.current === "watch"
            ? measure(find(action.to))
            : null;
        if (!box) return next();
        const point = {
          x: box.x + Math.min(box.w / 2, 60),
          y: box.y + box.h / 2,
        };
        setCursor((c) => ({ ...c, ...point, visible: true }));
        setFocus(point);
        later(CURSOR_TRAVEL, () => {
          if (!action.click) return next();
          setCursor((c) => ({ ...c, clicking: true }));
          later(CLICK_MS, () => {
            setCursor((c) => ({ ...c, clicking: false }));
            next();
          });
        });
      });
    };
    later(INTRO_LEAD, run);
    return cleanup;
    // The intro restarts only when the step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit, finished, reduced, armed]);

  // Hint ring around what to click; it gets louder after a pause.
  useEffect(() => {
    if (!ready || !step?.action) return;
    const action = step.action;
    const place = () => {
      const box = measure(find(action.ring ?? action.target));
      setRing(box);
      if (box) setFocus({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
    };
    place();
    const t1 = window.setTimeout(place, 350);
    const t2 = window.setTimeout(() => setIdle(true), IDLE_HINT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ready, step, viewport.w, measure, find]);

  // Watch mode does each action itself.
  useEffect(() => {
    if (mode !== "watch" || !ready || !step) return;
    const t = sched.set(stepTiming(step, true, reducedRef.current).hold, () =>
      step.action ? showMe() : advance(),
    );
    return () => sched.clear(t);
  }, [mode, ready, step, showMe, advance, sched]);

  // Pausing holds every step timer, the bar and the scan where they are.
  useEffect(() => {
    if (paused) sched.pause();
    else sched.resume();
  }, [paused, sched]);

  useEffect(() => {
    if (mode === "do") setCursor((c) => ({ ...c, visible: false }));
  }, [mode]);

  // Keyboard users keep their place: focus returns to the coach's first
  // control when the next step is ready, and to the receipt at the end.
  useEffect(() => {
    if (!coachDriven.current) return;
    if (finished) receiptRef.current?.focus({ preventScroll: true });
    else if (ready)
      coachRef.current
        ?.querySelector<HTMLElement>("[data-coach-action]")
        ?.focus({ preventScroll: true });
  }, [ready, finished]);

  // Deployment clock: eases toward the step's simulated time.
  useEffect(() => {
    const target = step ? clockAt(step, stage) : null;
    if (target === null) return;
    const from = clockRef.current;
    if (reduced || target <= from) {
      clockRef.current = target;
      setClock(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      const value = from + (target - from) * (1 - (1 - p) ** 3);
      clockRef.current = value;
      setClock(value);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step, stage, reduced]);

  // A finished mission hands over to the next one unless the visitor stays.
  useEffect(() => {
    if (!finished) return;
    nextBudget.current = AUTO_NEXT_MS;
    setNextIn(AUTO_NEXT_MS / 1000);
  }, [finished, missionId]);

  useEffect(() => {
    if (!autoNext || nextPaused) return;
    const start = performance.now();
    const budget = nextBudget.current;
    const tick = window.setInterval(() => {
      const rest = budget - (performance.now() - start);
      setNextIn(Math.max(1, Math.ceil(rest / 1000)));
    }, 200);
    const done = window.setTimeout(() => startMission(next.id), budget);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
      nextBudget.current = Math.max(0, budget - (performance.now() - start));
    };
  }, [autoNext, nextPaused, next.id, startMission]);

  const onStageClick = (e: React.MouseEvent) => {
    setIdle(false);
    coachDriven.current = false;
    if (!ready || busy || !step?.action) return;
    const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-tt]");
    if (hit && matches(step.action.target, hit.dataset.tt))
      perform(hit.dataset.choice ?? null);
  };

  /** Open any step of the mission. Choices are reset or filled in to match. */
  const jumpTo = (target: number, byBack: boolean) => {
    if (!mission || target < 0 || target >= mission.steps.length) return;
    const choiceAt = (kind: "gpu" | "bid") =>
      mission.steps.findIndex((s) => s.action?.choice === kind);
    const gpuAt = choiceAt("gpu");
    const bidAt = choiceAt("bid");
    setCtx((c) => {
      // Choices at or after the target are made again; ones skipped past
      // take the first option.
      const gpu =
        gpuAt < 0 ? c.gpu : target <= gpuAt ? null : (c.gpu ?? data.gpus[0]);
      const bid =
        bidAt < 0
          ? c.bid
          : target <= bidAt
            ? null
            : (c.bid ?? simulateBids(gpu ?? data.gpus[0])[0]);
      return { gpu, bid };
    });
    goTo(target, byBack);
  };

  const back = () => {
    coachDriven.current = true;
    coachRef.current?.focus({ preventScroll: true });
    if (!mission) return;
    jumpTo(finished ? mission.steps.length - 1 : index - 1, true);
  };

  /** Switch Watch / Try it, and replay the current step in the new mode. */
  const switchMode = (value: Mode) => {
    setArmed(true);
    if (value === mode) return;
    setMode(value);
    setModeNote({ mode: value, key: Date.now() });
    if (!finished) {
      setCursor((c) => ({ ...c, visible: false }));
      goTo(index, manual);
    }
  };

  useEffect(() => {
    if (!modeNote) return;
    const t = window.setTimeout(() => setModeNote(null), MODE_NOTE_MS);
    return () => clearTimeout(t);
  }, [modeNote]);

  /** A progress bar was clicked: play the mission from that step. */
  const seek = (target: number) => {
    if (!finished && target === index) return;
    setArmed(true);
    jumpTo(target, false);
  };

  /** A coach control was used: keep focus in the coach while the step changes. */
  const fromCoach = (fn: () => void) => () => {
    coachDriven.current = true;
    coachRef.current?.focus({ preventScroll: true });
    fn();
  };

  const props: SceneProps | null =
    mission && step
      ? { mission: mission.id, step, stage, reduced, ctx, data, at }
      : null;
  const clockShown =
    !!mission?.speed &&
    (finished || mission.steps.slice(0, index + 1).some((s) => s.clock));
  const ticking = !finished && !!step?.clock && stage < step.clock.length - 1;
  // The active step's bar fills over as long as the step will play. A step
  // that waits for the visitor fills over its intro, then holds full.
  const fillMs = useMemo(() => {
    if (!step) return 0;
    const watch = mode === "watch";
    const t = stepTiming(step, watch, reduced);
    // Watch mode plays every step through. Trying it, a step with an action
    // waits for the click; one without waits for Continue after Back or with
    // reduced motion.
    const waits = !watch && (!!step.action || manual || reduced);
    return waits
      ? Math.max(t.intro, MIN_FILL)
      : t.intro +
          t.hold +
          (step.action && !reduced ? CURSOR_TRAVEL + CLICK_MS : 0);
  }, [step, mode, manual, reduced]);
  const bids = useMemo(
    () => simulateBids(ctx.gpu ?? data.gpus[0]),
    [ctx.gpu, data.gpus],
  );
  const counter = mission
    ? `${String(index + 1).padStart(2, "0")} / ${String(mission.steps.length).padStart(2, "0")}`
    : "";

  const choices =
    step?.action?.choice === "gpu"
      ? data.gpus.map((g) => ({
          id: g.id,
          name: g.name,
          meta: `$${g.min.toFixed(2)}–$${g.max.toFixed(2)}/hr`,
        }))
      : step?.action?.choice === "bid"
        ? bids.map((b) => ({
            id: b.id,
            name: b.name,
            meta: `${hourly(b.hr)} · ${b.region}`,
          }))
        : null;
  /** The coach is showing options to pick from, rather than one button. */
  const choosing = armed && !finished && ready && !!step?.action && !!choices;
  const primaryButton =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

  const coachAction = !armed ? (
    <button
      type="button"
      data-coach-action
      onClick={fromCoach(() => setArmed(true))}
      className={primaryButton}
    >
      <Play className="h-3.5 w-3.5" aria-hidden />
      Play
    </button>
  ) : finished ? (
    <>
      <button
        type="button"
        data-coach-action
        onClick={fromCoach(() => startMission(next.id))}
        // Moving on to another mission, not another step: outlined, so it
        // doesn't read as one more step.
        className="group relative inline-flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-md border border-foreground bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        <span className="relative">
          {startsOver ? "Start over" : "Next"}: {next.title}
        </span>
        <ArrowRight
          className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
        {autoNext && (
          <span
            aria-hidden
            className="tour-countdown absolute inset-x-0 bottom-0 h-0.5 bg-[#FF414C]"
            style={sweep}
          />
        )}
      </button>
      {autoNext && (
        <span
          // Above the button: first in the row, on a line of its own.
          className="order-first w-full text-xs text-muted-foreground"
        >
          {nextPaused ? "Paused" : `Starts in ${nextIn}s`} ·{" "}
          <button
            type="button"
            onClick={fromCoach(() => setStayed(true))}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Stay here
          </button>
        </span>
      )}
    </>
  ) : !step ? null : ready && !step.action ? (
    <button
      type="button"
      data-coach-action
      onClick={fromCoach(advance)}
      className={primaryButton}
    >
      Continue
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </button>
  ) : !ready ? (
    <span className="inline-flex h-9 items-center gap-2 px-2 text-sm text-muted-foreground">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          paused
            ? "bg-muted-foreground"
            : "bg-[#FF414C] motion-safe:animate-pulse",
        )}
      />
      {mode === "watch"
        ? paused
          ? "Paused"
          : "Playing…"
        : step.action
          ? "Watch this…"
          : "Almost there…"}
    </span>
  ) : choices ? (
    choices.map((o) => (
      <button
        key={o.id}
        type="button"
        data-coach-action
        onClick={fromCoach(() => showMe(o.id))}
        className={cn(
          "inline-flex shrink-0 rounded-md border px-3 text-left transition-colors hover:border-foreground",
          fit.side
            ? "w-full items-center justify-between py-2"
            : "h-10 flex-col items-start justify-center",
        )}
      >
        <span className="text-xs font-semibold leading-tight text-foreground">
          {o.name}
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground">
          {o.meta}
        </span>
      </button>
    ))
  ) : (
    <button
      type="button"
      data-coach-action
      onClick={fromCoach(() => showMe())}
      className={primaryButton}
    >
      {step.action?.label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </button>
  );

  // One bar per chapter; only the chapter being played splits into a bar
  // per step, and widens to make room for them.
  const chapterBars = mission?.chapters.map((chapter) => {
    const steps = mission.steps.filter((s) => s.chapter === chapter);
    const first = mission.steps.indexOf(steps[0]);
    const last = first + steps.length - 1;
    const active = !finished && step?.chapter === chapter;
    const done = finished || index > last;
    // The bar that just completed turns from red to black.
    const settled = (pos: number) =>
      pos === (finished ? index : index - 1) && "tour-settle";
    const bar = (
      pos: number,
      label: string,
      fill: React.ReactNode,
      current = false,
    ) => (
      <button
        key={pos}
        type="button"
        onClick={() => seek(pos)}
        aria-label={label}
        aria-current={current ? "step" : undefined}
        title={label}
        // A taller hit area than the 4px bar it draws.
        className="group -my-1.5 flex min-w-0 flex-1 cursor-pointer items-center py-1.5"
      >
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/10 transition-transform group-hover:scale-y-150">
          {fill}
        </span>
      </button>
    );
    return (
      <div
        key={chapter}
        // Sized from its label, so the label never crops; the active chapter
        // takes most of the room left over.
        className="transition-[flex-grow] duration-500 ease-out"
        style={{
          flexGrow: active ? Math.max(2, steps.length) : 1,
          flexBasis: "auto",
        }}
      >
        <div
          className={cn(
            "whitespace-nowrap font-jetBrainsMono text-[11px] uppercase tracking-wider",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {chapter}
        </div>
        <div className="mt-1.5 flex gap-1">
          {active
            ? steps.map((s, i) => {
                const pos = first + i;
                return bar(
                  pos,
                  `Step ${pos + 1}: ${s.title}`,
                  pos < index ? (
                    <span
                      key="done"
                      className={cn(
                        "absolute inset-0 bg-foreground",
                        settled(pos),
                      )}
                    />
                  ) : pos === index ? (
                    <span
                      key={`fill-${visit}-${armed}-${mode}`}
                      className="tour-fill absolute inset-0 bg-[#FF414C]"
                      style={{
                        animationDuration: `${fillMs}ms`,
                        animationPlayState:
                          armed && !paused ? "running" : "paused",
                      }}
                    />
                  ) : null,
                  pos === index,
                );
              })
            : bar(
                first,
                `${chapter}: ${steps.length} step${steps.length > 1 ? "s" : ""}, from step ${first + 1}`,
                done ? (
                  <span
                    key="done"
                    className={cn(
                      "absolute inset-0 bg-foreground",
                      settled(last),
                    )}
                  />
                ) : null,
              )}
        </div>
      </div>
    );
  });

  const backButton = (
    <button
      type="button"
      onClick={back}
      disabled={index === 0 && !finished}
      aria-label="Previous step"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    // `isolate` keeps the receipt's and overlays' z-indexes inside the tour,
    // so they never rise over the sticky site header.
    <div
      ref={rootRef}
      id="tour"
      className="isolate scroll-mt-24 overflow-hidden rounded-2xl border bg-background"
    >
      {/* Mission bar */}
      <div
        ref={barRef}
        className="flex items-center gap-2 border-b px-3 py-2.5 sm:gap-3 md:px-6 md:py-3"
      >
        <div
          role="group"
          aria-label="Missions"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] sm:gap-1.5 [&::-webkit-scrollbar]:hidden"
        >
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === missionId}
              onClick={() => {
                startMission(m.id);
                setArmed(true);
                reveal();
              }}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-full border px-2 py-1.5 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-sm",
                m.id === missionId
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {m.id === missionId && armed && !finished && (
                <span
                  aria-hidden
                  className="tour-scan pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent to-background/25"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                />
              )}
              <span className="relative lg:hidden">{m.short}</span>
              <span className="relative hidden lg:inline">{m.title}</span>
            </button>
          ))}
        </div>
        {clockShown && (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5"
            title="Time to live"
          >
            <span className="hidden font-jetBrainsMono text-[10.5px] uppercase tracking-wider text-muted-foreground xl:inline">
              Time to live
            </span>
            <span className="font-jetBrainsMono text-sm font-semibold tabular-nums text-foreground">
              {formatClock(clock)}
            </span>
            <span
              className={cn(
                "hidden items-center gap-0.5 font-jetBrainsMono text-[10.5px] text-muted-foreground transition-opacity sm:flex",
                ticking ? "opacity-100" : "opacity-40",
              )}
              title={`Fast-forwarded ${mission?.speed}×`}
            >
              <FastForward className="h-3 w-3" aria-hidden /> {mission?.speed}×
            </span>
          </div>
        )}
        <div
          className="flex shrink-0 rounded-full border p-0.5 text-xs font-medium"
          role="group"
          aria-label="Tour mode"
        >
          {(
            [
              ["watch", "Watch", Eye],
              ["do", "Try it", MousePointerClick],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              aria-label={label}
              onClick={() => switchMode(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors sm:px-3",
                mode === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapters (in the coach when it sits beside the mock) */}
      {mission && !fit.side && (
        <div
          ref={chaptersRef}
          className="flex gap-3 px-4 pt-3 md:px-8 md:pt-4"
          role="group"
          aria-label="Steps"
        >
          {chapterBars}
        </div>
      )}

      <div className={cn(props && fit.side && "flex")}>
        {/* Stage */}
        <div
          ref={canvasRef}
          className={cn(
            "relative min-w-0 flex-1 bg-[radial-gradient(hsl(var(--foreground)/0.1)_1px,transparent_1px)] [background-size:16px_16px]",
            props && fit.side ? "flex items-center p-5" : "p-3 sm:p-6 lg:p-8",
          )}
        >
          {props && (
            <div
              ref={viewportRef}
              className="relative mx-auto overflow-hidden rounded-lg bg-background shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10 max-md:h-[403px] md:aspect-[1120/720]"
              style={{ width: fit.width, height: fit.height }}
            >
              <div
                ref={stageRef}
                aria-hidden="true"
                onClick={onStageClick}
                className="tc absolute left-0 top-0 origin-top-left"
                style={{
                  width: DESIGN_W,
                  height: DESIGN_H,
                  transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})`,
                  opacity: viewport.measured ? 1 : 0,
                  transition: [cameraTransition, "opacity 300ms"]
                    .filter(Boolean)
                    .join(", "),
                }}
              >
                <BrowserFrame
                  path={pathAt(props.step, stage)}
                  external={props.step.screen === "app"}
                >
                  <Scene {...props} />
                </BrowserFrame>
                <SceneOverlay {...props} />

                {ring && ready && (
                  <div
                    className="pointer-events-none absolute z-40"
                    style={{
                      left: ring.x - 6,
                      top: ring.y - 6,
                      width: ring.w + 12,
                      height: ring.h + 12,
                    }}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-xl border-2 border-[#FF414C] shadow-[0_0_0_4px_rgba(255,65,76,0.15),0_0_24px_rgba(255,65,76,0.35)]",
                        !reduced && (idle ? "tour-hint-strong" : "tour-hint"),
                      )}
                    />
                    {idle && mode === "do" && (
                      <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#D7263D] px-3 py-1 text-[12px] font-semibold text-white shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1">
                        {step?.action?.choice ? "Pick one" : "Click here"}
                      </span>
                    )}
                  </div>
                )}

                {!reduced && (
                  <div
                    className="pointer-events-none absolute left-0 top-0 z-50"
                    style={{
                      transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                      opacity: cursor.visible && !finished ? 1 : 0,
                      transition: `transform ${CURSOR_TRAVEL}ms cubic-bezier(0.65, 0, 0.35, 1), opacity 300ms`,
                    }}
                  >
                    <span
                      className={cn(
                        "absolute -left-4 -top-4 h-8 w-8 rounded-full bg-white/50 transition-all duration-200",
                        cursor.clicking
                          ? "scale-100 opacity-100"
                          : "scale-50 opacity-0",
                      )}
                    />
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      className="-ml-0.5 -mt-0.5 drop-shadow-md"
                    >
                      <path
                        d="M5 3l14 8-6.2 1.6L10 19z"
                        fill="#fff"
                        stroke="#0a0a0a"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {modeNote && (
                <div
                  key={modeNote.key}
                  role="status"
                  // Above everything in the mock, which blurs behind it.
                  className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center bg-black/20 px-3 backdrop-blur-sm motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in-0"
                >
                  {/* Dark in both themes, like the receipt. */}
                  <div className="flex max-w-sm items-start gap-3 rounded-xl border border-ak-border-strong bg-ak-off-black px-4 py-3 shadow-2xl motion-safe:duration-300 motion-safe:animate-in motion-safe:zoom-in-95">
                    {modeNote.mode === "watch" ? (
                      <Eye
                        className="mt-0.5 h-4 w-4 shrink-0 text-white"
                        aria-hidden
                      />
                    ) : (
                      <MousePointerClick
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#FF414C]"
                        aria-hidden
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {modeNote.mode === "watch" ? "Watching" : "Your turn"}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug text-white/70">
                        {modeNote.mode === "watch"
                          ? "Sit back. The tour clicks through each step for you."
                          : "Click the spot outlined in red, or use the button in the panel."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {finished && (
                <Receipt
                  props={props}
                  next={next}
                  startsOver={startsOver}
                  countdown={
                    autoNext
                      ? { seconds: nextIn, paused: nextPaused, sweep }
                      : null
                  }
                  onStay={() => setStayed(true)}
                  onHold={setHolding}
                  headingRef={receiptRef}
                  onMission={startMission}
                />
              )}
            </div>
          )}
        </div>

        {/* Coach: beside the stage on wide, short screens; below it otherwise */}
        {mission && step && (
          <div
            ref={coachRef}
            tabIndex={-1}
            data-side={fit.side ? "" : undefined}
            className={cn(
              "flex outline-none",
              fit.side
                ? "shrink-0 flex-col border-l"
                : "flex-col gap-4 border-t px-4 py-4 md:flex-row md:items-center md:gap-8 md:px-8 md:py-5",
            )}
            style={
              fit.side
                ? {
                    width: SIDE_COACH_W,
                    height: (fit.height ?? 0) + 2 * SIDE_PAD,
                  }
                : undefined
            }
          >
            {fit.side && (
              <div
                className="flex shrink-0 gap-2 px-6 pt-6"
                role="group"
                aria-label="Steps"
              >
                {chapterBars}
              </div>
            )}
            <div
              className={cn(
                "min-w-0",
                fit.side
                  ? "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
                  : "flex-1",
              )}
            >
              <div>
                <div className="flex h-6 items-center gap-2 font-jetBrainsMono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {finished ? (
                    "Mission complete"
                  ) : (
                    <>
                      <span>
                        {counter}
                        {/* The chapter bars already name it on wider screens. */}
                        <span className="md:hidden"> · {step.chapter}</span>
                      </span>
                      {mode === "watch" && armed && (
                        <button
                          type="button"
                          onClick={() => setUserPaused((v) => !v)}
                          aria-label={
                            paused ? "Play the tour" : "Pause the tour"
                          }
                          aria-pressed={paused}
                          title={paused ? "Play" : "Pause"}
                          // Pinned to the right edge of the panel.
                          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-accent"
                        >
                          {paused ? (
                            <Play className="h-3 w-3" aria-hidden />
                          ) : (
                            <Pause className="h-3 w-3" aria-hidden />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 font-semibold leading-snug text-foreground",
                    fit.side ? "text-xl tracking-tight" : "text-lg",
                  )}
                >
                  {finished ? mission.title : step.title}
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-sm leading-relaxed text-muted-foreground",
                    !fit.side && "md:min-h-[2lh]",
                  )}
                >
                  {finished
                    ? "Everything you just did works the same way in Akash Console."
                    : step.action?.choice === "bid"
                      ? `${step.body} These bids are simulated within the ${data.live ? "live " : ""}${ctx.gpu?.name ?? "GPU"} price range.`
                      : step.body}
                </p>
              </div>
              {/* Options are part of the step; the footer keeps its place. */}
              {fit.side && choosing && (
                <div className="flex flex-col gap-2">{coachAction}</div>
              )}
            </div>
            {fit.side ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-t px-6 py-4 [&>button[data-coach-action]]:flex-1">
                {backButton}
                {!choosing && coachAction}
              </div>
            ) : (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {backButton}
                {coachAction}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {mission && step
          ? finished
            ? `${mission.title} complete.${autoNext ? ` ${next.title} starts in ${AUTO_NEXT_MS / 1000} seconds.` : ""}`
            : `Step ${index + 1} of ${mission.steps.length}: ${step.title}. ${step.body}`
          : ""}
      </p>
    </div>
  );
}

function Receipt({
  props,
  next,
  startsOver,
  countdown,
  onStay,
  onHold,
  headingRef,
  onMission,
}: {
  props: SceneProps;
  next: Mission;
  startsOver: boolean;
  /** Set while the next mission is counting down to start on its own. */
  countdown: {
    seconds: number;
    paused: boolean;
    sweep: React.CSSProperties;
  } | null;
  onStay: () => void;
  /** Keyboard focus inside the receipt holds the countdown. */
  onHold: (holding: boolean) => void;
  headingRef: React.RefObject<HTMLParagraphElement>;
  onMission: (id: MissionId) => void;
}) {
  const { mission, data } = props;
  const f = deploymentFacts(props);
  const rows: [string, string][] =
    mission === "web"
      ? [
          ["Template", "Hello world · Next.js"],
          ["Provider", `${f.provider} · picked for you`],
          ["Hardware", "0.5 vCPU · 512 MiB · 512 MiB"],
          ["Estimated cost", "~$0.25/month"],
          ["Time to live", "0:27 (simulated)"],
        ]
      : mission === "gpu" && f.bid
        ? [
            ["Image", "vllm/vllm-openai:v0.9.2"],
            ["GPU", `1× ${f.option.name} · ${f.option.ram}`],
            ["Provider", `${f.bid.name} · ${f.bid.region}`],
            ["Price", `${hourly(f.bid.hr)} · ${monthly(f.bid.hr)}`],
            [
              "Escrow held",
              `${money(f.bid.hr * ESCROW_HOURS)} (about ${ESCROW_HOURS} h)`,
            ],
            ["Time to ready", "2:11 (simulated)"],
          ]
        : [
            ["Organization", "Acme AI"],
            ["Members", "4, plus 1 invited"],
            ["Budget", "inference · $2,000/month"],
            ["Your billing", "Auto recharge on, by card"],
          ];
  const title =
    mission === "web"
      ? "Hello world is live"
      : mission === "gpu"
        ? "llama-chat is serving"
        : "Acme AI is set up";

  return (
    <div className="absolute inset-0 z-50 flex overflow-auto bg-black/55 p-3 backdrop-blur-sm motion-safe:duration-500 motion-safe:animate-in motion-safe:fade-in-0">
      <div
        className="m-auto w-full max-w-md rounded-xl bg-[#0a0a0a] p-5 text-white shadow-2xl ring-1 ring-white/10 sm:p-7"
        // Keyboard focus only: a mouse click elsewhere in the tour also
        // moves focus here, and shouldn't stop the countdown.
        onFocus={(e) => onHold(e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            onHold(false);
        }}
      >
        <p className="font-jetBrainsMono text-[10.5px] uppercase tracking-[0.15em] text-white/60">
          Receipt
        </p>
        <p
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-xl font-semibold tracking-tight text-white outline-none sm:text-2xl"
        >
          {title}
        </p>
        <dl className="mt-4 divide-y divide-dashed divide-white/15 border-y border-dashed border-white/15 font-jetBrainsMono text-[11.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 py-2">
              <dt className="w-28 shrink-0 text-white/55">{k}</dt>
              <dd className="min-w-0 text-white/90">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-white/55">
          Simulated in your browser.
          {mission === "gpu" &&
            (data.live
              ? " GPU availability and price ranges are live from the network; providers and bids are illustrative."
              : " GPU numbers are recent samples; providers and bids are illustrative.")}
        </p>
        <button
          type="button"
          onClick={() => onMission(next.id)}
          className="group relative mt-5 flex w-full items-center gap-3.5 overflow-hidden rounded-lg bg-white/[0.08] p-2 pr-3 text-left ring-1 ring-white/25 transition-colors hover:bg-white/[0.12] hover:ring-white/40 max-sm:pl-3"
        >
          {countdown && (
            <>
              <span
                aria-hidden
                className="tour-countdown absolute inset-0 bg-white/[0.07]"
                style={countdown.sweep}
              />
              <span
                aria-hidden
                className="tour-countdown absolute inset-x-0 bottom-0 h-0.5 bg-white"
                style={countdown.sweep}
              />
            </>
          )}
          <img
            src={next.image}
            alt=""
            className="relative h-14 w-24 shrink-0 rounded-md object-cover max-sm:hidden"
          />
          <span className="relative min-w-0 flex-1">
            <span className="block font-jetBrainsMono text-[10.5px] uppercase tracking-[0.15em] text-white/60">
              {startsOver ? "Start over" : "Up next"}
              {countdown &&
                (countdown.paused
                  ? " · paused"
                  : ` · in ${countdown.seconds}s`)}
            </span>
            <span className="mt-1 block truncate text-base font-semibold text-white">
              {next.title}
            </span>
          </span>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </button>
        {countdown && (
          <p className="mt-2 text-[11px] text-white/55">
            Starts automatically.{" "}
            <button
              type="button"
              onClick={onStay}
              className="font-medium text-white/85 underline underline-offset-2 transition-colors hover:text-white"
            >
              Stay here
            </button>
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <a
            href={CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Do it in Console
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => onMission(mission)}
            aria-label="Replay this mission"
            className="inline-flex h-9 items-center justify-center rounded-md px-3 text-white/70 ring-1 ring-white/15 transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function BrowserFrame({
  path,
  external,
  children,
}: {
  path: string;
  external: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-tc-bg font-sans text-tc-fg antialiased">
      <div className="flex h-11 shrink-0 items-center gap-4 border-b border-tc-fg/10 bg-tc-chrome px-4">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-7 w-[460px] items-center justify-center gap-1.5 rounded-md bg-tc-fg/[0.06] px-3 text-[12px] text-tc-fg/50">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="truncate">
            {external ? (
              <span className="text-tc-fg/80">{path}</span>
            ) : (
              <>
                <span className="text-tc-fg/80">console.akash.network</span>
                {path}
              </>
            )}
          </span>
        </div>
        <div className="w-[52px]" />
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
