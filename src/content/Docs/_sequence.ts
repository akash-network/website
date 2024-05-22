export const docsSequence = [
  {
    label: "Docs",
    subItems: [
      {
        type: "Header",
        label: "User Docs",
      },

      {
        label: "Getting Started",
        subItems: [
          {
            label: "Intro To Akash",
            subItems: [
              { label: "Akash Network" },
              { label: "Bids and Leases" },
              { label: "DSEQ, GSEQ and OSEQ" },
              { label: "Providers" },
              { label: "RPC Nodes" },
              { label: "Validator Nodes" },
              { label: "Payments" },
            ],
          },
          { label: "Stack Definition Language (SDL)" },
          { label: "Tokens and Wallets" },
        ],
      },
      { label: "Architecture", subItems: [{ label: "Architecture Overview" }] },
      {
        label: "Deployments",
        subItems: [
          { label: "Deployment Overview" },
          { label: "Cloudmos Deploy" },

          {
            label: "Akash CLI",
            subItems: [
              { label: "Akash CLI Introduction" },
              { label: "Akash CLI Installation" },
            ],
          },
          { label: "Stable Payment Deployments" },
          { label: "Sandbox", subItems: [{ label: "Sandbox Introduction" }] },
        ],
      },
      {
        label: "Guides",
        subItems: [
          { label: "TLS Termination of Akash Deployments" },
          { label: "Kava RPC Node Deployment" },
          { label: "Chia on Akash" },
          { label: "Polygon on Akash" },
          { label: "Mine Raptoreum on Akash Network" },
          { label: "Unstoppable Web 2.0" },
          { label: "Multi-Tiered Deployment" },
          { label: "Helium Validator" },
        ],
      },
      {
        label: "Providers",
        subItems: [
          {
            label: "Build A Cloud Provider",
            subItems: [
              {
                label: "Kubernetes Cluster For Akash Providers",
                subItems: [{ label: "Kubernetes Cluster for Akash Providers" }],
              },
              {
                label: "Akash Cloud Provider Build With Helm Charts",
              },
              {
                label: "Akash Provider Checkup",
              },
              {
                label: "GPU Resource Enablement (Optional Step)",
              },
              {
                label: "TLS Certs for Akash Provider (Optional Step)",
              },
              {
                label: "IP Leases - Provider Enablement (Optional Step)",
              },
              {
                label: "Helm Based Provider Persistent Storage Enablement",
              },
              {
                label: "Akash Provider Bid Pricing Calculation",
              },
              {
                label: "Akash Provider Attribute Updates",
              },
              {
                label: "gVisor Issue - No system-cgroup v2 Support",
              },
              {
                label: "Shared Memory Enablement",
              },
            ],
          },
          { label: "Akash Provider FAQ and Guide" },
          { label: "Community Solutions" },
          { label: "Custom Kubernetes Cluster Settings" },
        ],
      },

      {
        label: "Akash Nodes",
        subItems: [
          { label: "Akash Node Via Helm Charts" },
          { label: "Akash Node Deployment Via Omnibus" },
          { label: "Akash Node CLI Build" },
          { label: "Public RPC Nodes" },
        ],
      },
      {
        label: "Network Features",
        subItems: [
          { label: "IP Leases" },
          { label: "Persistent Storage" },
          { label: "Authorized Spend" },
          { label: "Fractional uAKT" },
          { label: "Deployment Shell Access" },
          { label: "Deployment HTTP Options" },
        ],
      },
      {
        label: "Validators",
        subItems: [
          { label: "Running a Validator" },
          { label: "Akash Validator with TMKMS and Stunnel" },
        ],
      },
      {
        label: "Mainnet 11 Upgrade",
      },
      {
        label: "Testnet",
        subItems: [
          { label: "GPU Testnet Client Instructions" },
          { label: "GPU Testnet Submission Instructions" },
          { label: "Testnet Issue Reporting" },
        ],
      },
      {
        label: "Other Resources",
        subItems: [
          {
            label: "Experimental",
            subItems: [
              { label: "AMD GPU Support" },
              { label: "Akash Provider Streamlined Build with Rancher K3s" },
              {
                label: "Omnibus",
              },
              {
                label: "Hardware and Software Recommendations",
              },
              {
                label: "Streamlined Steps",
              },
            ],
          },
          { label: "Security" },
          { label: "Containers" },
          { label: "Marketplace" },
          { label: "Payments" },
          { label: "Authentication" },
        ],
      },
      {
        type: "Header",
        label: "Engineering Docs",
      },
      {
        label: "Akash Provider Service And Associated Sub Services",
        subItems: [
          { label: "Overview" },
          { label: "Bid Engine Overview" },
          { label: "Manifest Service Overview" },
          { label: "Provider Service Overview" },
          { label: "Bid Engine Service" },
        ],
      },
      {
        label: "Akash Provider Operators",
        subItems: [
          { label: "Provider Service" },
          {
            label: "Akash Operator Overview",
            subItems: [
              {
                label: "Akash Operator Overview",
              },
              {
                label: "Hostname Operator For Ingress Controller",
                subItems: [
                  { label: "Hostname Operator for Ingress Controller" },
                ],
              },
              {
                label: "IP Operator for IP Leases",
              },
            ],
          },
        ],
      },

      {
        label: "Akash Node Table Of Contents",
        subItems: [{ label: "Akash Node Repo Table of Contents" }],
      },
      {
        label: "Akash App",
      },

      {
        label: "Akash Development Environment",
        subItems: [
          {
            label: "Overview and Requirments",
          },
          {
            label: "Code",
          },
          {
            label: "Install Tools",
          },
          {
            label: "Development Environment General Behavior",
          },
          {
            label: "Runbook",
          },
          {
            label: "Parameters",
          },
        ],
      },
      {
        label: "Akash Code Contributors   Policies And Standards",
        subItems: [
          { label: "Getting Started with Akash Contributions" },
          { label: "Code Conventions" },
          { label: "Contributor Cheatsheet" },
        ],
      },
      {
        label: "Akash End To End Testing Provider",
      },
      {
        label: "Akash API",
      },
    ],
  },
];
