import {
  DISPLAY_STORAGE_KEY,
  GHOST_PILL_CLASS,
  OUTLINE_BUTTON_CLASS,
  POSTS_GRID_CLASS,
  POSTS_PER_PAGE,
} from "@/components/blog/blogUi";
import SearchDialog from "@/components/blog/search-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Filter (topic and year checkboxes), sort and grid/list controls for the blog
// listings, built from shadcn/ui Popover, Checkbox and DropdownMenu. The
// listing pages stay static: while a filter or the oldest-first sort is
// active, the cards come from /partials/blog-cards/ and are filtered, sorted
// and paginated here. The state lives in the URL (?topic=…&year=…&sort=oldest);
// the layout choice is kept in localStorage.

export type BlogScope =
  | { kind: "all" }
  | { kind: "category"; slug: string }
  | { kind: "archived" };

interface Props {
  scope: BlogScope;
  topics: { slug: string; label: string }[];
  years: number[];
}

type Sort = "newest" | "oldest";
type Display = "grid" | "list";

interface Card {
  html: string;
  time: number;
  year: string;
  categories: string[];
  topics: string[];
  archived: boolean;
}

const splitList = (value?: string | null) =>
  (value ?? "").split(",").filter(Boolean);

let cardsRequest: Promise<Card[]> | undefined;

/** Fetches and parses the card fragment once per page load. */
function loadCards() {
  cardsRequest ??= fetch("/partials/blog-cards/")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const template = document.createElement("template");
      template.innerHTML = html;
      return [...template.content.querySelectorAll<HTMLElement>("[data-date]")]
        .filter((card) => card.parentNode === template.content)
        .map((card) => ({
          html: card.outerHTML,
          time: Date.parse(card.dataset.date ?? ""),
          year: card.dataset.year ?? "",
          categories: splitList(card.dataset.categories),
          topics: splitList(card.dataset.topics),
          archived: card.dataset.archived === "true",
        }));
    })
    .catch((error) => {
      cardsRequest = undefined;
      throw error;
    });
  return cardsRequest;
}

