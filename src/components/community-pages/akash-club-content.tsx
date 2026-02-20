import { QuoteSection } from "./quote-section";
import { FAQSection } from "./faq-section";
import { SocialChannelsSection } from "./social-channels-section";

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
    </svg>
);

export default function AkashClubContent() {
    return (
        <>
        <section className="px-6 py-4 md:px-10 md:py-10 lg:px-[240px] lg:py-10">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-12 lg:flex-row lg:gap-20">
                {/* Left: Image + Button */}
                <div className="flex flex-col items-center lg:w-1/2">
                    <div className="sticky top-24">
                        <div className="flex aspect-video md:aspect-square w-full items-center justify-center overflow-hidden rounded-[20px] border border-[#e4e4e7] dark:border-defaultBorder bg-gray-100">
                            <img src="/images/welcome/club.png" alt="Akash Club Hero" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-center py-5">
                            <a
                                href="https://discord.com/invite/akash"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] dark:bg-background2 px-8 py-2.5 text-sm font-medium text-[#171717] dark:text-foreground transition-colors hover:bg-[#ebebeb]"
                            >
                                Join the Club &amp; Start Building
                                <ArrowUpRightIcon className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="flex flex-col gap-12 lg:w-1/2">
                    {/* Intro */}
                    <div className="flex flex-col gap-4">
                        <p className="text-base text-para">The Official Community Hub</p>
                        <h2 className="text-[28px] font-semibold  md:text-[32px] md:leading-10">
                            Shape the Supercloud with Akash Club
                        </h2>
                        <p className="text-sm md:text-base leading-6 text-para font-normal">
                            Akash Club is the official community hub where builders and $AKT enthusiasts collaborate to drive the network forward. Gain insider access to core development, earn rewards for participation, and build with conviction alongside the architects of the Supercloud.
                        </p>
                    </div>

                    {/* Learn Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-semibold text-[#11181c]">
                                Learn: Weekly Sessions &amp; Trivia
                            </h3>
                            <p className="mt-1 text-sm md:text-base text-[#687076] dark:text-para">
                                Move beyond price speculation and master the fundamentals of decentralized infrastructure.
                            </p>
                        </div>
                        <div className="flex flex-col gap-8 rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6">
                            {[
                                {
                                    emoji: "🗓️",
                                    title: "Deep Dives into Akash Progress:",
                                    desc: "Join deep dives into the technical roadmap and future protocol upgrades.",
                                },
                                {
                                    emoji: "🏅",
                                    title: "AMAs with Core Team Members:",
                                    desc: "Test your ecosystem knowledge in live challenges to win $AKT rewards.",
                                },
                                {
                                    emoji: "💭",
                                    title: "Workshops using Akash:",
                                    desc: "Move from passive learning to active contribution by collaborating on real network projects.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7]  dark:border-defaultBorder">
                                        <span className="text-2xl">{item.emoji}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-semibold text-[#11181c]  dark:text-foreground md:text-xl">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-para md:text-base">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Earn Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-semibold text-[#11181c]">
                                Earn: The Community Reward Stack
                            </h3>
                            <p className="mt-1 text-sm md:text-base text-[#687076] dark:text-para">
                                Hear directly from the people building the protocol.
                            </p>
                        </div>
                        <div className="flex flex-col gap-8 rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6">
                            {[
                                {
                                    emoji: "🌠",
                                    title: "Akash Club NFT:",
                                    desc: "Mint a unique annual collectible that serves as a permanent record of your journey and contributions to the roadmap.",
                                },
                                {
                                    emoji: "🎟️",
                                    title: "Monthly $AKT Raffle:",
                                    desc: "Our raffle is merit-based. You earn entries by attending events and actively participating, never by purchasing.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] dark:border-defaultBorder">
                                        <span className="text-2xl">{item.emoji}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-semibold text-[#11181c]  dark:text-foreground md:text-xl">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-para md:text-base">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Club Game Nights */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-[#11181c] dark:text-foreground">
                            Club Game Nights &amp; Trivia
                        </h3>
                        <div className="rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] dark:border-defaultBorder">
                                    <span className="text-2xl">🎮</span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-semibold text-[#11181c] dark:text-foreground md:text-xl">
                                        Network with our Community
                                    </h4>
                                    <p className="mt-1 text-sm text-[#687076] dark:text-para md:text-base">
                                        Visit our Akash Passage world hosted on Akash GPUs to meet others passionate about Akash.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <QuoteSection />
        <SocialChannelsSection />            
        <FAQSection />
        </>
    );
}
