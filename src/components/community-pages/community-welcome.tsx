import React, { useState, useRef, useEffect, useCallback } from "react";
import AkashClubContent from "./akash-club-content";
import AkashInsidersContent from "./akash-insiders-content";
import DevelopersContent from "./developers-content";

// ─── Icon Components ───────────────────────────────────────────────────────────

const MessagesSquareIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
  </svg>
);

const BadgeCheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CalendarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const PeaceHandIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.1488 9.47163V3.61153C14.1488 2.72151 13.4273 2 12.5373 2C11.6473 2 10.9258 2.72151 10.9258 3.61153V8.44611" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.346 12.841L18.5217 5.58862C18.7755 4.74265 18.2886 3.85248 17.4394 3.60984C16.5943 3.3684 15.7142 3.8609 15.4779 4.70743L14.1484 9.47149" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7.61935 9.24985L8.67489 11.5913C9.03961 12.4003 8.68159 13.352 7.87404 13.72C7.06183 14.0901 6.10347 13.7296 5.73663 12.9159L4.68109 10.5745C4.31637 9.76542 4.67439 8.81376 5.48193 8.44574C6.29415 8.07559 7.25251 8.43614 7.61935 9.24985Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11.7192 12.2596C11.9239 11.6921 11.8998 11.0672 11.6518 10.5172L10.5787 8.13678C10.2181 7.33697 9.27613 6.98258 8.4778 7.34641C7.66469 7.71696 7.31885 8.68636 7.71382 9.4879L7.84946 9.76316" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13.8566 17.6787L14.3487 16.6947C14.3976 16.5967 14.3461 16.4783 14.241 16.4474L10.6903 15.403C9.97853 15.1937 9.51797 14.5057 9.59563 13.7679C9.68372 12.9311 10.4284 12.3208 11.2662 12.3987L16.0542 12.8441C16.0542 12.8441 19.8632 13.4301 18.5447 17.2392C17.2262 21.0483 16.7867 22.3668 13.8566 22.3668C11.9521 22.3668 9.16855 22.3668 9.16855 22.3668H8.87555C6.52912 22.3668 4.62697 20.4646 4.62697 18.1182L4.48047 9.91406" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const HeartHandshakeLargeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
    <path d="m18 15-2-2" />
    <path d="m15 18-2-2" />
  </svg>
);

const BadgeCheckLargeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SearchCodeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 9-2 2 2 2" />
    <path d="m13 13 2-2-2-2" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

// ─── Hero Section ───────────────────────────────────────────────────────────────

function HeroSection({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}) {
  return (
    <section className=" px-6 py-16 md:px-10 md:pt-[100px] pb-10 sm:pb-20 lg:px-[240px]">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-14">
        {/* Title Block */}
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-center text-[40px] font-semibold md:text-4xl lg:text-[56px] leading-[48px] lg:leading-[1.15]">
            Building the People's Supercloud
          </h1>
          <p className="max-w-[800px] text-center text-sm leading-6 text-[#71717a] dark:text-para md:text-lg">
            A global community collaboratively managing the future of decentralized cloud computing from code to culture.
            Whether you are here to learn, deploy, or govern, you belong here.
          </p>
        </div>

        {/* Join the Movement */}
        <div className="flex w-full flex-col items-center gap-5">
          <h2 className="text-center text-lg font-medium ">
            Join the Movement
          </h2>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessagesSquareIcon,
                title: "Connect",
                desc: "Join a global network of peers to shape decentralized infrastructure.",
              },
              {
                icon: BadgeCheckIcon,
                title: "Contribute",
                desc: "Your unique skills move the needle for code, content, and support.",
              },
              {
                icon: CalendarIcon,
                title: "Attend",
                desc: "Join virtual sessions or global events to stay at the cutting edge.",
              },
              {
                icon: PeaceHandIcon,
                title: "Impact",
                desc: "Help us build a permissionless alternative to cloud giants.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-lg border border-[#e4e4e7] dark:border-defaultBorder p-4 md:p-6"
              >
                <div className="flex items-center gap-2">
                  <card.icon className="h-6 w-6 " />
                  <span className="text-base font-semibold ">
                    {card.title}
                  </span>
                </div>
                <p className="text-sm leading-5 text-[#71717a] dark:text-para">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How do you want to build? - Tab Switcher */}
        <HowToBuildTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </section>
  );
}

// ─── Tab Switcher ("How do you want to build?") ────────────────────────────────

type TabKey = "akash-club" | "akash-insiders" | "developers";

const tabs: { key: TabKey; icon: React.FC<{ className?: string }>; label: string; sub: string }[] = [
  { key: "akash-club", icon: HeartHandshakeLargeIcon, label: "Akash Club", sub: "For Enthusiast" },
  { key: "akash-insiders", icon: BadgeCheckLargeIcon, label: "Akash Insiders", sub: "For Experts" },
  { key: "developers", icon: SearchCodeIcon, label: "Developers", sub: "For Builders" },
];

