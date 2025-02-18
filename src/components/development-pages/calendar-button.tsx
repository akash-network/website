import { CalendarIcon } from "lucide-react";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button onClick={onClick} className="rounded-full bg-background">
      <div className="flex items-center justify-between gap-2 whitespace-nowrap rounded-full border border-primary bg-primary/5 px-5 py-1.5 text-sm  font-semibold text-primary hover:bg-primary/10 dark:border-primary/10 md:py-2 ">
        <CalendarIcon className="h-4 w-4" />
        Community Calendar
      </div>
    </button>
  );
}
