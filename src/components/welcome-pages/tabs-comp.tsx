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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/radix-tabs";

type Card = {
  icon: string;
  title: string;
  description: string;
};

// Reusable component for the feature list items
const FeatureCard = ({ icon, title, description }: Card) => (
  <div className="flex items-start gap-4 rounded-xl bg-white p-4 md:p-6 pb-0 transition-colors hover:bg-gray-50">
    <div
      className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg border text-xl md:text-2xl`}
    >
      {icon}
    </div>
    <div>
      <h1 className="text-lg md:text-2xl font-semibold text-[#0a0a0a]">{title}</h1>
      <p className="text-sm md:text-base text-[#71717a] mt-1">{description}</p>
    </div>
  </div>
);

const AkashBuildPage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl bg-white px-4 pb-12 font-sans">
      {/* Header Section */}
      <div className="mb-12 flex flex-col items-center">
        <span className="mb-5 text-lg font-medium text-[#737373]">
          How do you want to build?
        </span>

        {/* Shadcn Tabs Component */}
        <Tabs defaultValue="club" className="flex w-full flex-col items-center">
          <TabsList className="grid h-auto w-full grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl md:rounded-full bg-[#f5f5f7] p-2">
            <TabsTrigger
              value="club"
              className="group flex items-center !justify-start gap-4 !rounded-full px-6 md:px-8 py-3 transition-all hover:bg-[#e8e8ed] duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:hover:bg-white"
            >
              <HeartHandshake className="h-6 w-6 md:h-8 md:w-8 transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-lg md:text-2xl transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]">Akash Club</div>
                <div className="text-sm md:text-base transition-colors text-[#86868b] group-data-[state=active]:text-darkGrayText">For Enthusiast</div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="insiders"
              className="group flex items-center !justify-start gap-4 !rounded-full px-6 md:px-8 py-3 transition-all hover:bg-[#e8e8ed] duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:hover:bg-white"
            >
              <BadgeCheck className="h-6 w-6 md:h-8 md:w-8 transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-lg md:text-2xl transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]">Akash Insiders</div>
                <div className="text-sm md:text-base transition-colors text-[#86868b] group-data-[state=active]:text-darkGrayText">For Experts</div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="developers"
              className="group flex items-center !justify-start gap-4 !rounded-full px-6 md:px-8 py-3 transition-all hover:bg-[#e8e8ed] duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:hover:bg-white"
            >
              <SearchCode className="h-6 w-6 md:h-8 md:w-8 transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-lg md:text-2xl transition-colors text-[#86868b] group-data-[state=active]:text-[#111111]">Developers</div>
                <div className="text-sm md:text-base transition-colors text-[#86868b] group-data-[state=active]:text-darkGrayText">For Builders</div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Area */}
          <TabsContent
            value="club"
            className="mt-12 md:mt-20 w-full duration-500 animate-in fade-in-50"
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left Column: Image & Button */}
              <div className="flex flex-col gap-7 ">
                <div className="relative aspect-[58/60] overflow-hidden rounded-2xl shadow-sm">
                  {/* Placeholder for the image from screenshot */}
                  <img
                    src="/images/welcome-page-image.png"
                    alt="People working together on laptops"
                    className="h-full w-full object-cover contrast-125 grayscale"
                  />
                </div>

                <button className="group mx-auto flex w-max items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-200 ">
                  <span className="text-sm">
                    Join the Club & Start Building
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-darkGrayText transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Right Column: Content */}
              <div className="flex flex-col gap-12">
                {/* Header Text */}
                <div className="space-y-4">
                  <span className="text-darkGrayText">
                    The Official Community Hub
                  </span>
                  <h2 className="max-w-[500px] text-3xl font-semibold text-gray-900 md:text-4xl">
                    Shape the Supercloud with Akash Club
                  </h2>
                  <p className="text-sm leading-relaxed text-darkGrayText md:text-base">
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
                    <p className="mt-1 text-darkGrayText">
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
                    <p className="mt-1 text-darkGrayText">
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
          <TabsContent value="insiders">
            <div className="p-12 text-center text-gray-400">
              Insiders content placeholder
            </div>
          </TabsContent>
          <TabsContent value="developers">
            <div className="p-12 text-center text-gray-400">
              Developers content placeholder
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AkashBuildPage;
