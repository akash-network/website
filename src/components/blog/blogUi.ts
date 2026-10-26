// Shared by the static post grid (blog-posts.astro, pagination.astro) and the
// client-side results of the blog controls, so both render identically.

export const POSTS_PER_PAGE = 12;

/** localStorage key for the grid/list choice. */
export const DISPLAY_STORAGE_KEY = "blog-display";

/** Post grid; data-display="list" stacks text-only cards (see post-card.astro). */
export const POSTS_GRID_CLASS =
  "group/posts grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 data-[display=list]:grid-cols-1 data-[display=list]:gap-3";

/** shadcn/ui outline Button (links and buttons). */
export const OUTLINE_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 disabled:pointer-events-none disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-neutral-500/50";

/** shadcn/ui ghost Button, small and fully rounded (filter-bar controls). */
export const GHOST_PILL_CLASS =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-neutral-100 focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 data-[state=open]:bg-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-500/50 dark:data-[state=open]:bg-neutral-800";
