import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import type { HowToContributeDropdownProps } from "@/types/components";

export function HowToContributeDropdown({
  heading,
  children,
}: HowToContributeDropdownProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={`item`}
        className="border-b  border-defaultBorder  py-3  "
      >
        <AccordionTrigger className="not-prose flex cursor-pointer no-underline ">
          <span className="flex h-full w-full">
            <p className="  text-start text-base   font-semibold  text-foreground md:text-xl  lg:text-2xl">
              {heading}
            </p>
          </span>
        </AccordionTrigger>

        <AccordionContent className="-mt-[4px]">
          <div dangerouslySetInnerHTML={{ __html: children.props.value }}></div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
