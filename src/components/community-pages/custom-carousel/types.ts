export interface CarouselImage {
  src: string;
  alt: string;
}

export interface CarouselProps {
  images: CarouselImage[];
  speed?: number;
  gap?: number;
}
