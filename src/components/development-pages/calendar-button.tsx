import { CalendarIcon } from "@heroicons/react/20/solid";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-full bg-primary/5 dark:border-primary/10 px-5 py-3 text-xs text-primary font-semibold border border-primary md:text-sm "
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      Community Calendar
    </button>
  );
}