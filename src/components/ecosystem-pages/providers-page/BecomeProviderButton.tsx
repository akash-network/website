import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { BecomeProviderDialog } from "./BecomeProviderDialog";

interface Props {
  className?: string;
  label?: string;
}

/** "Become a Provider" button for Astro pages: opens the HomeNode / data center chooser instead of linking out. */
export function BecomeProviderButton({
  className,
  label = "Become a Provider",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label} <ChevronRight size={14} className="ml-1.5" />
      </button>
      <BecomeProviderDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
