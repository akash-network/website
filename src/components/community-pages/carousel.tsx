import { useState, useMemo } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const images = [
  "/images/slides/slide1.webp",
  "/images/slides/slide2.webp",
  "/images/slides/slide3.webp",
  "/images/slides/slide4.webp",
  "/images/slides/slide5.webp",
  "/images/slides/slide6.webp",
  "/images/slides/slide7.webp",
  "/images/slides/slide8.webp",
  "/images/slides/slide1.webp",
  "/images/slides/slide2.webp",
  "/images/slides/slide3.webp",
  "/images/slides/slide4.webp",
  "/images/slides/slide5.webp",
  "/images/slides/slide6.webp",
  "/images/slides/slide7.webp",
  "/images/slides/slide8.webp",
];

const Carousel = () => {
  const memoizedImages = useMemo(() => images, []);

  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="swiper-linear pointer-events-none relative w-full select-none overflow-hidden bg-background"
      aria-label="Image Carousel"
    >
      <Swiper
        modules={[Autoplay]}
        spaceBetween={5}
        slidesPerView="auto"
        loop={true}
        centeredSlides={true}
        speed={4000}
        freeMode={{
          enabled: true,
          momentum: false,
        }}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          reverseDirection: false,
        }}
        className="w-full"
        watchSlidesProgress={true}
        preventInteractionOnTransition={true}
        onInit={() => setIsLoaded(true)}
      >
        {memoizedImages.map((src, index) => (
          <SwiperSlide key={src} className="!w-auto">
            <div className="mx-3 md:mx-5 lg:mx-[28px]">
              <img
                src={src}
                alt={`Carousel image ${index + 1}`}
                height={380}
                width={260}
                loading="lazy"
                decoding="async"
                className={`
                  aspect-auto 
                  !max-h-[14rem] 
                  w-full 
                  md:h-full 
                  md:!max-h-[unset] 
                  md:object-cover
                  ${isLoaded ? "opacity-100" : "opacity-0"}
                  transition-opacity 
                  duration-300
                `}
                draggable="false"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
