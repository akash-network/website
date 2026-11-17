import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { tone } from "@/components/alex/styles";
import { cn } from "@/lib/utils";

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Single-open accordion for the /alex FAQ; the first answer starts open. */
export function Faq({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-0"
      className={cn("flex min-w-0 flex-col border-t", tone.line)}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`item-${index}`}
          className={tone.line}
        >
          <AccordionTrigger
            className={cn(
              "group gap-4 py-[22px] text-left text-[17px] font-medium leading-[1.4] [&>svg]:hidden",
              tone.fg,
            )}
          >
            {item.question}
            <span
              aria-hidden="true"
              className={cn(
                "shrink-0 font-jetBrainsMono text-lg font-normal leading-none",
                tone.muted,
              )}
            >
              <span className="group-data-[state=open]:hidden">+</span>
              <span className="hidden group-data-[state=open]:inline">−</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p
              className={cn(
                "pb-2 pr-12 text-[15px] leading-[1.6] [text-wrap:pretty]",
                tone.body,
              )}
            >
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
