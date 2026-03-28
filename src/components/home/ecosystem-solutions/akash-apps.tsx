import { useEffect, useRef, useState } from "react";

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

export default function AkashApps({ desktopItems }: { desktopItems: Item[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom >= viewportHeight) {
        const totalHeight = rect.height - viewportHeight;
        const scrolled = Math.abs(rect.top);
        const progress = scrolled / totalHeight;

        const newIndex = Math.min(
          Math.floor(progress * desktopItems.length),
          desktopItems.length - 1
        );
        setActiveIndex(newIndex);
      } else if (rect.top > 0) {
        setActiveIndex(0);
      } else if (rect.bottom < viewportHeight) {
        setActiveIndex(desktopItems.length - 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [desktopItems.length]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${desktopItems.length * 80}vh` }}
    >
      <div className="sticky top-24 max-w-7xl h-[700px] flex items-center overflow-hidden">
        <div className="w-full flex flex-col md:flex-row items-start h-full justify-between">
          
          <div className="w-full md:w-1/2 flex items-start gap-[10px]">
            <div className="w-[180px] h-16 md:h-[88px] flex items-center shrink-0">
              <img 
                src="/akash.svg" 
                alt="Akash" 
                className="h-[40px] w-auto object-contain invert dark:invert-0 select-none pointer-events-none"
              />
            </div>

            <div className="relative overflow-visible">
              <div 
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{
                  transform: `translateY(-${activeIndex * 88}px)`
                }}
              >
                {desktopItems.map((item, i) => {
                  const isActive = i === activeIndex;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center h-16 md:h-[88px] transition-colors duration-500"
                    >
                      <div className="flex items-baseline gap-3">
                        <h2 className={`text-[32px] md:text-[48px] font-normal tracking-tighter leading-none font-Satoshi ${isActive ? "text-[#171717] dark:text-white" : "text-[#171717]/40 dark:text-white/40"}`}>
                          {item.name}
                        </h2>
                        {item.label && (
                          <span className={`text-sm md:text-base lowercase font-normal font-jetBrainsMono -translate-y-5 ${isActive ? "text-[#171717] dark:text-white" : "text-[#171717]/40 dark:text-white/40"}`}>
                             ({item.label})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex items-start justify-end h-full mt-6">
            <div className="w-full max-w-[560px] flex flex-col">

              <div className="bg-[#212123] border border-[#2C2C2E] rounded-[24px] overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 0)', 
                    backgroundSize: '20px 20px' 
                  }} 
                />

                <div className="relative w-full h-full rounded-[12px] overflow-hidden">
                  {desktopItems.map((item, i) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.title}
                      className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 ${
                        i === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
                      }`}
                    />
                  ))}
                </div>

                {desktopItems[activeIndex].label === "coming-soon" && (
                  <div className="absolute top-[36px] left-[36px] z-20">
                    <div className="bg-white text-[#171717] text-xs md:text-sm px-4 py-2 rounded-full font-medium">
                      Coming Soon
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h3 className="text-xl md:text-[24px] font-semibold transition-all duration-500 tracking-tight">
                  {desktopItems[activeIndex].title}
                </h3>
                <p className="text-[#86868B] text-sm md:text-base leading-relaxed transition-all duration-500 line-clamp-2 mt-2.5">
                  {desktopItems[activeIndex].description}
                </p>
                
                {desktopItems[activeIndex].label !== "coming-soon" && (
                  <div>
                    <a
                      href={desktopItems[activeIndex].button.url}
                      target="_blank"
                      className="inline-flex items-center justify-center mt-5 gap-2 bg-[#F5F5F7] text-[#171717] text-xs md:text-sm px-4 py-2 rounded-full font-medium hover:bg-[#e8e8e8] transition-all group scale-100 active:scale-95 cursor-pointer"
                    >
                      {desktopItems[activeIndex].button.text}
                      <svg 
                        className="group-hover:rotate-45 transition-transform duration-300 translate-y-px"
                        width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4.66663 4.66699H11.3333M11.3333 4.66699V11.3337M11.3333 4.66699L4.66663 11.3337" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}