import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import {
  communityItems,
  developmentItems,
  ecosystemNavItems,
  networkItems,
} from "./popovers/links";

type MenuId = "network" | "community" | "development" | "ecosystem";

const MENU_ORDER: MenuId[] = [
  "development",
  "ecosystem",
  "community",
  "network",
];

type FeaturedItemData = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
};

const featuredItems: Record<MenuId, FeaturedItemData> = {
  development: {
    href: "/development/welcome/",
    title: "Developer Portal",
    description: "Homebase for building on Akash.",
    imageSrc: "/nav/development_featured.webp",
  },
  ecosystem: {
    href: "/ecosystem/akash-tools/",
    title: "Product Suite",
    description: "Tools to deploy, serve & provide compute.",
    imageSrc: "/nav/ecosystem_featured.webp",
  },
  community: {
    href: "/community/welcome/",
    title: "Join the Movement",
    description: "Help us build the People's Supercloud.",
    imageSrc: "/nav/community_featured.webp",
  },
  network: {
    href: "/about/general-information/",
    title: "About Akash",
    description: "The story and tech of the Supercloud.",
    imageSrc: "/nav/network_featured.webp",
  },
};

// Animated +/- toggle icon
function ToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative ml-1.5 inline-flex h-3 w-3 shrink-0 items-center justify-center">
      <span className="absolute h-px w-2.5 rounded-full bg-current transition-all duration-200" />
      <span
        className={clsx(
          "absolute h-2.5 w-px rounded-full bg-current transition-all duration-200 origin-center",
          isOpen ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100",
        )}
      />
    </span>
  );
}

