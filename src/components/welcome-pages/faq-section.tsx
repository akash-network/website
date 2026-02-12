import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQs = {
  question: string;
  answer: string;
}[];

const FAQ = ({ faqItems }: { faqItems: FAQs }) => {
  return (
    <section className="py-[120px] pb-[180px]">
      <div className="mx-auto max-w-[920px] px-4 sm:px-6 lg:px-8">
        {/* FAQ Header */}
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-lg py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#373737]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
