export const getYearToUse = () => {
  const today = new Date();
  const currentYear = today.getFullYear();

  return currentYear;
};

export const redirects = {
  "/development/current-projects": "/roadmap/",
  "/ecosystem": "/ecosystem/akash-tools/latest/",
  "/development": "/development/welcome/overview/",
  "/community": "/community/akash-insiders/",
  "/about": "/about/general-information/",
  "/blog/a/acc-akash-accelerationism": "/blog/a-acc-akash-accelerationism/",
  "/community/events/upcoming": "/community/events/",
  "/careers": "/",
  "/whitepapers":
    "https://ipfs.io/ipfs/QmVwsi5kTrg7UcUEGi5UfdheVLBWoHjze2pHy4tLqYvLYv",
  "/l/econ-paper":
    "https://ipfs.io/ipfs/QmdV52bF7j4utynJ6L11RgG93FuJiUmBH1i7pRD6NjUt6B",
  "/docs/features/ip-leases": "/docs/network-features/ip-leases/",
  "/testnet": "/docs/testnet/gpu-testnet-client-instructions/",
  "/gpus": "/pricing/gpus/",
  "/about/pricing": "/pricing/usage-calculator/",
  "/about/pricing/custom": "/pricing/usage-calculator/",
  "/community/insiders/": "/community/akash-insiders/",
  "/community/core-groups/cg-list/": "/development/community-groups/",
  "/ecosystem/showcase/latest/": "/ecosystem/deployed-on-akash/showcase/",
  "/ecosystem/akash-tools/latest/": "/ecosystem/akash-tools/",
  "/pricing": "/pricing/gpus",
  "/roadmap": `/roadmap/${getYearToUse()}`,
  "/docs/providers/build-a-cloud-provider/gpu-resource-enablement/":
    "/docs/providers/build-a-cloud-provider/akash-cli/gpu-resource-enablement/",
  "/docs/providers/build-a-cloud-provider/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers/":
    "/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers/",
  "/docs/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts/":
    "/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/",
  "/akash-accelerate-2025": "/akash-accelerate-2025-livestream/",
  "/development/current-groups/": "/development/community-groups/",
    "/docs/features/authorized-spend/": "/docs/network-features/authorized-spend/",
};
