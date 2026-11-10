// The globes pull in cobe and d3-geo, so they load only when a scene needs one.
import { Suspense, lazy, type ComponentProps } from "react";

const RegionGlobeImpl = lazy(() => import("./RegionGlobe"));
const BidGlobeImpl = lazy(() => import("./BidGlobe"));
const ProvidersGlobeImpl = lazy(() => import("./ProvidersGlobe"));

export function RegionGlobe(props: ComponentProps<typeof RegionGlobeImpl>) {
  return (
    <Suspense
      fallback={<div style={{ width: props.size, height: props.size }} />}
    >
      <RegionGlobeImpl {...props} />
    </Suspense>
  );
}

export function ProvidersGlobe(
  props: ComponentProps<typeof ProvidersGlobeImpl>,
) {
  return (
    <Suspense
      fallback={<div style={{ width: props.size, height: props.size }} />}
    >
      <ProvidersGlobeImpl {...props} />
    </Suspense>
  );
}

export function BidGlobe(props: ComponentProps<typeof BidGlobeImpl>) {
  return (
    <Suspense
      fallback={
        <div className={props.className ?? "aspect-square w-[280px]"} />
      }
    >
      <BidGlobeImpl {...props} />
    </Suspense>
  );
}
