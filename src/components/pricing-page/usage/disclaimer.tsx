import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

function Disclaimer() {
  return (
    <div className="flex items-center gap-1">
      <HoverCard openDelay={2} closeDelay={2}>
        <HoverCardTrigger className="flex items-center justify-between pt-1.5">
          <p className="mr-2 text-sm font-medium text-[#7E868C]">Disclaimer</p>
          <Info size={14} className="text-[#9D9C9C] dark:text-[#3E3E3E]" />
        </HoverCardTrigger>
        <HoverCardContent
          className="r-0"
          side="left"
          sideOffset={-85}
          align="start"
          alignOffset={40}
        >
          <div className="flex max-w-[250px] flex-col px-4 py-3 text-xs text-linkText sm:max-w-[500px] md:max-w-[700px]">
            <p>
              These prices may vary. We strongly suggest that you do your own
              research as we may have miscalculated some of the providers'
              pricing. To calculate the pricing for Akash, we use the same
              calculations from the provider bidding engine in the helm-charts
              repo from Akash. For the other cloud providers, we use the same
              logic of price per GB of ram/storage and price per thread.
            </p>
            <ul className="ml-6 mt-4 list-disc">
              <li>Amazon Web Service pricing calculator</li>
              <li>Google cloud platform pricing</li>
              <li>Calculator Microsoft Azure pricing calculator</li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export default Disclaimer;
