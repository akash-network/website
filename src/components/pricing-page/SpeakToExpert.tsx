import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const speakToExpertVariants = cva(
  "flex items-center justify-center border transition-all duration-300",
  {
    variants: {
      size: {
        default:
          "w-full gap-2 rounded-md py-[9px] text-sm md:py-2 md:text-base",
        small: "w-fit gap-2 rounded-md px-4 py-2 text-sm",
        "extra-small": "w-fit gap-1 rounded-[4px] px-2 py-1.5 text-xs",
      },
      variant: {
        primary:
          "border-primary dark:border-primary bg-primary/5 text-primary hover:bg-primary hover:text-white",
        secondary:
          "bg-white text-gray-600 hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
  },
);

interface SpeakToExpertProps
  extends VariantProps<typeof speakToExpertVariants> {
  className?: string;
}

const SpeakToExpert = ({ size, variant, className }: SpeakToExpertProps) => {
  return (
    <a
      href="https://share.hsforms.com/1gQOaeJXgQ-GMc7MnsTOmsAsaima"
      target="_blank"
    >
      <button
        className={clsx(speakToExpertVariants({ size, variant }), className)}
      >
        <svg
          className={clsx(
            size === "small"
              ? "h-[17px] w-[17px]"
              : size === "extra-small"
                ? "size-4"
                : "h-5 w-5",
          )}
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.6561 11.7018C14.2325 11.7018 14.6998 11.2345 14.6998 10.658C14.6998 10.0816 14.2325 9.61426 13.6561 9.61426C13.0796 9.61426 12.6123 10.0816 12.6123 10.658C12.6123 11.2345 13.0796 11.7018 13.6561 11.7018Z"
            fill="currentColor"
          />
          <path
            d="M9.90605 11.7018C10.4825 11.7018 10.9498 11.2345 10.9498 10.658C10.9498 10.0816 10.4825 9.61426 9.90605 9.61426C9.32961 9.61426 8.8623 10.0816 8.8623 10.658C8.8623 11.2345 9.32961 11.7018 9.90605 11.7018Z"
            fill="currentColor"
          />

          <path
            d="M6.16875 11.7018C6.7452 11.7018 7.2125 11.2345 7.2125 10.658C7.2125 10.0816 6.7452 9.61426 6.16875 9.61426C5.5923 9.61426 5.125 10.0816 5.125 10.658C5.125 11.2345 5.5923 11.7018 6.16875 11.7018Z"
            fill="currentColor"
          />

          <path
            d="M9.99984 19.0724C14.6022 19.0724 18.3332 15.3415 18.3332 10.7391C18.3332 6.13672 14.6022 2.40576 9.99984 2.40576C5.39746 2.40576 1.6665 6.13672 1.6665 10.7391C1.6665 12.257 2.07231 13.68 2.78136 14.9058L2.08317 18.6558L5.83317 17.9576C7.05889 18.6666 8.48197 19.0724 9.99984 19.0724Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p className="font-medium text-inherit ">Speak to an expert</p>
      </button>
    </a>
  );
};

export default SpeakToExpert;
