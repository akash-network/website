import { useState } from "react";
import { acc2025 } from "./acc-2025";

const Location = () => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <a
      className=" flex flex-col lg:flex-row"
      href={acc2025.map}
      target="_blank"
    >
      <div
        className="relative w-full flex-1 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src="/images/acc-2025/map.png"
          alt="location"
          className={`h-full w-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-0" : "opacity-100"} `}
        />
        <img
          src="/images/acc-2025/map-hover.png"
          alt="location"
          className={`h-full w-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"} absolute inset-0`}
        />
      </div>
      <div className="group flex aspect-[16/15] w-full flex-1  flex-col justify-between gap-5 bg-black px-4 py-10 md:aspect-auto md:justify-normal md:gap-10 md:px-10 md:pb-40 md:pt-10">
        <div className="flex flex-col md:gap-3">
          <svg
            viewBox="0 0 60 61"
            className="size-10 lg:size-[60px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="30"
              cy="30"
              r="30"
              transform="matrix(1.19249e-08 -1 -1 -1.19249e-08 60 60.7766)"
              fill="#FAB215"
            ></circle>
            <path
              d="M40.4705 43.2345L40.4945 38.3104L25.6741 38.3104L43.6772 20.3073L40.0982 16.7283L22.0951 34.7314L22.1071 19.923L17.171 19.935V43.2345L40.4705 43.2345Z"
              fill="white"
            ></path>
          </svg>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.2] transition-all duration-500 group-hover:underline lg:text-5xl">
            74Wythe <br /> Williamsburg
            <br /> NYC
          </h2>
        </div>
        <h3 className="font-jetBrainsMono md:text-xl lg:text-2xl">
          June 23rd <br /> 9:30-6:30pm
        </h3>
      </div>
    </a>
  );
};

export default Location;
