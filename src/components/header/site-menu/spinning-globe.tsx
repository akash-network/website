import { useEffect, useRef } from "react";
import { feature } from "topojson-client";

import type { GlobeMarker } from "./menu-data";

type Rgb = [number, number, number];
type Vec3 = [number, number, number];
type Ring = [number, number][];

// A small orthographic globe drawn on a 2D canvas with filled continents.
// cobe (the providers use-case globe) only draws land as dots, which break up at
// this size. Land is rasterized once into an equirectangular mask; each frame
// then just looks up which longitude sits under each pixel.

// Same 110m land dataset the providers page globe loads.
const WORLD_ATLAS_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const MASK_WIDTH = 720; // 0.5° per mask pixel
const MASK_HEIGHT = 360;

const DEG = Math.PI / 180;
// About one turn a minute, independent of the display's refresh rate.
const DEGREES_PER_MS = 0.006;
// Starts over the Atlantic: the Americas and Europe, where most providers are.
const START_LNG = -40;
// Tilted north: most providers sit at 35–55°N.
const TILT = 26 * DEG;
// Light from the upper left, in view space.
const LIGHT = normalize([-0.45, 0.55, 0.7]);

const MARKER_COLOR = "rgb(255 65 76)";
const MARKER_RADIUS_PX = 1.5;

const PALETTE: Record<"light" | "dark", { ocean: Rgb; land: Rgb }> = {
  light: { ocean: [255, 255, 255], land: [161, 161, 170] }, // white, zinc-400
  dark: { ocean: [39, 39, 42], land: [113, 113, 122] }, // zinc-800, zinc-500
};

function normalize([x, y, z]: Vec3): Vec3 {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
}

interface LandGeometry {
  type: string;
  coordinates?: unknown;
  geometry?: LandGeometry;
  features?: LandGeometry[];
}

function landPolygons(geo: LandGeometry): Ring[][] {
  if (geo.features) return geo.features.flatMap(landPolygons);
  if (geo.geometry) return landPolygons(geo.geometry);
  if (geo.type === "Polygon") return [geo.coordinates as Ring[]];
  if (geo.type === "MultiPolygon") return geo.coordinates as Ring[][];
  return [];
}

function rasterizeLand(geo: LandGeometry): Uint8Array {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const toX = (lng: number) => ((lng + 180) / 360) * MASK_WIDTH;
  const toY = (lat: number) => ((90 - lat) / 180) * MASK_HEIGHT;

  for (const polygon of landPolygons(geo)) {
    ctx.beginPath();
    for (const ring of polygon) {
      // Unwrap jumps across the antimeridian so the ring stays continuous,
      // then draw it shifted ±360° as well so the wrapped part lands on the map.
      let shift = 0;
      const unwrapped = ring.map(([lng, lat], i) => {
        const jump = i > 0 ? lng - ring[i - 1][0] : 0;
        if (jump > 180) shift -= 360;
        else if (jump < -180) shift += 360;
        return [lng + shift, lat];
      });
      for (const offset of [-360, 0, 360]) {
        unwrapped.forEach(([lng, lat], i) => {
          if (i === 0) ctx.moveTo(toX(lng + offset), toY(lat));
          else ctx.lineTo(toX(lng + offset), toY(lat));
        });
        ctx.closePath();
      }
    }
    ctx.fill("evenodd");
  }

  const { data } = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
  const mask = new Uint8Array(MASK_WIDTH * MASK_HEIGHT);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;
  return mask;
}

let landMask: Promise<Uint8Array | null> | undefined;

/** Fetched and rasterized once per page, shared by every mount. */
function loadLandMask(): Promise<Uint8Array | null> {
  landMask ??= fetch(WORLD_ATLAS_URL)
    .then((response) => response.json())
    .then((topology) =>
      rasterizeLand(
        feature(topology, topology.objects.land) as unknown as LandGeometry,
      ),
    )
    .catch(() => {
      landMask = undefined; // allow a retry on the next open
      return null;
    });
  return landMask;
}

