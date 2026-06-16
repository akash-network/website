import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Card = {
  wide: boolean;
  title: string;
  description: string;
  image?: string;
};

const CARDS: Card[] = [
  {
    wide: true,
    title: "Docker Native",
    description:
      "No refactoring. If it runs in a container, it runs on Akash. Migrate your stack from legacy providers with zero changes to your application code.",
    image: "/images/infra/docker-native.webp",
  },
  {
    wide: false,
    title: "Train 3x Longer",
    description:
      "H100s for $1.33/hr vs AWS at $3.93/hr. Get nearly 3 hours of compute for the price of 1. Transparent pricing, no hidden fees.",
    image: "/images/infra/pricing.webp",
  },
  {
    wide: false,
    title: "1-Click Templates",
    description:
      "Launch pre-configured environments for Llama 3, DeepSeek, and Stable Diffusion in seconds. Move from configuration to active container in less than 60 seconds.",
    image: "/images/infra/templates.webp",
  },
  {
    wide: true,
    title: "Global Silicon Supply",
    description:
      "Access enterprise-grade H100s and A100s alongside high-performance consumer RTX 5090s. Scale from single-node inference to massive interconnected training clusters on demand.",
    image: "/images/infra/global-supply.webp",
  },
  {
    wide: false,
    title: "Ray Distributed Clusters",
    description:
      "Scale your machine learning workloads instantly. Provision multi-node Ray clusters to train and fine-tune large-scale models natively, eliminating complex manual cluster orchestration.",
    image: "/images/infra/ray.webp",
  },
  {
    wide: false,
    title: "Operational Autonomy",
    description:
      "Retain absolute control over your network routing and data residency. Moving away from closed, proprietary ecosystems protects your application stack from single-provider lock-in and vendor dependencies.",
    image: "/images/infra/autonomy.webp",
  },
];

const CONTAINER_PADDING = "max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))";
const WIDE_CONTAINER_PADDING = "max(1.5rem, calc((100vw - 2800px) / 2))";
const DESKTOP_SCROLL_MIN_WIDTH = 1024;
const WIDE_STATIC_MIN_WIDTH = 2850;

const SCROLL_TARGETS = [4, 5];

const getCenteredScrollLeft = (el: HTMLElement) =>
  Math.max(0, (el.scrollWidth - el.clientWidth) / 2);

