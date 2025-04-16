import { acc2025 } from "@/components/acc-2025/acc-2025";
import classNames from "classnames";
import { ArrowUpCircle } from "lucide-react";
import { useEffect, useState } from "react";
const Recap = ({ type }: { type: "button" | "image" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = acc2025.youtube.split("v=")[1];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div>
      {type === "button" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center bg-[#272626] py-3.5 font-jetBrainsMono text-lg text-white transition-all hover:bg-[#8A8A8A]"
        >
          <ArrowUpCircle className="mr-2 size-5 rotate-45 md:size-6" />
          Watch the 2024 Recap
        </button>
      )}
      {type === "image" && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex aspect-[16/15] max-h-[640px] w-full lg:aspect-[16/6]"
        >
          <img
            src="/images/acc-2025/highlights.png"
            alt="Akash Accelerate 2025 Highlights"
            className="relative z-[1] h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 z-[2] flex items-end py-10 transition-all group-hover:bg-black/10">
            <div className="container-nav-2 flex flex-col gap-2">
              <svg
                className="size-14 lg:size-[85px]"
                viewBox="0 0 85 85"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="42.5" cy="42.5002" r="42.5" fill="#21B35D"></circle>
                <path
                  d="M61 43.5002L30.25 60.3877L30.25 26.6127L61 43.5002Z"
                  fill="white"
                ></path>
              </svg>
              <h2 className="text-left text-3xl font-semibold leading-[1.2] transition-all group-hover:underline md:text-5xl">
                View highlights <br />
                from last year
              </h2>
            </div>
          </div>
        </button>
      )}

      <div
        className={classNames(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={classNames(
          "fixed left-1/2 top-1/2 z-50 w-[90%] max-w-4xl -translate-x-1/2 -translate-y-1/2 transform select-none transition-all duration-300",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
};

export default Recap;
