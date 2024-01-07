import React from "react";
import ReactMarkdown from "react-markdown";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface FAQs {
  title: string;
  description: string;
}

export function FAQ({ cards }: { cards: FAQs[] }) {
  const [value, setValue] = React.useState("");

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={() => setValue("")}
      className="w-full "
    >
      {cards.map((card, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-foreground  pb-[8px]  "
        >
          <AccordionTrigger className="flex cursor-pointer no-underline ">
            <span className="flex h-full w-full">
              <p className="text-base font-bold leading-[24px] text-foreground">
                {card.title}
              </p>
            </span>
          </AccordionTrigger>

          <AccordionContent className="">
            <ReactMarkdown className="prose  prose-p:text-sm prose-a:font-normal prose-a:text-primary">
              {card.description}
            </ReactMarkdown>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
