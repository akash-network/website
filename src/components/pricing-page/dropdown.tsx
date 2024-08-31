import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import React from "react";

const Dropdown = ({
  tabs,
  value,
}: {
  tabs: {
    value: string;
    description: string;
  }[];
  value: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-input placeholder:text-muted-foreground flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
        {tabs.find((tab) => tab.value === value)?.description || "Select"}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        style={{
          width: "var(--radix-popper-anchor-width)",
        }}
        className="group   bg-background2"
      >
        {tabs.map((tab) => (
          <DropdownMenuItem
            asChild
            key={tab.value}
            data-state={value === tab.value ? "checked" : ""}
            className={clsx(
              "data-[state=checked]:bg-primary",
              "data-[state=checked]:text-white",
              "group/item hover:bg-primary hover:text-white",
            )}
          >
            <a href={`/pricing/${tab.value}`}>{tab.description}</a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
