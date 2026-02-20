import {
  DiscordIcon,
  GithubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  TwitterIcon,
  YoutubeIcon,
  RedditIcon,
  ChevronRightIcon,
} from "../header/icons";

const socialChannels = [
    { name: "Discord", icon: DiscordIcon, href: "https://discord.com/invite/akash" },
    { name: "Github", icon: GithubIcon, href: "https://github.com/akash-network" },
    { name: "X", icon: TwitterIcon, href: "https://x.com/akashnet" },
    { name: "LinkedIn", icon: LinkedInIcon, href: "https://www.linkedin.com/company/akash-network/" },
    { name: "Youtube", icon: YoutubeIcon, href: "https://www.youtube.com/c/AkashNetwork" },
    { name: "Telegram", icon: TelegramIcon, href: "https://t.me/AkashNW" },
    // { name: "Zealy", icon: ZealyIcon, href: "https://zealy.io/c/akashnetwork" },
    { name: "Reddit", icon: RedditIcon, href: "https://www.reddit.com/r/AkashNetwork/" },
];

export function SocialChannelsSection() {
    return (
        <section className="border-y border-[#e5e5e5] dark:border-defaultBorder px-6 py-16 md:px-10 md:py-[120px] lg:px-[240px]">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-10 lg:flex-row lg:gap-20">
                {/* Left: Title */}
                <div className="flex flex-col gap-3 lg:w-1/2">
                    <h2 className="text-3xl font-semibold text-[#111827] dark:text-foreground md:text-[40px] md:leading-[1.2]">
                        Explore Social Channels
                    </h2>
                    <p className="text-sm leading-5 text-[#71717a]">
                        Be part of the Akash Network community. Connect, contribute, and collaborate to shape the future of decentralized cloud computing.
                    </p>
                </div>

                {/* Right: Channel Cards */}
                <div className="flex flex-col gap-6 lg:w-1/2">
                    {socialChannels.map((channel, i) => (
                        <a
                            key={i}
                            href={channel.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-[#e4e4e7] dark:border-defaultBorder px-5 py-6 transition-colors hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3">

                                <channel.icon className="h-8 w-8" />

                                <span className="text-base font-medium ">
                                    {channel.name}
                                </span>
                            </div>
                            <ChevronRightIcon className="h-6 w-6 " />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}