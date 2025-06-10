import React from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const NYCCarousel: React.FC = () => {
  const images = [
    {
      src: "/images/acc-2025/nyc.png",
      alt: "NYC Event Rooftop View 1",
    },
    {
      src: "/images/acc-2025/nyc2.png",
      alt: "NYC Event Rooftop View 2",
    },
  ];

  const swiperRef = React.useRef<SwiperType>();

  return (
    <div className="relative h-full w-full">
      <style>
        {`
          .swiper-pagination-bullet {
            background-color: #D9D9D9 !important;
            opacity: 1 !important;
            width: 15px !important;
            height: 15px !important;
            margin: 0 4px !important;
          }
          .swiper-pagination-bullet-active {
            background-color: #5C5C5C !important;
          }
          .swiper-pagination {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        `}
      </style>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          el: ".swiper-pagination",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full w-full"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-[50vh] w-full lg:h-full">
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination */}
      <div className="swiper-pagination absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2"></div>
    </div>
  );
};

export default NYCCarousel;
