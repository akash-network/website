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

const bitsClassName = clsx(
  "prose prose-blog max-w-full",

  // Headings — shadcn: semibold, tracking-tight, no aggressive scaling
  "prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-headings:mb-3",
  "prose-h2:mt-10 prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-semibold",
  "prose-h3:mt-8 prose-h3:text-lg md:prose-h3:text-xl prose-h3:font-semibold",
  "prose-h4:mt-6 prose-h4:text-base md:prose-h4:text-lg prose-h4:font-semibold",

  // Paragraphs — shadcn standard: text-base leading-7
  "prose-p:text-base prose-p:leading-7 prose-p:text-para prose-p:my-5",

  // Lists
  "prose-ul:mt-5 prose-ol:mt-5 prose-li:mt-1",
  "prose-li:text-base prose-li:leading-7 prose-li:text-para",

  // Links — foreground with underline (not red)
  "prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-foreground/70",

  // Bold
  "prose-strong:font-semibold prose-strong:text-foreground",

  // Tables — explicit foreground text so cells don't inherit blue/gray defaults
  "prose-table:mt-8 prose-table:border-b",
  "prose-thead:border-defaultBorder prose-thead:text-xs prose-thead:font-medium",
  "prose-th:text-foreground md:prose-th:px-4 prose-tr:border-defaultBorder",
  "prose-td:py-3 prose-td:text-foreground prose-td:text-start prose-td:text-sm prose-td:px-2 md:prose-td:px-4",

  // Images
  "prose-img:my-6 md:prose-img:my-10 prose-img:mx-auto prose-img:max-w-[70rem] prose-img:w-full",

  // HR
  "prose-hr:border-defaultBorder prose-hr:mb-0",

  "md:mt-12",
);

export { bitsClassName as bitsProseClasses };
