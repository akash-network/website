import type { ApiProviderList } from "@/types/provider";
import { formatVCpu, formatBytesLabel } from "../providerHelpers";

interface Props {
  provider: ApiProviderList;
}

function UtilizationBar({ label, used, total, usedLabel, totalLabel }: { label: string; used: number; total: number; usedLabel: string; totalLabel: string }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-2xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-cardGray">
          {usedLabel} / {totalLabel}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background2">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CurrentUtilization({ provider }: Props) {
  const cpu = provider.stats?.cpu;
  const memory = provider.stats?.memory;
  const cpuUsed = (cpu?.active ?? 0) + (cpu?.pending ?? 0);
  const memoryUsed = (memory?.active ?? 0) + (memory?.pending ?? 0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xs text-cardGray">Current reserved capacity, not a historical trend</p>
      <UtilizationBar
        label="CPU"
        used={cpuUsed}
        total={cpu?.total ?? 0}
        usedLabel={`${formatVCpu(cpuUsed)} vCPU`}
        totalLabel={`${formatVCpu(cpu?.total ?? 0)} vCPU`}
      />
      <UtilizationBar
        label="Memory"
        used={memoryUsed}
        total={memory?.total ?? 0}
        usedLabel={formatBytesLabel(memoryUsed)}
        totalLabel={formatBytesLabel(memory?.total ?? 0)}
      />
    </div>
  );
}
