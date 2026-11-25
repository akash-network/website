import { useId, useState } from "react";
import { ArrowDown, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMS, usd } from "./terms";

/**
 * One referral, month by month. The visitor picks what the referred person
 * pays by card each month; the timeline shows the 5% commission inside the
 * three-month window, the first-payment bonus (or why it doesn't apply), the
 * hold (at least 30 days) that moves each commission into a later month, and the month
 * after the window, which earns nothing. An example, not a forecast.
 */

const AMOUNTS = [10, 20, 50, 100, 250, 500];
const DEFAULT_AMOUNT = 100;
const MONTHS = TERMS.windowMonths + 1;

export default function EarningsExample() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const name = useId();

  const bonusApplies = amount >= TERMS.bonusMinPayment;
  const commission = amount * TERMS.rate;
  const total =
    commission * TERMS.windowMonths + (bonusApplies ? TERMS.bonus : 0);

  const months = Array.from({ length: MONTHS }, (_, i) => {
    const n = i + 1;
    const inWindow = n <= TERMS.windowMonths;
    return {
      n,
      inWindow,
      commission: inWindow ? commission : 0,
      bonus: n === 1 && bonusApplies ? TERMS.bonus : 0,
    };
  });

  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="flex flex-col gap-5 border-b p-5 md:flex-row md:items-end md:justify-between md:p-8">
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            They pay by card each month
          </legend>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {AMOUNTS.map((a) => (
              <label key={a} className="relative">
                <input
                  type="radio"
                  name={name}
                  value={a}
                  checked={amount === a}
                  onChange={() => setAmount(a)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "inline-flex h-9 min-w-[64px] cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium tabular-nums transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                    amount === a
                      ? "border-foreground bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-accent",
                  )}
                >
                  {usd(a)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="md:text-right" aria-live="polite">
          <p className="text-sm text-para">This referral earns you</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-foreground md:text-5xl">
            {usd(total, true)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            in Console credit
          </p>
        </div>
      </div>

      <div className="p-5 md:p-8">
        {/* the window bracket, over the first three columns from lg up */}
        <div
          className="mb-3 hidden grid-cols-4 gap-4 lg:grid"
          aria-hidden="true"
        >
          <div className="col-span-3 flex items-center gap-3">
            <span className="h-2 w-px bg-foreground" />
            <span className="h-px flex-1 bg-foreground" />
            <span className="shrink-0 text-xs font-medium text-foreground">
              {TERMS.windowMonths} months after sign-up
            </span>
            <span className="h-px flex-1 bg-foreground" />
            <span className="h-2 w-px bg-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 border-t border-dashed border-muted-foreground/50" />
            <span className="shrink-0 text-xs text-muted-foreground">
              After
            </span>
            <span className="h-px flex-1 border-t border-dashed border-muted-foreground/50" />
          </div>
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {months.map((m) => (
            <li
              key={m.n}
              className={cn(
                "flex flex-col rounded-xl border p-4",
                m.inWindow ? "bg-card/50 dark:bg-background2" : "border-dashed",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Month {m.n} after sign-up
                </p>
                <p
                  className={cn(
                    "text-[11px] lg:hidden",
                    m.inWindow ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {m.inWindow ? "In the window" : "After it"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-stretch gap-2 sm:flex sm:flex-1 sm:flex-col sm:gap-0">
                <div className="rounded-lg border bg-background px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground">They pay</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {usd(amount, true)}
                  </p>
                </div>

                <span
                  className={cn(
                    "flex items-center justify-center sm:my-2",
                    m.inWindow ? "text-foreground" : "text-muted-foreground/50",
                  )}
                  aria-hidden="true"
                >
                  <ArrowRight className="h-4 w-4 sm:hidden" />
                  <ArrowDown className="hidden h-4 w-4 sm:block" />
                </span>

                <div
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2.5",
                    m.inWindow
                      ? "bg-foreground text-background"
                      : "border border-dashed text-muted-foreground",
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px]",
                      m.inWindow
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    You earn
                  </p>
                  {m.inWindow ? (
                    <>
                      <p className="text-lg font-semibold tabular-nums text-background">
                        +{usd(m.commission, true)}
                        <span className="ml-1.5 text-xs font-normal text-background/70">
                          {TERMS.rate * 100}%
                        </span>
                      </p>
                      {m.n === 1 && (
                        <p
                          className={cn(
                            "mt-0.5 text-xs tabular-nums",
                            bonusApplies
                              ? "text-background/80"
                              : "text-background/60",
                          )}
                        >
                          {bonusApplies ? (
                            <>+{usd(TERMS.bonus, true)} first-payment bonus</>
                          ) : (
                            <>
                              <s>{usd(TERMS.bonus)} bonus</s>: first payment
                              under {usd(TERMS.bonusMinPayment)}
                            </>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-semibold text-muted-foreground">
                      Nothing
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                {m.inWindow
                  ? `Credited in month ${m.n + 1} at the earliest`
                  : "They keep deploying. The window has closed."}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          An example, not a forecast. It assumes they pay from their first
          month; time spent on the trial counts toward the {TERMS.windowMonths}{" "}
          months. Each commission is held at least {TERMS.holdDays} days. The
          bonus needs a first payment of {usd(TERMS.bonusMinPayment)} or more,
          and is credited once they&apos;ve used {usd(TERMS.bonusMinUsed)} on
          deployments beyond their trial credit within the {TERMS.windowMonths}{" "}
          months, or it&apos;s canceled. Up to {TERMS.bonusMaxPerMonth} bonuses
          a month across all your referrals. Refunds and chargebacks cancel a
          commission or take it back.
        </p>
      </div>
    </div>
  );
}
