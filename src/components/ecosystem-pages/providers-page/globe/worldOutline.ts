import { feature } from "topojson-client";
import * as THREE from "three";

import { latLngToVector3 } from "./latLngToVector3";

/** Same simplified (110m resolution) world land dataset already used by src/components/providersandincentives/Map.tsx, reused here for the globe's continent outlines. */
const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";

interface Topology {
  type: "Topology";
  objects: { land: unknown };
  arcs: number[][][];
  transform?: unknown;
}

interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: Array<{ geometry: { type: string; coordinates: unknown } }>;
}

let cachedGeometryPromise: Promise<THREE.BufferGeometry> | null = null;

/** Cached across every globe instance on the page — the fetch and parse only happen once. */
export function loadWorldOutlineGeometry(radius: number): Promise<THREE.BufferGeometry> {
  if (!cachedGeometryPromise) {
    cachedGeometryPromise = fetch(WORLD_ATLAS_URL)
      .then((response) => response.json())
      .then((topology: Topology) => {
        const collection = feature(topology as never, topology.objects.land as never) as unknown as GeoFeatureCollection;
        const points: number[] = [];

        for (const geoFeature of collection.features ?? [collection as never]) {
          const geometry = geoFeature.geometry ?? (geoFeature as never);
          const polygons =
            geometry.type === "MultiPolygon"
              ? (geometry.coordinates as number[][][][])
              : [(geometry.coordinates as number[][][])];

          for (const polygon of polygons) {
            for (const ring of polygon) {
              for (let i = 0; i < ring.length - 1; i++) {
                const [lng0, lat0] = ring[i];
                const [lng1, lat1] = ring[i + 1];
                const p0 = latLngToVector3(lat0, lng0, radius);
                const p1 = latLngToVector3(lat1, lng1, radius);
                points.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
              }
            }
          }
        }

        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        return bufferGeometry;
      });
  }
  return cachedGeometryPromise;
}
