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

const FromAutoScroll = ({
  from,
  speed = 50,
  gap = 20,
}: {
  from: { logo: string; name: string }[];
  speed?: number;
  gap?: number;
}) => {
  const { containerRef, trackRef, isLoaded } = useAutoScroll(speed);

  const displayItems = [...from, ...from, ...from];

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden lg:hidden"
      aria-label="From Logos Carousel"
    >
      <div
        ref={trackRef}
        className="flex items-center"
        style={{ gap: `${gap}px` }}
      >
        {displayItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex  min-w-[150px] items-center justify-center"
          >
            <img
              src={item.logo}
              alt={item.name}
              className="max-h-full max-w-full object-contain"
              style={{ opacity: isLoaded ? 1 : 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FromAutoScroll;
