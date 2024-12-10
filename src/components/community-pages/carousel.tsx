import React, { useState, useEffect, useRef } from "react";
import "./carousel.css";

const images = [
  "/images/slides/slide1.webp",
  "/images/slides/slide2.webp",
  "/images/slides/slide3.webp",
  "/images/slides/slide4.webp",
  "/images/slides/slide5.webp",
  "/images/slides/slide6.webp",
  "/images/slides/slide7.webp",
  "/images/slides/slide8.webp",
];

const Carousel: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      const scrollWidth = carousel.scrollWidth;
      const animationDuration = scrollWidth / 200;

      carousel.style.setProperty("--scroll-width", `${scrollWidth}px`);
      carousel.style.setProperty(
        "--animation-duration",
        `${animationDuration}s`,
      );

      setIsLoaded(true);
    }
  }, []);

  return (
    <div
      className="carousel-container w-full overflow-hidden bg-background"
      aria-label="Image Carousel"
    >
      <div
        ref={carouselRef}
        className={`
          carousel-track
          flex
          ${isLoaded ? "animate-scroll" : ""}
        `}
      >
        {[...images, ...images].map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="carousel-item mx-3 flex-shrink-0 md:mx-5 lg:mx-[28px]"
          >
            <img
              src={src}
              alt={`Carousel image ${(index % images.length) + 1}`}
              width={260}
              height={380}
              className={`
                aspect-auto 
                max-h-[14rem] 
                w-auto
                md:h-full 
                md:max-h-[unset] 
                md:object-cover
                ${isLoaded ? "opacity-100" : "opacity-0"}
                transition-opacity 
                duration-300
              `}
              draggable={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
