/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { latLngToVector3 } from "./latLngToVector3";
import { loadWorldOutlineGeometry } from "./worldOutline";
import type { ProviderCluster } from "./clusterProviders";

const GLOBE_RADIUS = 1;
const BASE_CAMERA_DISTANCE = 2.75;
const MIN_CAMERA_DISTANCE = GLOBE_RADIUS * 1.7;
const MAX_CAMERA_DISTANCE = GLOBE_RADIUS * 4;
const ROTATION_SPEED = 0.0022;
const BASE_THETA = 0.24;
const FRAME_MS_60HZ = 1000 / 60;
const FOCUS_DURATION_MS = 1400;
const DRAG_SENSITIVITY = 0.006;
const MAX_THETA = 1.3;

const SPHERE_COLOR_DARK = "#14141f";
const GRID_COLOR_DARK = "#4b5570";
const OUTLINE_COLOR_DARK = "#7d89a8";

const SPHERE_COLOR_LIGHT = "#e9ecf5";
const GRID_COLOR_LIGHT = "#a7aec4";
const OUTLINE_COLOR_LIGHT = "#5b6478";

const MARKER_COLOR = "#8b5cf6";

/** Tracks the site's light/dark toggle (a `dark` class on <html>, flipped outside React) via
 * MutationObserver, since the globe's colors are Three.js material props — plain CSS can't
 * theme them the way `dark:` variants theme everything else on the page. */
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/** Explicit lat/lng graticule lines rather than a wireframed SphereGeometry — a triangulated wireframe sphere shows the diagonal edge of every quad's two triangles, which reads as clutter instead of a clean lat/long grid. */
function buildGraticuleGeometry(radius: number): THREE.BufferGeometry {
  const points: number[] = [];
  const segments = 64;

  for (let latDeg = -80; latDeg <= 80; latDeg += 20) {
    const latRad = (latDeg * Math.PI) / 180;
    const ringRadius = radius * Math.cos(latRad);
    const y = radius * Math.sin(latRad);
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      points.push(ringRadius * Math.cos(a0), y, ringRadius * Math.sin(a0));
      points.push(ringRadius * Math.cos(a1), y, ringRadius * Math.sin(a1));
    }
  }

  for (let lngDeg = 0; lngDeg < 180; lngDeg += 30) {
    const lngRad = (lngDeg * Math.PI) / 180;
    const ax = Math.sin(lngRad);
    const az = Math.cos(lngRad);
    for (let i = 0; i < segments; i++) {
      const t0 = (i / segments) * Math.PI * 2;
      const t1 = ((i + 1) / segments) * Math.PI * 2;
      points.push(radius * Math.cos(t0) * ax, radius * Math.sin(t0), radius * Math.cos(t0) * az);
      points.push(radius * Math.cos(t1) * ax, radius * Math.sin(t1), radius * Math.cos(t1) * az);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

type FocusTarget = { lat: number; lng: number } | null;

interface Props {
  clusters: ProviderCluster[];
  focusTarget: FocusTarget;
  scale: number;
  spinning: boolean;
  highlightedClusterId?: string | null;
  dimUnmatched?: (cluster: ProviderCluster) => boolean;
  onSelectCluster: (cluster: ProviderCluster) => void;
}

interface RotationState {
  phi: React.MutableRefObject<number>;
  theta: React.MutableRefObject<number>;
  dragging: React.MutableRefObject<{ startX: number; startY: number; startPhi: number; startTheta: number } | null>;
  /** The focusTarget object dismissed by starting a drag, so releasing the drag doesn't snap back to it. Cleared implicitly once a genuinely new focusTarget (a different object) comes in. */
  dismissedFocus: React.MutableRefObject<FocusTarget>;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function badgeSize(count: number): number {
  return Math.min(56, Math.max(26, 22 + count * 3));
}

function nearestEquivalentAngle(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  let delta = (((to - from) % twoPi) + twoPi) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  return from + delta;
}

interface SceneProps {
  clusters: ProviderCluster[];
  focusTarget: FocusTarget;
  scaleRef: React.MutableRefObject<number>;
  spinningRef: React.MutableRefObject<boolean>;
  rotation: RotationState;
  badgeRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  dimUnmatchedRef: React.MutableRefObject<Props["dimUnmatched"]>;
  isDark: boolean;
}

function GlobeScene({ clusters, focusTarget, scaleRef, spinningRef, rotation, badgeRefs, dimUnmatchedRef, isDark }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const focusTargetRef = useRef(focusTarget);
  focusTargetRef.current = focusTarget;
  const focusTween = useRef<{
    startedAt: number;
    fromPhi: number;
    toPhi: number;
    fromTheta: number;
    toTheta: number;
    target: FocusTarget;
  } | null>(null);
  const lastTime = useRef(performance.now());

  const markers = useMemo(
    () => clusters.map((c) => ({ cluster: c, position: latLngToVector3(c.lat, c.lng, GLOBE_RADIUS) })),
    [clusters],
  );
  const graticule = useMemo(() => buildGraticuleGeometry(GLOBE_RADIUS * 1.003), []);
  const [outline, setOutline] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadWorldOutlineGeometry(GLOBE_RADIUS * 1.004).then((geometry) => {
      if (!cancelled) setOutline(geometry);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { camera } = useThree();
  const { phi, theta } = rotation;

  const sphereColor = isDark ? SPHERE_COLOR_DARK : SPHERE_COLOR_LIGHT;
  const gridColor = isDark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT;
  const outlineColor = isDark ? OUTLINE_COLOR_DARK : OUTLINE_COLOR_LIGHT;

  useFrame(() => {
    const now = performance.now();
    const deltaFrames = (now - lastTime.current) / FRAME_MS_60HZ;
    lastTime.current = now;

    const rawFocus = focusTargetRef.current;
    const focus = rawFocus && rawFocus === rotation.dismissedFocus.current ? null : rawFocus;
    if (focus && !rotation.dragging.current) {
      const targetVector = latLngToVector3(focus.lat, focus.lng, 1);
      const targetPhi = Math.atan2(targetVector.x, targetVector.z);
      const targetTheta = Math.max(-MAX_THETA, Math.min(MAX_THETA, Math.asin(Math.max(-1, Math.min(1, targetVector.y)))));

      const existing = focusTween.current;
      const active =
        existing && existing.target?.lat === focus.lat && existing.target?.lng === focus.lng
          ? existing
          : {
              startedAt: now,
              fromPhi: phi.current,
              toPhi: nearestEquivalentAngle(phi.current, targetPhi),
              fromTheta: theta.current,
              toTheta: targetTheta,
              target: focus,
            };
      focusTween.current = active;

      const progress = Math.min(1, (now - active.startedAt) / FOCUS_DURATION_MS);
      const eased = easeInOutCubic(progress);
      phi.current = active.fromPhi + (active.toPhi - active.fromPhi) * eased;
      theta.current = active.fromTheta + (active.toTheta - active.fromTheta) * eased;
    } else {
      focusTween.current = null;
      if (spinningRef.current && !rotation.dragging.current && !focus) {
        phi.current += ROTATION_SPEED * deltaFrames;
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = phi.current;
      groupRef.current.rotation.x = theta.current;
      groupRef.current.updateMatrixWorld();
    }

    // Clamped so the camera can never get close enough to the sphere (radius 1) for the near
    // plane to clip through it — that clipping is what squared off the globe's silhouette and
    // sent marker projections to extreme/invalid screen positions at high zoom.
    const distance = Math.min(MAX_CAMERA_DISTANCE, Math.max(MIN_CAMERA_DISTANCE, BASE_CAMERA_DISTANCE / scaleRef.current));
    camera.position.setZ(distance);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const cameraDir = camera.position.clone().normalize();
    const worldPos = new THREE.Vector3();
    for (const { cluster, position } of markers) {
      const badge = badgeRefs.current.get(cluster.id);
      if (!badge || !groupRef.current) continue;

      worldPos.copy(position).applyMatrix4(groupRef.current.matrixWorld);
      const facing = worldPos.clone().normalize().dot(cameraDir);
      const projected = worldPos.clone().project(camera);
      const offscreen = !Number.isFinite(projected.x) || !Number.isFinite(projected.y) || Math.abs(projected.x) > 1.15 || Math.abs(projected.y) > 1.15;
      if (facing < 0.04 || offscreen) {
        badge.style.opacity = "0";
        badge.style.pointerEvents = "none";
        continue;
      }

      badge.style.opacity = dimUnmatchedRef.current?.(cluster) ? "0.25" : "1";
      badge.style.pointerEvents = "auto";
      badge.style.left = `${((projected.x + 1) / 2) * 100}%`;
      badge.style.top = `${((1 - projected.y) / 2) * 100}%`;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 32]} />
        <meshBasicMaterial color={sphereColor} />
      </mesh>
      <lineSegments geometry={graticule}>
        <lineBasicMaterial color={gridColor} transparent opacity={0.5} />
      </lineSegments>
      {outline && (
        <lineSegments geometry={outline}>
          <lineBasicMaterial color={outlineColor} transparent opacity={0.85} />
        </lineSegments>
      )}
      {markers.map(({ cluster, position }) => (
        <mesh key={cluster.id} position={position}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color={MARKER_COLOR} />
        </mesh>
      ))}
    </group>
  );
}

export function ProvidersGlobe({ clusters, focusTarget, scale, spinning, highlightedClusterId, dimUnmatched, onSelectCluster }: Props) {
  const isDark = useIsDarkMode();
  const badgeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const spinningRef = useRef(spinning);
  spinningRef.current = spinning;
  const dimUnmatchedRef = useRef(dimUnmatched);
  dimUnmatchedRef.current = dimUnmatched;

  const phi = useRef(0);
  const theta = useRef(BASE_THETA);
  const dragging = useRef<{ startX: number; startY: number; startPhi: number; startTheta: number } | null>(null);
  const dismissedFocus = useRef<FocusTarget>(null);
  const rotation = useMemo(() => ({ phi, theta, dragging, dismissedFocus }), []);

  const clustersKey = useMemo(
    () => clusters.map((c) => `${c.id}:${c.lat.toFixed(2)},${c.lng.toFixed(2)}`).join("|"),
    [clusters],
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = { startX: event.clientX, startY: event.clientY, startPhi: phi.current, startTheta: theta.current };
    // Starting a drag permanently overrides whatever focus is currently active (e.g. from a prior
    // marker click) — without this, the drag rotates the globe correctly while the pointer is
    // down, but the instant you release, the still-active focusTarget prop resumes its tween and
    // snaps the view straight back to the focused marker.
    dismissedFocus.current = focusTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragging.current;
    if (!drag) return;
    // Divided by the current zoom so a given pointer-pixel delta rotates the sphere by a
    // proportionally smaller angle when zoomed in — surface features appear bigger on screen at
    // higher zoom, so the same fixed sensitivity would otherwise feel wildly over-responsive.
    const sensitivity = DRAG_SENSITIVITY / scaleRef.current;
    phi.current = drag.startPhi + (event.clientX - drag.startX) * sensitivity;
    theta.current = Math.max(-MAX_THETA, Math.min(MAX_THETA, drag.startTheta - (event.clientY - drag.startY) * sensitivity));
  }
  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      className="relative aspect-square w-full max-w-[520px] select-none overflow-hidden rounded-full"
      style={{
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0) 72%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, BASE_CAMERA_DISTANCE], fov: 42, near: 0.1, far: 10 }}
        gl={{ alpha: true, antialias: true }}
        className="cursor-grab touch-none active:cursor-grabbing"
        key={clustersKey}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <GlobeScene
          clusters={clusters}
          focusTarget={focusTarget}
          scaleRef={scaleRef}
          spinningRef={spinningRef}
          rotation={rotation}
          badgeRefs={badgeRefs}
          dimUnmatchedRef={dimUnmatchedRef}
          isDark={isDark}
        />
      </Canvas>
      {clusters.map((cluster) => {
        const count = cluster.providers.length;
        const size = count > 1 ? badgeSize(count) : 10;
        const isHighlighted = highlightedClusterId === cluster.id;
        return (
          <button
            key={cluster.id}
            ref={(el) => {
              if (el) badgeRefs.current.set(cluster.id, el);
              else badgeRefs.current.delete(cluster.id);
            }}
            type="button"
            onClick={() => onSelectCluster(cluster)}
            style={{ left: "50%", top: "50%", width: size, height: size, opacity: 0 }}
            className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-violet-600/90 text-[10px] font-bold text-white transition-[opacity,transform] duration-150 hover:scale-110 ${
              isHighlighted ? "border-white scale-110" : "border-white/70"
            } ${count === 1 ? "border-[1.5px]" : ""}`}
          >
            {count > 1 ? count : null}
          </button>
        );
      })}
    </div>
  );
}
