import { BuyAktButton } from "./buy-akt-modal";

const StickyBuyBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-center px-4 py-3">
        <BuyAktButton className="min-w-[200px] bg-foreground text-background hover:bg-foreground/90" />
      </div>
    </div>
  );
};

export default StickyBuyBar;
