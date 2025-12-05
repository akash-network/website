import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

interface Card {
  title: string;
  description: string;
  icon: string;
}

interface WhyChooseSwiperProps {
  cards: Card[];
}

const WhyChooseSwiper = ({ cards }: WhyChooseSwiperProps) => {
  return (
    <div className="block md:hidden">
      <Swiper spaceBetween={16} slidesPerView={1.1} className="w-full !px-4">
        {cards.map((card, index) => (
          <SwiperSlide key={index}>
            <div className="flex h-[14rem] gap-3 rounded-lg border bg-background p-6 shadow-xl">
              <div
                dangerouslySetInnerHTML={{ __html: card.icon }}
                className="size-10"
              />
              <div className="flex flex-1 flex-col">
                <h3
                  className="text-[24px] font-semibold leading-tight"
                  dangerouslySetInnerHTML={{ __html: card.title }}
                />
                <p className="mt-3 flex-grow text-base font-medium leading-[20px] dark:text-paraDark">
                  {card.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default WhyChooseSwiper;
