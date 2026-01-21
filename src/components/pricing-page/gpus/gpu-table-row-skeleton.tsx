import { cn } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";

interface GpuTableRowSkeletonProps {
  className?: string;
  isB200?: boolean;
}

const GpuTableRowSkeleton = ({
  className,
}: GpuTableRowSkeletonProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-defaultBorder py-4",
        className,
      )}
    >
      {/* GPU Model */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Price */}
      <Skeleton className="h-5 w-16" />
    </div>
  );
};

export default GpuTableRowSkeleton;
