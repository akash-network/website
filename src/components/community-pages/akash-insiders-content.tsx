import { QuoteSection } from "./quote-section";
import { SocialChannelsSection } from "./social-channels-section";

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
    </svg>
);


export default function AkashInsidersContent() {
    return (
        <>
        <section className="px-6 pb-4 pt-0 md:px-10 md:pb-10 md:pt-3 lg:pb-10 lg:pt-3">
            <div className="mx-auto flex max-w-[1240px] flex-col-reverse gap-12 lg:flex-row lg:gap-20">
                {/* Left: Content */}
                <div className="flex flex-col gap-12 lg:w-1/2">
                    {/* Intro */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-base text-[#71717a] dark:text-para">Step Into Leadership</p>
                            <h2 className="font-sans text-3xl font-medium leading-snug tracking-tight text-foreground md:text-4xl">
                                Step Into a Leadership Role as an Akash Insider
                            </h2>
                        </div>
                        <p className="text-base leading-6 font-semibold text-[#0a0a0a] dark:text-foreground">
                            Join a vetted group of community vanguards who solve real-world problems and drive the growth of the Supercloud.
                        </p>
                        <p className="text-base leading-6 text-[#71717a] dark:text-para">
                            This is a high-impact, reward-heavy path for those ready to commit to the mission of the open-source Supercloud.
                        </p>
                    </div>

                    {/* The Three Paths of Contribution */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-[#0a0a0a]">
                            The Three Paths of Contribution
                        </h3>
                        <div className="flex flex-col gap-10 rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6">
                            {[
                                {
                                    emoji: "👨‍💻",
                                    title: "Path 1: Technical Vanguard",
                                    desc: "Solve UX issues, improve documentation, and close GitHub tickets to support core protocol development.",
                                },
                                {
                                    emoji: "📐",
                                    title: "Path 2: Content Architect",
                                    desc: "Produce high-fidelity video tutorials, guides, and explainers that simplify the Supercloud for the world.",
                                },
                                {
                                    emoji: "📣",
                                    title: "Path 3: Community Advocate",
                                    desc: "Lead social campaigns, host workshops, and manage community challenges to bring new builders into the ecosystem.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] dark:border-defaultBorder">
                                        <span className="text-2xl">{item.emoji}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-semibold text-[#11181c] dark:text-foreground md:text-xl">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-[#71717a] dark:text-para md:text-base">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exclusive Insider Perks */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-[#0a0a0a]">
                            Exclusive Insider Perks
                        </h3>
                        <div className="flex flex-col gap-10 rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6">
                            {[
                                {
                                    emoji: "🎯",
                                    title: "The Private Bounty Board",
                                    desc: "Gain exclusive access to a monthly list of paid opportunities across multiple skill sets rewarded in $AKT.",
                                },
                                {
                                    emoji: "🃏",
                                    title: "Insider Poker Nights",
                                    desc: "Network with core team members and fellow Insiders in monthly poker tournaments with $AKT prizes.",
                                },
                                {
                                    emoji: "✨",
                                    title: "The VIP Multiplier",
                                    desc: "Receive automatic free entry into all monthly community raffles and gain early access to network features.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] dark:border-defaultBorder">
                                        <span className="text-2xl">{item.emoji}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-semibold text-[#11181c] dark:text-foreground md:text-xl">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-[#71717a] dark:text-para md:text-base">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Image + Button */}
                <div className="flex flex-col items-center lg:w-1/2">
                    <div className="sticky top-24 flex flex-col items-center">
                        <div className="flex aspect-video md:aspect-square w-full items-center justify-center overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-gray-100 dark:bg-background2 dark:border-defaultBorder">
                            <img src="/images/welcome/insiders.png" alt="Akash Insiders Hero" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-center py-5">
                            <a
                                href="https://akashnet.typeform.com/to/PXpRWgfD?typeform-source=akash.network"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md bg-foreground px-8 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
                            >
                                Apply to Insiders
                                <ArrowUpRightIcon className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <QuoteSection />
        <SocialChannelsSection /> 
        </>
    );
}
