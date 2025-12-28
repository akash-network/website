import React, { useEffect, useRef } from "react";

const useAutoScroll = (speed: number = 50) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;
    let animationFrameId: number;
    let position = 0;

    const animate = () => {
      position -= speed / 80;
      if (position <= -track.scrollWidth / 3) {
        position = 0;
      }
      track.style.transform = `translateX(${position}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    setIsLoaded(true);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return { containerRef, trackRef, isLoaded };
};

interface TrustedByItem {
  image?: string;
  title: string;
  svg?: string;
  height?: number | string;
}

const TrustedByMarquee = ({
  trustedBySection,
  speed = 50,
  gap = 0,
}: {
  trustedBySection: TrustedByItem[];
  speed?: number;
  gap?: number;
}) => {
  const { containerRef, trackRef, isLoaded } = useAutoScroll(speed);

  const displayItems = [
    ...trustedBySection,
    ...trustedBySection,
    ...trustedBySection,
  ];

  // Process SVG string to fix height attribute
  const processSvg = (svgString: string) => {
    return svgString.replace(/height="100%"/g, "").replace(/width="100%"/g, "");
  };

  useEffect(() => {
    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (trackRef.current) {
        const svgs = trackRef.current.querySelectorAll("svg");
        svgs.forEach((svg, index) => {
          const itemIndex = index % trustedBySection.length;
          const item = trustedBySection[itemIndex];
          const height = item.height
            ? typeof item.height === "number"
              ? `${item.height}px`
              : item.height
            : "34px";

          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.style.height = height;
          svg.style.width = "auto";
          svg.style.display = "block";
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [trustedBySection, isLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      aria-label="Trusted By Logos Carousel"
    >
      <div ref={trackRef} className="flex items-center gap-24">
        {displayItems.map((item, index) => {
          const height = item.height
            ? typeof item.height === "number"
              ? `${item.height}px`
              : item.height
            : "34px";
          return (
            <div
              key={`${item.title}-${index}`}
              className="flex shrink-0 items-center justify-center"
            >
              {item.svg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: processSvg(item.svg) }}
                  className="flex items-center justify-center [&>svg]:block [&>svg]:w-auto"
                  style={{ height }}
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-auto object-contain"
                  style={{ height, opacity: isLoaded ? 1 : 0 }}
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
