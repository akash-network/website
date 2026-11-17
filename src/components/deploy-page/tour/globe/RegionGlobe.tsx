import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// The sign-in globe from Akash Console: cobe with the same settings and region
// markers (apps/deploy-web/src/components/globe/Globe, auth/AuthLayout/markers).
const REGIONS = [
  { id: "us-west-1", lat: 37.37, lng: -121.92 },
  { id: "us-east-1", lat: 39.04, lng: -77.49 },
  { id: "eu-west-1", lat: 53.35, lng: -6.26 },
  { id: "eu-central-1", lat: 50.11, lng: 8.68 },
  { id: "ap-southeast-1", lat: 1.35, lng: 103.82 },
  { id: "ap-northeast-1", lat: 35.68, lng: 139.65 },
  { id: "ap-southeast-2", lat: -33.87, lng: 151.21 },
  { id: "sa-east-1", lat: -23.55, lng: -46.63 },
];

const ROTATION_PER_FRAME = 0.005;
const THETA = 0.2;
const FRAME_MS = 1000 / 60;
const MARKER_PINK: [number, number, number] = [236 / 255, 72 / 255, 153 / 255];
const LABEL_BG = "lab(36 55.64 -107.68)";

type Marker = { id: string; lat: number; lng: number };

export default function RegionGlobe({
  size,
  still,
  markers = REGIONS,
  labels = true,
}: {
  size: number;
  still: boolean;
  markers?: Marker[];
  labels?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const globe = createGlobe(canvas, {
      devicePixelRatio: 1,
      width: size,
      height: size,
      phi: 0,
      theta: THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.09, 0.09, 0.09],
      markerColor: MARKER_PINK,
      markerElevation: 0,
      glowColor: [0.08, 0.08, 0.08],
      markers: markers.map((r) => ({
        id: r.id,
        location: [r.lat, r.lng],
        size: 0.04,
      })),
    });

    // Spin only while on screen; a reduced-motion globe is drawn once.
    let phi = 0;
    let last = performance.now();
    let frame = 0;
    let visible = false;
    const tick = (now: number) => {
      phi += (ROTATION_PER_FRAME * (now - last)) / FRAME_MS;
      last = now;
      globe.update({ phi, theta: THETA });
      if (visible && !still) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      globe.destroy();
      // cobe wraps the canvas on creation and never unwraps it.
      const wrapper = canvas.parentElement;
      if (wrapper && parent && wrapper !== parent) {
        wrapper.parentElement?.insertBefore(canvas, wrapper);
        wrapper.remove();
      }
    };
  }, [size, markers, still]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: "block" }}
      />
      {labels &&
        markers.map((r) => (
          <div
            key={r.id}
            className="pointer-events-none absolute whitespace-nowrap uppercase text-white"
            style={
              {
                positionAnchor: `--cobe-${r.id}`,
                bottom: "anchor(top)",
                left: "anchor(center)",
                translate: "-50% 0",
                marginBottom: 14,
                padding: "0.15rem 0.35rem",
                background: LABEL_BG,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                opacity: `var(--cobe-visible-${r.id}, 0)`,
                transition: "opacity 0.3s",
              } as React.CSSProperties
            }
          >
            {r.id}
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translate3d(-50%, -1px, 0)",
                border: "5px solid transparent",
                borderTopColor: LABEL_BG,
              }}
            />
          </div>
        ))}
    </div>
  );
}
