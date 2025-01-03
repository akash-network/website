import clsx from "clsx";
import { useEffect, useRef } from "react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface YearSelectorProps {
  years: number[];
  currentYear: number;
}

export default function YearSelector({
  years,
  currentYear,
}: YearSelectorProps) {
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (swiperRef.current) {
      const swiper = swiperRef.current.swiper;
      const currentIndex = years.findIndex(
        (y) => y.toString() === currentYear.toString(),
      );
      if (currentIndex !== -1) {
        setTimeout(() => {
          swiper.slideTo(currentIndex, 300);
        }, 100);
      }
    }
  }, [currentYear, years]);

  return (
    <div className="mt-10 flex w-full items-center gap-4">
      <h2 className="whitespace-nowrap text-lg font-medium">Year:</h2>
      <Swiper
        ref={swiperRef}
        slidesPerView="auto"
        spaceBetween={16}
        freeMode={{
          enabled: true,
          sticky: false,
        }}
        breakpoints={{
          0: {
            slidesOffsetAfter: 50,
          },
          1024: {
            slidesOffsetAfter: 0,
          },
        }}
        modules={[FreeMode]}
        className="w-full"
        slideToClickedSlide={true}
      >
        {years?.map((y) => (
          <SwiperSlide key={y} style={{ width: "auto" }}>
            <a
              href={`/roadmap/${y}`}
              className={clsx(
                "block rounded-full px-3 py-1 text-lg font-medium transition-all duration-300 hover:bg-badgeColor hover:text-para",
                y.toString() === currentYear?.toString()
                  ? "bg-badgeColor"
                  : "text-linkText",
              )}
            >
              {y}
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
