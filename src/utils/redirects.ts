export const getYearToUse = () => {
  const today = new Date();
  const currentYear = today.getFullYear();

  return currentYear;
};

export const redirects = {
  "/compare": "/explore/compare",
  "/compare/": "/explore/compare",
  "/akt": "/token",
  "/akt-token": "/token",
  "/akt/": "/token",
  "/akt-token/": "/token",
  "/community/akash-validators/": "/akash-validators/",
  "/community/akash-validators": "/akash-validators/",
  "/network/akash-validators/": "/akash-validators/",
  "/network/akash-validators": "/akash-validators/",
  "/about/providers/": "/ecosystem/providers/",
  "/about/providers": "/ecosystem/providers/",
  "/about/network-capacity/": "/ecosystem/providers/",
  "/about/network-capacity": "/ecosystem/providers/",
  "/ecosystem/network-capacity/": "/ecosystem/providers/",
  "/ecosystem/network-capacity": "/ecosystem/providers/",
  "/providers/": "/ecosystem/providers/",
  "/providers": "/ecosystem/providers/",
  "/development/current-projects": "/roadmap/",
  "/ecosystem": "/ecosystem/akash-tools/latest/",
  // 404 cleanup, Oct 2026: replaces 6 entries whose targets were deleted. See HANDOFF.md.
  "/development": "/development/welcome/",
  "/development/": "/development/welcome/",
  "/docs/features/ip-leases": "/docs/learn/core-concepts/ip-leases/",
  "/docs/features/ip-leases/": "/docs/learn/core-concepts/ip-leases/",
  "/testnet": "/roadmap/aep-76/",
  "/testnet/": "/roadmap/aep-76/",
  "/docs/providers/build-a-cloud-provider/gpu-resource-enablement":
    "/docs/providers/setup-and-installation/kubespray/gpu-support/",
  "/docs/providers/build-a-cloud-provider/gpu-resource-enablement/":
    "/docs/providers/setup-and-installation/kubespray/gpu-support/",
  "/docs/providers/build-a-cloud-provider/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers":
    "/docs/providers/setup-and-installation/kubespray/kubernetes-setup/",
  "/docs/providers/build-a-cloud-provider/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers/":
    "/docs/providers/setup-and-installation/kubespray/kubernetes-setup/",
  "/docs/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts":
    "/docs/providers/setup-and-installation/kubespray/provider-installation/",
  "/docs/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts/":
    "/docs/providers/setup-and-installation/kubespray/provider-installation/",
  "/community": "/community/welcome/",
  "/about": "/architectural-overview",
  "/about/general-information": "/architectural-overview",
  "/about/general-information/": "/architectural-overview",
  "/blog/a/acc-akash-accelerationism": "/blog/a-acc-akash-accelerationism/",
  "/community/events/upcoming": "/community/events/",
  "/careers": "/",
  "/whitepapers":
    "https://ipfs.io/ipfs/QmVwsi5kTrg7UcUEGi5UfdheVLBWoHjze2pHy4tLqYvLYv",
  "/l/econ-paper":
    "https://ipfs.io/ipfs/QmdV52bF7j4utynJ6L11RgG93FuJiUmBH1i7pRD6NjUt6B",
  "/gpus": "/pricing/gpus/",
  "/about/pricing": "/pricing/usage-calculator/",
  "/about/pricing/custom": "/pricing/usage-calculator/",
  "/community/insiders/": "/community/akash-insiders/",
  "/community/core-groups/cg-list/": "/development/community-groups/",
  "/ecosystem/showcase/latest/": "/ecosystem/deployed-on-akash/showcase/",
  "/ecosystem/akash-tools/latest/": "/ecosystem/akash-tools/",
  "/pricing": "/pricing/gpus",
  "/roadmap": `/roadmap/${getYearToUse()}`,
  "/akash-accelerate-2025": "/akash-accelerate-2025-livestream/",
  "/development/current-groups/": "/development/community-groups/",
  "/development/product-strategy/": "/",
  "/blog/case-studies/": "/case-studies/",
  "/blog/case-studies/1": "/case-studies/",
  "/blog/case-studies/2": "/case-studies/",
  "/docs/deployments/": "/docs/developers/deployment/",
  "/docs/deployments/akash-cli/overview/": "/docs/developers/deployment/",
  "/docs/deployments/akash-cli/cli-booster/": "/docs/developers/deployment/",
  "/docs/deployments/akash-cli/installation/": "/docs/developers/deployment/",
  "/docs/developers/deployment/akash-console/with-wallet":
    "/docs/developers/deployment/console-air/",
  "/docs/developers/deployment/akash-console/with-wallet/":
    "/docs/developers/deployment/console-air/",
  "/docs/getting-started/intro-to-akash/payments/":
    "/docs/getting-started/how-funding-works/",
  // The akt CLI moved out of Deployment; only its deployment pages stayed.
  "/docs/developers/deployment/akt/installation":
    "/docs/developers/akt/installation/",
  "/docs/developers/deployment/akt/configuration":
    "/docs/developers/akt/configuration/",
  "/docs/developers/deployment/akt/queries-and-transactions":
    "/docs/developers/akt/queries-and-transactions/",
  "/docs/developers/deployment/akt/monitor": "/docs/developers/akt/monitor/",
  "/docs/developers/deployment/akt/agent-skill":
    "/docs/developers/akt/agent-skill/",
  "/docs/developers/deployment/akt/mcp": "/docs/developers/akt/mcp/",
  "/docs/developers/deployment/akt/commands-reference":
    "/docs/developers/akt/commands-reference/",
  "/bits": "/the-bid",
  "/bits/": "/the-bid",
  "/bits/[...page]": "/the-bid/[...page]",
  "/bits/[slug]": "/the-bid/[slug]",
  "/bits/[tag]/[page]": "/the-bid/[tag]/[page]",
  // Consolidated /explore/use-cases/* into /use-cases/* so the hub and all
  // five children share one URL tree.
  "/explore/use-cases": "/use-cases/",
  "/explore/use-cases/": "/use-cases/",
  "/explore/use-cases/providers": "/use-cases/providers/",
  "/explore/use-cases/providers/": "/use-cases/providers/",
  "/explore/use-cases/startups": "/use-cases/startups/",
  "/explore/use-cases/startups/": "/use-cases/startups/",
  "/explore/use-cases/universities": "/use-cases/universities/",
  "/explore/use-cases/universities/": "/use-cases/universities/",
  // Renamed slug to match the page's display title.
  "/use-cases/ai-product-engineering": "/use-cases/ai-inference-and-training/",
  "/use-cases/ai-product-engineering/": "/use-cases/ai-inference-and-training/",
  // 404 cleanup, Oct 2026. Generated from fix-plan.json; see HANDOFF.md.
  "/docs/providers/build-a-cloud-provider":
    "/docs/providers/setup-and-installation/",
  "/docs/providers/build-a-cloud-provider/":
    "/docs/providers/setup-and-installation/",
  "/docs/testnet/testplan": "/roadmap/aep-76/",
  "/docs/testnet/testplan/": "/roadmap/aep-76/",
  "/docs/getting-started/intro-to-akash/akash-network":
    "/docs/getting-started/what-is-akash/",
  "/docs/getting-started/intro-to-akash/akash-network/":
    "/docs/getting-started/what-is-akash/",
  "/docs/other-resources/archived-resources/akash-v18-cli-release-notes":
    "https://github.com/akash-network/provider/releases",
  "/docs/other-resources/archived-resources/akash-v18-cli-release-notes/":
    "https://github.com/akash-network/provider/releases",
  "/docs/providers": "/docs/providers/getting-started/",
  "/docs/providers/": "/docs/providers/getting-started/",
  "/contact": "/support/",
  "/contact/": "/support/",
  "/blog/a-primer-on-the-first-decentralized-cloud-marketplace":
    "/blog/why-akash-network-a-primer-on-the-first-decentralized-cloud-marketplace/",
  "/blog/a-primer-on-the-first-decentralized-cloud-marketplace/":
    "/blog/why-akash-network-a-primer-on-the-first-decentralized-cloud-marketplace/",
  "/blog/akt-token-now-on-bitmart-exchange": "/token/",
  "/blog/akt-token-now-on-bitmart-exchange/": "/token/",
  "/community/community-contributions": "/community/contributions/",
  "/community/community-contributions/": "/community/contributions/",
  "/docs/akash-provider-service-and-associated-sub-services/overview":
    "/docs/providers/architecture/overview/",
  "/docs/akash-provider-service-and-associated-sub-services/overview/":
    "/docs/providers/architecture/overview/",
  "/docs/community": "/docs/learn/community-resources/",
  "/docs/community/": "/docs/learn/community-resources/",
  "/docs/guides/data-analysis/superset": "/docs/developers/guides/",
  "/docs/guides/data-analysis/superset/": "/docs/developers/guides/",
  "/docs/guides/machine-learning/keras": "/docs/developers/guides/",
  "/docs/guides/machine-learning/keras/": "/docs/developers/guides/",
  "/docs/guides/machine-learning/ml-envs": "/docs/developers/guides/",
  "/docs/guides/machine-learning/ml-envs/": "/docs/developers/guides/",
  "/docs/learn/core-concepts/akash-network":
    "/docs/getting-started/what-is-akash/",
  "/docs/learn/core-concepts/akash-network/":
    "/docs/getting-started/what-is-akash/",
  "/docs/learn/core-concepts/bme": "/docs/getting-started/how-funding-works/",
  "/docs/learn/core-concepts/bme/": "/docs/getting-started/how-funding-works/",
  "/docs/learn/tokenomics": "/token/",
  "/docs/learn/tokenomics/": "/token/",
  "/docs/network-features/fractional-uakt": "/docs/learn/core-concepts/",
  "/docs/network-features/fractional-uakt/": "/docs/learn/core-concepts/",
  "/docs/other-resources/archived-resources/praetor-app/akash-provider/build-windows-provider":
    "/docs/providers/setup-and-installation/provider-console/",
  "/docs/other-resources/archived-resources/praetor-app/akash-provider/build-windows-provider/":
    "/docs/providers/setup-and-installation/provider-console/",
  "/docs/other-resources/archived-resources/praetor-app/akash-provider/single-server-provider":
    "/docs/providers/setup-and-installation/provider-console/",
  "/docs/other-resources/archived-resources/praetor-app/akash-provider/single-server-provider/":
    "/docs/providers/setup-and-installation/provider-console/",
  "/docs/other-resources/authentication":
    "/docs/developers/deployment/cli/commands-reference/",
  "/docs/other-resources/authentication/":
    "/docs/developers/deployment/cli/commands-reference/",
  "/docs/other-resources/security":
    "/docs/providers/operations/provider-audit/",
  "/docs/other-resources/security/":
    "/docs/providers/operations/provider-audit/",
  "/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers":
    "/docs/providers/setup-and-installation/kubespray/kubernetes-setup/",
  "/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/":
    "/docs/providers/setup-and-installation/kubespray/kubernetes-setup/",
  "/gpu": "/pricing/gpus/",
  "/gpu/": "/pricing/gpus/",
  "/blog/akash-mainnet-launch":
    "/blog/announcing-akash-mainnet-live-and-bitmax-ieo/",
  "/blog/akash-mainnet-launch/":
    "/blog/announcing-akash-mainnet-live-and-bitmax-ieo/",
  "/blog/akash-network-proposal-migrate-to-solana": "/roadmap/aep-79/",
  "/blog/akash-network-proposal-migrate-to-solana/": "/roadmap/aep-79/",
  "/blog/akash-network-provides-decentralized-cloud-to-the-largest-internet-of-things-iot":
    "/blog/akash-network-provides-decentralized-cloud-to-the-largest-internet-of-things-iot-network-helium/",
  "/blog/akash-network-provides-decentralized-cloud-to-the-largest-internet-of-things-iot/":
    "/blog/akash-network-provides-decentralized-cloud-to-the-largest-internet-of-things-iot-network-helium/",
  "/blog/akash-network-s-akt-token-now-listed-on-bhex": "/token/",
  "/blog/akash-network-s-akt-token-now-listed-on-bhex/": "/token/",
  "/blog/akash-网络通证经济学的演变":
    "/blog/an-evolution-of-akash-network-token-economics/",
  "/blog/akash-网络通证经济学的演变/":
    "/blog/an-evolution-of-akash-network-token-economics/",
  "/blog/akash-通证的收入潜力": "/token/",
  "/blog/akash-通证的收入潜力/": "/token/",
  "/blog/akashml-managed-ai-inference-on-the-decentralized-network":
    "/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/",
  "/blog/akashml-managed-ai-inference-on-the-decentralized-network/":
    "/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/",
  "/blog/category/token-economics-ru": "/token/",
  "/blog/category/token-economics-ru/": "/token/",
  "/blog/what-actually-determines-llm-inference-speed-in-2026":
    "/the-bid/what-actually-determines-llm-inference-speed-2026/",
  "/blog/what-actually-determines-llm-inference-speed-in-2026/":
    "/the-bid/what-actually-determines-llm-inference-speed-2026/",
  "/community/grants": "/grants/",
  "/community/grants/": "/grants/",
  "/contact-us": "/support/",
  "/contact-us/": "/support/",
  "/docs/community/grants": "/grants/",
  "/docs/community/grants/": "/grants/",
  "/docs/console/billing": "/docs/getting-started/how-funding-works/",
  "/docs/console/billing/": "/docs/getting-started/how-funding-works/",
  "/docs/deployments/akash-console":
    "/docs/developers/deployment/akash-console/",
  "/docs/deployments/akash-console/":
    "/docs/developers/deployment/akash-console/",
  "/docs/deployments/payments-and-billing":
    "/docs/getting-started/how-funding-works/",
  "/docs/deployments/payments-and-billing/":
    "/docs/getting-started/how-funding-works/",
  "/docs/deployments/providers/requirements":
    "/docs/providers/getting-started/hardware-requirements/",
  "/docs/deployments/providers/requirements/":
    "/docs/providers/getting-started/hardware-requirements/",
  "/docs/developers/console-api": "/docs/api-documentation/console-api/",
  "/docs/developers/console-api/": "/docs/api-documentation/console-api/",
  "/docs/getting-started/token-economics": "/token/",
  "/docs/getting-started/token-economics/": "/token/",
  "/docs/governance": "/docs/node-operators/validators/",
  "/docs/governance/": "/docs/node-operators/validators/",
  "/docs/guides/data-analysis/druid": "/docs/developers/guides/",
  "/docs/guides/data-analysis/druid/": "/docs/developers/guides/",
  "/docs/guides/data-analysis/kibana": "/docs/developers/guides/",
  "/docs/guides/data-analysis/kibana/": "/docs/developers/guides/",
  "/docs/guides/databases/cockroachdb":
    "https://github.com/akash-network/awesome-akash/tree/master/CockroachDB",
  "/docs/guides/databases/cockroachdb/":
    "https://github.com/akash-network/awesome-akash/tree/master/CockroachDB",
  "/docs/guides/machine-learning/jupyter":
    "https://github.com/akash-network/awesome-akash/tree/master/jupyter",
  "/docs/guides/machine-learning/jupyter/":
    "https://github.com/akash-network/awesome-akash/tree/master/jupyter",
  "/docs/learn/core-concepts/burn-mint-equilibrium":
    "/docs/getting-started/how-funding-works/",
  "/docs/learn/core-concepts/burn-mint-equilibrium/":
    "/docs/getting-started/how-funding-works/",
  "/docs/learn/core-concepts/deployments-and-escrow":
    "/docs/learn/core-concepts/deployments/",
  "/docs/learn/core-concepts/deployments-and-escrow/":
    "/docs/learn/core-concepts/deployments/",
  "/docs/learn/core-concepts/deployments-lifecycle":
    "/docs/learn/core-concepts/deployments/",
  "/docs/learn/core-concepts/deployments-lifecycle/":
    "/docs/learn/core-concepts/deployments/",
  "/docs/learn/core-concepts/governance": "/docs/node-operators/validators/",
  "/docs/learn/core-concepts/governance/": "/docs/node-operators/validators/",
  "/docs/learn/core-concepts/tokens": "/token/",
  "/docs/learn/core-concepts/tokens/": "/token/",
  "/docs/node-operators/network-upgrades/mainnet-17":
    "/docs/node-operators/network-upgrades/",
  "/docs/node-operators/network-upgrades/mainnet-17/":
    "/docs/node-operators/network-upgrades/",
  "/docs/pricing/provider-calculator": "/pricing/provider-calculator/",
  "/docs/pricing/provider-calculator/": "/pricing/provider-calculator/",
  "/docs/providers/getting-started/gpu-providers":
    "/docs/providers/getting-started/hardware-requirements/",
  "/docs/providers/getting-started/gpu-providers/":
    "/docs/providers/getting-started/hardware-requirements/",
  "/docs/providers/getting-started/provider-earnings":
    "/pricing/provider-calculator/",
  "/docs/providers/getting-started/provider-earnings/":
    "/pricing/provider-calculator/",
  "/docs/providers/intro": "/docs/providers/getting-started/",
  "/docs/providers/intro/": "/docs/providers/getting-started/",
  "/docs/providers/operations/audited-attributes":
    "/docs/providers/operations/provider-attributes/",
  "/docs/providers/operations/audited-attributes/":
    "/docs/providers/operations/provider-attributes/",
  "/docs/providers/operations/fees":
    "/docs/providers/getting-started/should-i-run-a-provider/",
  "/docs/providers/operations/fees/":
    "/docs/providers/getting-started/should-i-run-a-provider/",
  "/docs/providers/operations/pricing":
    "/docs/providers/architecture/bid-engine/",
  "/docs/providers/operations/pricing/":
    "/docs/providers/architecture/bid-engine/",
  "/docs/providers/operations/pricing-and-profitability":
    "/docs/providers/getting-started/should-i-run-a-provider/",
  "/docs/providers/operations/pricing-and-profitability/":
    "/docs/providers/getting-started/should-i-run-a-provider/",
  "/docs/providers/operations/provider-auditing":
    "/docs/providers/operations/provider-audit/",
  "/docs/providers/operations/provider-auditing/":
    "/docs/providers/operations/provider-audit/",
  "/docs/providers/operations/revenue": "/pricing/provider-calculator/",
  "/docs/providers/operations/revenue/": "/pricing/provider-calculator/",
  "/docs/testnet/testplan/circuit-breaker": "/roadmap/aep-76/",
  "/docs/testnet/testplan/circuit-breaker/": "/roadmap/aep-76/",
  "/docs/validators-and-providers": "/docs/node-operators/validators/",
  "/docs/validators-and-providers/": "/docs/node-operators/validators/",
  "/ko/blog/ibc-what-you-need-to-know": "/blog/ibc-what-you-need-to-know/",
  "/ko/blog/ibc-what-you-need-to-know/": "/blog/ibc-what-you-need-to-know/",
  "/paper.pdf": "/whitepaper/",
  "/paper.pdf/": "/whitepaper/",
  "/pricing/gpu": "/pricing/gpus/",
  "/pricing/gpu/": "/pricing/gpus/",
  "/privacy-policy": "/privacy/",
  "/privacy-policy/": "/privacy/",
  "/provide": "/ecosystem/providers/",
  "/provide/": "/ecosystem/providers/",
  "/blog/2020/02/05/an-evolution-of-akash-network-token-economics":
    "/blog/an-evolution-of-akash-network-token-economics/",
  "/blog/2020/02/05/an-evolution-of-akash-network-token-economics/":
    "/blog/an-evolution-of-akash-network-token-economics/",
  "/blog/announcing-our-third-founding-member-challenge-earn-2000-akash-tokens":
    "/blog/announcing-our-third-founding-member-challenge/",
  "/blog/announcing-our-third-founding-member-challenge-earn-2000-akash-tokens/":
    "/blog/announcing-our-third-founding-member-challenge/",
  "/current-groups/wg-economics-2.0": "/current-groups/wg-economics-20/",
  "/current-groups/wg-economics-2.0/": "/current-groups/wg-economics-20/",
  "/docs/architecture/overview": "/architectural-overview/",
  "/docs/architecture/overview/": "/architectural-overview/",
  "/docs/deployments/stable-payment-deployments":
    "/docs/getting-started/how-funding-works/",
  "/docs/deployments/stable-payment-deployments/":
    "/docs/getting-started/how-funding-works/",
  "/docs/features/authorized-spend": "/docs/developers/deployment/authz/",
  "/docs/features/authorized-spend/": "/docs/developers/deployment/authz/",
  "/docs/features/fractional-uakt": "/docs/learn/core-concepts/",
  "/docs/features/fractional-uakt/": "/docs/learn/core-concepts/",
  "/docs/features/persistent-storage":
    "/docs/learn/core-concepts/persistent-storage/",
  "/docs/features/persistent-storage/":
    "/docs/learn/core-concepts/persistent-storage/",
  "/docs/getting-started/quickstart-guides/akash-cli":
    "/docs/developers/deployment/cli/",
  "/docs/getting-started/quickstart-guides/akash-cli/":
    "/docs/developers/deployment/cli/",
  "/docs/getting-started/quickstart-guides/akash-console":
    "/docs/developers/deployment/akash-console/getting-started/",
  "/docs/getting-started/quickstart-guides/akash-console/":
    "/docs/developers/deployment/akash-console/getting-started/",
  "/docs/getting-started/stack-definition-language":
    "/docs/developers/deployment/akash-sdl/",
  "/docs/getting-started/stack-definition-language/":
    "/docs/developers/deployment/akash-sdl/",
  "/docs/getting-started/token-and-wallets":
    "/docs/getting-started/how-funding-works/",
  "/docs/getting-started/token-and-wallets/":
    "/docs/getting-started/how-funding-works/",
  "/docs/guides/akash-cli-booster": "/docs/developers/deployment/",
  "/docs/guides/akash-cli-booster/": "/docs/developers/deployment/",
  "/docs/guides/deploy": "/docs/developers/deployment/",
  "/docs/guides/deploy/": "/docs/developers/deployment/",
  "/docs/guides/deploy/cloudmos-deploy-installation":
    "/docs/developers/deployment/akash-console/",
  "/docs/guides/deploy/cloudmos-deploy-installation/":
    "/docs/developers/deployment/akash-console/",
  "/docs/network-features/authorized-spend":
    "/docs/developers/deployment/authz/",
  "/docs/network-features/authorized-spend/":
    "/docs/developers/deployment/authz/",
  "/docs/network-features/persistent-storage":
    "/docs/learn/core-concepts/persistent-storage/",
  "/docs/network-features/persistent-storage/":
    "/docs/learn/core-concepts/persistent-storage/",
  "/docs/other-resources/archived-resources/akash-mainnet8-upgrade":
    "/docs/node-operators/network-upgrades/",
  "/docs/other-resources/archived-resources/akash-mainnet8-upgrade/":
    "/docs/node-operators/network-upgrades/",
  "/docs/other-resources/archived-resources/mainnet5-upgrade-docs":
    "/docs/node-operators/network-upgrades/",
  "/docs/other-resources/archived-resources/mainnet5-upgrade-docs/":
    "/docs/node-operators/network-upgrades/",
  "/docs/other-resources/archived-resources/upgrades/v20-upgrade-docs":
    "/docs/node-operators/network-upgrades/",
  "/docs/other-resources/archived-resources/upgrades/v20-upgrade-docs/":
    "/docs/node-operators/network-upgrades/",
  "/docs/readme/stack-definition-language":
    "/docs/developers/deployment/akash-sdl/",
  "/docs/readme/stack-definition-language/":
    "/docs/developers/deployment/akash-sdl/",
  // Linked as https://akash.network/chat from the synced AEP-4 page.
  "/chat": "https://discord.com/invite/akash",
  "/chat/": "https://discord.com/invite/akash",
};
