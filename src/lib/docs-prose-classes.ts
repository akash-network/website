import classNames from "clsx";

const p = "prose-p:text-xs md:prose-p:text-sm lg:prose-p:text-base";
const h1 =
  "prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-6xl prose-h1:font-bold prose-h1:text-foreground";
const h2 =
  "prose-h2:text-xl md:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:font-medium";
const h3 =
  "prose-h3:text-base md:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:font-medium";
const h4 =
  "prose-h4:text-sm md:prose-h4:text-base lg:prose-h4:text-lg prose-h4:font-medium";
const h5 =
  "prose-h5:mt-4 prose-h5:mb-3 prose-h5:text-sm lg:prose-h5:text-base prose-h5:font-medium";
const ul =
  "prose-ul:font-os prose-ul:text-xs md:prose-ul:text-sm lg:prose-ul:text-base";
const ol =
  "prose-ol:font-os prose-ol:text-xs md:prose-ol:text-sm lg:prose-ol:text-base";
const table = [
  "prose-table:overflow-x-auto prose-table:table-auto prose-table:border-b prose-tr:border-defaultBorder",
  "prose-td:py-4 prose-td:text-start prose-td:text-para prose-td:px-2 md:prose-td:px-4 md:prose-td:text-sm",
  "prose-th:text-para prose-thead:text-justify prose-thead:border-defaultBorder",
  "md:prose-thead:text-xs md:prose-thead:font-medium md:prose-th:px-4",
].join(" ");

const pre = "prose-pre:overflow-x-auto prose-pre:max-w-full";

export const proseClasses = classNames(
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  ul,
  ol,
  table,
  pre,
  "prose max-w-full",
  "prose-a:text-primary prose-a:no-underline prose-img:w-full text-foreground prose-hr:border-defaultBorder",
);

const className = proseClasses;
export { className as docsProseClasses };
