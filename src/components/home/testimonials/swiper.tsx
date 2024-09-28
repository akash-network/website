import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";

import "swiper/css";

import TestimonialCard from "./card";

import { Autoplay, Navigation } from "swiper/modules";

export function Swiper({
  testimonials,
}: {
  testimonials: {
    userName: string;
    testimonial: string;
    useAvatar: string;
    companyName?: string;
    accountLink?: string;
  }[];
}) {
  return (
    <div className=" flex flex-col justify-between md:min-h-[560px]">
      <SwiperReact
        slidesPerView={4.5}
        breakpoints={{
          50: {
            slidesPerView: 1.4,
            spaceBetween: 32,
          },
          758: {
            slidesPerView: 2.5,
          },

          1024: {
            slidesPerView: 3.5,
          },
          1280: {
            slidesPerView: 4.005,
          },
          1536: {
            slidesPerView: 4.5,
          },
        }}
        modules={[Navigation, Autoplay]}
        loop
        centeredSlides
        loopedSlides={4}
        grabCursor={true}
        spaceBetween={48}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        className="w-full"
        // autoplay
      >
        {testimonials?.map((testimonial) => (
          <SwiperSlide key={Math.random()}>
            <TestimonialCard
              userName={testimonial.userName}
              testimonial={testimonial.testimonial}
              userAvatar={testimonial.useAvatar}
              companyName={testimonial.companyName}
              accountLink={testimonial.accountLink}
            />
          </SwiperSlide>
        ))}
      </SwiperReact>
      <div className="mt-14 hidden items-center justify-center md:flex">
        <SwiperNavButtons />
      </div>
    </div>
  );
}

export const SwiperNavButtons = () => {
  return (
    <div className="flex space-x-4">
      <button
        aria-label="Previous testimonial"
        className="swiper-button-prev inline-flex h-14 w-14 items-center justify-center rounded-full border  hover:bg-foreground/5"
      >
        <svg
          width="6"
          height="12"
          viewBox="0 0 6 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 1.08691L1 6.08691L5 11.0869"
            stroke="#808080"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        aria-label="Next testimonial"
        className="swiper-button-next inline-flex h-14 w-14 items-center justify-center rounded-full border  hover:bg-foreground/5"
      >
        <svg
          width="6"
          height="12"
          viewBox="0 0 6 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1.08691L5 6.08691L1 11.0869"
            stroke="#808080"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
