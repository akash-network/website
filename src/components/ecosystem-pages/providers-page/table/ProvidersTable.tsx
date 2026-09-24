import { ChevronRight, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { ApiProviderList } from "@/types/provider";
import {
  formatVCpu,
  formatBytesLabel,
  getGpuSummaryLabel,
  getProviderDisplayName,
  getProviderRegionLabel,
  getTotalGpuCount,
} from "../providerHelpers";

const ROWS_PER_PAGE = 10;

type SortKey = "uptime" | "gpus" | "name";

interface Props {
  providers: ApiProviderList[];
  onSelectProvider: (provider: ApiProviderList) => void;
}

function uptimeColor(uptime: number): string {
  if (uptime >= 0.99) return "text-emerald-500";
  if (uptime >= 0.9) return "text-sky-500";
  return "text-amber-500";
}

export function ProvidersTable({ providers, onSelectProvider }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("uptime");

  const sorted = useMemo(() => {
    const list = [...providers];
    list.sort((a, b) => {
      if (sortKey === "uptime") return (b.uptime30d || 0) - (a.uptime30d || 0);
      if (sortKey === "gpus") return getTotalGpuCount(b) - getTotalGpuCount(a);
      return getProviderDisplayName(a).localeCompare(getProviderDisplayName(b));
    });
    return list;
  }, [providers, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const rows = sorted.slice(start, start + ROWS_PER_PAGE);

  function handleSort(key: SortKey) {
    setSortKey(key);
    setPage(1);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background2 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cardGray">All Providers</p>
        <p className="text-2xs text-cardGray">
          {providers.length} providers &middot; {providers.reduce((s, p) => s + getTotalGpuCount(p), 0)} GPUs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-2xs uppercase tracking-wide text-cardGray">
              <SortableHeader label="Provider" active={sortKey === "name"} onClick={() => handleSort("name")} />
              <th className="px-4 py-2.5 font-medium">Region</th>
              <th className="px-4 py-2.5 font-medium">GPU</th>
              <SortableHeader label="GPUs" active={sortKey === "gpus"} onClick={() => handleSort("gpus")} />
              <th className="px-4 py-2.5 font-medium">Capacity</th>
              <SortableHeader label="Uptime (30D)" active={sortKey === "uptime"} onClick={() => handleSort("uptime")} />
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((provider) => {
              const gpuCount = getTotalGpuCount(provider);
              return (
                <tr
                  key={provider.owner}
                  onClick={() => onSelectProvider(provider)}
                  className="cursor-pointer border-b border-border/60 last:border-none hover:bg-background2"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{getProviderDisplayName(provider)}</p>
                    <p className="truncate text-2xs text-cardGray">{provider.hostUri}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-2xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {getProviderRegionLabel(provider)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-2xs text-cardGray">{getGpuSummaryLabel(provider)}</td>
                  <td className="px-4 py-3 text-foreground">{gpuCount > 0 ? gpuCount : "—"}</td>
                  <td className="px-4 py-3 text-foreground">
                    {formatVCpu(provider.stats?.cpu?.total ?? 0)} vCPU &middot; {formatBytesLabel(provider.stats?.memory?.total ?? 0)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${uptimeColor(provider.uptime30d || 0)}`}>
                    {((provider.uptime30d || 0) * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="ml-auto h-4 w-4 text-cardGray" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-2xs text-cardGray">
        <span>
          {start + 1}&ndash;{Math.min(start + ROWS_PER_PAGE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-border px-2.5 py-1 font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="rounded-md border border-border px-2.5 py-1 font-medium disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-2.5 font-medium">
      <button type="button" onClick={onClick} className={`flex items-center gap-1 ${active ? "text-foreground" : ""}`}>
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}
