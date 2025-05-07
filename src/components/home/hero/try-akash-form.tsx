import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface TryAkashFormProps {
  type: "hero" | "header" | "speckToExpert";
  fullWidth?: boolean;
}

export default function TryAkashForm({ type, fullWidth }: TryAkashFormProps) {
  useEffect(() => {
    // Load HubSpot script
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/47519938.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  const defaultButton = (
    <button
      type="button"
      className={buttonVariants({
        variant: "default",
        size: "sm",
        className: "!h-auto !rounded px-[11px] py-[7px] text-xs",
      })}
    >
      Try Akash
    </button>
  );

  const heroButton = (
    <button
      type="button"
      className={clsx(
        " cursor-pointer rounded-md bg-primary px-10 py-2.5  !font-medium text-white transition-all hover:bg-primary/90 md:px-[60px] md:py-5 lg:text-xl",
        fullWidth ? "w-full" : "mx-auto",
      )}
    >
      Access The Marketplace
    </button>
  );

  const speckToExpertButton = (
    <button
      type="button"
      className="group mx-auto flex w-fit items-center gap-2 rounded-full border bg-gray-50 px-8 py-2 hover:bg-gray-100 dark:bg-background2 dark:hover:bg-white/10"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 18.25C15.5 18.25 19.25 16.5 19.25 12C19.25 7.5 15.5 5.75 12 5.75C8.5 5.75 4.75 7.5 4.75 12C4.75 13.0298 4.94639 13.9156 5.29123 14.6693C5.50618 15.1392 5.62675 15.6573 5.53154 16.1651L5.26934 17.5635C5.13974 18.2547 5.74527 18.8603 6.43651 18.7307L9.64388 18.1293C9.896 18.082 10.1545 18.0861 10.4078 18.1263C10.935 18.2099 11.4704 18.25 12 18.25Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M15.5 12C15.5 12.2761 15.2761 12.5 15 12.5C14.7239 12.5 14.5 12.2761 14.5 12C14.5 11.7239 14.7239 11.5 15 11.5C15.2761 11.5 15.5 11.7239 15.5 12Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>

      <p className="line-clamp-2 flex-1 text-center text-xs font-semibold text-foreground lg:text-sm">
        Speak To An Expert
      </p>
      <svg
        width="24"
        height="24"
        className="hidden group-hover:block"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.25 15.25V6.75H8.75"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M17 7L6.75 17.25"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {type === "hero"
          ? heroButton
          : type === "speckToExpert"
            ? speckToExpertButton
            : defaultButton}
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="hide-scrollbar  max-h-[95vh] overflow-hidden overflow-y-auto !border-none bg-transparent  p-0 shadow-none sm:max-w-[600px]"
      >
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className="absolute right-4 top-4 rounded-full bg-white p-2 text-black hover:bg-white/90"
        >
          <X className="h-4 w-4" />
        </button>
        <div
          className="hs-form-frame"
          data-region="na1"
          data-form-id="f6d48b8a-55fd-4327-b947-1ae5b33ed63f"
          data-portal-id="47519938"
        />
      </DialogContent>
    </Dialog>
  );
}
