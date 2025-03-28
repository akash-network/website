import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group peer relative h-[18px] w-[18px] shrink-0 rounded border-2 border-primary/30 shadow-sm",
      "transition-all duration-200 ease-in-out",
      "hover:border-primary/70 hover:shadow-md",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "absolute inset-0 flex items-center justify-center text-primary-foreground",
        "scale-0 opacity-0 transition-all duration-200",
        "group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100",
      )}
    >
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
    <div
      className={cn(
        "absolute inset-0 rounded-md",
        "bg-primary/0 transition-colors duration-200",
        "group-hover:bg-primary/5",
        "group-data-[state=checked]:bg-transparent",
      )}
    />
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
