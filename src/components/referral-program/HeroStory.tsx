import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Gift,
  MousePointer2,
  Pause,
  Play,
  Share2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMS, usd } from "./terms";

/**
 * Hero figure: a referral from the affiliate's side, in four steps, inside a
 * Console-style Referrals panel. Copy the link, share it, someone signs up
 * with a bigger trial, they pay by card and the commission clears its hold.
 * The totals at the top grow as each step lands, and every loop adds one
 * more referral (three, then it starts over), so the panel shows progress.
 *
 * One clock drives it: the elapsed time of the current step, advanced by
 * requestAnimationFrame only while playing. Scenes use CSS animations with
 * delays; pausing pauses those too. Hover, the pause button, and leaving the
 * viewport pause (a hidden tab stops requestAnimationFrame on its own). With reduced motion nothing plays:
 * each step shows its finished state and the step buttons move between them.
 */

const STEPS = [
  {
    label: "Copy",
    title: "Copy your link",
    body: "It's waiting on the Referrals page in Console.",
    ms: 4600,
  },
  {
    label: "Share",
    title: "Share it where you already post",
    body: "Add ?ref=yourcode to a guide, a README or a template link.",
    ms: 5200,
  },
  {
    label: "Sign-up",
    title: `They sign up with ${usd(TERMS.referredTrial)}`,
    body: `Your link gives them ${usd(TERMS.referredTrial)} of trial credit instead of ${usd(TERMS.standardTrial)}.`,
    ms: 5000,
  },
  {
    label: "Earn",
    title: "They pay by card, you earn",
    body: `${TERMS.rate * 100}% for ${TERMS.windowMonths} months after they sign up, plus a ${usd(TERMS.bonus)} first-payment bonus.`,
    ms: 7200,
  },
] as const;

const CODES = ["#4F2A", "#9C1D", "#B7E0"];
const PAYMENT = 100;
const PER_REFERRAL = PAYMENT * TERMS.rate + TERMS.bonus;

type Key = "signups" | "paying" | "hold" | "credited";
// [step, at ms into that step, stat, change]
const EVENTS: [number, number, Key, number][] = [
  [2, 2700, "signups", 1],
  [3, 400, "paying", 1],
  [3, 1500, "hold", PER_REFERRAL],
  [3, 4000, "hold", -PER_REFERRAL],
  [3, 4000, "credited", PER_REFERRAL],
];
const TWEEN = 550;
// Placeholder release date for the "On hold" hint.
const HOLD_DATE = "Dec 26";

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function statsAt(round: number, step: number, elapsed: number) {
  const s: Record<Key, number> = {
    signups: round,
    paying: round,
    hold: 0,
    credited: round * PER_REFERRAL,
  };
  const flash: Partial<Record<Key, boolean>> = {};
  for (const [st, at, key, v] of EVENTS) {
    if (step > st) s[key] += v;
    else if (step === st && elapsed >= at) {
      s[key] += v * ease((elapsed - at) / TWEEN);
      if (elapsed - at < 900) flash[key] = true;
    }
  }
  return { s, flash };
}

const d = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function Cursor({ delay }: { delay: number }) {
  return (
    <MousePointer2
      aria-hidden="true"
      className="ap-a ap-cursor pointer-events-none absolute left-1/2 top-1/2 z-10 h-5 w-5 fill-foreground text-background drop-shadow"
      style={d(delay)}
    />
  );
}

function Ref() {
  return (
    <span className="rounded-[3px] bg-foreground px-1 text-background">
      yourcode
    </span>
  );
}

/* ---------- scenes ---------- */

