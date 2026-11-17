import { bytesToShrink } from "@/lib/unit-utils";
import { cn } from "@/lib/utils";
import { formatVCpu } from "../providerHelpers";
import type { NetworkCapacity } from "../useNetworkCapacity";

interface Props {
  networkCapacity: NetworkCapacity | undefined;
}

interface CapacityTileProps {
  label: string;
  /** Undefined until the capacity data has loaded — rendered as "—" rather than a fake 0. */
  total: number | undefined;
  free: number | undefined;
  /** Unit for all three of the tile's numbers, shown once next to the total. */
  unit: string;
  format: (value: number) => string;
}

/** Whole-number shares for the two segments. Both come from one rounded value so they always add
 * up to 100 (rounding each separately can give 101), and a sliver shows as "<1%" / ">99%" rather
 * than claiming 0% or 100%. */
function formatShares(total: number, free: number): { occupied: string; free: string } {
  if (total <= 0) return { occupied: "0%", free: "0%" };
  const freePct = (Math.min(free, total) / total) * 100;
  if (freePct > 0 && freePct < 1) return { occupied: ">99%", free: "<1%" };
  if (freePct > 99 && freePct < 100) return { occupied: "<1%", free: ">99%" };
  const rounded = Math.round(freePct);
  return { occupied: `${100 - rounded}%`, free: `${rounded}%` };
}

function CapacityTile({ label, total, free, unit, format }: CapacityTileProps) {
  const hasData = total !== undefined && free !== undefined;
  // "Occupied" is everything that isn't free: active leases plus pending ones (capacity reserved
  // for a lease that's still starting). The API's total is exactly active + pending + available,
  // so occupied + free always adds back up to the total in the headline.
  const occupied = hasData ? Math.max(0, total - free) : 0;
  const occupiedPct = hasData && total > 0 ? (occupied / total) * 100 : 0;
  const shares = hasData ? formatShares(total, free) : { occupied: "—", free: "—" };

  // Slightly tighter padding and gaps on two-per-row mobile tiles, which stack the legend and so
  // run taller than the sm:+ layout.
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-background p-3 sm:gap-3 sm:p-4">
      {/* The headline is the whole pool; the meter underneath breaks it down. */}
      <div className="flex flex-col gap-1">
        <p className="text-2xs font-semibold uppercase tracking-wide text-cardGray">{label}</p>
        {/* "14,746.3 vCPU total" doesn't fit on one line in every two-per-row mobile tile, so
            there the unit always drops under the number; from sm: up they share a line. */}
        <p className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-1.5">
          <span className="text-xl font-semibold tabular-nums text-foreground">
            {hasData ? format(total) : "—"}
          </span>
          <span className="text-xs text-cardGray">{unit ? `${unit} total` : "total"}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Decorative: the legend below carries the same numbers as text. */}
        <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-foreground/15">
          <div className="h-full bg-foreground" style={{ width: `${occupiedPct}%` }} />
        </div>

        {/* Legend in bar order — occupied is the fill from the left, free the rest up to the right
            edge — so from sm: up each item sits under its own end of the bar. Two-per-row mobile
            tiles are too narrow for both side by side, so there they stack. */}
        <dl className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-3">
          <LegendItem
            label="Occupied"
            value={hasData ? format(occupied) : "—"}
            unit={unit}
            share={shares.occupied}
            swatchClassName="bg-foreground"
          />
          <LegendItem
            label="Free"
            value={hasData ? format(free) : "—"}
            unit={unit}
            share={shares.free}
            swatchClassName="bg-foreground/15 ring-1 ring-inset ring-foreground/30"
            alignEnd
          />
        </dl>
      </div>
    </div>
  );
}

interface LegendItemProps {
  label: string;
  value: string;
  unit: string;
  share: string;
  swatchClassName: string;
  alignEnd?: boolean;
}

function LegendItem({ label, value, unit, share, swatchClassName, alignEnd }: LegendItemProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", alignEnd && "sm:items-end")}>
      <dt className="flex items-center gap-1.5 text-xs text-cardGray">
        <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", swatchClassName)} />
        {label}
      </dt>
      <dd className="flex items-baseline gap-1.5 tabular-nums">
        <span className="text-sm font-semibold text-foreground">
          {value}
          {/* Visually the unit is only next to the total; screen readers get it here too. */}
          {unit && <span className="sr-only"> {unit}</span>}
        </span>
        <span className="text-xs text-cardGray">{share}</span>
      </dd>
    </div>
  );
}

/** Grouped, with a fixed number of decimals — so "48.0" doesn't collapse to "48" next to "28.2". */
function formatFixed(value: number, decimals: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Formats bytes in the unit bytesToShrink picks for the tile's total (e.g. TiB), so all three of
 * the tile's numbers share that unit and it only needs showing once. Rounds like formatBytesLabel:
 * one decimal below 100, none from 100 up. */
function byteScale(totalBytes: number | undefined): { unit: string; format: (bytes: number) => string } {
  const { value, unit } = bytesToShrink(totalBytes ?? 0, true);
  const bytesPerUnit = value > 0 ? (totalBytes ?? 0) / value : 1;
  return {
    unit: value > 0 ? unit : "",
    format: (bytes) => {
      const scaled = bytes / bytesPerUnit;
      return formatFixed(scaled, scaled >= 100 ? 0 : 1);
    },
  };
}

export function NetworkCapacityOverview({ networkCapacity }: Props) {
  const resources = networkCapacity?.resources;
  const memory = byteScale(resources?.memory.total);
  const storage = byteScale(resources?.storage.total.total);

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cardGray">Network Capacity</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CapacityTile
          label="CPU"
          total={resources?.cpu.total}
          free={resources?.cpu.available}
          unit="vCPU"
          format={(milliCores) => formatFixed(formatVCpu(milliCores), 1)}
        />
        <CapacityTile
          label="GPU"
          total={resources?.gpu.total}
          free={resources?.gpu.available}
          unit="GPUs"
          format={(count) => formatFixed(count, 0)}
        />
        <CapacityTile
          label="Memory"
          total={resources?.memory.total}
          free={resources?.memory.available}
          unit={memory.unit}
          format={memory.format}
        />
        <CapacityTile
          label="Storage"
          total={resources?.storage.total.total}
          free={resources?.storage.total.available}
          unit={storage.unit}
          format={storage.format}
        />
      </div>
    </div>
  );
}
