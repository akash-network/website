import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared classes for the /alex campaign page (Big Technology Podcast).
//
// The page follows the site's light/dark switch. Light values come from the Akash DS
// light ladder, which is Tailwind's neutral scale; dark values are the DS dark
// palette (`ak-*` in tailwind.config.cjs). globals.css colours `.dark .border` and
// h2/h3 text at a higher specificity than a plain utility, so dark colours go
// through the `dark:` variant.
//
// Pass the font size before `leading-none`: tailwind-merge drops a line-height that
// comes before a font-size class.

export const tone = {
  fg: "text-neutral-900 dark:text-ak-fg",
  body: "text-neutral-600 dark:text-neutral-400",
  muted: "text-neutral-500 dark:text-ak-muted-strong",
  // neutral-500 is the lightest grey that meets AA (4.5:1) on white.
  faint: "text-neutral-500 dark:text-ak-muted",
  page: "bg-white dark:bg-ak-black",
  surface: "bg-neutral-50 dark:bg-ak-off-black",
  line: "border-neutral-200 dark:border-ak-border",
  lineStrong: "border-neutral-300 dark:border-ak-border-strong",
  divider: "border-neutral-200 dark:border-ak-subtle",
};

const focusRing =
  "focus-visible:ring-neutral-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ak-black";

/** Monochrome take on the shadcn Button: the design drops Akash red on this page. */
export function primaryButtonClass(className?: string) {
  return cn(
    buttonVariants(),
    "bg-neutral-900 text-neutral-50 duration-200 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-ak-black dark:hover:bg-neutral-200",
    focusRing,
    className,
  );
}

/** Outline shadcn Button. */
export function outlineButtonClass(className?: string) {
  return cn(
    buttonVariants({ variant: "outline" }),
    "gap-2 bg-transparent duration-200 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-ak-subtle dark:hover:text-ak-fg",
    tone.fg,
    tone.lineStrong,
    focusRing,
    className,
  );
}

/** Mono, uppercase section label. */
export const eyebrow = cn(
  "font-jetBrainsMono text-[11px] font-medium uppercase leading-none tracking-[0.1em]",
  tone.muted,
);
