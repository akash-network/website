import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (swiperRef.current && !isInitialized) {
      const swiper = swiperRef.current.swiper;
      const currentIndex = years.findIndex(
        (y) => y.toString() === currentYear.toString(),
      );
      if (currentIndex !== -1) {
        swiper.slideTo(currentIndex, 0);
        setIsInitialized(true);
      }
    }
  }, [currentYear, years, isInitialized]);

  const handleYearClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    if (swiperRef.current) {
      const swiper = swiperRef.current.swiper;
      swiper.slideTo(index, 300);
    }
  };

  return (
    <div className="relative mt-6 flex w-full items-center gap-4 md:mt-10">
      <h2 className="shrink-0 whitespace-nowrap text-lg font-medium">Year:</h2>
      <div className="relative flex-1 overflow-hidden">
        <Swiper
          ref={swiperRef}
          slidesPerView="auto"
          spaceBetween={12}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumBounce: false,
            minimumVelocity: 0.02,
          }}
          touchRatio={1.5}
          breakpoints={{
            0: {
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 40,
            },
            768: {
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 0,
            },
          }}
          modules={[FreeMode]}
          className="w-full !overflow-visible"
          slideToClickedSlide={false}
          threshold={5}
        >
          {years?.map((y, index) => (
            <SwiperSlide key={y} style={{ width: "auto" }}>
              <a
                href={`/roadmap/${y}`}
                onClick={(e) => handleYearClick(e, index)}
                className={clsx(
                  "block rounded-full px-3 py-1 text-lg font-medium transition-colors duration-200 hover:bg-badgeColor hover:text-para",
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
    </div>
  );
}
