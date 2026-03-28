import { useState, useEffect } from "react";

type Item = {
  id: number;
  name: string;
  label?: string;
  image: string;
  mobileImage?: string;
  title: string;
  description: string;
  button: {
    text: string;
    url: string;
  };
};

export default function AkashAppsMob({ 
  mobileItems, 
  isTallScreen 
}: { 
  mobileItems: Item[]; 
  isTallScreen?: boolean; 
}) {
  const itemsPerView = isTallScreen ? 9 : 3;
  const [visibleCount, setVisibleCount] = useState(itemsPerView);

  // Adjust count if tall screen state changes
  useEffect(() => {
    setVisibleCount(prev => Math.max(prev, itemsPerView));
  }, [itemsPerView]);

  return (
    <div className="flex flex-col gap-8 mt-[40px] pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mobileItems.slice(0, visibleCount).map((item) => {
          const isComingSoon = item.label === "coming-soon";

          return (
            <div
              key={item.id}
              className="bg-[#181819] border border-[#2C2C2E] rounded-[16px] overflow-hidden flex flex-col h-full"
            >
              <div className="pt-3 pb-6 px-4 space-y-1 text-white flex-grow">
                <div className="flex items-center gap-2 md:gap-3">
                  <img src="/akash.svg" alt="Akash Logo" className="h-[22px] md:h-8 select-none pointer-events-none" />
                  <span className="text-[26px] md:text-[36px] tracking-tight">
                    {item.name}
                  </span>
                  {item.label && (
                    <span className="text-xs md:text-sm text-white/40 lowercase font-normal -translate-x-1 -translate-y-2">
                      ({item.label})
                    </span>
                  )}
                </div>

                <p className="text-sm md:text-lg text-[#86868B] leading-relaxed font-normal -mt-2 md:-mt-3">
                  {item.description}
                </p>

                {!isComingSoon && (
                  <div className="pt-2 md:pt-3">
                    <a
                      href={item.button.url}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-[#F5F5F7] text-[#171717] text-xs md:text-base px-3 md:px-6 py-1.5 md:py-3 rounded-full font-medium active:scale-95 transition-all"
                    >
                      {item.button.text}
                      <svg
                        className="w-[14px] h-[14px] md:w-5 md:h-5"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.66663 4.66699H11.3333M11.3333 4.66699V11.3337M11.3333 4.66699L4.66663 11.3337"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-transparent border-t border-[#2C2C2E] flex items-center justify-center relative md:px-[32px] aspect-[1035/543] w-full">
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 0)', 
                    backgroundSize: '20px 20px' 
                  }} 
                />

                <div className="relative w-full h-full rounded-[12px] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>

                {isComingSoon && (
                  <div className="absolute top-2 sm:top-8 md:top-16 left-6 sm:left-8 md:left-16 z-20">
                    <div className="bg-white text-[#171717] text-[8.5px] sm:text-xs md:text-sm px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full font-medium">
                      Coming Soon
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < mobileItems.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((p) => p + itemsPerView)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent dark:bg-white/5 hover:bg-black/5 hover:dark:bg-white/15 border border-black/10 dark:border-white/15 rounded-[40px] text-black dark:text-[#FAFAFA] text-[13px] md:text-base font-medium transition-all active:scale-95 group"
          >
            <span>Show More</span>
            <svg 
              className="w-4 h-4 md:w-5 md:h-5 shrink-0 translate-y-px"
              viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}