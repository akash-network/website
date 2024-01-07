import React from "react";
import ReactMarkdown from "react-markdown";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface FAQs {
  title: string;
  description: string[];
  type: "ol" | "ul";
}

export function FAQ({ cards }: { cards: FAQs[] }) {
  const [active, setActive] = React.useState("item-0");
  return (
    <Accordion
      type="multiple"
      className="not-prose mt-5 w-full md:min-h-[860px] "
    >
      {cards.map((card, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="">
          <AccordionTrigger
            plus
            className="flex cursor-pointer py-5  no-underline"
          >
            <span className="flex h-full w-full">
              <p className="text-xs font-bold leading-[24px] text-foreground md:text-xl">
                {card.title}
              </p>
            </span>
          </AccordionTrigger>

          <AccordionContent className="pb-10">
            {card.type === "ol" ? (
              <ol className="flex list-inside list-decimal flex-col gap-1">
                {card?.description?.map((item, index) => (
                  <li key={index} className="text-2xs text-para md:text-base">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="flex list-inside list-none flex-col gap-1">
                {card?.description?.map((item, index) => (
                  <li key={index} className="text-2xs text-para md:text-base">
                    - {item}
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
