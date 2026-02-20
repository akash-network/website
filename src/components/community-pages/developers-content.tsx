import { QuoteSection } from "./quote-section";
import { SocialChannelsSection } from "./social-channels-section";

// ─── Icon Components ───────────────────────────────────────────────────────────

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
    </svg>
);

const ZapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
);

const RocketIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

const DollarSignIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

// ─── Feature data ──────────────────────────────────────────────────────────────

const leftFeatures = [
    {
        emoji: "🦾",
        title: "High-Performance GPUs",
        desc: "Access premier NVIDIA chips for AI training, rendering, and data processing at a fraction of the cost of legacy providers.",
    },
    {
        emoji: "⚡️",
        title: "Deploy in Seconds",
        desc: "Use the Akash Console or Command Line Interface to launch apps globally in a few clicks.",
    },
    {
        emoji: "🌎",
        title: "Provider Ecosystem",
        desc: "Choose from a diverse network of infrastructure providers to find the exact hardware specs your application requires.",
    },
];

const consoleFeatures = [
    {
        icon: ZapIcon,
        title: "Generous Free Trial",
        desc: "$100 of cloud compute credits so you can test real workloads.",
    },
    {
        icon: RocketIcon,
        title: "Optimized for AI/ML",
        desc: "Container native with a library of templates for leading open source AI models and applications.",
    },
    {
        icon: DollarSignIcon,
        title: "Cost Savings",
        desc: "The most competitive prices for GPUs on-demands, anywhere on the internet.",
    },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DevelopersContent() {
    return (
        <>
        <section className="px-6 py-4 md:px-10 md:py-10 lg:px-[320px] lg:py-10">
            <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-6">
                {/* Header */}
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-center font-semibold text-[#09090b] dark:text-foreground text-[32px] leading-10 px-6 sm:px-0">
                        Power Your Applications with Decentralized Compute
                    </h2>
                    <p className="max-w-6xl text-center text-base leading-6 text-[#71717a] dark:text-para font-normal">
                        Akash Network provides high-performance GPU and CPU power for the next generation of decentralized applications.
                        Stop overpaying for centralized cloud monopolies and start building on the permissionless Supercloud.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 py-6">
                    <a
                        href="https://console.akash.network/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#171717] dark:bg-background2 px-8 py-2.5 text-sm font-medium text-[#fafafa] dark:text-foreground transition-colors hover:bg-[#333]"
                    >
                        Deploy Now on Console
                        <ArrowUpRightIcon className="h-4 w-4" />
                    </a>
                    <a
                        href="/docs"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] dark:bg-background2 px-8 py-2.5 text-sm font-medium text-[#171717] dark:text-foreground transition-colors hover:bg-[#ebebeb]"
                    >
                        View Documentation
                        <ArrowUpRightIcon className="h-4 w-4" />
                    </a>
                </div>

                {/* Two-column layout */}
                <div className="flex w-full flex-col gap-6 items-center lg:items-start lg:flex-row pb-10 sm:pb-0">
                    {/* Left: Feature list */}
                    <div className="flex flex-col gap-10 rounded-md border border-[#e5e5e5] dark:border-defaultBorder p-4 sm:p-6 w-full lg:w-1/2">
                        {leftFeatures.map((item, i) => (
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

                    {/* Right: Dark Console card */}
                    <div className=" relative rounded-md w-full lg:w-1/2 overflow-hidden ">
                        <img src="/images/welcome/dev.png" alt="Akash Console" className="w-full h-full object-cover absolute top-0" />
                        <div className="relative w-full lg:px-[72px] lg:py-20 p-6 flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <svg width="291" height="32" viewBox="0 0 291 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.5407 20.2822L29.3531 30.3407H17.6122L11.7383 20.2822H23.5407Z" fill="url(#paint0_linear_30_3764)" />
                                    <path d="M29.3499 30.3425L35.2141 20.2841L23.4761 0.162109H11.7383L29.3499 30.3425Z" fill="#FF414C" />
                                    <path d="M5.86891 10.2178H17.6069L5.87378 30.3397L0 20.2811L5.86891 10.2178Z" fill="#FF414C" />
                                    <path d="M60.1657 9.76883L59.8706 12.9221C58.6058 10.4742 55.6965 9.14648 52.5765 9.14648C46.7161 9.14648 42.7949 13.337 42.7949 19.7679C42.7949 26.1573 46.3366 30.8042 52.5343 30.8042C55.9074 30.8042 58.3949 29.1862 59.702 27.0701L60.0392 30.2649H64.8457V9.76883H60.1657ZM59.6176 20.0168C59.6176 23.7094 57.2987 26.2403 53.715 26.2403C50.1312 26.2403 47.9388 23.6678 47.9388 20.0168C47.9388 16.3657 50.1733 13.7519 53.7571 13.7519C57.3408 13.7519 59.6176 16.3242 59.6176 20.0168Z" fill="white" />
                                    <path d="M73.5977 30.2649V24.7466L76.6333 21.635L82.0723 30.2649H87.9749L80.2171 17.9008L88.1436 9.76886H81.6928L73.5977 18.3572V0H68.4961V30.2649H73.5977Z" fill="white" />
                                    <path d="M105.248 9.76883L104.953 12.9221C103.688 10.4742 100.779 9.14648 97.6585 9.14648C91.7981 9.14648 87.877 13.337 87.877 19.7679C87.877 26.1573 91.4186 30.8042 97.6164 30.8042C100.989 30.8042 103.477 29.1862 104.784 27.0701L105.121 30.2649H109.928V9.76883H105.248ZM104.7 20.0168C104.7 23.7094 102.381 26.2403 98.797 26.2403C95.2131 26.2403 93.0206 23.6678 93.0206 20.0168C93.0206 16.3657 95.2553 13.7519 98.8391 13.7519C102.423 13.7519 104.7 16.3242 104.7 20.0168Z" fill="white" />
                                    <path d="M112.531 24.0414C112.531 28.0658 115.82 30.8042 121.006 30.8042C126.15 30.8042 129.733 28.2319 129.733 24.0828C129.733 20.9297 127.963 19.3531 124.463 18.5647L120.711 17.6934C118.94 17.2785 118.012 16.5317 118.012 15.37C118.012 13.8348 119.193 12.9221 121.217 12.9221C123.198 12.9221 124.379 14.0423 124.421 15.7849H129.312C129.27 11.8018 126.107 9.14648 121.427 9.14648C116.621 9.14648 113.164 11.5529 113.164 15.5774C113.164 18.855 114.977 20.5977 118.729 21.4275L122.482 22.2988C124.337 22.7137 124.885 23.4605 124.885 24.4977C124.885 25.9914 123.578 26.9457 121.174 26.9457C118.813 26.9457 117.464 25.8253 117.422 24.0414H112.531Z" fill="white" />
                                    <path d="M137.742 30.2649V19.0626C137.742 15.9923 139.639 13.7519 142.885 13.7519C145.499 13.7519 147.228 15.4115 147.228 18.8551V30.2649H152.372V17.6519C152.372 12.3412 149.673 9.14651 144.53 9.14651C141.536 9.14651 139.091 10.4327 137.784 12.4242V0H132.598V30.2649H137.742Z" fill="white" />
                                    <path d="M157.482 20.2867C157.482 26.6055 161.329 30.8042 166.995 30.8042C171.545 30.8042 175.102 28.1021 176.052 23.9866H173.157C172.371 26.5639 169.972 28.2269 166.995 28.2269C162.942 28.2269 160.295 25.0259 160.295 20.2453C160.295 15.2982 163.148 12.1804 167.201 12.1804C169.972 12.1804 172.371 13.7185 173.116 16.5038H175.969C175.184 12.3467 171.793 9.64453 167.16 9.64453C161.329 9.64453 157.482 13.9679 157.482 20.2867Z" fill="#A3A3A3" />
                                    <path d="M178.143 20.2453C178.143 26.3561 182.444 30.8042 188.317 30.8042C194.19 30.8042 198.49 26.3561 198.49 20.2453C198.49 14.0926 194.19 9.64453 188.317 9.64453C182.444 9.64453 178.143 14.0926 178.143 20.2453ZM181.037 20.2037C181.037 15.5476 184.016 12.2219 188.317 12.2219C192.576 12.2219 195.596 15.5476 195.596 20.2037C195.596 24.9427 192.576 28.2269 188.317 28.2269C184.016 28.2269 181.037 24.9427 181.037 20.2037Z" fill="#A3A3A3" />
                                    <path d="M205.082 30.3054V19.7878C205.082 15.2566 207.398 12.2635 211.491 12.2635C214.799 12.2635 216.91 13.9264 216.91 18.6239V30.3054H219.764V18.0004C219.764 12.9287 217.489 9.64453 211.987 9.64453C209.092 9.64453 206.446 11.0995 205.123 13.6769L204.709 10.185H202.227V30.3054H205.082Z" fill="#A3A3A3" />
                                    <path d="M222.686 24.6517C222.686 28.3931 225.498 30.8042 230.005 30.8042C234.555 30.8042 237.616 28.4347 237.616 24.8181C237.616 21.9081 236.044 20.2867 232.569 19.4138L229.137 18.5408C226.946 18.0004 225.869 16.9194 225.869 15.3814C225.869 13.2197 227.441 12.0141 230.253 12.0141C232.942 12.0141 234.555 13.3859 234.637 15.7139H237.408C237.285 11.9725 234.555 9.64453 230.337 9.64453C226.035 9.64453 223.1 11.8894 223.1 15.4229C223.1 18.1666 224.794 19.9958 228.269 20.8688L231.701 21.7417C234.059 22.3237 234.885 23.2799 234.885 24.9427C234.885 27.1044 233.066 28.4347 229.964 28.4347C227.152 28.4347 225.416 26.9797 225.416 24.6517H222.686Z" fill="#A3A3A3" />
                                    <path d="M240.08 20.2453C240.08 26.3561 244.382 30.8042 250.253 30.8042C256.126 30.8042 260.428 26.3561 260.428 20.2453C260.428 14.0926 256.126 9.64453 250.253 9.64453C244.382 9.64453 240.08 14.0926 240.08 20.2453ZM242.975 20.2037C242.975 15.5476 245.953 12.2219 250.253 12.2219C254.514 12.2219 257.533 15.5476 257.533 20.2037C257.533 24.9427 254.514 28.2269 250.253 28.2269C245.953 28.2269 242.975 24.9427 242.975 20.2037Z" fill="#A3A3A3" />
                                    <path d="M267.143 30.3053V0H264.289V30.3053H267.143Z" fill="#A3A3A3" />
                                    <path d="M280.78 30.8042C285.494 30.8042 288.596 28.5178 289.671 24.2776H286.942C286.198 26.9381 284.089 28.3515 280.821 28.3515C276.519 28.3515 273.955 25.5247 273.75 20.6193H289.671V19.2059C289.671 13.5107 285.991 9.64453 280.573 9.64453C274.866 9.64453 270.979 13.9679 270.979 20.2453C270.979 26.5639 274.907 30.8042 280.78 30.8042ZM280.573 12.0972C284.337 12.0972 286.817 14.6746 286.817 18.5408H273.832C274.328 14.5915 276.809 12.0972 280.573 12.0972Z" fill="#A3A3A3" />
                                    <defs>
                                        <linearGradient id="paint0_linear_30_3764" x1="20.542" y1="27.7896" x2="27.2771" y2="20.1123" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="#FF414C" />
                                            <stop offset="1" stop-color="#FF414C" stop-opacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>


                                <p className="text-lg text-white">
                                    The fastest way to deploy apps on Akash
                                </p>
                            </div>

                            {/* Console features */}
                            <div className="flex flex-col gap-6">
                                {consoleFeatures.map((item, i) => (
                                    <div key={i} className="flex items-start gap-5">
                                        <div className="flex h-10 w-10 shrink-0 bg-background items-center justify-center rounded-lg border border-[#e5e5e5]">
                                            <item.icon className="h-5 w-5 text-[#232323] dark:text-white" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-base font-semibold text-[#fafafa]">
                                                {item.title}
                                            </h4>
                                            <p className="text-base text-[#e5e5e5]">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div></div>
                    </div>
                </div>
            </div>
        </section>
        <QuoteSection />
        <SocialChannelsSection />
        </>
    );
}
