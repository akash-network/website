import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const images = [
  "/images/slides/slide1.png",
  "/images/slides/slide2.png",
  "/images/slides/slide3.png",
  "/images/slides/slide4.png",
  "/images/slides/slide5.png",
  "/images/slides/slide6.png",
  "/images/slides/slide7.png",
  "/images/slides/slide8.png",
  "/images/slides/slide1.png",
  "/images/slides/slide2.png",
  "/images/slides/slide3.png",
  "/images/slides/slide4.png",
  "/images/slides/slide5.png",
  "/images/slides/slide6.png",
  "/images/slides/slide7.png",
  "/images/slides/slide8.png",
];

const Carousel = () => {
  return (
    <div className="swiper-linear relative  w-full overflow-hidden bg-background ">
      {/* disabled gradient for future use */}
      {/* <div className="absolute inset-0 z-[2] hidden bg-gradient-to-r  from-background from-0%  to-transparent to-5% md:block "></div>
      <div className="absolute inset-0 z-[2] hidden bg-gradient-to-l  from-background from-0%  to-transparent to-5% md:block "></div> */}
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
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} className="!w-auto ">
            <div className="mx-3  md:mx-5 lg:mx-[28px]">
              <img
                src={src}
                alt={`Image ${index + 1}`}
                height={380}
                width={260}
                className=" aspect-auto !max-h-[14rem] w-full md:h-full md:!max-h-[unset]  md:object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
