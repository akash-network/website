// The "Collecting bids" globe from Akash Console, ported so the tour shows
// the real animation: request arcs fly from you to providers, pins light up
// as they're reached, and the first bid returns as a green arc.
//
// Source: github.com/akash-network/console (Apache-2.0),
// apps/deploy-web/src/components/deployments/ConfigureDeployment/MarketplacePane/BidCollecting
// (globeGeometry.ts, bidGlobeScene.ts, paintBidGlobe.ts). Logic and timings
// are unchanged; the three files are merged here.
import type { GeoPermissibleObjects } from "d3-geo";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";

export const RADIANS_PER_DEGREE = Math.PI / 180;

const REFERENCE_SIZE_PX = 280;
const ORB_RADIUS_RATIO = 0.4;
const MIN_INTERPOLATED_ANGLE = 1e-6;
const FULL_TURN = Math.PI * 2;

export interface GeoPoint {
  lng: number;
  lat: number;
  vector: readonly [number, number, number];
}

export interface GlobeView {
  centerLng: number;
  tilt: number;
}

export interface LocatedProvider {
  id: string;
  lat: number;
  lng: number;
}

interface GlobeNode extends GeoPoint {
  id: string;
  distance: number;
}

export interface GlobeField {
  key: string;
  viewer: GeoPoint;
  nodes: GlobeNode[];
  launchOrder: number[];
}

interface Arc {
  node: number;
  launchedAt: number;
  duration: number;
  hasLanded: boolean;
}

interface Pulse {
  node: number;
  startedAt: number;
}

export interface BidGlobeScene {
  field: GlobeField;
  arcs: Arc[];
  pulses: Pulse[];
  reachedAt: Map<number, number>;
  launchedCount: number;
  nextLaunchAt: number;
}

export interface BidGlobeFrame {
  seconds: number;
  bid: { providerId: string; seconds: number } | null;
  isStill: boolean;
}

type GlobeShape =
  | {
      kind: "dot";
      x: number;
      y: number;
      radius: number;
      color: string;
      opacity: number;
      glow?: { color: string; blur: number };
    }
  | {
      kind: "ring";
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      rotation: number;
      color: string;
    }
  | {
      kind: "segment";
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      width: number;
      color: string;
    };

// Geometry

function globeLayout(size: number) {
  return {
    center: size / 2,
    radius: size * ORB_RADIUS_RATIO,
    unit: size / REFERENCE_SIZE_PX,
  };
}

export function toGeoPoint(lng: number, lat: number): GeoPoint {
  return {
    lng,
    lat,
    vector: [
      Math.cos(lat) * Math.cos(lng),
      Math.cos(lat) * Math.sin(lng),
      Math.sin(lat),
    ],
  };
}

function angleBetween(from: GeoPoint, to: GeoPoint): number {
  const dot =
    from.vector[0] * to.vector[0] +
    from.vector[1] * to.vector[1] +
    from.vector[2] * to.vector[2];
  return Math.acos(clamp(dot, -1, 1));
}

function interpolateGreatCircle(
  from: GeoPoint,
  to: GeoPoint,
  angle: number,
  progress: number,
): [number, number] {
  if (angle < MIN_INTERPOLATED_ANGLE) return [from.lng, from.lat];
  const sinAngle = Math.sin(angle);
  const fromWeight = Math.sin((1 - progress) * angle) / sinAngle;
  const toWeight = Math.sin(progress * angle) / sinAngle;
  const x = fromWeight * from.vector[0] + toWeight * to.vector[0];
  const y = fromWeight * from.vector[1] + toWeight * to.vector[1];
  const z = fromWeight * from.vector[2] + toWeight * to.vector[2];
  return [Math.atan2(y, x), Math.asin(clamp(z, -1, 1))];
}

/** Matches d3's geoOrthographic rotated by [-centerLng, -tilt]. */
function projectOnGlobe(
  view: GlobeView,
  lng: number,
  lat: number,
  altitude = 1,
) {
  const lngFromCenter = lng - view.centerLng;
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const cosLngFromCenter = Math.cos(lngFromCenter);
  const x = cosLat * Math.sin(lngFromCenter);
  const y =
    Math.cos(view.tilt) * sinLat -
    Math.sin(view.tilt) * cosLat * cosLngFromCenter;
  const depth =
    Math.sin(view.tilt) * sinLat +
    Math.cos(view.tilt) * cosLat * cosLngFromCenter;
  const clearsOutline = (x * x + y * y) * altitude * altitude > 1;
  return {
    x: x * altitude,
    y: y * altitude,
    depth,
    isVisible: depth > 0 || clearsOutline,
  };
}