function HowToBuildTabs({ activeTab, setActiveTab }: { activeTab: TabKey; setActiveTab: (tab: TabKey) => void }) {
  const activeIndex = tabs.findIndex((t) => t.key === activeTab);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ width: 0, transform: "translateX(0px)" });

  const updatePill = useCallback(() => {
    const el = buttonRefs.current[activeIndex];
    if (el) {
      setPillStyle({
        width: el.offsetWidth,
        transform: `translateX(${el.offsetLeft}px)`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    updatePill();
  }, [updatePill]);

  // Re-measure when container resizes (handles orientation change, window resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => updatePill());
    ro.observe(container);
    return () => ro.disconnect();
  }, [updatePill]);

  useEffect(() => {
    // Only trigger centering scroll on mobile (sm breakpoint is 640px)
    if (window.innerWidth >= 640) return;

    const container = scrollContainerRef.current;
    const el = buttonRefs.current[activeIndex];
    if (container && el) {
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeIndex]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <h2 className="text-center text-lg font-medium text-[#737373] dark:text-para">
        How do you want to build?
      </h2>
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto rounded-full bg-[#f5f5f7] dark:bg-background2 p-2 scrollbar-hide"
      >
        <div ref={containerRef} className="relative flex min-w-max sm:min-w-0 sm:w-full items-center">

          <div
            className="absolute top-0 h-full rounded-full bg-white dark:bg-[#1c1c1c] shadow transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: pillStyle.width, transform: pillStyle.transform }}
          />

          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => { buttonRefs.current[i] = el; }}
                onClick={() => setActiveTab(tab.key)}
                // shrink-0 on mobile → flex-1 on sm+
                className={`relative z-10 shrink-0 sm:flex-1 flex items-center justify-start gap-2 md:gap-4 rounded-full px-7 py-3 md:py-4 md:px-10 transition-colors duration-200 ${isActive ? "text-[#111111] dark:text-foreground" : "text-[#86868b] dark:text-para hover:text-[#111111] dark:hover:text-foreground"}`}
              >
                <tab.icon className="h-8 w-8 transition-colors duration-200" />
                <div className="flex flex-col items-start">
                  <span className="font-medium text-2xl whitespace-nowrap transition-colors duration-200">
                    {tab.label}
                  </span>
                  <span className={`font-normal text-sm whitespace-nowrap transition-colors duration-200 ${isActive ? "text-[#737373] dark:text-foreground" : ""}`}>
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Quote Section ──────────────────────────────────────────────────────────────

// function QuoteSection() {
//     return (
//         <section className="border-y border-[#e4e4e7] dark:border-defaultBorder bg-[#fafafa] dark:bg-background2 px-4 py-20 md:px-10 md:py-[120px]">
//             <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
//                 <blockquote className="text-center font-instrument italic text-xl  leading-relaxed text-[#111827] dark:text-foreground md:text-3xl lg:text-[48px] lg:leading-[1.3]">
//                     "Bull market, bear market, it doesn&apos;t matter.
//                     495 open-source contributors averaging 67 commits per week build Akash regardless of market conditions. Akash is the People&apos;s Supercloud and I&apos;m credibly proud of the $AKT community."
//                 </blockquote>
//                 <div className="flex flex-col items-center">
//                     <p className="text-lg font-semibold text-[#111827] dark:text-foreground">Greg Osuri</p>
//                     <p className="text-center text-base text-[#71717a] dark:text-para">
//                         Founder of Akash
//                         <br />
//                         Overclock Labs CEO
//                     </p>
//                 </div>
//             </div>
//         </section>
//     );
// }

// ─── Social Channels Section ────────────────────────────────────────────────────

// const socialChannels = [
//     { name: "Discord", icon: DiscordIcon, href: "https://discord.com/invite/akash" },
//     { name: "Github", icon: GithubIcon, href: "https://github.com/akash-network" },
//     { name: "X", icon: TwitterIcon, href: "https://x.com/akashnet" },
//     { name: "LinkedIn", icon: LinkedInIcon, href: "https://www.linkedin.com/company/akash-network/" },
//     { name: "Youtube", icon: YoutubeIcon, href: "https://www.youtube.com/c/AkashNetwork" },
//     { name: "Telegram", icon: TelegramIcon, href: "https://t.me/AkashNW" },
//     // { name: "Zealy", icon: ZealyIcon, href: "https://zealy.io/c/akashnetwork" },
//     { name: "Reddit", icon: RedditIcon, href: "https://www.reddit.com/r/AkashNetwork/" },
// ];

// function SocialChannelsSection() {
//     return (
//         <section className="border-y border-[#e5e5e5] dark:border-defaultBorder  px-4 py-20 md:px-10 md:py-[120px] lg:px-[240px]">
//             <div className="mx-auto flex max-w-[1240px] flex-col gap-20 lg:flex-row lg:gap-20">
//                 {/* Left: Title */}
//                 <div className="flex flex-col gap-3 lg:w-1/2">
//                     <h2 className="text-3xl font-semibold text-[#111827] dark:text-foreground md:text-[40px] md:leading-[1.2]">
//                         Explore Social Channels
//                     </h2>
//                     <p className="text-sm leading-5 text-[#71717a]">
//                         Be part of the Akash Network community. Connect, contribute, and collaborate to shape the future of decentralized cloud computing.
//                     </p>
//                 </div>

//                 {/* Right: Channel Cards */}
//                 <div className="flex flex-col gap-6 lg:w-1/2">
//                     {socialChannels.map((channel, i) => (
//                         <a
//                             key={i}
//                             href={channel.href}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="flex items-center justify-between rounded-lg border border-[#e4e4e7] dark:border-defaultBorder px-5 py-6 transition-colors hover:shadow-lg"
//                         >
//                             <div className="flex items-center gap-3">

//                                 <channel.icon className="h-8 w-8 " />

//                                 <span className="text-base font-medium ">
//                                     {channel.name}
//                                 </span>
//                             </div>
//                             <ChevronRightIcon className="h-6 w-6 " />
//                         </a>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// }

// ─── FAQ Section ────────────────────────────────────────────────────────────────

// const faqItems = [
//     {
//         question: "Do I have to contribute to join Akash Club?",
//         answer:
//             "No. We'd love every member to contribute, but we understand not everyone has the time. Everyone is welcome to join our events, learn alongside us, and connect with the core community without completing contribution missions.",
//     },
//     {
//         question: "What if I'm not technical?",
//         answer:
//             "Perfect. We need content creators, community advocates, social media voices, and people who can explain Akash to non-technical audiences. Technical contributions are important, but so is everything else that drives adoption.",
//     },
//     {
//         question: "Can I contribute if I'm not part of Akash Club?",
//         answer: `Content contributions are reserved for Akash Insiders, who receive proper training before creating materials for the network. We induct new Insiders four times a year.\nClick here to join our start-list.\n\nTechnical contributions are open to all developers. We provide optional training modules to help you get up to speed and fill in any gaps you may have missed surrounding the Akash ecosystem.\n\nSocial campaigns (rewarded with Club Points) are open to all Club members through Discord.\nPoints can be redeemed to purchase additional raffle tickets, and/or cool Akash swag from the official shop.`,
//     },
// ];

// function FAQSection() {
//     return (
//         <section className="px-4 py-20 md:px-10 md:py-[120px] lg:px-[400px]">
//             <div className="mx-auto max-w-[913px]">
//                 <h2 className="mb-12 text-center text-2xl font-bold  md:text-[36px]">
//                     Frequently asked questions
//                 </h2>
//                 <Accordion type="single" collapsible className="w-full">
//                     {faqItems.map((item, i) => (
//                         <AccordionItem
//                             key={i}
//                             value={`faq-${i}`}
//                             className="border-b border-[#e5e5e5] dark:border-defaultBorder"
//                         >
//                             <AccordionTrigger className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-base font-medium  no-underline">
//                                 <span>{item.question}</span>
//                             </AccordionTrigger>
//                             <AccordionContent className="pb-4 text-sm leading-5 text-[#737373] dark:text-para whitespace-pre-line">
//                                 {item.answer}
//                             </AccordionContent>
//                         </AccordionItem>
//                     ))}
//                 </Accordion>
//             </div>
//         </section>
//     );
// }

// ─── CTA Section ────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="border-t border-[#e4e4e7] dark:border-defaultBorder px-6 py-20 md:px-10 md:py-[180px] lg:px-[240px]">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 md:gap-[60px]">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-center text-3xl font-bold text-[#111827] dark:text-foreground md:text-[48px] md:leading-[1.15]">
              The Supercloud is waiting.
            </h2>
            <p className="text-center text-lg text-[#71717a] dark:text-para">
              Where will you start?
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://discord.com/invite/akash"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] dark:bg-background2 px-4 py-2 text-sm font-medium text-[#171717] dark:text-foreground transition-colors hover:bg-[#ebebeb]"
            >
              Join the Akash Club
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
            <a
              href="https://akashnet.typeform.com/to/PXpRWgfD?typeform-source=akash.network"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] dark:bg-background2 px-4 py-2 text-sm font-medium text-[#171717] dark:text-foreground transition-colors hover:bg-[#ebebeb]"
            >
              Apply to Insiders
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="max-w-[859px] text-center text-sm leading-6 text-[#71717a] dark:text-para">
          Note: Technical contributions on GitHub are always open to everyone.
          <br />
          However, access to paid content bounties and official training is reserved for the Insider program.
        </p>
      </div>
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

function TabContent({ activeTab }: { activeTab: TabKey }) {
  const content = () => {
    switch (activeTab) {
      case "akash-club": return <AkashClubContent />;
      case "akash-insiders": return <AkashInsidersContent />;
      case "developers": return <DevelopersContent />;
      default: return <AkashClubContent />;
    }
  };

  return (
    <div
      key={activeTab}
      className="animate-tab-fade"
    >
      {content()}
    </div>
  );
}

export default function CommunityWelcome() {
  const [activeTab, setActiveTab] = useState<TabKey>("akash-club");

  return (
    <div className="flex flex-col">
      <HeroSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} />
      {/* <QuoteSection />
            <SocialChannelsSection /> */}
      {/* <FAQSection /> */}
      <CTASection />
    </div>
  );
}
