interface CalendarButtonProps {
  onClick: () => void;
}

export function CalendarButton({ onClick }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-full bg-primary/5 dark:border-primary/10 px-5 py-3 text-xs text-primary font-semibold border border-primary md:text-sm "
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12.5 3.33366V1.66699M12.5 3.33366V5.00033M12.5 3.33366H8.75M2.5 8.33366V15.8337C2.5 16.7542 3.24619 17.5003 4.16667 17.5003H15.8333C16.7538 17.5003 17.5 16.7542 17.5 15.8337V8.33366H2.5Z"
          stroke="#FF414C"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M2.5 8.33301V4.99967C2.5 4.0792 3.24619 3.33301 4.16667 3.33301H5.83333"
          stroke="#FF414C"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M5.83594 1.66699V5.00033"
          stroke="#FF414C"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M17.4974 8.33301V4.99967C17.4974 4.0792 16.7512 3.33301 15.8307 3.33301H15.4141"
          stroke="#FF414C"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
      Community Calendar
    </button>
  );
}