import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export function HowToContributeDropdown({
  heading,
  children,
}: {
  heading: string;
  children: any;
}) {
  const [value, setValue] = React.useState("");

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={`item`}
        className="border-b  border-[#E6E8EB]  py-3  "
      >
        <AccordionTrigger
          className="not-prose flex cursor-pointer no-underline "
          plus
        >
          <span className="flex h-full w-full">
            <p className="  text-start text-base   font-bold leading-[32px] text-foreground md:text-xl md:leading-[40px] lg:text-2xl">
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