export default function SpinningGlobe({
  markers,
  className,
}: {
  markers: GlobeMarker[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.round(canvas.offsetWidth * dpr);
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = center - 1; // leaves room for the anti-aliased edge
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Everything but the longitude under each pixel is fixed, so the sphere's
    // geometry is worked out once: mask row, longitude offset, shading, alpha.
    const pixelIndex: number[] = [];
    const maskRow: number[] = [];
    const lngOffset: number[] = [];
    const shade: number[] = [];
    const alpha: number[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - center;
        const dy = center - (y + 0.5);
        const distance = Math.hypot(dx, dy);
        if (distance > radius + 0.5) continue;

        let nx = dx / radius;
        let ny = dy / radius;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) {
          nx /= Math.sqrt(r2);
          ny /= Math.sqrt(r2);
        }
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const worldY = ny * Math.cos(TILT) + nz * Math.sin(TILT);
        const worldZ = -ny * Math.sin(TILT) + nz * Math.cos(TILT);
        const lat = Math.asin(worldY) / DEG;

        pixelIndex.push((y * size + x) * 4);
        maskRow.push(
          Math.min(
            MASK_HEIGHT - 1,
            Math.floor(((90 - lat) / 180) * MASK_HEIGHT),
          ) * MASK_WIDTH,
        );
        lngOffset.push(Math.atan2(nx, worldZ) / DEG);
        const light = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
        shade.push(0.86 + 0.14 * Math.max(0, light));
        alpha.push(Math.min(1, radius + 0.5 - distance) * 255);
      }
    }

    const image = ctx.createImageData(size, size);
    let mask: Uint8Array | null = null;
    let disposed = false;
    loadLandMask().then((loaded) => {
      if (!disposed) mask = loaded;
    });

    const draw = (centerLng: number) => {
      const palette =
        PALETTE[
          document.documentElement.classList.contains("dark") ? "dark" : "light"
        ];
      const { data } = image;
      for (let i = 0; i < pixelIndex.length; i++) {
        const lng = (((lngOffset[i] + centerLng + 180) % 360) + 360) % 360;
        const isLand =
          mask !== null &&
          mask[maskRow[i] + Math.floor((lng / 360) * MASK_WIDTH)] === 1;
        const [r, g, b] = isLand ? palette.land : palette.ocean;
        const o = pixelIndex[i];
        data[o] = r * shade[i];
        data[o + 1] = g * shade[i];
        data[o + 2] = b * shade[i];
        data[o + 3] = alpha[i];
      }
      ctx.putImageData(image, 0, 0);

      // Markers on the near hemisphere only, sitting on the surface.
      ctx.fillStyle = MARKER_COLOR;
      ctx.beginPath();
      for (const [lat, lng] of markers) {
        const la = lat * DEG;
        const rel = (lng - centerLng) * DEG;
        const worldX = Math.cos(la) * Math.sin(rel);
        const worldY = Math.sin(la);
        const worldZ = Math.cos(la) * Math.cos(rel);
        const viewY = worldY * Math.cos(TILT) - worldZ * Math.sin(TILT);
        const viewZ = worldY * Math.sin(TILT) + worldZ * Math.cos(TILT);
        if (viewZ <= 0.1) continue;

        const px = center + worldX * radius;
        const py = center - viewY * radius;
        ctx.moveTo(px + MARKER_RADIUS_PX * dpr, py);
        ctx.arc(px, py, MARKER_RADIUS_PX * dpr, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    // The loop also picks up the land mask once it loads and theme switches,
    // so it keeps running with reduced motion and just holds the rotation.
    let centerLng = START_LNG;
    let last = performance.now();
    let rafId = 0;
    const frame = (now: number) => {
      if (!reduceMotion) centerLng -= (now - last) * DEGREES_PER_MS;
      last = now;
      draw(centerLng);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Provider locations on a globe"
      className={className}
    />
  );
}
