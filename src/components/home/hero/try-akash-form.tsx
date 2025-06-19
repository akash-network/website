import { speakToExpertVariants } from "@/components/pricing-page/SpeakToExpert";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

// Singleton to track if HubSpot script is already loaded
let hubspotScriptLoaded = false;
let hubspotScriptPromise: Promise<void> | null = null;

const loadHubSpotScript = (): Promise<void> => {
  if (hubspotScriptLoaded) {
    return Promise.resolve();
  }

  if (hubspotScriptPromise) {
    return hubspotScriptPromise;
  }

  hubspotScriptPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://js.hsforms.net/forms/embed/47519938.js"]',
    );
    if (existingScript) {
      hubspotScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/47519938.js";
    script.defer = true;

    script.onload = () => {
      hubspotScriptLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Failed to load HubSpot script"));
    };

    document.body.appendChild(script);
  });

  return hubspotScriptPromise;
};

interface TryAkashFormProps extends VariantProps<typeof speakToExpertVariants> {
  type: "hero" | "header" | "speckToExpert" | "speakToExpertHeader" | "custom";
  fullWidth?: boolean;
  className?: string;
  id?: string;
  text?: string;
}

export default function TryAkashForm({
  type,
  fullWidth,
  size,
  variant,
  className,
  id = "f6d48b8a-55fd-4327-b947-1ae5b33ed63f",
  text,
}: TryAkashFormProps) {
  useEffect(() => {
    // Load HubSpot script only once
    loadHubSpotScript().catch(console.error);
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M15.5 12C15.5 12.2761 15.2761 12.5 15 12.5C14.7239 12.5 14.5 12.2761 14.5 12C14.5 11.7239 14.7239 11.5 15 11.5C15.2761 11.5 15.5 11.7239 15.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M17 7L6.75 17.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </button>
  );

  const speakToExpertHeaderButton = (
    <button
      className={clsx(speakToExpertVariants({ size, variant }), className)}
    >
      <svg
        className={clsx("h-5 w-5")}
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-medium text-inherit ">Speak to an expert</p>
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {type === "custom" ? (
          <button className={className}>{text}</button>
        ) : type === "hero" ? (
          heroButton
        ) : type === "speckToExpert" ? (
          speckToExpertButton
        ) : type === "speakToExpertHeader" ? (
          speakToExpertHeaderButton
        ) : (
          defaultButton
        )}
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
          data-form-id={id}
          data-portal-id="47519938"
        />
      </DialogContent>
    </Dialog>
  );
}
