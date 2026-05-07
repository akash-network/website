import React, { useEffect, useRef } from "react";

interface TrustedByItem {
  image?: string;
  svg?: string;
  title: string;
  height?: number | string;
}

const processSvg = (svgString: string) => {
  return svgString.replace(/height="100%"/g, "").replace(/width="100%"/g, "");
};

// Fixed speed: pixels moved per animation frame (~60fps)
// Matches original: speed(50) / 80 = 0.625px per frame
const PX_PER_FRAME = 0.4;

const TrustedByMarquee = ({
  trustedBySection,
}: {
  trustedBySection: TrustedByItem[];
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Triple items for seamless loop
  const displayItems = [...trustedBySection, ...trustedBySection, ...trustedBySection];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let position = 0;
    let rafId: number;

    const animate = () => {
      position -= PX_PER_FRAME;
      // Reset when one-third (one full set) has scrolled past
      const oneSetWidth = track.scrollWidth / 3;
      if (Math.abs(position) >= oneSetWidth) {
        position += oneSetWidth;
      }
      track.style.transform = `translateX(${position}px)`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [trustedBySection.length]);

  return (
    <div
      className="marquee-container w-full overflow-hidden"
      role="marquee"
      aria-label="Trusted By Logos Carousel"
    >
      <div ref={trackRef} className="marquee-track flex items-center gap-24" style={{ willChange: "transform" }}>
        {displayItems.map((item, index) => {
          const height = item.height
            ? typeof item.height === "number"
              ? `${item.height}px`
              : item.height
            : "34px";
          const isFirstSet = index < trustedBySection.length;
          return (
            <div
              key={`${item.title}-${index}`}
              className="flex shrink-0 items-center justify-center"
            >
              {item.svg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: processSvg(item.svg) }}
                  className="flex items-center justify-center [&>svg]:block [&>svg]:w-auto [&>svg]:h-[var(--logo-h)]"
                  style={{ height, "--logo-h": height } as React.CSSProperties}
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  width="120"
                  height="34"
                  loading={isFirstSet ? "eager" : "lazy"}
                  decoding="async"
                  className="w-auto object-contain dark:invert"
                  style={{ height }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustedByMarquee;
