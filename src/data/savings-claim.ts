// Single source of truth for the network-level GPU savings claim used
// across the Use Cases pages. See spec 05 for methodology. When the values
// below are unset (null), the <SavingsClaim /> component renders nothing —
// pages should not ship a "[TBD]" placeholder in live copy.
//
// To calculate:
//   1. Pull the current median H100 lease price on Akash from the underlying
//      GPU-pricing feed (see /pricing/gpus).
//   2. Pull on-demand list prices for H100 at AWS, Google Cloud, and Azure.
//   3. Compute the median delta across the three hyperscalers.
//   4. Refresh at least quarterly, and update the `asOf` date each time.
//
// Once populated, every page that imports the component will render the
// same sentence, dated once, linking to the same methodology anchor.
export type SavingsClaim = {
  akashPricePerGpuHour: string; // e.g. "$X.XX"
  hyperscalerRange: string;     // e.g. "$Y–$Z"
  percentLower: string;         // e.g. "N%"
  asOf: string;                 // YYYY-MM-DD
  methodologyHref: string;
};

// null until the growth / pricing team publishes the calculated figure.
// Do not fill in from memory or estimation.
export const savingsClaim: SavingsClaim | null = null;
