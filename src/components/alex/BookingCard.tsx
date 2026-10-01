import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import * as z from "zod";

import { eyebrow, primaryButtonClass, tone } from "@/components/alex/styles";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      params?: Record<string, any>,
    ) => void;
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: {
          name?: string;
          email?: string;
          customAnswers?: Record<string, string>;
        };
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

const CALENDLY_WIDGET_SRC =
  "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_ORIGIN = "https://calendly.com";

// Calendly's `a1` fills the event's first custom question, which is where the
// organization and the source are saved on the booking. UTMs ride along as the
// booking's tracking fields, so the source survives even if the invitee edits a1.
const SOURCE_LABEL = "Big Technology Podcast (akash.network/alex)";
const UTM = {
  utmSource: "big-technology-podcast",
  utmMedium: "podcast",
  utmCampaign: "alex",
};
// Embed colours per site theme. Calendly applies them on paid plans only.
const EMBED_COLORS = {
  light: {
    background_color: "ffffff",
    text_color: "171717",
    primary_color: "171717",
  },
  dark: {
    background_color: "0a0a0a",
    text_color: "f2f2f2",
    primary_color: "fafafa",
  },
};
const ANALYTICS_PARAMS = {
  event_category: "Big Technology Podcast",
  campaign: "alex",
};

// Space left above a scroll target, below the site header when it is showing.
const SCROLL_GAP = 24;
const FOCUS_DELAY_MS = 450;

const formSchema = z.object({
  name: z.string().trim().min(1, "Add your name."),
  org: z.string().trim().min(1, "Add your company or lab."),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Use a valid work email."),
});

type Details = z.infer<typeof formSchema>;

const fields = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "Jane Park",
  },
  {
    name: "org",
    label: "Organization",
    type: "text",
    autoComplete: "organization",
    placeholder: "Company or lab",
  },
  {
    name: "email",
    label: "Work email",
    type: "email",
    autoComplete: "email",
    placeholder: "jane@company.com",
  },
] as const;

const inputClass = cn(
  "h-[46px] rounded-md px-3.5 py-0 text-[15px] leading-none transition-[border-color] duration-150 placeholder:text-neutral-400 focus-visible:border-neutral-500 focus-visible:ring-[3px] focus-visible:ring-black/[0.08] focus-visible:ring-offset-0 dark:placeholder:text-[#555] dark:focus-visible:border-neutral-400 dark:focus-visible:ring-white/[0.12]",
  tone.page,
  tone.fg,
  tone.lineStrong,
);
const textButtonClass = cn(
  "text-[13px] leading-[1.4] transition-colors duration-150 hover:text-neutral-900 dark:hover:text-ak-fg",
  tone.muted,
);

/** Tracks the site's light/dark switch (a `dark` class on <html>, flipped outside
 * React), like ProvidersGlobe does, so the Calendly iframe can be re-themed. */
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function trackEvent(eventName: string) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, ANALYTICS_PARAMS);
  }
}

let calendlyWidget: Promise<void> | null = null;

