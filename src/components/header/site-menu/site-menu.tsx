import { BASE_API_URL, socialLinks } from "@/lib/constants";
import { isExternalHref } from "@/lib/provider-options";
import { cn } from "@/lib/utils";
import { gpus } from "@/utils/api";
import { ArrowUpRight, ChevronRight, Grip, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { BecomeProviderDialog } from "@/components/ecosystem-pages/providers-page/BecomeProviderDialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DiscordIcon, GithubIcon, TwitterIcon, YoutubeIcon } from "../icons";
import { pickH100, type SiteMenuData } from "./menu-data";
import SpinningGlobe from "./spinning-globe";
import ThemeToggleGroup from "./theme-toggle-group";

const PRODUCT_TILES = [
  {
    key: "deploy",
    title: "Deploy on Console",
    description: "Run any container from a template or your own SDL.",
    href: "https://console.akash.network",
    image: "/images/site-menu/deploy-now.png",
    logo: (
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/images/site-menu/logos/akash-logo.svg"
          alt=""
          className="h-5 w-[22px]"
        />
      </div>
    ),
  },
  {
    key: "inference",
    title: "Run AI inference",
    description: "Drop-in OpenAI-compatible API for open-source models.",
    href: "https://playground.akashml.com",
    image: "/images/site-menu/run-ai-inference.png",
    logo: (
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/images/site-menu/logos/run-ai-inference-logo.svg"
          alt=""
          className="h-[17px] w-7"
        />
      </div>
    ),
  },
];

const PROVIDE_COMPUTE_TILE = {
  title: "Provide compute",
  description: "Offer a single GPU or a full data center to the network.",
  image: "/images/site-menu/provide-compute.png",
  logo: (
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src="/images/site-menu/logos/akash-logo.svg"
        alt=""
        className="h-5 w-[22px]"
      />
    </div>
  ),
};

const DEVELOPER_RESOURCES = [
  { key: "docs", label: "Documentation", href: "/docs/" },
  {
    key: "quick-start",
    label: "Quick start",
    href: "/docs/getting-started/quick-start/",
  },
  {
    key: "console-api",
    label: "Console API",
    href: "/docs/api-documentation/console-api/",
  },
  {
    key: "templates",
    label: "Deployment templates",
    href: "https://github.com/akash-network/awesome-akash",
  },
];

const SOCIAL_LINKS = [
  {
    key: "twitter",
    label: "Twitter",
    href: socialLinks.twitter,
    Icon: TwitterIcon,
  },
  {
    key: "github",
    label: "GitHub",
    href: socialLinks.github,
    Icon: GithubIcon,
  },
  {
    key: "discord",
    label: "Discord",
    href: socialLinks.discord,
    Icon: DiscordIcon,
  },
  {
    key: "youtube",
    label: "YouTube",
    href: socialLinks.youtube,
    Icon: YoutubeIcon,
  },
];

// shadcn's Item pattern (muted variant): 8px corners like the site's Card,
// 56px media, medium-weight title, trailing action, visible focus ring; all
// top-aligned so the thumbnail lines up with the title.
const TILE_CLASSNAME =
  "group flex items-start gap-3 rounded-lg bg-card p-3 text-left outline-none transition-colors hover:bg-accent hover:no-underline focus-visible:ring-2 focus-visible:ring-foreground/20";

// Matches the nav dropdown items: text-sm at normal weight, chevron on hover.
const ROW_CLASSNAME =
  "group -mx-2 flex h-8 items-center gap-2 rounded-md px-2 text-sm font-normal text-foreground outline-none transition-colors hover:bg-accent hover:no-underline focus-visible:bg-accent";

// Hover outlines instead of tinting: the globe's glow is matched to bg-card, so
// a background change would leave a pale disc around it.
const NETWORK_TILE_CLASSNAME =
  "group relative flex aspect-square flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg bg-card p-3 text-center ring-inset ring-zinc-300 transition-shadow hover:no-underline hover:ring-1 focus-visible:outline-none focus-visible:ring-2 dark:ring-white/20";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const NetworkTileArrow = () => (
  <ChevronRight className="absolute right-2 top-2 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
);

const StatusLine = ({
  live,
  children,
}: {
  live: boolean;
  children: string;
}) => (
  <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-foreground">
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        live ? "bg-green-500" : "bg-muted-foreground",
      )}
    />
    {children}
  </div>
);

const TileArrow = () => (
  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground" />
);

