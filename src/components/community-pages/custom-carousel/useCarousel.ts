import { useEffect, useRef, useState } from "react";

export const useCarousel = (speed = 50) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const images = Array.from(track.getElementsByTagName("img"));
    Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null);
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }),
      ),
    ).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth;
    const duration = totalWidth / speed;

    track.style.setProperty("--scroll-width", `${totalWidth}px`);
    track.style.setProperty("--animation-duration", `${duration}s`);
    track.classList.add("animate-scroll");

    return () => {
      track.classList.remove("animate-scroll");
    };
  }, [isLoaded, speed]);

  return {
    containerRef,
    trackRef,
    isLoaded,
  };
};
