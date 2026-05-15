import { Github, Linkedin, Youtube } from "lucide-react";
import { DiscordIcon, TwitterIcon, TelegramIcon, RedditIcon } from "../header/icons";

const socialChannels = [
  {
    name: "Discord",
    href: "https://discord.com/invite/akash",
    renderIcon: () => <DiscordIcon className="h-4 w-4 shrink-0" />,
  },
  {
    name: "Github",
    href: "https://github.com/akash-network",
    renderIcon: () => <Github size={16} className="shrink-0" />,
  },
  {
    name: "X",
    href: "https://x.com/akashnet",
    renderIcon: () => <TwitterIcon className="h-4 w-4 shrink-0" />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/akash-network/",
    renderIcon: () => <Linkedin size={16} className="shrink-0" />,
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/c/AkashNetwork",
    renderIcon: () => <Youtube size={16} className="shrink-0" />,
  },
  {
    name: "Telegram",
    href: "https://t.me/AkashNW",
    renderIcon: () => <TelegramIcon className="h-4 w-4 shrink-0" />,
  },
  {
    name: "Reddit",
    href: "https://www.reddit.com/r/AkashNetwork/",
    renderIcon: () => <RedditIcon className="h-4 w-4 shrink-0" />,
  },
];

export function SocialChannelsSection() {
  return (
    <section className="border-y border-[#e5e5e5] dark:border-defaultBorder px-6 py-16 md:py-[120px]">
      <div className="mx-auto max-w-[1240px] space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-foreground md:text-[40px] md:leading-[1.2]">
            Explore Social Channels
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-para">
            Be part of the Akash Network community. Connect, contribute, and
            collaborate to shape the future of decentralized cloud computing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {socialChannels.map((channel, i) => (
            <a
              key={i}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-badgeColor"
            >
              {channel.renderIcon()}
              {channel.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
