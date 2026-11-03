import { fetchGpuPrices, liveHourly } from "@/lib/gpu-detail-pages/live-price";
import { priceLabels } from "@/lib/gpu-detail-pages/shared";
import type { LivePriceSource } from "@/lib/gpu-detail-pages/types";

// Browser side of The Bid CTAs. Each `[data-bid-price]` ships with the lowest snapshot rate of
// its GPUs; swap in the lowest live one and show the "Live" badges. If the API fails, the
// snapshots stay. Clicks on `[data-bid-cta]` links are reported to GA4.

type PriceEntry = { snapshot: number; source?: LivePriceSource };

async function refreshPrices() {
  const prices = document.querySelectorAll<HTMLElement>("[data-bid-price]");
  if (!prices.length) return;

  let data: Awaited<ReturnType<typeof fetchGpuPrices>>;
  try {
    data = await fetchGpuPrices();
  } catch (error) {
    console.warn("[the-bid] live price fetch failed", error);
    return;
  }

  prices.forEach((el) => {
    const entries = JSON.parse(el.dataset.bidPrice || "[]") as PriceEntry[];
    const rates = entries.map(
      ({ snapshot, source }) =>
        (source && liveHourly(data, source)) ?? snapshot,
    );
    if (rates.length) el.textContent = priceLabels(Math.min(...rates)).rate;
  });
  document
    .querySelectorAll<HTMLElement>("[data-bid-live]")
    .forEach((el) => (el.hidden = false));
}

document.addEventListener("astro:page-load", refreshPrices);

document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
    "a[data-bid-cta]",
  );
  if (!link || typeof window.gtag !== "function") return;
  window.gtag("event", "the_bid_cta_click", {
    cta_destination: link.dataset.bidCta,
    cta_placement: link.dataset.bidCtaPlacement,
    post_slug: window.location.pathname.split("/")[2],
  });
});
