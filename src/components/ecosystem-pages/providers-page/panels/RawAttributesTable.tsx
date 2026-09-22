import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { ApiProviderList } from "@/types/provider";

interface Props {
  attributes: ApiProviderList["attributes"];
}

export function RawAttributesTable({ attributes }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!attributes || attributes.length === 0) return null;

  const half = Math.ceil(attributes.length / 2);
  const columns = [attributes.slice(0, half), attributes.slice(half)];

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Raw Attributes
          <span className="rounded-full bg-background2 px-1.5 py-0.5 text-2xs font-normal text-cardGray">
            {attributes.length}
          </span>
        </span>
        <span className="text-2xs text-cardGray">On-chain, as published by the operator</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-x-8 border-t border-border px-4 py-3 md:grid-cols-2">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex}>
              {column.map((attribute) => (
                <div
                  key={attribute.key}
                  className="flex items-center justify-between gap-4 border-b border-border/50 py-2 text-2xs last:border-none"
                >
                  <span className="text-cardGray">{attribute.key}</span>
                  <span className="truncate text-right font-medium text-foreground">{attribute.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
