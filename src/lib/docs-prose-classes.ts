import classNames from "clsx";

/** Body copy: 16px / 1.7 with near-foreground ink for comfortable long reads */
const p =
  "prose-p:text-[15px] md:prose-p:text-[16px] prose-p:leading-[1.7] prose-p:text-neutral-700 dark:prose-p:text-neutral-300";
const h1 =
  "prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-semibold prose-h1:tracking-[-0.05em] prose-h1:text-foreground";
const h2 =
  "prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-semibold prose-h2:leading-8 prose-h2:tracking-[-0.04em] prose-h2:mb-4";
const h3 =
  "prose-h3:text-lg md:prose-h3:text-xl prose-h3:font-semibold prose-h3:tracking-[-0.02em]";
const h4 =
  "prose-h4:text-base md:prose-h4:text-lg prose-h4:font-semibold prose-h4:tracking-[-0.01em]";
const h5 =
  "prose-h5:mt-4 prose-h5:mb-3 prose-h5:text-sm lg:prose-h5:text-base prose-h5:font-semibold";
const ul =
  "prose-ul:font-os prose-ul:text-[15px] md:prose-ul:text-[16px] prose-ul:leading-[1.7]";
const ol =
  "prose-ol:font-os prose-ol:text-[15px] md:prose-ol:text-[16px] prose-ol:leading-[1.7]";
const li = "prose-li:text-neutral-700 dark:prose-li:text-neutral-300";
const table = [
  "prose-table:overflow-x-auto prose-table:table-auto prose-table:border-b prose-tr:border-defaultBorder",
  "prose-td:py-3 prose-td:text-start prose-td:text-neutral-700 dark:prose-td:text-neutral-300 prose-td:px-2 md:prose-td:px-4 md:prose-td:text-sm",
  "prose-th:text-para prose-thead:text-justify prose-thead:border-defaultBorder",
  "md:prose-thead:text-xs md:prose-thead:font-medium md:prose-th:px-4",
].join(" ");

const pre = "prose-pre:overflow-x-auto prose-pre:max-w-full";
/** Inline `code` pills: keep line height close to body copy (avoids tall gray boxes) */
const code = [
  "prose-code:rounded-sm prose-code:px-1 prose-code:py-0 prose-code:font-mono",
  "prose-code:text-[0.9em] prose-code:leading-none prose-code:align-baseline",
].join(" ");
/** Links read as links: foreground ink with a quiet underline that firms up on hover */
const a = [
  "prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:decoration-neutral-300 prose-a:underline-offset-[3px]",
  "hover:prose-a:decoration-foreground dark:prose-a:decoration-neutral-600 dark:hover:prose-a:decoration-foreground",
].join(" ");

export const proseClasses = classNames(
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  ul,
  ol,
  li,
  table,
  pre,
  code,
  a,
  "prose max-w-full",
  "prose-img:w-full text-foreground prose-hr:border-defaultBorder",
);

const className = proseClasses;
export { className as docsProseClasses };
