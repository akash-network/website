import { buyAktIcons } from "./token-icons";

interface BuyingAKTSection {
  title: string;
  description: string;
  categories: {
    title: string;
    items: {
      title: string;
      link: string;
      icon: string;
    }[];
  }[];
}

const BuyingAkt = ({
  buyingAKTSection,
}: {
  buyingAKTSection: BuyingAKTSection;
}) => {
  return (
    <div>
      <div>
        <h2 className="text-center text-2xl font-semibold  md:text-2lg ">
          {buyingAKTSection.title}
        </h2>
        <p className="mt-4 text-center text-base font-normal md:text-lg ">
          {buyingAKTSection.description}
        </p>
      </div>

      <div className="mt-[40px] space-y-[60px] md:mt-[60px]">
        {buyingAKTSection.categories.map((category) => (
          <div key={category.title} className="space-y-8">
            <div className="flex justify-center">
              <h3 className="inline-flex items-center justify-center rounded-full border border-defaultBorder bg-[#F5F5F5] px-8 py-2 text-base font-medium text-para dark:bg-background2">
                {category.title}
              </h3>
            </div>

            <div className="grid  grid-cols-2 gap-4 lg:grid-cols-3">
              {category.items.map((item) => (
                <a
                  key={item.title}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-defaultBorder bg-background2 px-2 py-6 text-center transition-all duration-200 hover:border-primary hover:bg-background2/80 md:gap-4 md:px-6"
                >
                  <div
                    className="h-6 text-foreground transition-colors duration-200 group-hover:text-primary"
                    dangerouslySetInnerHTML={{ __html: buyAktIcons[item.icon] }}
                  />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyingAkt;
