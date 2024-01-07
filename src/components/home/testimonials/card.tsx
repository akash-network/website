import { useSwiperSlide } from "swiper/react";

interface IFProps {
  userName?: string;
  testimonial?: string;
  userAvatar?: string;
  accountLink?: string;
  companyName?: string;
}

const TestimonialCard = ({
  userName,
  testimonial,
  userAvatar,
  accountLink,
  companyName,
}: IFProps) => {
  const swiperSlide = useSwiperSlide();

  return (
    <div
      className={`${
        swiperSlide.isActive && "relative"
      } mt-20 flex  flex-col justify-between space-y-4 self-center rounded-2xl border border-paraDark bg-background2 p-5`}
    >
      <p
        className={`text-base 
      ${swiperSlide.isActive ? "" : "line-clamp-3"}
      `}
      >
        {testimonial}
      </p>

      <div className="flex items-center gap-2">
        <div>
          <img src={userAvatar} alt="Avatar" width="40" height="40" />
        </div>
        <div className="flex flex-col md:ml-3">
          {accountLink ? (
            <a
              className="text-sm font-bold underline "
              href={accountLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {userName}
            </a>
          ) : (
            <p className="text-sm font-bold text-foreground">{userName}</p>
          )}
          <p className=" text-sm  ">{companyName}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