function DropdownItem({
  href,
  target,
  title,
  description,
  isActive = false,
}: {
  href: string;
  target: string;
  title: string;
  description?: string;
  isActive?: boolean;
}) {
  return (
    <a
      href={href}
      target={target}
      className={clsx(
        "group flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2.5 outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-white/5",
        isActive && "bg-zinc-200 dark:bg-white/10",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className={clsx("text-sm text-foreground", isActive ? "font-medium" : "font-normal")}>{title}</p>
        {description && (
          <p className="whitespace-nowrap text-xs font-normal text-zinc-400 dark:text-zinc-500">
            {description}
          </p>
        )}
      </div>
      <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function DropdownFooterItem({
  href,
  target,
  title,
}: {
  href: string;
  target: string;
  title: string;
}) {
  return (
    <a
      href={href}
      target={target}
      className="group flex cursor-pointer items-center justify-between border-t border-zinc-200 dark:border-white/10 px-5 py-3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
    >
      <p className="text-sm font-normal text-foreground">{title}</p>
      <ChevronRight className="h-4 w-4 shrink-0 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function FeaturedCard({ featured }: { featured: FeaturedItemData }) {
  return (
    <a
      href={featured.href}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-sm border border-zinc-200 dark:border-white/10 transition-colors hover:border-zinc-300 dark:hover:border-white/20"
    >
      {/* Image background */}
      <img
        src={featured.imageSrc}
        alt={featured.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay — bottom fade for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Bottom content */}
      <div className="relative mt-auto flex items-end justify-between p-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold leading-tight text-white">
            {featured.title}
          </p>
          <p className="text-xs font-normal leading-tight text-white/70">
            {featured.description}
          </p>
        </div>
        <ChevronRight className="mb-0.5 h-4 w-4 shrink-0 translate-x-1 text-white opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </a>
  );
}

export default function NavMenu({
  latestRoadmapYear,
  pathname,
}: {
  latestRoadmapYear: number;
  pathname: string;
}) {
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [contentKey, setContentKey] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);
  const prevMenuRef = useRef<MenuId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (menu: MenuId) => {
    cancelClose();

    if (prevMenuRef.current && prevMenuRef.current !== menu) {
      const prevIdx = MENU_ORDER.indexOf(prevMenuRef.current);
      const nextIdx = MENU_ORDER.indexOf(menu);
      setSlideDir(nextIdx > prevIdx ? "right" : "left");
      setContentKey((k) => k + 1);
    }
    prevMenuRef.current = menu;
    setActiveMenu(menu);

    // Always center the panel under the viewport center
    const container = containerRef.current;
    if (container) {
      const cRect = container.getBoundingClientRect();
      setPanelLeft(window.innerWidth / 2 - cRect.left);
    }
  };

  const isCurrentPath = (menu: MenuId) => {
    if (pathname === "/") return false;
    const paths: Record<MenuId, string[]> = {
      network: ["/about", "/token"],
      community: ["/community"],
      development: ["/development", "/roadmap"],
      ecosystem: ["/ecosystem", "/case-studies"],
    };
    return paths[menu].some((p) => pathname.startsWith(p));
  };

  const communityExternal = communityItems.find((i) => i.external);
  const developmentExternal = developmentItems.find((i) => i.external);

  function renderMainItems(menu: MenuId) {
    const featured = featuredItems[menu];

    switch (menu) {
      case "network":
        return networkItems
          .filter((item) => item.link !== featured.href)
          .map((item) => (
            <DropdownItem
              key={item.link}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : "_self"}
              title={item.title}
              description={item.description}
            />
          ));

      case "community":
        return communityItems
          .filter((i) => !i.external && i.link !== featured.href)
          .map((item) => (
            <DropdownItem
              key={item.link}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : "_self"}
              title={item.title}
              description={item.description}
            />
          ));

      case "development":
        return developmentItems
          .filter((i) => !i.external && i.link !== featured.href)
          .map((item) => (
            <DropdownItem
              key={item.link}
              href={
                item.link === "roadmap"
                  ? `/roadmap/${latestRoadmapYear}`
                  : item.link
              }
              target={item.link.startsWith("http") ? "_blank" : "_self"}
              title={item.title}
              description={item.description}
            />
          ));

      case "ecosystem":
        return ecosystemNavItems
          .filter((i) => !i.external && !i.internal && i.link !== featured.href)
          .map((item) => {
            const base = item.link.replace(/\/$/, "");
            const isActive =
              pathname === item.link ||
              pathname.startsWith(base + "/") ||
              (item.link === "/ecosystem/providers/" &&
                pathname.startsWith("/ecosystem/network-capacity"));
            return (
              <DropdownItem
                key={item.link}
                href={item.link}
                target={item.link.startsWith("http") ? "_blank" : "_self"}
                title={item.title}
                description={item.description}
                isActive={isActive}
              />
            );
          });
    }
  }

  function renderFooter(menu: MenuId) {
    switch (menu) {
      case "network":
        return null;
      case "community":
        return communityExternal ? (
          <DropdownFooterItem
            href={communityExternal.link}
            target={
              communityExternal.link.startsWith("http") ? "_blank" : "_self"
            }
            title={communityExternal.title ?? ""}
          />
        ) : null;
      case "development":
        return developmentExternal ? (
          <DropdownFooterItem
            href={developmentExternal.link}
            target={
              developmentExternal.link.startsWith("http") ? "_blank" : "_self"
            }
            title={developmentExternal.title ?? ""}
          />
        ) : null;
      case "ecosystem":
        return null;
    }
  }

  const triggerLabels: Record<MenuId, string> = {
    network: "Network",
    community: "Community",
    development: "Development",
    ecosystem: "Ecosystem",
  };

  const triggerHrefs: Record<MenuId, string> = {
    network: networkItems[0].link,
    community: communityItems[0].link,
    development: developmentItems[0].link,
    ecosystem: ecosystemNavItems[0].link,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full items-center gap-x-[20px] xl:gap-x-[24px]"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      {MENU_ORDER.map((menu) => (
        <a
          key={menu}
          href={triggerHrefs[menu]}
          onMouseEnter={() => openMenu(menu)}
          className={clsx(
            "group inline-flex cursor-pointer items-center justify-center text-[13.4px] leading-[18.6px] font-normal transition-colors",
            isCurrentPath(menu)
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
          )}
        >
          {triggerLabels[menu]}
          <ToggleIcon isOpen={activeMenu === menu} />
        </a>
      ))}

      {/* Single shared dropdown panel */}
      {activeMenu && (
        <div
          className="absolute top-full z-[35] pt-3"
          style={{ left: `${panelLeft}px`, transform: "translateX(-50%)" }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div
            className="rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d0d0f] shadow-xl overflow-hidden"
            style={{
              width: activeMenu === "development" ? "900px" : "660px",
              transition: "width 0.45s cubic-bezier(0.34, 1.3, 0.64, 1)",
            }}
          >
            <div
              key={`${activeMenu}-${contentKey}`}
              className="overflow-hidden rounded-md"
              style={{
                animation: `${slideDir === "right" ? "navSlideFromRight" : "navSlideFromLeft"} 0.22s ease-out both`,
              }}
            >
              {activeMenu === "development" ? (
                /* 3-column development layout */
                <div className="flex items-stretch">
                  {/* Col 1: featured card */}
                  <div className="w-[300px] shrink-0 p-2 flex flex-col">
                    <FeaturedCard featured={featuredItems.development} />
                  </div>
                  {/* Col 2: Roadmap, Integrations, Engineering Syncs */}
                  <div className="flex-1 border-l border-zinc-100 dark:border-white/5 p-2">
                    {developmentItems
                      .filter(i => i.link !== featuredItems.development.href)
                      .slice(0, 3)
                      .map((item) => (
                        <DropdownItem
                          key={item.link}
                          href={item.link === "roadmap" ? `/roadmap/${latestRoadmapYear}` : item.link}
                          target={item.link.startsWith("http") ? "_blank" : "_self"}
                          title={item.title}
                          description={item.description}
                        />
                      ))}
                  </div>
                  {/* Col 3: Startups, Universities, Grants */}
                  <div className="flex-1 border-l border-zinc-100 dark:border-white/5 p-2">
                    {developmentItems
                      .filter(i => i.link !== featuredItems.development.href)
                      .slice(3)
                      .map((item) => (
                        <DropdownItem
                          key={item.link}
                          href={item.link}
                          target={item.link.startsWith("http") ? "_blank" : "_self"}
                          title={item.title}
                          description={item.description}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                /* Standard 2-column layout for other menus */
                <div className="flex items-stretch">
                  <div className="w-1/2 p-2 flex flex-col">
                    <FeaturedCard featured={featuredItems[activeMenu]} />
                  </div>
                  <div className="w-1/2 p-2">
                    {renderMainItems(activeMenu)}
                  </div>
                </div>
              )}

              {/* Footer spans full width */}
              {renderFooter(activeMenu)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
