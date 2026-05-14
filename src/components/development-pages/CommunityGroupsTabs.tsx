import { useState, useEffect } from "react";

type GroupItem = {
  slug: string;
  category: string;
  title: string;
  description: string;
  dateLabel?: string;
  meetingsLinkLabel?: string;
  meetingsLink?: string;
  githubLink?: string;
  discordLink?: string;
};

type Props = {
  groups: GroupItem[];
};

const TABS = [
  { label: "Special Interest Groups", value: "special-interest-groups" },
  { label: "Working Groups", value: "working-groups" },
  { label: "Steering Committee", value: "steering-committee" },
] as const;

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GroupCard({ item }: { item: GroupItem }) {
  const tag = item.slug.split("/")[0];
  const href = `/current-groups/${tag}/`;

  return (
    <div className="not-prose group flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">

      {/* Main content area */}
      <div className="flex flex-1 flex-col p-5">

        {/* Top row: badge + icon buttons */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-[3px] text-sm font-normal text-foreground">
            {tag}
          </span>
          <div className="flex shrink-0 gap-1">
            {item.githubLink && (
              <a
                href={item.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <GithubIcon />
              </a>
            )}
            {item.discordLink && (
              <a
                href={item.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on Discord"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <DiscordIcon />
              </a>
            )}
          </div>
        </div>

        {/* Title + description — grows to push button down */}
        <div className="mt-3 flex flex-1 flex-col">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm font-normal leading-relaxed text-para">
            {item.description}
          </p>
        </div>

        {/* View Group Details — always pinned above the darker section */}
        <a
          href={href}
          className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50 dark:bg-transparent dark:hover:bg-badgeColor"
        >
          View Group Details
          <ChevronRight />
        </a>
      </div>

      {/* Schedule section — darker, full-width, edge-to-edge */}
      <div className="border-t border-border bg-neutral-200/70 px-5 pb-5 pt-4 dark:bg-[hsl(0,0%,6%)]">
        <div className="space-y-3">

          {/* Schedule line — all muted, wraps left-aligned; min-h keeps cards aligned */}
          <p className="min-h-[2.5rem] text-xs text-para">
            <span className="font-medium">Schedule: </span>
            {item.dateLabel}
            {item.meetingsLinkLabel && (
              <> · {item.meetingsLinkLabel}</>
            )}
          </p>

          {/* Add to Calendar */}
          {item.meetingsLink && (
            <a
              href={item.meetingsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-neutral-200/70 px-3 text-xs font-medium text-foreground transition-colors hover:bg-neutral-300/70 dark:bg-[hsl(0,0%,6%)] dark:hover:bg-[hsl(0,0%,9%)]"
            >
              <CalendarIcon />
              Add to Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityGroupsTabs({ groups }: Props) {
  const validValues = TABS.map((t) => t.value);
  const hashTab = typeof window !== "undefined"
    ? window.location.hash.replace("#", "")
    : "";
  const initialTab = validValues.includes(hashTab as (typeof TABS)[number]["value"])
    ? (hashTab as (typeof TABS)[number]["value"])
    : "special-interest-groups";

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["value"]>(initialTab);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "") as (typeof TABS)[number]["value"];
      if (validValues.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const filtered = groups.filter((g) => g.category === activeTab);

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-gray-100 p-1.5 dark:bg-background2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-gray-500 hover:text-foreground dark:text-gray-400 dark:hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {filtered.map((item) => (
          <GroupCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