function loadCalendlyWidget() {
  if (window.Calendly) return Promise.resolve();
  if (!calendlyWidget) {
    calendlyWidget = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CALENDLY_WIDGET_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        calendlyWidget = null;
        reject(new Error("Calendly widget failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return calendlyWidget;
}

/** Height of the site's sticky header (#main-header, from header.astro). */
function siteHeaderHeight() {
  return document.getElementById("main-header")?.offsetHeight ?? 0;
}

// The site header slides away while the page scrolls down and returns when it
// scrolls up, so only an upward scroll has to clear it.
function scrollToElement(element: HTMLElement) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const scrollingUp = elementTop < window.scrollY;
  window.scrollTo({
    top: elementTop - SCROLL_GAP - (scrollingUp ? siteHeaderHeight() : 0),
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

function organizationAnswer(org: string) {
  return `Organization: ${org} · Source: ${SOURCE_LABEL}`;
}

function directBookingUrl(calendlyUrl: string, details: Details) {
  const params = new URLSearchParams({
    name: details.name,
    email: details.email,
    a1: organizationAnswer(details.org),
    utm_source: UTM.utmSource,
    utm_medium: UTM.utmMedium,
    utm_campaign: UTM.utmCampaign,
  });
  return `${calendlyUrl}?${params}`;
}

function logInvalid(errors: FieldErrors<Details>) {
  console.warn(
    "Consultation form failed validation:",
    Object.keys(errors).join(", "),
  );
}

interface BookingCardProps {
  /** Calendly event link, e.g. https://calendly.com/remington-akash/consultation */
  calendlyUrl: string;
}

/**
 * Two-step booking card for /alex: details form, then the Calendly inline embed
 * prefilled with them. Also owns the page's scroll-to-form buttons and the sticky
 * bottom CTA, which hides once the visitor reaches the calendar step.
 */
export function BookingCard({ calendlyUrl }: BookingCardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState<Details | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const isDark = useIsDarkMode();

  const cardRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const thanksHeadingRef = useRef<HTMLHeadingElement>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(step);
  const renderedStep = useRef(step);

  const form = useForm<Details>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", org: "", email: "" },
  });

  const scrollToForm = useCallback(() => {
    if (!cardRef.current) return;
    scrollToElement(cardRef.current);
    window.setTimeout(
      () => nameInputRef.current?.focus({ preventScroll: true }),
      FOCUS_DELAY_MS,
    );
  }, []);

  // Shown between the proof strip reaching the header and the final CTA entering
  // the viewport, and only while the visitor is still on the details step.
  const updateSticky = useCallback(() => {
    const proof = document.getElementById("more");
    const finalCta = document.getElementById("final-cta");
    const pastProof = proof
      ? proof.getBoundingClientRect().top <= siteHeaderHeight()
      : false;
    const atFinalCta = finalCta
      ? finalCta.getBoundingClientRect().top < window.innerHeight
      : false;
    setStickyVisible(pastProof && !atFinalCta && stepRef.current === 1);
  }, []);

  // The hero scroll cue and the final CTA are static markup; they opt in with
  // data-alex-scroll="more" or data-alex-scroll="book".
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-alex-scroll]")
          : null;
      if (!trigger) return;
      event.preventDefault();
      if (trigger.dataset.alexScroll === "book") {
        scrollToForm();
        return;
      }
      const proof = document.getElementById("more");
      if (proof) scrollToElement(proof);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollToForm]);

  useEffect(() => {
    window.addEventListener("scroll", updateSticky, { passive: true });
    window.addEventListener("resize", updateSticky);
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(updateSticky);
    });
    return () => {
      window.removeEventListener("scroll", updateSticky);
      window.removeEventListener("resize", updateSticky);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [updateSticky]);

  useEffect(() => {
    stepRef.current = step;
    updateSticky();
    if (renderedStep.current === step) return;
    renderedStep.current = step;
    if (step === 2) thanksHeadingRef.current?.focus();
    else nameInputRef.current?.focus();
  }, [step, updateSticky]);

  useEffect(() => {
    const container = calendlyRef.current;
    if (step !== 2 || !details || !container) return;

    let cancelled = false;
    loadCalendlyWidget()
      .then(() => {
        if (cancelled || !window.Calendly) return;
        container.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: `${calendlyUrl}?${new URLSearchParams({
            hide_gdpr_banner: "1",
            ...EMBED_COLORS[isDark ? "dark" : "light"],
          })}`,
          parentElement: container,
          prefill: {
            name: details.name,
            email: details.email,
            customAnswers: { a1: organizationAnswer(details.org) },
          },
          utm: UTM,
        });
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [step, details, calendlyUrl, isDark]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CALENDLY_ORIGIN) return;
      if (event.data?.event === "calendly.event_scheduled") {
        trackEvent("consultation_booked");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function onSubmit(values: Details) {
    // The lead reaches Calendly with the booking (name, email, a1 and UTMs). A CRM
    // (HubSpot) submission would go here once a form exists for this campaign.
    trackEvent("consultation_form_submit");
    setDetails(values);
    setStep(2);
  }

  const firstName = details?.name.split(/\s+/)[0] || "there";

  return (
    <>
      <div
        id="book"
        ref={cardRef}
        className={cn(
          "flex flex-col gap-[22px] rounded-xl border p-7",
          tone.surface,
          tone.line,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={eyebrow}>
            {step === 1
              ? "Step 1 of 2 · Your details"
              : "Step 2 of 2 · Pick a time"}
          </span>
          <div className="flex gap-1" aria-hidden="true">
            <span className="h-[3px] w-6 rounded-sm bg-neutral-900 dark:bg-ak-fg" />
            <span
              className={cn(
                "h-[3px] w-6 rounded-sm",
                step === 2
                  ? "bg-neutral-900 dark:bg-ak-fg"
                  : "bg-neutral-300 dark:bg-ak-border-strong",
              )}
            />
          </div>
        </div>

        {step === 2 && details ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                ref={thanksHeadingRef}
                tabIndex={-1}
                className={cn(
                  "alex-display text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] outline-none",
                  tone.fg,
                )}
              >
                Thanks, {firstName}. Pick a time with Remington.
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(textButtonClass, "font-medium leading-none")}
              >
                ← Edit details
              </button>
            </div>
            <div
              className={cn(
                "overflow-hidden rounded-lg border",
                tone.page,
                tone.line,
              )}
            >
              <div ref={calendlyRef} className="h-[640px] w-full" />
            </div>
            <a
              href={directBookingUrl(calendlyUrl, details)}
              target="_blank"
              rel="noopener"
              className={textButtonClass}
            >
              Calendar not loading? Open it in a new tab ↗
            </a>
          </div>
        ) : (
          <Form {...form}>
            {/* method="post" keeps name and email out of the URL if the form is
                submitted natively before the island hydrates. */}
            <form
              method="post"
              noValidate
              onSubmit={form.handleSubmit(onSubmit, logInvalid)}
              className="flex flex-col gap-[18px]"
            >
              <div className="flex flex-col gap-1.5">
                <h2
                  className={cn(
                    "alex-display text-2xl font-semibold leading-[1.2] tracking-[-0.02em]",
                    tone.fg,
                  )}
                >
                  Book your free consultation
                </h2>
                <p className={cn("text-sm leading-normal", tone.muted)}>
                  30 minutes with Remington. Pick a time on the next step.
                </p>
              </div>

              {fields.map((config) => (
                <FormField
                  key={config.name}
                  control={form.control}
                  name={config.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5 space-y-0">
                      <FormLabel
                        className={cn(
                          "text-xs font-medium leading-none",
                          tone.body,
                        )}
                      >
                        {config.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={config.type}
                          autoComplete={config.autoComplete}
                          placeholder={config.placeholder}
                          className={inputClass}
                          {...field}
                          ref={(element) => {
                            field.ref(element);
                            if (config.name === "name") {
                              nameInputRef.current = element;
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage
                        className={cn(
                          "text-xs font-medium leading-[1.4]",
                          tone.fg,
                        )}
                      />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                type="submit"
                className={primaryButtonClass(
                  "mt-1 h-[50px] w-full text-[15px] leading-none",
                )}
              >
                Pick a Time →
              </Button>
              <p
                className={cn("text-center text-xs leading-normal", tone.muted)}
              >
                Free · 30 minutes · Your details stay with Akash
              </p>
            </form>
          </Form>
        )}
      </div>

      <div
        aria-hidden={!stickyVisible}
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-6 transition-[opacity,transform] duration-300",
          stickyVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0",
        )}
      >
        <Button
          type="button"
          tabIndex={stickyVisible ? 0 : -1}
          onClick={scrollToForm}
          className={primaryButtonClass(
            cn(
              "h-[52px] w-full max-w-[360px] px-7 text-[15px] leading-none shadow-[0_4px_24px_rgba(0,0,0,0.16)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.5)]",
              stickyVisible ? "pointer-events-auto" : "pointer-events-none",
            ),
          )}
        >
          <span className="alex-shine alex-shine--on-primary">
            Book a Free Call
          </span>
        </Button>
      </div>
    </>
  );
}
