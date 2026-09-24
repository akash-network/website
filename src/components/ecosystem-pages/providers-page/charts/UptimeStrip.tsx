import type { UptimeSummary } from "../providerHelpers";

interface Props {
  summary: UptimeSummary;
}

export function UptimeStrip({ summary }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xl font-semibold text-emerald-500">{(summary.onlineRatio * 100).toFixed(2)}%</p>
        <p className="text-2xs text-cardGray">{summary.windowLabel}</p>
      </div>
      <div className="flex h-[46px] items-end gap-[1.5px]">
        {summary.points.map((point, index) => (
          <div
            key={index}
            className={`w-full rounded-[1px] ${point.isOnline ? "h-full bg-emerald-500" : "h-2/3 bg-amber-500"}`}
            title={new Date(point.date).toLocaleString()}
          />
        ))}
      </div>
      <p className="mt-1 text-2xs text-cardGray">
        {summary.incidentCount === 0
          ? `No outages in the last ${summary.windowLabel}`
          : `${summary.incidentCount} outage${summary.incidentCount > 1 ? "s" : ""} · ${summary.downtimeMinutes} min total in the last ${summary.windowLabel}`}
      </p>
    </div>
  );
}
