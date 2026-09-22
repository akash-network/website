import * as THREE from "three";

/** lng=0,lat=0 maps to +Z (facing the default camera position at (0,0,+d)). */
export function latLngToVector3(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const x = radius * Math.cos(latRad) * Math.sin(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lngRad);
  return new THREE.Vector3(x, y, z);
}