const TileBody = ({
  image,
  logo,
  title,
  description,
}: {
  image: string;
  logo: ReactNode;
  title: string;
  description: string;
}) => (
  <>
    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-background">
      <img
        src={image}
        alt=""
        width={56}
        height={56}
        className="absolute inset-0 size-full scale-110 object-cover"
      />
      {logo}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="text-sm font-medium leading-snug text-foreground">
        {title}
      </p>
      <p className="text-xs leading-normal text-muted-foreground">
        {description}
      </p>
    </div>
    <TileArrow />
  </>
);

export default function SiteMenu({
  data,
  hideDarkToggle,
}: {
  data: SiteMenuData;
  hideDarkToggle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [provideComputeOpen, setProvideComputeOpen] = useState(false);
  const [providerCount, setProviderCount] = useState(data.activeProviderCount);
  const [h100, setH100] = useState(data.h100);

  // The build-time figures are the fallback; refresh them each time the menu
  // opens from the same endpoints the providers and pricing pages poll.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const getJson = (url: string) =>
      fetch(url, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);

    getJson(`${BASE_API_URL}/v1/network-capacity`).then((capacity) => {
      if (typeof capacity?.activeProviderCount === "number") {
        setProviderCount(capacity.activeProviderCount);
      }
    });
    getJson(gpus).then((prices) => {
      const live = prices && pickH100(prices);
      if (live) setH100(live);
    });
    return () => controller.abort();
  }, [open]);

  const providerLabel =
    providerCount === null
      ? "Provider status unavailable"
      : `${providerCount} active providers`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex size-[30px] items-center justify-center rounded-md text-foreground transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 dark:hover:bg-zinc-800"
        >
          <Grip className="size-4" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        hideCloseButton
        className="flex w-[336px] max-w-[90vw] flex-col gap-0 border-zinc-200 p-0 dark:border-white/10 sm:max-w-[336px]"
        aria-describedby={undefined}
      >
        <div className="flex shrink-0 items-center justify-between p-6 pb-0">
          <SheetTitle className="text-sm font-medium text-muted-foreground">
            Get started
          </SheetTitle>
          <SheetClose className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 dark:border-white/10">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="flex flex-col gap-3">
            {PRODUCT_TILES.map((tile) => (
              <a
                key={tile.key}
                href={tile.href}
                target="_blank"
                rel="noreferrer"
                className={TILE_CLASSNAME}
              >
                <TileBody
                  image={tile.image}
                  logo={tile.logo}
                  title={tile.title}
                  description={tile.description}
                />
              </a>
            ))}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setProvideComputeOpen(true);
              }}
              className={TILE_CLASSNAME}
            >
              <TileBody {...PROVIDE_COMPUTE_TILE} />
            </button>
          </div>

          <div className="mt-auto flex flex-col divide-y divide-zinc-200 pt-6 dark:divide-white/10">
            <section className="flex flex-col gap-2 pb-4">
              <p className="text-xs font-medium text-muted-foreground">
                Developer resources
              </p>
              <div className="flex flex-col">
                {DEVELOPER_RESOURCES.map((resource) => {
                  const external = isExternalHref(resource.href);
                  const Arrow = external ? ArrowUpRight : ChevronRight;
                  return (
                    <a
                      key={resource.key}
                      href={resource.href}
                      {...(external && { target: "_blank", rel: "noreferrer" })}
                      className={ROW_CLASSNAME}
                    >
                      <span className="flex-1">{resource.label}</span>
                      <Arrow className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </section>

            <section className="flex items-start gap-4 py-4">
              <a href="/ecosystem/providers" className={NETWORK_TILE_CLASSNAME}>
                <NetworkTileArrow />
                <SpinningGlobe markers={data.markers} className="size-[88px]" />
                <StatusLine live={providerCount !== null}>
                  {providerLabel}
                </StatusLine>
              </a>
              <a href="/pricing/gpus" className={NETWORK_TILE_CLASSNAME}>
                <NetworkTileArrow />
                {/* Same 88px box as the globe so both status lines align. */}
                <div className="flex h-[88px] flex-col items-center justify-center gap-1">
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {h100 ? "H100 from" : "GPU pricing"}
                  </p>
                  <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                    {h100 ? usd.format(h100.hourly) : "Live rates"}
                    {h100 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        /hr
                      </span>
                    )}
                  </p>
                </div>
                <StatusLine live={h100 !== null}>
                  {h100 ? `${h100.available} available` : "See all GPUs"}
                </StatusLine>
              </a>
            </section>

            <section className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                {SOCIAL_LINKS.map(({ key, label, href, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Akash Network ${label}`}
                    className="text-foreground transition-colors hover:text-muted-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
              {!hideDarkToggle && <ThemeToggleGroup />}
            </section>
          </div>
        </div>
      </SheetContent>

      <BecomeProviderDialog
        open={provideComputeOpen}
        onOpenChange={setProvideComputeOpen}
      />
    </Sheet>
  );
}
