export const hiddenPaths = [
  "/community/",
  "/pricing/gpus",
  "/akash-accelerate-2024",
];

export const shouldHideCta = (pathname: string) => {
  return hiddenPaths.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );
};
