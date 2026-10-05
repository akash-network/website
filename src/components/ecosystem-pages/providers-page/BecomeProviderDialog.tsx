import { ArrowRight, ArrowUpRight, Cpu, Server } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PROVIDER_OPTIONS, isExternalHref, type ProviderOption } from "@/lib/provider-options";

const ICONS: Record<ProviderOption["key"], typeof Cpu> = {
  homenode: Cpu,
  "data-center": Server,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Two-option "how do you want to provide?" chooser; copy and destinations live in PROVIDER_OPTIONS. */
export function BecomeProviderDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[95vw] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogTitle className="max-w-[22ch] text-2xl font-semibold tracking-tight sm:text-3xl">
          Two ways to provide.
        </DialogTitle>
        <DialogDescription className="max-w-[58ch] text-sm leading-relaxed">
          Both put capacity onto the same Akash marketplace. Pick the one that matches the hardware you have.
        </DialogDescription>

        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROVIDER_OPTIONS.map((option) => {
            const Icon = ICONS[option.key];
            const external = isExternalHref(option.href);
            return (
              <article key={option.key} className="flex flex-col rounded-xl border border-border bg-background2 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-para">{option.eyebrow}</p>
                <h3 className="mt-0.5 text-lg font-semibold text-foreground">{option.title}</h3>
                <p className="mb-4 mt-2 text-sm leading-relaxed text-para">{option.body}</p>
                <a
                  href={option.href}
                  {...(external && { target: "_blank", rel: "noreferrer" })}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                  {option.cta}
                  {external ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                </a>
              </article>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
