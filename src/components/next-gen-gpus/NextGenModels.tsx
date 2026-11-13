import { gpuDetailHref } from "@/lib/gpu-detail-pages/slugs";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useGpuPrices } from "../pricing-page/shared/pricing-api";
import { PricingQueryProvider } from "../pricing-page/shared/ui";

export interface NextGenModel {
  /** Console API model id, used to check whether providers list it today. */
  id: string;
  name: string;
  architecture: string;
  spec: string;
  description: string;
  /** What the page says while no provider lists the model. */
  fallbackStatus: string;
}

/** The next-gen lineup. Each model reads "On the network" while providers list it in the
 *  Console API, so the page tracks real availability without hand edits. */
export default function NextGenModels({ models }: { models: NextGenModel[] }) {
  return (
    <PricingQueryProvider>
      <ModelList models={models} />
    </PricingQueryProvider>
  );
}

function ModelList({ models }: { models: NextGenModel[] }) {
  const { data } = useGpuPrices();
  const listed = new Set(
    (data?.models ?? [])
      .filter((m) => (m?.availability?.total ?? 0) > 0)
      .map((m) => m.model.toLowerCase()),
  );

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.02]">
      {models.map((model) => {
        const live = listed.has(model.id);
        const detailHref = gpuDetailHref(model.id);
        return (
          <li key={model.id} className="flex flex-col gap-3 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-medium leading-snug text-foreground">
                  {detailHref ? (
                    <a
                      href={detailHref}
                      className="inline-flex items-center gap-1 underline decoration-zinc-300 decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-current dark:decoration-white/25"
                    >
                      {model.name}
                      <ArrowUpRight
                        aria-hidden
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                    </a>
                  ) : (
                    model.name
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {model.architecture}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium",
                  live
                    ? "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "border-zinc-200 text-muted-foreground dark:border-white/15",
                )}
              >
                {live && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  />
                )}
                {live ? "On the network" : model.fallbackStatus}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {model.description}
            </p>
            <span className="inline-flex h-6 w-fit items-center rounded-md border border-zinc-200 px-2 font-jetBrainsMono text-[13px] tabular-nums text-muted-foreground dark:border-white/15">
              {model.spec}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
