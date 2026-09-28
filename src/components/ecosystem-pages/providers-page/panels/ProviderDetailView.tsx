import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { ApiProviderList } from "@/types/provider";
import { ActiveLeasesChart } from "../charts/ActiveLeasesChart";
import { CurrentUtilization } from "../charts/CurrentUtilization";
import { UptimeStrip } from "../charts/UptimeStrip";
import { ProviderLocationMap } from "./ProviderLocationMap";
import { RawAttributesTable } from "./RawAttributesTable";
import {
  formatBytesLabel,
  formatPricePerHour,
  formatVCpu,
  getProviderCoords,
  getProviderDeployLabel,
  getProviderDisplayName,
  getProviderLocationLabel,
  pickSimilarProviders,
  summarizeUptimeChecks,
} from "../providerHelpers";
import { useActiveLeasesGraph } from "../useActiveLeasesGraph";
import { findGpuMedianPrice, type GpuPrices } from "../useGpuPrices";
import { useProviderDetail } from "../useProviderDetail";

interface Props {
  owner: string;
  allProviders: ApiProviderList[];
  gpuPrices: GpuPrices | undefined;
  onBack: () => void;
  onSelectProvider: (owner: string) => void;
}

export function ProviderDetailView({ owner, allProviders, gpuPrices, onBack, onSelectProvider }: Props) {
  const { data: provider, isLoading, error } = useProviderDetail(owner);
  const { data: leasesGraph } = useActiveLeasesGraph(owner);

  if (isLoading) return <DetailSkeleton onBack={onBack} />;

  if (error || !provider) {
    return (
      <div className="py-10 text-center">
        <BackLink onBack={onBack} />
        <p className="mt-6 text-para">Could not load this provider right now.</p>
      </div>
    );
  }

  const uptimeSummary = summarizeUptimeChecks(provider.uptime);
  const gpuModel = provider.gpuModels[0];
  const indicativePrice = gpuModel ? findGpuMedianPrice(gpuPrices, gpuModel.vendor, gpuModel.model) : null;
  const coords = getProviderCoords(provider);
  const reclamationWindow = provider.attributes.find((a) => a.key === "reclamation-window")?.value;
  const similar = pickSimilarProviders(allProviders, provider, 3);

  const availableVCpu = formatVCpu(provider.stats?.cpu?.available ?? 0);
  const availableMemory = formatBytesLabel(provider.stats?.memory?.available ?? 0);
  const availableDisk = formatBytesLabel(provider.stats?.storage?.persistent?.available ?? 0);

  return (
    <div>
      <BackLink onBack={onBack} />

      <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{getProviderDisplayName(provider)}</h2>
            {provider.tier && (
              <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium capitalize text-cardGray">
                {provider.isAudited ? "Audited" : "Community"}
              </span>
            )}
            {provider.ipRegionCode && (
              <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-cardGray">
                {provider.ipCountryCode || provider.ipRegionCode}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-para">{getProviderLocationLabel(provider)}</p>
        </div>

        <a
          href={`https://console.akash.network/providers/${provider.owner}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <span className="truncate">{getProviderDeployLabel(provider)}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <CopyChip label={provider.owner} />
        <CopyChip label={provider.hostUri} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Indicative Price"
          value={indicativePrice !== null ? formatPricePerHour(indicativePrice) : "—"}
          sublabel={indicativePrice !== null ? `Network median for ${gpuModel!.model.toUpperCase()}` : "CPU only — pricing varies"}
        />
        <StatCard
          label="Reliability"
          value={`${((provider.uptime30d || 0) * 100).toFixed(2)}%`}
          sublabel={
            uptimeSummary
              ? `${uptimeSummary.incidentCount} outage${uptimeSummary.incidentCount === 1 ? "" : "s"} in last ${uptimeSummary.windowLabel}`
              : "30 day average"
          }
        />
        <StatCard label="Available Now" value={`${availableVCpu} vCPU`} sublabel={`${availableMemory} RAM · ${availableDisk} disk free`} />
        <StatCard
          label={reclamationWindow ? "Reclamation Window" : "Active Leases"}
          value={reclamationWindow ?? String(provider.leaseCount ?? 0)}
          sublabel={reclamationWindow ? "Guaranteed notice before reclaim" : "Currently running"}
        />
      </div>

      <div className="mt-3 rounded-lg border border-border p-4">
        <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-cardGray">GPU Inventory</p>
        {provider.gpuModels.length === 0 ? (
          <p className="text-sm text-para">
            No accelerators &mdash; this is a CPU and memory provider. {availableVCpu} vCPU and {availableMemory} RAM are
            unreserved right now.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {provider.gpuModels.map((gpu, index) => (
              <div key={index} className="text-sm">
                <span className="font-semibold text-foreground">
                  {gpu.vendor.toUpperCase()} {gpu.model.toUpperCase()}
                </span>
                <span className="text-cardGray"> &middot; {gpu.ram} &middot; {gpu.interface}</span>
              </div>
            ))}
            <p className="w-full text-2xs text-cardGray">
              {provider.stats.gpu.available} of {provider.stats.gpu.total} GPUs available now
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel title="Utilization">
          <CurrentUtilization provider={provider} />
        </Panel>
        <Panel title="Uptime">
          {uptimeSummary ? (
            <UptimeStrip summary={uptimeSummary} />
          ) : (
            <p className="text-2xs text-cardGray">No recent check history available.</p>
          )}
        </Panel>
        <Panel title="Active Leases">
          {leasesGraph ? <ActiveLeasesChart data={leasesGraph} /> : <Skeleton className="h-[120px] w-full" />}
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel title="Location & Network">
          <div className="flex flex-col gap-3">
            {coords && (
              <div className="h-[140px] w-full overflow-hidden">
                <ProviderLocationMap lat={coords.lat} lng={coords.lng} />
              </div>
            )}
            <InfoRow label="City" value={provider.city || provider.ipRegion || "—"} />
            <InfoRow label="Region" value={provider.locationRegion || provider.ipRegionCode || "—"} />
            <InfoRow label="Timezone" value={provider.timezone || "—"} />
            <InfoRow label="Network" value={provider.networkProvider || "—"} />
            {(provider.networkSpeedUp || provider.networkSpeedDown) && (
              <InfoRow
                label="Bandwidth"
                value={`${provider.networkSpeedDown ?? "—"} Mbps ↓ · ${provider.networkSpeedUp ?? "—"} Mbps ↑`}
              />
            )}
          </div>
        </Panel>

        <Panel title="Operator">
          <div className="flex flex-col gap-3">
            <InfoRow label="Organization" value={provider.organization || "—"} />
            <InfoRow label="Website" value={provider.website || "—"} isLink={!!provider.website} />
            <InfoRow label="Status page" value={provider.statusPage || "—"} isLink={!!provider.statusPage} />
            <InfoRow label="Email" value={provider.email || "—"} />
            <InfoRow label="Hardware" value={[provider.hardwareCpu, provider.hardwareMemory].filter(Boolean).join(" · ") || "—"} />
            <InfoRow label="Akash version" value={provider.akashVersion || "—"} />
          </div>
        </Panel>

        <Panel title="Similar Providers">
          {similar.length === 0 ? (
            <p className="text-2xs text-cardGray">No comparable providers found.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {similar.map((p) => {
                const model = p.gpuModels[0];
                const price = model ? findGpuMedianPrice(gpuPrices, model.vendor, model.model) : null;
                return (
                  <button
                    key={p.owner}
                    type="button"
                    onClick={() => onSelectProvider(p.owner)}
                    className="flex items-center justify-between gap-2 py-2.5 text-left first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{getProviderDisplayName(p)}</p>
                      <p className="truncate text-2xs text-cardGray">
                        {getProviderLocationLabel(p)} &middot; {((p.uptime30d || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-foreground">
                      {price !== null ? formatPricePerHour(price) : "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="mb-8 mt-3">
        <RawAttributesTable attributes={provider.attributes} />
      </div>
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="mt-6 flex items-center gap-1.5 text-sm text-cardGray hover:text-foreground">
      <ArrowLeft className="h-3.5 w-3.5" />
      All providers
    </button>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-cardGray">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
      <p className="text-2xs text-cardGray">{sublabel}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-2xs font-semibold uppercase tracking-wide text-cardGray">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-2xs">
      <span className="text-cardGray">{label}</span>
      {isLink && value !== "—" ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="truncate font-medium text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="truncate font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

function CopyChip({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(label);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable; no-op
        }
      }}
      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-2xs text-cardGray hover:bg-background2"
    >
      <span className="max-w-[220px] truncate">{label}</span>
      {copied ? <Check className="h-3 w-3 shrink-0" /> : <Copy className="h-3 w-3 shrink-0" />}
    </button>
  );
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <BackLink onBack={onBack} />
      <Skeleton className="mt-4 h-8 w-64" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
