// Copy for a GPU detail page (/pricing/gpus/<slug>/). Text fields accept inline
// `**bold**` and `[label](href)` markup, rendered by `renderInline`.

export type GpuLink = {
  label: string;
  href: string;
  /** Opens in a new tab (console and other off-site links). */
  external?: boolean;
};

export type GpuTable = {
  columns: string[];
  rows: string[][];
  /** Columns (by index) holding values, set in the mono font and right-aligned. */
  numericColumns?: number[];
};

export type GpuTitledText = {
  title: string;
  text: string;
};

export type GpuOffer = {
  title: string;
  description: string;
  bullets: string[];
  cta: GpuLink;
};

export type GpuSubsection = {
  title: string;
  paragraphs: string[];
  bullets?: GpuTitledText[];
  table?: GpuTable;
  note?: string;
};

export type GpuFaqItem = {
  question: string;
  answer: string;
};

export type GpuDetailPage = {
  slug: string;
  /** Short name used in breadcrumbs and labels, e.g. "B300". */
  shortName: string;
  seo: {
    title: string;
    description: string;
    /** Page-specific image for structured data and social cards. Leave unset until one
     *  exists; the page then shares the generic GPU pricing card. */
    image?: string;
    imageAlt?: string;
  };
  hero: {
    title: string;
    description: string;
    specs: string[];
    price: string;
    priceNote: string;
    bullets: string[];
    ctas: GpuLink[];
  };
  intro: string;
  pricing: {
    title: string;
    paragraphs: string[];
    table: GpuTable;
    note: string;
    optionsTitle: string;
    options: GpuOffer[];
    optionsNote: string;
  };
  models?: {
    title: string;
    paragraphs: string[];
    table: GpuTable;
    note: string;
    subsections: GpuSubsection[];
  };
  /** Standalone sections after the models table, each with its own heading. */
  highlights?: GpuSubsection[];
  fit?: {
    title: string;
    choices: GpuTitledText[];
    paragraphs: string[];
  };
  useCases?: {
    title: string;
    paragraphs?: string[];
    items: GpuTitledText[];
  };
  deploy?: {
    title: string;
    steps: GpuTitledText[];
    cta: GpuLink;
  };
  enterprise?: {
    title: string;
    description: string;
    items: GpuTitledText[];
    cta: GpuLink;
    ctaNote: string;
  };
  specs: {
    title: string;
    columnLabel: string;
    rows: [string, string][];
  };
  faqTitle: string;
  faq: GpuFaqItem[];
  closing: {
    title: string;
    description: string;
    ctas: GpuLink[];
  };
};
