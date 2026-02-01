import React from "react";
import "./Carousel.css";
import { CarouselItem } from "./CarouselItem";
import type { CarouselProps } from "./types";
import { useCarousel } from "./useCarousel";

export const Carousel: React.FC<CarouselProps> = ({
  images,
  speed = 50,
  gap = 20,
}) => {
  const { containerRef, trackRef, isLoaded } = useCarousel(speed);

  const displayImages = [...images, ...images, ...images];

  return (
    <div
      ref={containerRef}
      className="carousel-container w-full overflow-hidden bg-background"
      aria-label="Image Carousel"
    >
      <div
        ref={trackRef}
        className="carousel-track flex"
        style={{ gap: `${gap}px` }}
      >
        {displayImages.map((image, index) => (
          <CarouselItem
            key={`${image.src}-${index}`}
            src={image.src}
            alt={image.alt}
            isLoaded={isLoaded}
          />
        ))}
      </div>
    </div>
  );
};