const toggle = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export default function BlogControls({ scope, topics, years }: Props) {
  const [ready, setReady] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("newest");
  const [display, setDisplay] = useState<Display>("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<HTMLElement | null>(null);

  // Initial state from the URL and the saved layout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicSlugs = new Set(topics.map((topic) => topic.slug));
    const yearValues = new Set(years.map(String));
    setSelectedTopics(
      splitList(params.get("topic")).filter((t) => topicSlugs.has(t)),
    );
    setSelectedYears(
      splitList(params.get("year")).filter((y) => yearValues.has(y)),
    );
    setSort(params.get("sort") === "oldest" ? "oldest" : "newest");
    try {
      if (localStorage.getItem(DISPLAY_STORAGE_KEY) === "list") {
        setDisplay("list");
      }
    } catch {}
    setResults(document.querySelector<HTMLElement>("[data-blog-results]"));
    setReady(true);
  }, []);

  const filterCount = selectedTopics.length + selectedYears.length;
  const active = filterCount > 0 || sort === "oldest";

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    const setParam = (key: string, values: string[]) =>
      values.length
        ? url.searchParams.set(key, values.join(","))
        : url.searchParams.delete(key);
    setParam("topic", selectedTopics);
    setParam("year", selectedYears);
    setParam("sort", sort === "oldest" ? ["oldest"] : []);
    window.history.replaceState(window.history.state, "", url);
  }, [ready, selectedTopics, selectedYears, sort]);

  // The layout applies to the static grid as well, and is remembered.
  useEffect(() => {
    if (!ready) return;
    document
      .querySelectorAll("[data-blog-posts]")
      .forEach((grid) => grid.setAttribute("data-display", display));
    try {
      localStorage.setItem(DISPLAY_STORAGE_KEY, display);
    } catch {}
  }, [ready, display]);

  // Hide the static grid while client results are shown; load the cards once.
  useEffect(() => {
    if (!results) return;
    results.toggleAttribute("data-client", active);
    if (!active || cards) return;
    let cancelled = false;
    setLoadFailed(false);
    loadCards().then(
      (loaded) => !cancelled && setCards(loaded),
      (error) => {
        console.error("Couldn't load the blog cards for filtering:", error);
        if (!cancelled) setLoadFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [results, active, cards, attempt]);

  const matches = useMemo(() => {
    if (!cards) return [];
    const inScope = (card: Card) =>
      scope.kind === "archived"
        ? card.archived
        : scope.kind === "category"
          ? card.categories.includes(scope.slug)
          : !card.archived;
    return cards
      .filter(
        (card) =>
          inScope(card) &&
          (selectedTopics.length === 0 ||
            selectedTopics.some((topic) => card.topics.includes(topic))) &&
          (selectedYears.length === 0 || selectedYears.includes(card.year)),
      )
      .sort((a, b) => (sort === "oldest" ? a.time - b.time : b.time - a.time));
  }, [cards, scope, selectedTopics, selectedYears, sort]);

  const lastPage = Math.max(1, Math.ceil(matches.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const pageCards = matches.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const goToPage = (next: number) => {
    setPage(next);
    results?.scrollIntoView({ block: "start" });
  };
  const clearFilters = () => {
    setSelectedTopics([]);
    setSelectedYears([]);
    setPage(1);
  };

  const clientTarget =
    results?.querySelector<HTMLElement>("[data-blog-client]");

  return (
    <div className="flex items-center gap-1">
      <SearchDialog />

      {(topics.length > 0 || years.length > 0) && (
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            className={cn(
              GHOST_PILL_CLASS,
              filterCount > 0 && "bg-neutral-100 dark:bg-neutral-800",
            )}
          >
            {filterCount === 0
              ? "Filter"
              : `${filterCount} ${filterCount === 1 ? "filter" : "filters"}`}
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            collisionPadding={16}
            className="flex max-h-[var(--radix-popover-content-available-height)] w-[min(calc(100vw-2rem),28rem)] flex-col bg-background2 p-0"
          >
            <div className="max-h-[min(65vh,30rem)] min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
              {topics.length > 0 && (
                <FilterGroup
                  legend="Topic"
                  className="grid-cols-1 sm:grid-cols-2"
                >
                  {topics.map((topic) => (
                    <FilterOption
                      key={topic.slug}
                      label={topic.label}
                      checked={selectedTopics.includes(topic.slug)}
                      onCheckedChange={() => {
                        setSelectedTopics((current) =>
                          toggle(current, topic.slug),
                        );
                        setPage(1);
                      }}
                    />
                  ))}
                </FilterGroup>
              )}
              {years.length > 0 && (
                <FilterGroup
                  legend="Year"
                  className="grid-cols-3 sm:grid-cols-4"
                >
                  {years.map((year) => (
                    <FilterOption
                      key={year}
                      label={String(year)}
                      checked={selectedYears.includes(String(year))}
                      onCheckedChange={() => {
                        setSelectedYears((current) =>
                          toggle(current, String(year)),
                        );
                        setPage(1);
                      }}
                    />
                  ))}
                </FilterGroup>
              )}
            </div>
            <div className="flex shrink-0 justify-end border-t p-2">
              <button
                type="button"
                className={GHOST_PILL_CLASS}
                onClick={() =>
                  filterCount > 0 ? clearFilters() : setFilterOpen(false)
                }
              >
                {filterCount > 0 ? "Clear all" : "Cancel"}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            GHOST_PILL_CLASS,
            sort === "oldest" && "bg-neutral-100 dark:bg-neutral-800",
          )}
        >
          Sort
          <ChevronDown className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          collisionPadding={16}
          className="min-w-[12rem] bg-background2"
        >
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => {
              setSort(value === "oldest" ? "oldest" : "newest");
              setPage(1);
            }}
          >
            <DropdownMenuRadioItem value="newest">
              Newest → Oldest
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">
              Oldest → Newest
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div role="group" aria-label="Layout" className="ml-1 flex items-center">
        <ViewButton
          label="Grid view"
          pressed={display === "grid"}
          onClick={() => setDisplay("grid")}
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
        </ViewButton>
        <ViewButton
          label="List view"
          pressed={display === "list"}
          onClick={() => setDisplay("list")}
        >
          <List className="size-4" aria-hidden="true" />
        </ViewButton>
      </div>

      {clientTarget &&
        active &&
        createPortal(
          loadFailed ? (
            <Notice>
              Couldn&apos;t load posts.
              <button
                type="button"
                className={OUTLINE_BUTTON_CLASS}
                onClick={() => setAttempt((n) => n + 1)}
              >
                Try again
              </button>
            </Notice>
          ) : !cards ? (
            <div role="status" className="flex justify-center py-16">
              <Loader2
                className="size-5 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">Loading posts</span>
            </div>
          ) : matches.length === 0 ? (
            <Notice>
              No posts match these filters.
              {filterCount > 0 && (
                <button
                  type="button"
                  className={OUTLINE_BUTTON_CLASS}
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </Notice>
          ) : (
            <>
              <div
                className={POSTS_GRID_CLASS}
                data-display={display}
                dangerouslySetInnerHTML={{
                  __html: pageCards.map((card) => card.html).join(""),
                }}
              />
              <nav
                aria-label="Pagination"
                className="mb-10 mt-[56px] flex items-center justify-between gap-4"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {lastPage}
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <button
                      type="button"
                      className={OUTLINE_BUTTON_CLASS}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                      Previous
                    </button>
                  )}
                  {currentPage < lastPage && (
                    <button
                      type="button"
                      className={OUTLINE_BUTTON_CLASS}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Next
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </nav>
            </>
          ),
          clientTarget,
        )}
    </div>
  );
}

function FilterGroup({
  legend,
  className,
  children,
}: {
  legend: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-muted-foreground">
        {legend}
      </legend>
      <div className={cn("mt-2 grid gap-x-4 gap-y-1", className)}>
        {children}
      </div>
    </fieldset>
  );
}

function FilterOption({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-2 py-1 text-sm text-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-4 w-4 rounded-[4px] border border-neutral-300 hover:border-neutral-400 hover:shadow-sm data-[state=checked]:border-primary dark:border-white/20 dark:bg-white/5 dark:data-[state=checked]:bg-primary"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function ViewButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 dark:focus-visible:ring-neutral-500/50",
        pressed && "bg-neutral-100 text-foreground dark:bg-neutral-800",
      )}
    >
      {children}
    </button>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
