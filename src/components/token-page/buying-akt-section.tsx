import { useState } from "react";
import { buyAktIcons } from "./token-icons";

interface BuyingAKTSection {
  title: string;
  description: string;
  categories: {
    title: string;
    items: { title: string; link: string; icon: string }[];
  }[];
}

const BuyingAkt = ({ buyingAKTSection }: { buyingAKTSection: BuyingAKTSection }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCategory = buyingAKTSection.categories[activeIndex];

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <h2 className="font-sans text-3xl !font-medium leading-snug tracking-tight text-foreground md:text-4xl">
          {buyingAKTSection.title}
        </h2>
        <p className="text-base font-normal text-para">
          {buyingAKTSection.description}
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-gray-100 p-1.5 dark:bg-background2">
          {buyingAKTSection.categories.map((category, i) => (
            <button
              key={category.title}
              onClick={() => setActiveIndex(i)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                activeIndex === i
                  ? "bg-background text-foreground shadow-sm"
                  : "text-gray-500 hover:text-foreground dark:text-gray-400 dark:hover:text-foreground"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {activeCategory && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {activeCategory.items.map((item) => (
            <a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center gap-3 rounded-md border border-input bg-background px-2 py-6 text-center transition-colors hover:bg-accent hover:text-accent-foreground md:gap-4 md:px-6"
            >
              <svg
                className="absolute right-2 top-2 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
              <div
                className="h-6 text-foreground md:h-7"
                dangerouslySetInnerHTML={{ __html: buyAktIcons[item.icon] }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyingAkt;