export function InfraCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width:
      typeof window === "undefined"
        ? DESKTOP_SCROLL_MIN_WIDTH
        : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  }));
  const [isStickyScrollEnabled, setIsStickyScrollEnabled] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollStart = useRef(0);

  const isMobileView = viewport.width < DESKTOP_SCROLL_MIN_WIDTH;
  const isStaticWideView = viewport.width >= WIDE_STATIC_MIN_WIDTH;
  const headerPadding = CONTAINER_PADDING;
  const carouselPadding = isStaticWideView
    ? WIDE_CONTAINER_PADDING
    : CONTAINER_PADDING;

  useEffect(() => {
    const check = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync dot and atStart/atEnd state with actual scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const isAtStart = el.scrollLeft < 5;
      const isAtEnd = el.scrollLeft >= maxScroll - 5;
      setAtStart(isAtStart);
      setAtEnd(isAtEnd);
      if (isMobileView) {
        const children = Array.from(el.children) as HTMLElement[];
        const containerMid =
          el.getBoundingClientRect().left + el.offsetWidth / 2;
        let closest = 0;
        let minDist = Infinity;
        children.forEach((child, i) => {
          const dist = Math.abs(
            child.getBoundingClientRect().left +
              child.offsetWidth / 2 -
              containerMid,
          );
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setStep(closest);
      } else {
        if (isAtStart) setStep(0);
        else if (isAtEnd) setStep(SCROLL_TARGETS.length);
        else setStep(1);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobileView]);

  // ── Sticky scroll-driven carousel (desktop only) ─────────────────────────
  // The section is position:sticky (lg:sticky lg:top-4 in the Astro wrapper).
  // We set the outer div tall enough for the section to stay pinned for the full
  // carousel traversal, then map scroll progress through that extra height to scrollLeft.

  useEffect(() => {
    const outer = document.getElementById("infra-scroll-outer");
    const inner = document.getElementById("infra-scroll-inner");
    const el = scrollRef.current;
    if (!outer || !inner || !el) return;

    const updateScrollTrack = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrollSpace = Math.max(0, Math.round(maxScroll / 2));
      const trackHeight = inner.offsetHeight + scrollSpace;
      const shouldUseStickyScroll =
        !isMobileView &&
        !isStaticWideView &&
        maxScroll > 0 &&
        window.innerHeight < trackHeight;

      outer.style.height = shouldUseStickyScroll ? `${trackHeight}px` : "";
      setIsStickyScrollEnabled(shouldUseStickyScroll);

      if (!shouldUseStickyScroll) {
        el.scrollLeft = isStaticWideView ? getCenteredScrollLeft(el) : 0;
      }
    };

    updateScrollTrack();

    const resizeObserver = new ResizeObserver(updateScrollTrack);
    resizeObserver.observe(inner);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      outer.style.height = "";
    };
  }, [isMobileView, isStaticWideView, viewport.width, viewport.height]);

  useEffect(() => {
    if (!isStickyScrollEnabled) return;
    const outer = document.getElementById("infra-scroll-outer");
    const el = scrollRef.current;
    if (!outer || !el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const scrollSpace = Math.round(maxScroll / 2);
    const onPageScroll = () => {
      const outerTop = outer.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (16 - outerTop) / scrollSpace));
      el.scrollLeft = progress * maxScroll;
    };
    window.addEventListener("scroll", onPageScroll, { passive: true });
    onPageScroll();
    return () => window.removeEventListener("scroll", onPageScroll);
  }, [isStickyScrollEnabled]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isStaticWideView) return;
    e.preventDefault();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft =
      dragScrollStart.current - (e.clientX - dragStartX.current);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const scrollToCardLeft = (cardIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = (Array.from(el.children) as HTMLElement[])[cardIndex];
    if (!card) return;
    const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft);
    el.scrollTo({ left: card.offsetLeft - paddingLeft, behavior: "smooth" });
  };

  const goToCard = (i: number) => {
    setStep(i);
    if (i === 0) scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    else scrollToCardLeft(i);
  };

  return (
    <div className="w-full">
      {/* Header — contained */}
      <div
        className="mb-10"
        style={{
          paddingLeft: headerPadding,
          paddingRight: headerPadding,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2 className="text-[28px] font-semibold leading-tight text-foreground md:text-[40px]">
          Supercloud for AI
        </h2>
        <p className="mt-3 max-w-lg text-sm text-para">
          Stop overpaying for gated compute. Deploy on a global marketplace of
          high-density GPUs to maximize your engineering runway.
        </p>
      </div>

      {/* Carousel — full bleed, left-padded to container edge */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:gap-8 [&::-webkit-scrollbar]:hidden",
          isStaticWideView
            ? "cursor-default overflow-x-hidden"
            : "cursor-grab overflow-x-auto active:cursor-grabbing",
        )}
        style={{
          paddingLeft: carouselPadding,
          paddingRight: carouselPadding,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {CARDS.map((card) => (
          <div
            key={card.title}
            className={cn(
              "shrink-0",
              card.wide
                ? "w-[280px] sm:w-[420px] lg:w-[620px]"
                : "w-[220px] sm:w-[270px] lg:w-[350px]",
            )}
          >
            <div
              className={cn(
                "mb-4 w-full overflow-hidden rounded-xl border border-border bg-card",
                "h-[280px] sm:h-[340px] lg:h-[400px]",
              )}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  className="block h-full w-full object-cover object-center"
                />
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground sm:text-xl lg:text-2xl">
              {card.title}
            </h3>
            <p
              className={cn(
                "mt-3 text-xs leading-relaxed text-para lg:text-sm",
                card.wide && "max-w-sm",
              )}
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Dots — mobile only */}
      <div
        className="mt-8 flex justify-center lg:hidden"
        style={{
          paddingLeft: headerPadding,
          paddingRight: headerPadding,
        }}
      >
        <div className="flex items-center gap-2">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => goToCard(i)}
              aria-label={`Go to card ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step === i ? "w-6 bg-foreground" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