function CopyScene() {
  return (
    <div className="w-full max-w-[480px]">
      <p className="ap-a ap-in text-xs text-muted-foreground">
        Your referral link
      </p>
      <div
        className="ap-a ap-in mt-2 flex flex-wrap items-center gap-2 sm:flex-nowrap"
        style={d(120)}
      >
        <div className="flex h-9 min-w-0 flex-1 basis-full items-center overflow-hidden rounded-md border bg-background px-2.5 font-mono text-[11px] text-foreground min-[400px]:text-[12px] sm:basis-auto sm:px-3">
          <span className="truncate">
            console.akash.network/?ref=
            <Ref />
          </span>
        </div>
        <span
          className="ap-a ap-press relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground"
          style={d(1500)}
        >
          <Copy className="ap-a ap-out absolute h-3.5 w-3.5" style={d(1550)} />
          <Check className="ap-a ap-pop absolute h-4 w-4" style={d(1600)} />
          <Cursor delay={500} />
        </span>
        <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </span>
      </div>
      <p
        className="ap-a ap-in mt-2 text-[12px] text-muted-foreground"
        style={d(240)}
      >
        Works on any Console page.
      </p>
      <div className="mt-6 flex justify-center">
        <span
          className="ap-a ap-in inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm"
          style={d(1750)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Referral link copied
        </span>
      </div>
    </div>
  );
}

function ShareScene() {
  const places = ["README", "Video description", "Discord"];
  return (
    <div className="w-full max-w-[480px]">
      <div className="ap-a ap-in rounded-lg border bg-background p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            Y
          </span>
          <span className="text-[12px] font-medium text-foreground">
            yourhandle
          </span>
          <span className="text-[11px] text-muted-foreground">· Guide</span>
        </div>
        <p className="mt-2.5 text-[12px] leading-relaxed text-foreground">
          How I host my app on Akash, step by step. Deploy it with my template:
        </p>
        <div
          className="ap-a ap-in mt-2 truncate rounded-md border bg-card/60 px-2.5 py-1.5 font-mono text-[11px] text-foreground"
          style={d(700)}
        >
          console.akash.network/templates/…?ref=
          <Ref />
        </div>
      </div>
      <p
        className="ap-a ap-in mt-4 text-[11px] text-muted-foreground"
        style={d(1500)}
      >
        The same code works anywhere you share
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {places.map((p, i) => (
          <span
            key={p}
            className="ap-a ap-pop inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] text-foreground"
            style={d(1800 + i * 350)}
          >
            <Check className="h-3 w-3" />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function SignupScene({ code }: { code: string }) {
  return (
    <div className="w-full max-w-[340px]">
      <div className="ap-a ap-in rounded-lg border bg-background p-3.5 shadow-sm">
        <div className="flex items-start gap-2.5 rounded-md border bg-card/60 p-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-foreground">
            <Gift className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-medium text-foreground">
              You were referred to Akash Console
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Start with {usd(TERMS.referredTrial)} in trial credit.
            </span>
          </span>
        </div>
        <p className="mt-3 text-center text-[13px] font-semibold text-foreground">
          Start deploying
        </p>
        <span
          className="ap-a ap-press relative mt-2 flex h-8 items-center justify-center rounded-md bg-primary text-[12px] font-medium text-primary-foreground"
          style={d(1950)}
        >
          Continue with email
          <Cursor delay={900} />
        </span>
      </div>
      <div
        className="ap-a ap-pop mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border bg-background py-1.5 pl-1.5 pr-3 shadow-sm"
        style={d(2600)}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
          <UserPlus className="h-3 w-3" />
        </span>
        <span className="text-[12px] text-foreground">
          New sign-up <span className="font-mono">{code}</span>
        </span>
      </div>
    </div>
  );
}

function Pill({ at }: { at: number }) {
  return (
    <span className="relative inline-flex h-5 w-[70px] shrink-0 items-center justify-center">
      <span
        className="ap-a ap-out absolute inset-0 flex items-center justify-center rounded-full border text-[10px] font-medium text-muted-foreground"
        style={d(at)}
      >
        On hold
      </span>
      <span
        className="ap-a ap-pop absolute inset-0 flex items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background"
        style={d(at + 60)}
      >
        Credited
      </span>
    </span>
  );
}

function EarnScene({ code }: { code: string }) {
  const rows = [
    { what: "Affiliate commission", amount: PAYMENT * TERMS.rate, at: 1100 },
    { what: "First-payment bonus", amount: TERMS.bonus, at: 1500 },
  ];
  return (
    <div className="w-full max-w-[480px]">
      <div className="overflow-hidden rounded-lg border bg-background text-[12px] shadow-sm">
        <div
          className="ap-a ap-in flex items-center gap-3 border-b bg-card/60 px-3 py-2.5"
          style={d(200)}
        >
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            Card payment by <span className="font-mono">{code}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">
            {usd(PAYMENT, true)}
          </span>
        </div>
        {rows.map((r) => (
          <div
            key={r.what}
            className="ap-a ap-in flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
            style={d(r.at)}
          >
            <span className="min-w-0 flex-1 truncate text-foreground">
              {r.what}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              +{usd(r.amount, true)}
            </span>
            <Pill at={4000} />
          </div>
        ))}
        <div className="ap-a ap-in px-3 py-2.5" style={d(1900)}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {TERMS.holdDays}-day hold
            </span>
            <span className="text-muted-foreground">Day {TERMS.holdDays}</span>
          </div>
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-accent">
            <span
              className="ap-a ap-fill block h-full rounded-full bg-foreground"
              style={d(2100)}
            />
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <span
          className="ap-a ap-pop inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background"
          style={d(4400)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />+{usd(PER_REFERRAL, true)} in
          Console credit
        </span>
      </div>
    </div>
  );
}

/* ---------- the panel ---------- */

export default function HeroStory() {
  const clock = useRef({ round: 0, step: 0, elapsed: 0 });
  const [, render] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        clock.current.elapsed = STEPS[clock.current.step].ms;
        render((n) => n + 1);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.2,
    });
    if (root.current) io.observe(root.current);
    return () => {
      mq.removeEventListener("change", apply);
      io.disconnect();
    };
  }, []);

  const running = playing && !reduced && !hovered && inView;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    // rAF stops in a hidden tab; the cap keeps the clock from jumping on return.
    let last = -1;
    const tick = (now: number) => {
      const c = clock.current;
      if (last >= 0) c.elapsed += Math.min(Math.max(now - last, 0), 1000);
      last = now;
      if (c.elapsed >= STEPS[c.step].ms) {
        c.elapsed = 0;
        if (c.step === STEPS.length - 1) {
          c.step = 0;
          c.round = (c.round + 1) % CODES.length;
        } else c.step += 1;
      }
      render((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const { round, step, elapsed } = clock.current;
  const code = CODES[round];
  const { s, flash } = statsAt(round, step, elapsed);
  const active = STEPS[step];

  const goTo = (i: number) => {
    clock.current.step = i;
    clock.current.elapsed = reduced ? STEPS[i].ms : 0;
    render((n) => n + 1);
  };

  // Labels and hints as on the Referrals page in Console.
  const signups = Math.round(s.signups);
  const paying = Math.round(s.paying);
  const hold = Math.max(0, s.hold);
  const tiles: { key: Key; label: string; value: string; hint: string }[] = [
    { key: "signups", label: "Sign-ups", value: String(signups), hint: "" },
    {
      key: "paying",
      label: "Paying",
      value: String(paying),
      hint: `${signups ? Math.round((paying / signups) * 100) : 0}% of sign-ups`,
    },
    {
      key: "hold",
      label: "On hold",
      value: usd(hold, true),
      hint: hold > 0.005 ? `next ${usd(hold, true)} on ${HOLD_DATE}` : "",
    },
    {
      key: "credited",
      label: "Credited",
      value: usd(s.credited, true),
      hint: "in your personal balance",
    },
  ];

  return (
    <figure className="relative">
      <div
        ref={root}
        className={cn(
          "ap-hs overflow-hidden rounded-xl border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-none",
          !running && "ap-hs-paused",
        )}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <p className="sr-only">
          How a referral works, in four steps: copy your referral link in
          Console, share it, someone signs up with it and gets{" "}
          {usd(TERMS.referredTrial)} of trial credit, and when they pay by card
          you earn Console credit after a {TERMS.holdDays}-day hold.
        </p>

        <div
          className="flex h-11 items-center justify-between border-b px-4"
          aria-hidden="true"
        >
          <p className="flex items-center gap-1.5 text-[13px]">
            <span className="text-muted-foreground">Settings</span>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-medium text-foreground">Referrals</span>
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-foreground">
            <Gift className="h-3 w-3" />
            Affiliate
          </span>
        </div>

        <div
          className="grid grid-cols-4 gap-1.5 px-3 pt-3 sm:gap-2 sm:px-4 sm:pt-4"
          aria-hidden="true"
        >
          {tiles.map((t) => (
            <div
              key={t.key}
              className={cn(
                "rounded-lg border px-2 py-2 transition-[box-shadow,border-color] duration-300 sm:px-3 sm:py-2.5",
                flash[t.key] &&
                  "border-foreground shadow-[0_0_0_1px_hsl(var(--foreground))]",
              )}
            >
              <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                {t.label}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-semibold tabular-nums tracking-tight text-foreground sm:text-lg">
                {t.value}
              </p>
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {t.hint || "\u00a0"}
              </p>
            </div>
          ))}
        </div>

        <div
          className="ap-hs-stage relative flex h-[290px] items-center justify-center px-4 py-6 sm:h-[268px] sm:px-6"
          aria-hidden="true"
        >
          <div
            key={`${round}-${step}`}
            className="ap-a ap-in flex w-full justify-center"
          >
            {step === 0 && <CopyScene />}
            {step === 1 && <ShareScene />}
            {step === 2 && <SignupScene code={code} />}
            {step === 3 && <EarnScene code={code} />}
          </div>
        </div>

        <div className="border-t px-3 py-3 sm:px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="text-sm font-medium text-foreground">
                {active.title}
              </p>
              <p className="text-[12px] text-muted-foreground">{active.body}</p>
            </div>
            {!reduced && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={
                  playing ? "Pause the walkthrough" : "Play the walkthrough"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                {playing ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
          <ol className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
            {STEPS.map((st, i) => {
              const fill =
                i < step ? 1 : i === step ? Math.min(1, elapsed / st.ms) : 0;
              return (
                <li key={st.label}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === step ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${st.title}`}
                    className="group w-full rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="block h-1 overflow-hidden rounded-full bg-accent">
                      <span
                        className="block h-full rounded-full bg-foreground"
                        style={{ width: `${fill * 100}%` }}
                      />
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block truncate text-[11px] transition-colors",
                        i === step
                          ? "font-medium text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <span className="tabular-nums">{i + 1}</span> {st.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        How a referral plays out in Console. Numbers are placeholders.
      </figcaption>
    </figure>
  );
}