/** Guessed from the UTC offset, since asking for the real location would prompt for a permission. */
export function locateViewer(timezoneOffsetMinutes: number): GeoPoint {
  const lngDegrees = clamp(-timezoneOffsetMinutes / 4, -165, 165);
  const latDegrees =
    timezoneOffsetMinutes > 0 ? 37 : timezoneOffsetMinutes < -300 ? 30 : 47;
  return toGeoPoint(
    lngDegrees * RADIANS_PER_DEGREE,
    latDegrees * RADIANS_PER_DEGREE,
  );
}

function hashToUnit(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

function easeOutBack(progress: number): number {
  return 1 + 2.70158 * (progress - 1) ** 3 + 1.70158 * (progress - 1) ** 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Scene

const MAX_GLOBE_PROVIDERS = 64;
const VIEW_LEAD_RADIANS = 0.7;
const VIEW_TILT_RADIANS = 0.38;
const SPIN_RADIANS_PER_SECOND = 0.038;
const FACING_DEPTH = 0.12;
const FIRST_LAUNCH_SECONDS = 0.4;
const LAUNCH_INTERVAL_SECONDS = 0.24;
const MAX_LAUNCH_BACKLOG_SECONDS = 1;
const ARC_BASE_SECONDS = 0.7;
const ARC_SECONDS_PER_HALF_TURN = 0.55;
const ARC_TAIL_LENGTH = 0.42;
const ARC_FADE_SECONDS = 0.5;
const ARC_SEGMENTS_PER_LENGTH = 30;
const PULSE_SECONDS = 0.9;
const PIN_LIGHT_UP_SECONDS = 0.3;
const VIEWER_PULSE_SECONDS = 1.2;
const REACHED_IN_STILL_FRAME = -Infinity;
const BID_REPLY_DELAY_SECONDS = 0.04;
const BID_REPLY_SECONDS = 0.55;
const BID_ARRIVAL_RING_SECONDS = 0.6;
export const BID_SETTLED_SECONDS = 2;

const COLORS = {
  arc: "201,138,232",
  arcHead: "#f5ecff",
  arcHeadGlow: "#c98ae8",
  bid: "52,211,153",
  bidHead: "#d1fae5",
  bidHeadGlow: "#34d399",
  pin: "#d9b6f7",
  pinDim: "#6b5c7d",
  viewer: "#ffffff",
  viewerRing: "255,255,255",
  viewerGlow: "rgba(255,255,255,0.8)",
};

export function buildGlobeField(
  providers: LocatedProvider[],
  viewer: GeoPoint,
  seed: string,
): GlobeField {
  const nodes = providers
    .slice(0, MAX_GLOBE_PROVIDERS)
    .map((provider): GlobeNode => {
      const point = toGeoPoint(
        provider.lng * RADIANS_PER_DEGREE,
        provider.lat * RADIANS_PER_DEGREE,
      );
      return {
        ...point,
        id: provider.id,
        distance: angleBetween(point, viewer),
      };
    });
  const openingView = viewFrom(viewer, 0);
  const facesViewer = (node: GlobeNode) =>
    projectOnGlobe(openingView, node.lng, node.lat).depth > FACING_DEPTH;
  const shuffleRank = (node: GlobeNode) => hashToUnit(`${node.id}${seed}`);
  const launchOrder = nodes
    .map((_, index) => index)
    .sort(
      (a, b) =>
        Number(facesViewer(nodes[b])) - Number(facesViewer(nodes[a])) ||
        shuffleRank(nodes[a]) - shuffleRank(nodes[b]),
    );
  return {
    key: `${seed}|${nodes.map((node) => node.id).join(",")}`,
    viewer,
    nodes,
    launchOrder,
  };
}

export function createBidGlobeScene(field: GlobeField): BidGlobeScene {
  return {
    field,
    arcs: [],
    pulses: [],
    reachedAt: new Map(),
    launchedCount: 0,
    nextLaunchAt: FIRST_LAUNCH_SECONDS,
  };
}

export function viewAt(
  field: Pick<GlobeField, "viewer">,
  seconds: number,
): GlobeView {
  return viewFrom(field.viewer, seconds);
}

export function advanceBidGlobeScene(
  scene: BidGlobeScene,
  frame: BidGlobeFrame,
): void {
  if (frame.isStill)
    scene.field.nodes.forEach((_, index) =>
      scene.reachedAt.set(index, REACHED_IN_STILL_FRAME),
    );
  else if (!frame.bid) launchDueArcs(scene, frame.seconds);
  landArrivedArcs(scene, frame.seconds);
  scene.pulses = scene.pulses.filter(
    (pulse) => frame.seconds - pulse.startedAt < PULSE_SECONDS,
  );
  const bidder = bidderIndexOf(scene, frame);
  if (bidder >= 0 && !scene.reachedAt.has(bidder))
    scene.reachedAt.set(bidder, frame.seconds);
}

export function composeGlobeOverlay(
  scene: BidGlobeScene,
  frame: BidGlobeFrame,
  size: number,
): GlobeShape[] {
  const { center, radius, unit } = globeLayout(size);
  const view = viewAt(scene.field, frame.seconds);
  const shapes: GlobeShape[] = [];
  const bidder = bidderIndexOf(scene, frame);
  const bidSeconds = frame.bid?.seconds ?? null;
  const dimming =
    bidSeconds === null ? 1 : 1 - 0.4 * Math.min(1, bidSeconds / 0.3);
  const arcOpacity =
    bidSeconds === null ? 1 : Math.max(0, 1 - bidSeconds / 0.22);
  const { nodes, viewer } = scene.field;

  function toScreen(lng: number, lat: number, altitude = 1) {
    const point = projectOnGlobe(view, lng, lat, altitude);
    return {
      x: center + radius * point.x,
      y: center - radius * point.y,
      depth: point.depth,
      isVisible: point.isVisible,
    };
  }

  type ScreenPoint = ReturnType<typeof toScreen>;

  function addRing(
    point: ScreenPoint,
    progress: number,
    rgb: string,
    maxRadius: number,
    opacity: number,
  ) {
    const ringRadius = (2 + maxRadius * (1 - (1 - progress) ** 2)) * unit;
    shapes.push({
      kind: "ring",
      x: point.x,
      y: point.y,
      radiusX: Math.max(0.1, ringRadius * Math.max(0.05, point.depth)),
      radiusY: ringRadius,
      rotation: Math.atan2(point.y - center, point.x - center),
      color: rgba(rgb, opacity * (1 - progress)),
    });
  }

  function addHead(
    point: ScreenPoint | null,
    color: string,
    glow: string,
    opacity: number,
  ) {
    if (!point?.isVisible) return;
    shapes.push({
      kind: "dot",
      x: point.x,
      y: point.y,
      radius: 1.8 * unit,
      color,
      opacity,
      glow: { color: glow, blur: 6 * unit },
    });
  }

  function addArc(
    from: GeoPoint,
    to: GeoPoint,
    angle: number,
    tail: number,
    head: number,
    rgb: string,
    opacity: number,
    fadesTowardTail: boolean,
  ) {
    const steps = Math.max(
      2,
      Math.ceil((head - tail) * ARC_SEGMENTS_PER_LENGTH),
    );
    const lift = 0.05 + (0.13 * angle) / Math.PI;
    let previous: ScreenPoint | null = null;
    for (let step = 0; step <= steps; step++) {
      const progress = tail + (head - tail) * (step / steps);
      const [lng, lat] = interpolateGreatCircle(from, to, angle, progress);
      const point = toScreen(lng, lat, 1 + lift * Math.sin(Math.PI * progress));
      if (previous?.isVisible && point.isVisible) {
        const share = step / steps;
        const segmentOpacity = fadesTowardTail
          ? opacity * (0.06 + 0.94 * share ** 2)
          : opacity;
        shapes.push({
          kind: "segment",
          fromX: previous.x,
          fromY: previous.y,
          toX: point.x,
          toY: point.y,
          width: 1.25 * unit,
          color: rgba(rgb, segmentOpacity),
        });
      }
      previous = point;
    }
    return previous;
  }

  nodes.forEach((node, index) => {
    if (index === bidder) return;
    const point = toScreen(node.lng, node.lat);
    if (point.depth <= 0.01) return;
    const edgeFade = Math.min(1, point.depth * 5) * dimming;
    const reachedAt = scene.reachedAt.get(index);
    const lit =
      reachedAt === undefined
        ? 0
        : Math.min(1, (frame.seconds - reachedAt) / PIN_LIGHT_UP_SECONDS);
    const pinRadius = (1.5 + 0.6 * lit) * unit;
    if (lit < 1)
      shapes.push({
        kind: "dot",
        x: point.x,
        y: point.y,
        radius: pinRadius,
        color: COLORS.pinDim,
        opacity: edgeFade * (1 - lit),
      });
    if (lit > 0)
      shapes.push({
        kind: "dot",
        x: point.x,
        y: point.y,
        radius: pinRadius,
        color: COLORS.pin,
        opacity: edgeFade * lit,
      });
  });

  scene.pulses.forEach((pulse) => {
    if (pulse.node === bidder) return;
    const node = nodes[pulse.node];
    const point = toScreen(node.lng, node.lat);
    if (point.depth > 0.05)
      addRing(
        point,
        (frame.seconds - pulse.startedAt) / PULSE_SECONDS,
        COLORS.arc,
        10,
        0.8 * dimming,
      );
  });

  if (arcOpacity > 0) {
    scene.arcs.forEach((arc) => {
      const age = frame.seconds - arc.launchedAt;
      const head = easeInOutCubic(Math.min(1, age / arc.duration));
      const isFlying = age < arc.duration;
      const tail = isFlying
        ? Math.max(0, head - ARC_TAIL_LENGTH)
        : Math.min(
            1,
            1 -
              ARC_TAIL_LENGTH +
              (ARC_TAIL_LENGTH * (age - arc.duration)) / ARC_FADE_SECONDS,
          );
      if (tail >= head) return;
      const node = nodes[arc.node];
      const end = addArc(
        viewer,
        node,
        node.distance,
        tail,
        head,
        COLORS.arc,
        0.9 * arcOpacity,
        true,
      );
      if (isFlying)
        addHead(end, COLORS.arcHead, COLORS.arcHeadGlow, arcOpacity);
    });
  }

  const viewerPoint = toScreen(viewer.lng, viewer.lat);

  if (bidSeconds !== null && bidder >= 0) {
    const node = nodes[bidder];
    const replyAge = bidSeconds - BID_REPLY_DELAY_SECONDS;
    if (replyAge > 0) {
      const replyHead = easeInOutCubic(
        Math.min(1, replyAge / BID_REPLY_SECONDS),
      );
      const replyEnd = addArc(
        node,
        viewer,
        node.distance,
        0,
        replyHead,
        COLORS.bid,
        0.95,
        false,
      );
      if (replyAge < BID_REPLY_SECONDS)
        addHead(replyEnd, COLORS.bidHead, COLORS.bidHeadGlow, 1);
    }
    const bidderPoint = toScreen(node.lng, node.lat);
    if (bidderPoint.depth > 0.01) {
      addRing(bidderPoint, Math.min(1, bidSeconds / 0.8), COLORS.bid, 14, 0.9);
      const popRadius =
        2.6 * unit * Math.max(0.2, easeOutBack(Math.min(1, bidSeconds / 0.22)));
      shapes.push({
        kind: "dot",
        x: bidderPoint.x,
        y: bidderPoint.y,
        radius: popRadius,
        color: rgba(COLORS.bid, 1),
        opacity: 1,
      });
    }
    const arrival = (replyAge - BID_REPLY_SECONDS) / BID_ARRIVAL_RING_SECONDS;
    if (arrival > 0 && arrival < 1 && viewerPoint.depth > 0.01)
      addRing(viewerPoint, arrival, COLORS.bid, 14, 0.9);
  }

  if (viewerPoint.depth > 0.01) {
    if (bidSeconds === null && !frame.isStill)
      addRing(
        viewerPoint,
        (frame.seconds % VIEWER_PULSE_SECONDS) / VIEWER_PULSE_SECONDS,
        COLORS.viewerRing,
        10,
        0.5,
      );
    shapes.push({
      kind: "dot",
      x: viewerPoint.x,
      y: viewerPoint.y,
      radius: 2.6 * unit,
      color: COLORS.viewer,
      opacity: 1,
      glow: { color: COLORS.viewerGlow, blur: 6 * unit },
    });
  }

  return shapes;
}

function viewFrom(viewer: GeoPoint, seconds: number): GlobeView {
  return {
    centerLng:
      viewer.lng + VIEW_LEAD_RADIANS - SPIN_RADIANS_PER_SECOND * seconds,
    tilt: VIEW_TILT_RADIANS,
  };
}

function launchDueArcs(scene: BidGlobeScene, seconds: number) {
  const { nodes, launchOrder } = scene.field;
  if (nodes.length === 0) return;
  if (scene.nextLaunchAt < seconds - MAX_LAUNCH_BACKLOG_SECONDS)
    scene.nextLaunchAt = seconds;
  while (scene.nextLaunchAt <= seconds) {
    const node = launchOrder[scene.launchedCount % launchOrder.length];
    scene.arcs.push({
      node,
      launchedAt: scene.nextLaunchAt,
      duration:
        ARC_BASE_SECONDS +
        (ARC_SECONDS_PER_HALF_TURN * nodes[node].distance) / Math.PI,
      hasLanded: false,
    });
    scene.launchedCount++;
    scene.nextLaunchAt += LAUNCH_INTERVAL_SECONDS;
  }
}

function landArrivedArcs(scene: BidGlobeScene, seconds: number) {
  scene.arcs = scene.arcs.filter((arc) => {
    const landedAt = arc.launchedAt + arc.duration;
    if (seconds >= landedAt && !arc.hasLanded) {
      arc.hasLanded = true;
      if (!scene.reachedAt.has(arc.node))
        scene.reachedAt.set(arc.node, landedAt);
      scene.pulses.push({ node: arc.node, startedAt: landedAt });
    }
    return seconds < landedAt + ARC_FADE_SECONDS;
  });
}

function bidderIndexOf(scene: BidGlobeScene, frame: BidGlobeFrame): number {
  return frame.bid
    ? scene.field.nodes.findIndex((node) => node.id === frame.bid?.providerId)
    : -1;
}

function rgba(rgb: string, opacity: number): string {
  return `rgba(${rgb},${clamp(opacity, 0, 1).toFixed(3)})`;
}

// Painter

/** The orb stays dark in both themes, like the Providers page globe. */
const ORB = {
  highlight: "#2a2a3c",
  body: "#111119",
  shadow: "#07070b",
  glow: "rgba(124,58,237,0.30)",
  graticule: "rgba(141,141,171,0.14)",
  land: "rgba(150,150,178,0.32)",
  landEdge: "rgba(176,176,206,0.34)",
  rim: "rgba(201,138,232,0.30)",
};

export interface GlobePicture {
  size: number;
  view: GlobeView;
  land: { shape: GeoPermissibleObjects; opacity: number } | null;
  shapes: GlobeShape[];
}

export function createBidGlobePainter(context: CanvasRenderingContext2D) {
  const projection = geoOrthographic().clipAngle(90).precision(0.7);
  const path = geoPath(projection, context);
  const graticule = geoGraticule10();

  return function paintBidGlobe({ size, view, land, shapes }: GlobePicture) {
    const { center, radius, unit } = globeLayout(size);

    context.save();
    context.beginPath();
    context.arc(center, center, radius, 0, FULL_TURN);
    context.shadowColor = ORB.glow;
    context.shadowBlur = 22 * unit;
    const shading = context.createRadialGradient(
      center - radius * 0.38,
      center - radius * 0.42,
      radius * 0.05,
      center,
      center,
      radius * 1.05,
    );
    shading.addColorStop(0, ORB.highlight);
    shading.addColorStop(0.55, ORB.body);
    shading.addColorStop(1, ORB.shadow);
    context.fillStyle = shading;
    context.fill();
    context.restore();

    projection
      .translate([center, center])
      .scale(radius)
      .rotate([
        -view.centerLng / RADIANS_PER_DEGREE,
        -view.tilt / RADIANS_PER_DEGREE,
      ]);
    context.beginPath();
    path(graticule);
    context.strokeStyle = ORB.graticule;
    context.lineWidth = 0.6;
    context.stroke();

    if (land) {
      context.save();
      context.globalAlpha = land.opacity;
      context.beginPath();
      path(land.shape);
      context.fillStyle = ORB.land;
      context.fill();
      context.strokeStyle = ORB.landEdge;
      context.lineWidth = 0.5;
      context.stroke();
      context.restore();
    }

    context.beginPath();
    context.arc(center, center, radius, 0, FULL_TURN);
    context.strokeStyle = ORB.rim;
    context.lineWidth = 1;
    context.stroke();

    shapes.forEach((shape) => paintShape(context, shape));
  };
}

function paintShape(context: CanvasRenderingContext2D, shape: GlobeShape) {
  context.save();
  context.beginPath();
  if (shape.kind === "dot") {
    context.globalAlpha = shape.opacity;
    if (shape.glow) {
      context.shadowColor = shape.glow.color;
      context.shadowBlur = shape.glow.blur;
    }
    context.arc(shape.x, shape.y, shape.radius, 0, FULL_TURN);
    context.fillStyle = shape.color;
    context.fill();
  } else if (shape.kind === "ring") {
    context.ellipse(
      shape.x,
      shape.y,
      shape.radiusX,
      shape.radiusY,
      shape.rotation,
      0,
      FULL_TURN,
    );
    context.strokeStyle = shape.color;
    context.lineWidth = 1;
    context.stroke();
  } else {
    context.moveTo(shape.fromX, shape.fromY);
    context.lineTo(shape.toX, shape.toY);
    context.strokeStyle = shape.color;
    context.lineWidth = shape.width;
    context.lineCap = "round";
    context.stroke();
  }
  context.restore();
}
