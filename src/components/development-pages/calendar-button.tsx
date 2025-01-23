import { CalendarIcon } from "@heroicons/react/20/solid";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-1/4 right-1/4 flex items-center justify-between rounded-full bg-[#ff414c] px-5 py-3 text-xs text-white dark:bg-white dark:text-black md:top-1/4 md:right-9 md:text-sm lg:top-1/4 lg:right-12 "
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      Community Calendar
    </button>
  );
}
