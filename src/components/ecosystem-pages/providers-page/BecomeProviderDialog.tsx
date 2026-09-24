import { ArrowUpRight, Cpu, Server } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface Option {
  icon: typeof Cpu;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}

/** Same two-option "how do you want to provide?" chooser as the akashml-website's ProviderChoice dialog — content and destinations kept verbatim from there. */
const OPTIONS: Option[] = [
  {
    icon: Cpu,
    eyebrow: "Consumer GPU",
    title: "Akash HomeNode",
    body: "For a single graphics card in a machine you already own — a 4090 or 5090 under your desk. HomeNode is the way in if what you have spare is GPU time rather than rack space.",
    cta: "Set up a HomeNode",
    href: "http://homenode.akash.network/",
  },
  {
    icon: Server,
    eyebrow: "Data centre capacity",
    title: "Become a provider",
    body: "For whole machines — CPU, memory, storage and GPUs offered together. Provider Console is where you stand that capacity up as an Akash provider and start accepting workloads.",
    cta: "Open Provider Console",
    href: "https://provider-console.akash.network/",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BecomeProviderDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] rounded-2xl sm:max-w-2xl">
        <DialogTitle className="max-w-[22ch] text-2xl font-semibold tracking-tight sm:text-3xl">
          Two ways to provide.
        </DialogTitle>
        <DialogDescription className="max-w-[58ch] text-sm leading-relaxed">
          Both put capacity onto the same Akash marketplace. Pick the one that matches the hardware you have.
        </DialogDescription>

        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <article key={option.title} className="flex flex-col rounded-xl border border-border bg-background2 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <option.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-para">{option.eyebrow}</p>
              <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{option.title}</h3>
              <p className="mb-4 mt-2 text-sm leading-relaxed text-para">{option.body}</p>
              <a
                href={option.href}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                {option.cta}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
