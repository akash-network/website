import { CalendarIcon } from "@heroicons/react/20/solid";

interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center justify-between rounded-full bg-[#1E1E1E] px-5 py-3 text-xs text-white dark:bg-white dark:text-black md:bottom-9 md:right-9 md:text-sm lg:bottom-12 lg:right-12 "
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      Community Calendar
    </button>
  );
}
