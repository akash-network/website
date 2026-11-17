/**
 * The two ways in for prospective providers. Every "Become a Provider" chooser on the
 * site reads from this list, so the copy and destinations only need changing here.
 *
 * Provider Console is now a management tool for providers that are already running,
 * so data center capacity is sent to the Provider Playbook docs to stand up.
 */
export interface ProviderOption {
  key: "homenode" | "data-center";
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Artwork for the choosers that show an image per option. */
  image: string;
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
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
    key: "data-center",
    eyebrow: "Data center capacity",
    title: "Become a provider",
    body: "For whole machines: CPU, memory, storage and GPUs offered together. The Provider Playbook is a guided installer that sets that capacity up as an Akash provider, ready to accept workloads.",
    cta: "Automate your setup",
    href: "/docs/providers/setup-and-installation/provider-playbook/",
    image: "/images/provider/compute-provider.webp",
  },
];

/** Off-site options open in a new tab; the docs stay in this one. */
export const isExternalHref = (href: string) => /^https?:\/\//.test(href);
