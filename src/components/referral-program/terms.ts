/**
 * Akash Console referral program terms, from the November 2026
 * decision doc and the Console team's review. Every figure on
 * /community/referral-program reads from here. In Console, the bonus amounts, the cap
 * and the hold are config; the rate, the window and the link lifetime are
 * hardcoded and change only with a deploy.
 */
export const TERMS = {
  /** Share of each card payment a referred person makes. */
  rate: 0.05,
  /** Months of commission, counted from the referred person's sign-up. */
  windowMonths: 3,
  /** One-off bonus on a referred person's first payment. */
  bonus: 5,
  /** The bonus needs the FIRST payment to be at least this (only it counts)... */
  bonusMinPayment: 20,
  /** ...and this much used on deployments beyond the trial, within the window. */
  bonusMinUsed: 20,
  /** Bonuses an affiliate can earn per month. */
  bonusMaxPerMonth: 10,
  /** Trial credit for someone who signs up through a referral link. */
  referredTrial: 5,
  /** The standard trial credit. */
  standardTrial: 1,
  /** Each commission is held at least this long; the bonus and disputed payments can wait longer. */
  holdDays: 30,
  /** How long a referral link is remembered. */
  linkDays: 30,
  /** Net card payments (personal account + teams they created) for phase 2 self-serve. */
  phaseTwoSpend: 100,
} as const;

export const CONSOLE_URL = "https://console.akash.network";
export const DISCORD_URL = "https://discord.akash.network";

export const usd = (n: number, cents = false) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
