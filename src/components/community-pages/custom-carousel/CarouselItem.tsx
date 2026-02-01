import React from 'react';

interface CarouselItemProps {
  src: string;
  alt: string;
  isLoaded: boolean;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ src, alt, isLoaded }) => (
  <div className="carousel-item flex-shrink-0">
    <img
      src={src}
      alt={alt}
      width={260}
      height={380}
      className={`
        aspect-auto
        max-h-[14rem]
        w-auto
        md:h-full
        md:max-h-[unset]
        md:object-cover
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
        transition-opacity
        duration-300
      `}
      draggable={false}
      loading="lazy"
    />
  </div>
);