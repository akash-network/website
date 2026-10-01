import { CalendarIcon } from "lucide-react";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[13.4px] font-normal text-muted-foreground transition-colors hover:text-foreground"
    >
      <CalendarIcon className="h-[13px] w-[13px] shrink-0" />
      Community Calendar
    </button>
  );
}
