import { formatVCpu, formatBytesLabel } from "../providerHelpers";
import type { NetworkCapacity } from "../useNetworkCapacity";

interface Props {
  networkCapacity: NetworkCapacity | undefined;
}

interface CapacityTileProps {
  label: string;
  used: number;
  free: number;
  total: number;
  format: (value: number) => string;
  unit: string;
}

function CapacityTile({ label, used, free, total, format, unit }: CapacityTileProps) {
  const usedPct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  // Not simply `100 - usedPct`: total also includes reserved-but-not-yet-active ("pending")
  // capacity, which is neither used nor free. Sizing the free segment from `free` directly
  // keeps the bar honest instead of silently folding pending into the free width.
  const freePct = total > 0 ? Math.min(100 - usedPct, (free / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-background p-4">
      <p className="text-2xs font-semibold uppercase tracking-wide text-cardGray">{label}</p>

      {/* Used gets its own fixed line always. "used of {total}" stacks under it on narrow
          tiles (two per row on mobile leaves no room to share a line) but joins into one
          line from sm: up, where a tile has enough width to spare. */}
      <div className="flex flex-col gap-0.5">
        <p className="text-lg font-semibold text-foreground">{format(used)}</p>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-1">
          <p className="text-xs text-cardGray">used of</p>
          <p className="text-xs font-medium text-foreground">
            {format(total)} {unit}
          </p>
        </div>
      </div>

      {/* Two adjacent segments spanning the full width, not a track-behind-fill meter —
          the light gray after the black is drawn as its own "free" segment so it reads
          as data, not empty space. */}
      <div
        role="img"
        aria-label={`${usedPct.toFixed(0)}% used, ${freePct.toFixed(0)}% free`}
        className="flex h-2 w-full overflow-hidden rounded-full"
      >
        <div className="h-full bg-foreground" style={{ width: `${usedPct}%` }} />
        <div className="h-full bg-foreground/15" style={{ width: `${freePct}%` }} />
      </div>
      <p className="text-xs text-foreground">{usedPct.toFixed(0)}%</p>

      <p className="text-2xs text-cardGray">
        {format(free)} {unit} free
      </p>
    </div>
  );
}

export function NetworkCapacityOverview({ networkCapacity }: Props) {
  const resources = networkCapacity?.resources;

  return (
    <div className="rounded-xl border border-border bg-background2 p-4 md:p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cardGray">Network Capacity</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CapacityTile
          label="CPU"
          used={resources?.cpu.active ?? 0}
          free={resources?.cpu.available ?? 0}
          total={resources?.cpu.total ?? 0}
          format={(v) => `${formatVCpu(v)}`}
          unit="vCPU"
        />
        <CapacityTile
          label="GPU"
          used={resources?.gpu.active ?? 0}
          free={resources?.gpu.available ?? 0}
          total={resources?.gpu.total ?? 0}
          format={(v) => String(Math.round(v))}
          unit="GPUs"
        />
        <CapacityTile
          label="Memory"
          used={resources?.memory.active ?? 0}
          free={resources?.memory.available ?? 0}
          total={resources?.memory.total ?? 0}
          format={formatBytesLabel}
          unit=""
        />
        <CapacityTile
          label="Storage"
          used={resources?.storage.total.active ?? 0}
          free={resources?.storage.total.available ?? 0}
          total={resources?.storage.total.total ?? 0}
          format={formatBytesLabel}
          unit=""
        />
      </div>
    </div>
  );
}
