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
            className="w-10 lg:w-[53px]"
            viewBox="0 0 54 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M51.4453 22.7637C51.8035 23.0559 51.8254 23.5872 51.5117 23.9092L51.4453 23.9707L32.1738 39.6787C31.6652 40.0933 30.9035 39.7312 30.9033 39.0752L30.9033 7.65918C30.9035 7.04419 31.5724 6.68804 32.0752 6.9873L32.1738 7.05566L51.4453 22.7637Z"
              stroke="white"
              stroke-width="2.29287"
            />
            <path
              d="M28.4924 22.7783C28.8286 23.0694 28.849 23.5764 28.5549 23.8945L28.4924 23.9561L10.5403 39.502C10.0361 39.9386 9.25243 39.581 9.2522 38.9141L9.2522 7.82031C9.25241 7.1952 9.94106 6.84152 10.4426 7.15918L10.5403 7.23242L28.4924 22.7783Z"
              stroke="white"
              stroke-width="2.29287"
            />
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
