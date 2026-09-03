import { buyAkt } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const BuyAktButton = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={clsx("gap-2", className)}>
          Buy AKT
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Buy AKT</DialogTitle>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {buyAkt.map((exchange) => (
            <a
              key={exchange.title}
              href={exchange.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-md border bg-card p-5 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div
                className="h-6"
                dangerouslySetInnerHTML={{ __html: exchange.logo }}
              />
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyAktButton;
