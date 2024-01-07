import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

import ArrowLeft from "./arrow-left.svg";
import ArrowRight from "./arrow-right.svg";

type Image = {
  src: string;
};

interface FeatureComponentProps {
  images: Image[];
  title: string;
  description: string;
  button: any;
  links: string[];
}

const FeatureComponent: React.FC<FeatureComponentProps> = ({
  images,
  title,
  description,
  button,
  links,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const handleArrowClick = (direction: "left" | "right") => {
    if (direction === "left") {
      setActiveIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1,
      );
    } else {
      setActiveIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1,
      );
    }

    // Disable auto-scroll for 10 seconds when the user interacts
    setAutoScrollEnabled(false);
    setTimeout(() => setAutoScrollEnabled(true), 10000);
  };

  useEffect(() => {
    // Start auto-scroll when autoScrollEnabled is true and the browser is not Firefox
    if (autoScrollEnabled) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1,
        );
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [images.length, autoScrollEnabled]);

  useEffect(() => {
    const preloadImages = images.map((image) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => setImageLoaded(true);
      return img;
    });
    return () => {
      preloadImages.forEach((img) => (img.onload = null));
    };
  }, [images]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleArrowClick("right"), // Reverse direction for swipe
    onSwipedRight: () => handleArrowClick("left"), // Reverse direction for swipe
  });
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#7E7C7B] shadow-xl md:max-w-[550px] md:border-0 md:shadow-2xl">
      <div className="overflow-hidden" {...swipeHandlers}>
        <div
          className={clsx("flex", {
            "opacity-100": imageLoaded,
            "opacity-0": !imageLoaded,
          })}
          style={{
            willChange: "transform", // Add this line
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              alt="Feature illustration"
              src={image.src}
              width={1200}
              height={1200}
              className="h-auto w-full object-cover"
              style={{
                flex: "0 0 100%", // Make each image take 100% width
              }}
            />
          ))}
        </div>
      </div>
      <div className="px-4 py-6 md:px-[24px] md:pb-[38px] md:pt-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex gap-x-[8px]">
            {images.map((_, index) => (
              <div
                key={index}
                className={clsx("h-[7px] w-[7px] rounded-full", {
                  "bg-foreground": index === activeIndex,
                  "bg-[#D9D9D9]": index !== activeIndex,
                })}
              ></div>
            ))}
          </div>
          <div className="flex">
            <img
              alt="Feature illustration"
              src={ArrowLeft.src}
              width={1200}
              height={1200}
              className="h-[16px] w-[16px] hover:cursor-pointer md:h-[24px] md:w-[24px]"
              onClick={() => handleArrowClick("left")}
            />
            <img
              alt="Feature illustration"
              src={ArrowRight.src}
              width={1200}
              height={1200}
              className="h-[16px] w-[16px] hover:cursor-pointer md:h-[24px] md:w-[24px]"
              onClick={() => handleArrowClick("right")}
            />
          </div>
        </div>

        <div className="mt-4 md:mt-[18px]">
          <h2 className="text-xl font-bold leading-[30px] md:text-2lg md:leading-10">
            {title}
          </h2>
          <p className="mt-1 text-xs font-normal leading-[18px] md:mt-2 md:text-base">
            {description}
          </p>
        </div>

        <div className="flex justify-center border-b border-[#272540] py-6 md:pb-[24px] md:pt-[47px]">
          <button className="mt-auto inline-flex h-[40px] items-center justify-center rounded-lg bg-primary px-2 align-bottom text-sm font-bold leading-none text-primary-foreground hover:bg-primary/80 md:h-[56px] md:px-4 md:text-lg">
            <svg
              width="29"
              height="29"
              viewBox="0 0 29 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block md:hidden"
            >
              <g clipPath="url(#clip0_798_9525)">
                <path
                  d="M11.6085 16.3113L16.6189 11.9135M16.6189 11.9135L12.5029 11.6455M16.6189 11.9135L16.3509 16.0296"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M19.609 20.3753C23.0679 17.3393 23.4108 12.0741 20.3748 8.61512C17.3387 5.15617 12.0735 4.81332 8.61456 7.84934C5.1556 10.8854 4.81275 16.1506 7.84878 19.6096C10.8848 23.0685 16.15 23.4114 19.609 20.3753Z"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_798_9525">
                  <rect
                    width="20"
                    height="20"
                    fill="white"
                    transform="translate(0 13.1934) rotate(-41.2744)"
                  ></rect>
                </clipPath>
              </defs>
            </svg>
            <svg
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 hidden md:block"
            >
              <g clipPath="url(#clip0_805_5954)">
                <path
                  d="M13.9912 19.6389L20.0037 14.3615M20.0037 14.3615L15.0644 14.0399M20.0037 14.3615L19.682 19.3008"
                  stroke="#FBF8F7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M23.5917 24.5156C27.7425 20.8723 28.1539 14.5541 24.5107 10.4033C20.8674 6.25259 14.5492 5.84117 10.3984 9.4844C6.24766 13.1276 5.83624 19.4459 9.47947 23.5966C13.1227 27.7474 19.441 28.1588 23.5917 24.5156Z"
                  stroke="#FBF8F7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_805_5954">
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    transform="translate(0.0625 15.8973) rotate(-41.2744)"
                  ></rect>
                </clipPath>
              </defs>
            </svg>
            {button.label}
          </button>
        </div>
        <div className="mt-4 flex flex-col space-y-1 md:mt-[23px] md:space-y-[11px]">
          {links.map((link: any) => (
            <a
              key={link.label}
              className="inline-flex cursor-pointer items-center gap-x-2 font-bold leading-normal hover:text-primary"
              href={link.link}
            >
              {link.label}
              <svg
                width="9"
                height="10"
                viewBox="0 0 9 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 8.5L8 1.5M8 1.5H1.87501M8 1.5V7.62501"
                  stroke="#272540"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureComponent;
