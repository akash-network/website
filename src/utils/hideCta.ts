export const hiddenPaths = [
  "/community/",
  "/pricing/gpus",
  "/akash-accelerate-2024",
  "/gpus-on-demand",
  "/case-studies/",
  "/blog/",
];

export const shouldHideCta = (pathname: string) => {
  return hiddenPaths.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );
};
