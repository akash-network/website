import { buyAkt } from "@/lib/constants";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { ArrowUpCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export const BuyAktButton = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="default" className={clsx(" gap-2 ", className)}>
          <span>Buy AKT</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.665 7.33171V11.3317C12.665 11.6853 12.5246 12.0245 12.2745 12.2745C12.0245 12.5246 11.6853 12.665 11.3317 12.665H1.99837C1.64475 12.665 1.30561 12.5246 1.05556 12.2745C0.805515 12.0245 0.665039 11.6853 0.665039 11.3317V1.99837C0.665039 1.64475 0.805515 1.30561 1.05556 1.05556C1.30561 0.805515 1.64475 0.665039 1.99837 0.665039H5.99837M12.665 0.665039L6.66504 6.66504M12.665 0.665039H8.66504M12.665 0.665039V4.66504"
              stroke="#FAFAFA"
              stroke-width="1.33"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
      </Dialog.Trigger>

      {/* Modal */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Close Button */}
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* Modal Header */}
          <Dialog.Title className="mb-6 text-center text-3xl font-bold">
            Buy AKT
          </Dialog.Title>

          {/* Exchange Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {buyAkt.map((exchange) => (
              <a
                key={exchange.title}
                href={exchange.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card group flex items-center justify-between gap-4 rounded-lg border p-6 transition-all hover:border-primary hover:shadow-md"
              >
                <div
                  className="h-6 "
                  dangerouslySetInnerHTML={{ __html: exchange.logo }}
                />

                <div className="flex  items-center justify-between">
                  <ArrowUpCircle className="text-muted-foreground h-5 w-5 rotate-45 transition-colors group-hover:text-primary" />
                </div>
              </a>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BuyAktButton;
