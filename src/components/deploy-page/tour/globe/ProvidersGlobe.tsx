import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// The provider globe behind Console's deploy progress
// (deployments/ConfigureDeployment/DeployProgressOverlay/ProvidersGlobe on top of
// globe/Globe): an oversized cobe sphere cropped to its top cap that shows every
// online provider while matching, then only the matched one with the camera
// turned toward it.
const THETA = 0.2;
const ROTATION_PER_FRAME = 0.005;
const FRAME_MS = 1000 / 60;
const FOCUS_MS = 1600;
/** Lifts the focused provider toward the top of the visible cap. */
const FOCUS_BIAS_Y = -0.75;
const MAX_THETA = (Math.PI / 2) * 0.999;
/** cobe puts longitude 0 a quarter turn right of the camera. */
const MERIDIAN_OFFSET = -Math.PI / 2;
const MARKER_SIZE = 0.01;
const MARKER_PINK: [number, number, number] = [236 / 255, 72 / 255, 153 / 255];
const LABEL_BG = "lab(36 55.64 -107.68)";

type Rgb = [number, number, number];
type Point = { lat: number; lng: number };
type Tween = {
  at: number;
  fromPhi: number;
  toPhi: number;
  fromTheta: number;
  toTheta: number;
};

export default function ProvidersGlobe({
  size,
  still,
  points,
  focus,
}: {
  size: number;
  still: boolean;
  points: Point[];
  focus: (Point & { id: string; label: string }) | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phi = useRef(0);
  const theta = useRef(THETA);
  const dark = useDarkTheme();
  const shown: (Point & { id?: string })[] = focus ? [focus] : points;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const key = focus ? focus.id : `${points.length}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const target = focus && {
      phi: -toRad(focus.lng) + MERIDIAN_OFFSET,
      theta: clamp(toRad(focus.lat) + Math.asin(FOCUS_BIAS_Y), MAX_THETA),
    };
    if (still) {
      phi.current = target?.phi ?? phi.current;
      theta.current = target?.theta ?? THETA;
    }

    const glow: Rgb = dark ? [0.09, 0.09, 0.09] : [1, 1, 1];
    const globe = createGlobe(canvas, {
      devicePixelRatio: 1,
      width: size,
      height: size,
      phi: phi.current,
      theta: theta.current,
      dark: 1,
      diffuse: 0,
      mapSamples: 32000,
      mapBrightness: dark ? 8 : 1,
      baseColor: readRgb(canvas, "--tc-card", glow),
      markerColor: MARKER_PINK,
      markerElevation: 0,
      glowColor: glow,
      markers: shownRef.current.map((m) => ({
        id: m.id,
        location: [m.lat, m.lng],
        size: MARKER_SIZE,
      })),
    });

    // Free-spin while matching; once a provider is matched, ease the camera
    // onto it over a fixed time so the whole turn stays visible.
    let tween: Tween | null = null;
    let last = performance.now();
    let frame = 0;
    let visible = false;
    const tick = (now: number) => {
      const frames = (now - last) / FRAME_MS;
      last = now;
      if (target && !still) {
        tween ??= {
          at: now,
          fromPhi: phi.current,
          toPhi: phi.current + shortestDelta(phi.current, target.phi),
          fromTheta: theta.current,
          toTheta: target.theta,
        };
        const t = easeInOutCubic(Math.min(1, (now - tween.at) / FOCUS_MS));
        phi.current = tween.fromPhi + (tween.toPhi - tween.fromPhi) * t;
        theta.current = tween.fromTheta + (tween.toTheta - tween.fromTheta) * t;
      } else if (!still) {
        phi.current += ROTATION_PER_FRAME * frames;
        theta.current += (THETA - theta.current) * Math.min(1, 0.08 * frames);
      }
      globe.update({ phi: phi.current, theta: theta.current });
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
    // `focus` only matters through `key`; a new object with the same id keeps the globe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, key, dark, still]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: "block" }}
      />
      {focus && (
        <div
          className="pointer-events-none absolute whitespace-nowrap uppercase text-white"
          style={
            {
              positionAnchor: `--cobe-${focus.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 14,
              padding: "0.15rem 0.35rem",
              background: LABEL_BG,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              opacity: `var(--cobe-visible-${focus.id}, 0)`,
              transition: "opacity 0.3s",
            } as React.CSSProperties
          }
        >
          {focus.label}
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
      )}
    </div>
  );
}

/** Follows the site's `.dark` class, which the tour's colors key off too. */
function useDarkTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/** Reads a `--tc-*` token ("r g b", 0–255) as cobe's 0–1 color. */
function readRgb(el: Element, name: string, fallback: Rgb): Rgb {
  const parts = getComputedStyle(el)
    .getPropertyValue(name)
    .trim()
    .split(/\s+/)
    .map(Number);
  return parts.length === 3 && parts.every(Number.isFinite)
    ? (parts.map((v) => v / 255) as Rgb)
    : fallback;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/** Signed shortest turn from one angle to another, so the camera never goes the long way round. */
function shortestDelta(from: number, to: number) {
  const twoPi = Math.PI * 2;
  let delta = (((to - from) % twoPi) + twoPi) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  return delta;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
