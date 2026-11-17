const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}
