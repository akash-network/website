import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight, X } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "../shared/ui";

// The same two routes in, with the same copy and artwork, as the provider chooser on the
// AkashML site (akashml-website: components/ProviderChoice.tsx), so both sites send
// prospective providers the same way.
const OPTIONS = [
  {
    key: "homenode",
    eyebrow: "Consumer GPU",
    title: "Akash HomeNode",
    body: "For a single graphics card in a machine you already own: a 4090 or 5090 under your desk. HomeNode is the way in if what you have spare is GPU time rather than rack space.",
    cta: "Set up a HomeNode",
    href: "https://homenode.akash.network/",
    image: "/images/provider/homenode-provider.webp",
  },
  {
    key: "provider-console",
    eyebrow: "Data center capacity",
    title: "Become a provider",
    body: "For whole machines: CPU, memory, storage and GPUs offered together. Provider Console is where you stand that capacity up as an Akash provider and start accepting workloads.",
    cta: "Open Provider Console",
    href: "https://provider-console.akash.network/",
    image: "/images/provider/compute-provider.webp",
  },
];

/** Wraps a trigger button; clicking it asks which of the two ways in suits the visitor. */
export default function ProviderChoiceDialog({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideCloseButton
        overlayClassName="bg-black/40 backdrop-blur-lg"
        className="block max-h-[calc(100vh-3rem)] w-[calc(100vw-2.5rem)] max-w-[1000px] gap-0 overflow-y-auto rounded-[20px] border-0 bg-white px-6 py-8 shadow-2xl dark:border dark:border-white/10 dark:bg-zinc-950 sm:rounded-[26px] md:px-12 md:py-11"
      >
        <DialogClose className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950">
          <X aria-hidden className="h-4 w-4" strokeWidth={2.4} />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogTitle className="max-w-[22ch] pr-10 text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] text-zinc-900 dark:text-zinc-50 sm:text-3xl lg:text-[38px]">
          Two ways to provide
        </DialogTitle>
        <DialogDescription className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Both put capacity onto the same Akash marketplace. Pick the one that
          matches the hardware you have.
        </DialogDescription>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <article
              key={option.key}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="mb-4 aspect-[3/2] overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5">
                <img
                  src={option.image}
                  alt=""
                  width={900}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {option.eyebrow}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {option.title}
              </h3>
              <p className="mb-5 mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {option.body}
              </p>
              {/* mt-auto keeps both buttons on one line however the paragraphs wrap. */}
              <a
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass(
                  "primary",
                  "default",
                  "mt-auto self-start",
                )}
              >
                {option.cta}
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
