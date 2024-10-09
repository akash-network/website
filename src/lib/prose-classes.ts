import clsx from "clsx";

const className = clsx(
  "prose",
  "max-w-full",
  "text-foreground",
  // Headings
  "prose-h1:text-foreground",
  "prose-h2:mt-14",
  "prose-h2:mb-0",
  "prose-h2:font-semibold",
  "prose-h2:text-xl",
  "md:prose-h2:mt-20",
  "md:prose-h2:text-2xl",
  "lg:prose-h2:text-2lg",
  "prose-h3:mt-10",
  "prose-h3:text-base",
  "md:prose-h3:mt-16",
  "md:prose-h3:text-xl",
  "lg:prose-h3:text-2xl",
  "prose-h4:text-foreground",
  "prose-h4:mt-8",
  "prose-h4:text-base",
  "md:prose-h4:text-lg",
  "lg:prose-h4:text-xl",
  // Ordered and unordered lists
  "prose-ol:mt-5",
  "prose-li:mt-0",
  "prose-li:text-para",
  "prose-ul:mt-5",
  // Paragraphs and anchors
  "prose-p:mt-3",
  "prose-p:text-sm",
  "md:prose-p:mt-5",
  "md:prose-p:text-base",
  "lg:prose-p:text-lg",
  "prose-a:text-primary",
  "prose-a:no-underline",
  "hover:prose-a:text-primary/80",
  // Tables
  "prose-table:mt-10",
  "prose-table:border-b",
  "prose-thead:border-defaultBorder",
  "prose-thead:text-justify",
  "md:prose-thead:text-xs",
  "md:prose-thead:font-medium",
  "prose-th:text-para",
  "md:prose-th:px-4",
  "prose-tr:border-defaultBorder",
  "prose-td:py-4",
  "prose-td:text-start",
  "prose-td:text-para",
  "prose-td:px-2",
  "md:prose-td:px-4",
  "md:prose-td:text-sm",
  // Images
  "prose-img:my-0 prose-img:mx-auto prose-img:max-w-[70rem] prose-img:w-full [&_.image]:max-w-[70rem]   [&_.image]:mx-auto ",
  // Horizontal rules
  "prose-hr:border-defaultBorder",
  "prose-hr:mb-0",
  // Media Queries
  "md:mt-16",
);

export { className as proseClasses };
