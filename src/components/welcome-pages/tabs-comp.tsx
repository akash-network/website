import React from "react";
import {
  Heart,
  BadgeCheck,
  Search,
  ArrowUpRight,
  Calendar,
  Trophy,
  MessageSquare,
  Image as ImageIcon,
  Ticket,
  Gamepad2,
  HeartHandshake,
  SearchCode,
  Zap,
  Globe,
  Rocket,
  DollarSign,
  Cpu,
  Terminal,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/radix-tabs";

type Card = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

// Reusable component for the feature list items
const FeatureCard = ({ icon, title, description }: Card) => (
  <div className="flex items-start gap-4 rounded-xl bg-white p-6 pb-0 transition-colors hover:bg-gray-50">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-2xl`}
    >
      {icon}
    </div>
    <div>
      <h4 className="text-[20px] font-semibold text-gray-900">{title}</h4>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
);

const AkashBuildPage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl bg-white px-4 pb-12 font-sans">
      {/* Header Section */}
      <div className="mb-12 flex flex-col items-center">
        <span className="mb-4 text-lg font-medium text-gray-500">
          How do you want to build?
        </span>

        {/* Shadcn Tabs Component */}
        <Tabs defaultValue="club" className="flex w-full flex-col items-center">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-3 rounded-full bg-[#f5f5f7] p-2">
            <TabsTrigger
              value="club"
              className="flex items-center !justify-start gap-4 !rounded-full px-8 py-3 text-gray-500 shadow-black/60 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              <HeartHandshake className="h-8 w-8" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-2xl">Akash Club</div>
                <div className="text-[#86868b]">For Enthusiast</div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="insiders"
              className="flex items-center !justify-start gap-4 !rounded-full px-8 py-3 text-gray-500 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BadgeCheck className="h-8 w-8" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-2xl">Akash Insiders</div>
                <div className="text-[#86868b]">For Experts</div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="developers"
              className="flex items-center !justify-start gap-4 !rounded-full px-8 py-3 text-gray-500 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <SearchCode className="h-8 w-8" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-2xl">Developers</div>
                <div className="text-[#86868b]">For Builders</div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Area */}
          <TabsContent
            value="club"
            className="mt-16 w-full duration-500 animate-in fade-in-50"
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left Column: Image & Button */}
              <div className="flex flex-col gap-7 ">
                <div className="relative aspect-[58/60] overflow-hidden rounded-2xl bg-[#f5f5f5] shadow-sm">
                  {/* Placeholder for the image from screenshot */}
                  <img
                    src="/images/welcome-page/office.png"
                    alt="People working together on laptops"
                    className="h-full w-full object-cover contrast-125 grayscale"
                  />
                </div>

                <button className="group mx-auto flex w-max items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-200 ">
                  <span className="text-sm">
                    Join the Club & Start Building
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Right Column: Content */}
              <div className="flex flex-col gap-12">
                {/* Header Text */}
                <div className="space-y-4">
                  <span className="text-gray-500">
                    The Official Community Hub
                  </span>
                  <h2 className="max-w-[500px] text-3xl font-semibold text-gray-900 md:text-4xl">
                    Shape the Supercloud with Akash Club
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                    Akash Club is the official community hub where builders and
                    $AKT enthusiasts collaborate to drive the network forward.
                    Gain insider access to core development, earn rewards for
                    participation, and build with conviction alongside the
                    architects of the Supercloud.
                  </p>
                </div>

                {/* Section 1: Learn */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Learn: Weekly Sessions & Trivia
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Move beyond price speculation and master the fundamentals
                      of decentralized infrastructure.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                    <FeatureCard
                      icon="🗓️"
                      title="Deep Dives into Akash Progress:"
                      description="Join deep dives into the technical roadmap and future protocol upgrades."
                    />
                    <FeatureCard
                      icon="🏅"
                      title="AMAs with Core Team Members:"
                      description="Test your ecosystem knowledge in live challenges to win $AKT rewards."
                    />
                    <FeatureCard
                      icon="💭"
                      title="Workshops using Akash:"
                      description="Move from passive learning to active contribution by collaborating on real network projects."
                    />
                  </div>
                </div>

                {/* Section 2: Earn */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Earn: The Community Reward Stack
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Hear directly from the people building the protocol.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                    <FeatureCard
                      icon="🌠"
                      title="Akash Club NFT:"
                      description="Mint a unique annual collectible that serves as a permanent record of your journey and contributions to the roadmap."
                    />
                    <FeatureCard
                      icon="🎟️"
                      title="Monthly $AKT Raffle:"
                      description="Our raffle is merit-based. You earn entries by attending events and actively participating, never by purchasing."
                    />
                  </div>
                </div>

                {/* Section 3: Game Nights */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Club Game Nights & Trivia
                  </h3>
                  <div className="flex flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                    <FeatureCard
                      icon="🎮"
                      title="Network with our Community"
                      description="Visit our Akash Passage world hosted on Akash GPUs to meet others passionate about Akash."
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Placeholders for other tabs */}
          <TabsContent
            value="insiders"
            className="mt-16 w-full duration-500 animate-in fade-in-50"
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left Column: Content */}
              <div className="flex flex-col gap-12">
                {/* Header Text */}
                <div className="space-y-4">
                  <span className="text-gray-500">Step Into Leadership</span>
                  <h2 className="max-w-[500px] text-3xl font-semibold text-gray-900 md:text-4xl">
                    Step Into a Leadership Role as an Akash Insider
                  </h2>
                  <p className="text-sm font-semibold leading-relaxed text-gray-900 md:text-base">
                    Join a vetted group of community vanguards who solve
                    real-world problems and drive the growth of the Supercloud.
                  </p>
                  <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                    This is a high-impact, reward-heavy path for those ready to
                    commit to the mission of the open-source Supercloud.
                  </p>
                </div>

                {/* Section 1: Paths */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    The Three Paths of Contribution
                  </h3>
                  <div className="flex flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                    <FeatureCard
                      icon="👷"
                      title="Path 1: Technical Vanguard"
                      description="Solve UX issues, improve documentation, and close GitHub tickets to support core protocol development."
                    />
                    <FeatureCard
                      icon="📐"
                      title="Path 2: Content Architect"
                      description="Produce high-fidelity video tutorials, guides, and explainers that simplify the Supercloud for the world."
                    />
                    <FeatureCard
                      icon="📣"
                      title="Path 3: Community Advocate"
                      description="Lead social campaigns, host workshops, and manage community challenges to bring new builders into the ecosystem."
                    />
                  </div>
                </div>

                {/* Section 2: Perks */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Exclusive Insider Perks
                  </h3>
                  <div className="flex flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                    <FeatureCard
                      icon="🎯"
                      title="The Private Bounty Board"
                      description="Gain exclusive access to a monthly list of paid opportunities across multiple skill sets rewarded in $AKT."
                    />
                    <FeatureCard
                      icon="🃏"
                      title="Insider Poker Nights"
                      description="Network with core team members and fellow Insiders in monthly poker tournaments with $AKT prizes."
                    />
                    <FeatureCard
                      icon="✨"
                      title="The VIP Multiplier"
                      description="Receive automatic free entry into all monthly community raffles and gain early access to network features."
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Image & Button */}
              <div className="flex flex-col gap-7 ">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f5f5] shadow-sm">
                  <img
                    src="/images/welcome-page/cup.png"
                    alt="Coffee cup on a table"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button className="group mx-auto flex w-max items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-200 ">
                  <span className="text-sm">Apply to Insiders</span>
                  <ArrowUpRight className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="developers"
            className="mx-auto mt-16 w-full max-w-[1080px] animate-in fade-in-50"
          >
            <div className="flex flex-col items-center gap-12">
              {/* Header Section */}
              <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
                <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">
                  Power Your Applications with Decentralized Compute
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-500 md:text-base">
                  Akash Network provides high-performance GPU and CPU power for
                  the next generation of decentralized applications. Stop
                  overpaying for centralized cloud monopolies and start building
                  on the permissionless Supercloud.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <button className="group flex items-center gap-2 rounded-lg bg-[#111111] px-6 py-2 font-medium text-white transition-all hover:bg-black/80">
                    <span>Deploy Now on Console</span>
                    <ArrowUpRight className="h-4 w-4 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                  <button className="group flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-6 py-2 font-medium text-gray-900 transition-all hover:bg-gray-200">
                    <span>View Documentation</span>
                    <ArrowUpRight className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
                {/* Left Card: Light Features */}
                <div className="flex h-min flex-col gap-3 rounded border border-[#e5e5e5] pb-6">
                  <FeatureCard
                    icon="🦾"
                    title="High-Performance GPUs"
                    description="Access premier NVIDIA chips for AI training, rendering, and data processing at a fraction of the cost of legacy providers."
                  />
                  <FeatureCard
                    icon="⚡"
                    title="Deploy in Seconds"
                    description="Use the Akash Console or Command Line Interface to launch apps globally in a few clicks."
                  />
                  <FeatureCard
                    icon="🌐"
                    title="Provider Ecosystem"
                    description="Choose from a diverse network of infrastructure providers to find the exact hardware specs your application requires."
                  />
                </div>

                {/* Right Card: Dark Console Section */}
                <div
                  className="flex flex-col rounded-lg bg-[#232323] p-[72px] py-[88px] text-white"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px)",
                    backgroundSize: "32px 32px",
                  }}
                >
                  <div className="mb-8 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logos/akash-console.svg"
                        alt="Akash Console Logo"
                        className="h-8 w-auto"
                      />
                    </div>
                    <p className="mt-2 text-lg">
                      The fastest way to deploy apps on Akash
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    {/* Dark Feature Item 1 */}
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/90 text-2xl">
                        <Zap className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Generous Free Trial
                        </h4>
                        <p className="mt-1 text-gray-400">
                          $100 of cloud compute credits so you can test real
                          workloads.
                        </p>
                      </div>
                    </div>

                    {/* Dark Feature Item 2 */}
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/90 text-2xl">
                        <Rocket className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Optimized for AI/ML
                        </h4>
                        <p className="mt-1 text-sm text-gray-400">
                          Container native with a library of templates for
                          leading open source AI models and applications.
                        </p>
                      </div>
                    </div>

                    {/* Dark Feature Item 3 */}
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/90 text-2xl">
                        <DollarSign className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Cost Savings
                        </h4>
                        <p className="mt-1 text-sm text-gray-400">
                          The most competitive prices for GPUs on-demands,
                          anywhere on the internet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AkashBuildPage;
