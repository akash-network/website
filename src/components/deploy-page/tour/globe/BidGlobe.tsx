import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import {
  BID_SETTLED_SECONDS,
  advanceBidGlobeScene,
  buildGlobeField,
  composeGlobeOverlay,
  createBidGlobePainter,
  createBidGlobeScene,
  locateViewer,
  viewAt,
  type BidGlobeScene,
  type LocatedProvider,
} from "./bidGlobeScene";

// Same 110m land dataset Console and the providers page load.
const LAND_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json";
const SIZE_PX = 280;
const MAX_PIXEL_RATIO = 2;
const LAND_FADE_IN_MS = 400;
const STILL_FRAME_SECONDS = 2.4;
const STILL_FRAME_INTERVAL_MS = 250;

let landPromise: Promise<GeoPermissibleObjects> | null = null;

function loadLand() {
  landPromise ??= fetch(LAND_URL)
    .then((response) => response.json())
    .then(
      (topology) =>
        feature(
          topology,
          topology.objects.land,
        ) as unknown as GeoPermissibleObjects,
    )
    .catch((error) => {
      landPromise = null;
      throw error;
    });
  return landPromise;
}

/** Console's "Collecting bids" globe. Props are read every frame, so a
 * landing bid never restarts the animation. */
export default function BidGlobe({
  providers,
  bidderId,
  seed,
  still,
  className,
}: {
  providers: LocatedProvider[];
  bidderId: string | null;
  seed: string;
  still: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [land, setLand] = useState<GeoPermissibleObjects | null>(null);
  const field = useMemo(
    () =>
      buildGlobeField(
        providers,
        locateViewer(new Date().getTimezoneOffset()),
        seed,
      ),
    [providers, seed],
  );
  const liveRef = useRef({ field, bidderId, land, still });
  liveRef.current = { field, bidderId, land, still };

  useEffect(() => {
    let mounted = true;
    loadLand().then(
      (shape) => mounted && setLand(shape),
      () => undefined,
    );
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const pixelRatio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
    canvas.width = Math.round(SIZE_PX * pixelRatio);
    canvas.height = Math.round(SIZE_PX * pixelRatio);
    const paint = createBidGlobePainter(context);
    let firstFrameAt: number | null = null;
    let scene: BidGlobeScene | null = null;
    let bidAt: number | null = null;
    let landShownAt: number | null = null;
    let frameId = 0;
    let stillTimer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;

    const render = (now: number) => {
      firstFrameAt ??= now;
      const live = liveRef.current;
      if (scene?.field.key !== live.field.key)
        scene = createBidGlobeScene(live.field);
      scene.field = live.field;
      bidAt = live.bidderId === null ? null : (bidAt ?? now);
      landShownAt = live.land === null ? null : (landShownAt ?? now);

      const frame = {
        seconds: live.still ? STILL_FRAME_SECONDS : (now - firstFrameAt) / 1000,
        bid:
          live.bidderId === null || bidAt === null
            ? null
            : {
                providerId: live.bidderId,
                seconds: live.still
                  ? BID_SETTLED_SECONDS
                  : (now - bidAt) / 1000,
              },
        isStill: live.still,
      };
      advanceBidGlobeScene(scene, frame);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, SIZE_PX, SIZE_PX);
      paint({
        size: SIZE_PX,
        view: viewAt(scene.field, frame.seconds),
        land:
          live.land && landShownAt !== null
            ? {
                shape: live.land,
                opacity: live.still
                  ? 1
                  : Math.min(1, (now - landShownAt) / LAND_FADE_IN_MS),
              }
            : null,
        shapes: composeGlobeOverlay(scene, frame, SIZE_PX),
      });

      if (!visible) return;
      // Still frames redraw slowly so late land data and a landing bid still show.
      if (live.still)
        stillTimer = setTimeout(
          () => (frameId = requestAnimationFrame(render)),
          STILL_FRAME_INTERVAL_MS,
        );
      else frameId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frameId);
      clearTimeout(stillTimer);
      if (visible) frameId = requestAnimationFrame(render);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(stillTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "block aspect-square w-[280px]"}
    />
  );
}
