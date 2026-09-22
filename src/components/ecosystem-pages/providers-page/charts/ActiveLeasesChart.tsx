import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { ActiveLeasesGraphData } from "../useActiveLeasesGraph";

const RANGE_OPTIONS = [
  { id: "30d", label: "30d", days: 30 },
  { id: "90d", label: "90d", days: 90 },
] as const;

interface Props {
  data: ActiveLeasesGraphData;
}

export function ActiveLeasesChart({ data }: Props) {
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]["id"]>("90d");

  const points = useMemo(() => {
    const days = RANGE_OPTIONS.find((r) => r.id === range)?.days ?? 90;
    return data.snapshots.slice(-days).map((s) => ({
      date: s.date,
      value: s.value,
      label: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
  }, [data, range]);

  const trend = data.currentValue - data.compareValue;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xl font-semibold text-foreground">{data.currentValue}</p>
          <p className="text-2xs text-cardGray">
            {trend === 0 ? "No change" : trend > 0 ? `▲ ${trend} in 30d` : `▼ ${Math.abs(trend)} in 30d`}
          </p>
        </div>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={`rounded px-2 py-0.5 text-2xs font-medium ${
                range === option.id ? "bg-foreground text-background" : "text-cardGray hover:bg-background2"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="activeLeasesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff414c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ff414c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, "dataMax + 2"]} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
              labelFormatter={(label) => label}
              formatter={(value: number) => [value, "Active leases"]}
            />
            <Area type="monotone" dataKey="value" stroke="#ff414c" strokeWidth={1.5} fill="url(#activeLeasesFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-2xs text-cardGray">{points.length} days &middot; today</p>
    </div>
  );
}
