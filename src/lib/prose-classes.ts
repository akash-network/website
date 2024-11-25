import clsx from "clsx";

const className = clsx(
  // Base prose styles
  "prose prose-blog prose-p:my-6 text-darkText  md:prose-p:my-10 md:prose-p:my-8",
  "max-w-full",
  "text-foreground prose-p:text-darkText prose-headings:font-normal prose-headings:text-darkText prose-headings:mb-4",

  // Headings

  "prose-h2:mt-12",
  "prose-h2:font-normal",
  "prose-h2:text-xl",

  "md:prose-h2:text-2xl",
  "lg:prose-h2:text-3xl",
  "prose-h3:mt-10",
  "prose-h3:text-base",

  "md:prose-h3:text-xl",
  "lg:prose-h3:text-2xl",

  "prose-h4:mt-8",
  "prose-h4:text-base",
  "md:prose-h4:text-lg",
  "lg:prose-h4:text-xl",

  // Lists
  "prose-ol:mt-8",
  "prose-li:mt-0",

  "lg:prose-li:text-lg",
  "md:prose-li:text-base",
  "prose-li:text-sm",
  "prose-ul:mt-8",

  // Paragraphs and Links

  "prose-p:text-sm",

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

  "md:prose-th:px-4",
  "prose-tr:border-defaultBorder",
  "prose-td:py-4",
  "prose-td:text-start",

  "prose-td:px-2",
  "md:prose-td:px-4",
  "md:prose-td:text-sm",

  // Images
  "prose-img:my-6 md:prose-img:my-14 prose-img:mx-auto prose-img:max-w-[70rem] prose-img:w-full",
  "[&_.image]:max-w-[70rem] [&_.image]:mx-auto",

  // Horizontal rules
  "prose-hr:border-defaultBorder",
  "prose-hr:mb-0",

  // Media Queries
  "md:mt-16",
);

export { className as proseClasses };
