import "./carousel.css";
import { Carousel } from "./custom-carousel/Carousel";
const images = [
  { src: "/images/slides/slide1.webp", alt: "Slide 1" },
  { src: "/images/slides/slide2.webp", alt: "Slide 2" },
  { src: "/images/slides/slide3.webp", alt: "Slide 3" },
  { src: "/images/slides/slide4.webp", alt: "Slide 4" },
  { src: "/images/slides/slide5.webp", alt: "Slide 5" },
  { src: "/images/slides/slide6.webp", alt: "Slide 6" },
  { src: "/images/slides/slide7.webp", alt: "Slide 7" },
  { src: "/images/slides/slide8.webp", alt: "Slide 8" },
];

const InsiderCarousel = () => {
  return <Carousel images={images} speed={100} gap={0} />;
};

export default InsiderCarousel;
