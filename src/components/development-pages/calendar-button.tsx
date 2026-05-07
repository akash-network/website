import { CalendarIcon } from "lucide-react";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[13.4px] font-normal text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
    >
      <CalendarIcon className="h-[13px] w-[13px] shrink-0" />
      Community Calendar
    </button>
  );
}
