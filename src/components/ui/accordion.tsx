import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  plus?: boolean;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionItemProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between  font-medium transition-all  [&[data-state=open]>svg]:-rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      {props.plus ? (
        <Plus
          className="ml-4  mt-1 h-5 w-5 shrink-0 transition-transform duration-200 "
          strokeWidth={1.5}
        />
      ) : (
        <ChevronDown className="ml-4  mt-1 h-5 w-5 shrink-0 transition-transform duration-200" />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// When `forceMount` is true, the answer stays mounted in the initial HTML
// (indexable, discoverable to non-JS crawlers) and is visually collapsed via
// CSS when data-state=closed. Radix sets the `hidden` attribute on closed
// forceMounted content, which we override so it stays in the accessibility
// tree; the collapsed height is enforced with `data-[state=closed]:h-0` so
// the layout remains identical to the unmount behaviour.
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      // Keep forceMounted content visible to crawlers by overriding the
      // `hidden` attribute Radix applies, and hold height at 0 when closed.
      "[&[hidden]]:block data-[state=closed]:h-0",
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
