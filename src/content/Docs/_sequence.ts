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
          {
            label: "Quickstart Guides",
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

          {
            label: "Akash CLI",
            subItems: [
              { label: "Akash CLI Introduction" },
              { label: "Akash CLI Installation" },
            ],
          },
          {
            label: "Akash Console",
          },
          { label: "Sandbox", subItems: [{ label: "Sandbox Introduction" }] },
          { label: "Stable Payment Deployments" },
        ],
      },
      {
        label: "Providers",
        subItems: [
          { label: "Provider Overview"},
          {
            label: "Build A Cloud Provider",
            subItems: [
              { label: "Provider Playbook Script" },
              {
                label: "Akash CLI",
                subItems: [
                  { 
                    label: "Akash CLI Introduction",
                  },
                  { 
                    label: "Kubernetes Cluster Setup",
                  },
                  { 
                    label: "Additional K8s Resources",
                  },
                  {
                    label: "Akash Cloud Provider Build With Helm Charts",
                  },
                  {
                    label: "GPU Resource Enablement",
                  },
                  {
                    label: "Persistent Storage Enablement",
                  },
                  {
                    label: "IP Leases Enablement",
                  },
                  {
                    label: "Provider Attribute Updates",
                  },
                  {
                    label: "TLS Certificates",
                  },
                  {
                    label: "Shared Memory Enablement",
                  },
                  {
                    label: "Bid Pricing Calculation",
                  },
                  {
                    label: "gVisor Issue Resolution",
                  },
                  {
                    label: "Provider Checkup",
                  },
                  {
                    label: "Time Synchronization",
                  },
                  {
                    label: "Custom Kubernetes Cluster Settings",
                  },
                ],
              },
              {
                label: "Provider Console",
                subItems: [
                  { label: "What is Provider Console?" },
                  { label: "Building with Provider Console" },
                  { label: "How to Enable Root Sign-in" },
                ],
              },
              { label: "Hardware Best Practices" },
            ],
          },
          { label: "Akash Provider FAQ and Guide",
            subItems: [
              { label: "Infrastructure Upkeep"},
              { label: "Lease Management"},
              { label: "Maintenance, Logs and Troubleshooting"},
              { label: "Provider Feature Discovery - GPU Configuration Integration Guide"},
            ],
          },
        ],
      },
      {
        label: "Guides",

        subItems: [
          { label: "Guides Overview"},
          {
            label: "Machine Learning",
            subItems: [
              { label: "Overview"},
              { label: "DeTrain" },
              { label: "Ray" },
              { label: "FLock.io" },
              { label: "vLLM" },
              { label: "Llama-2 70B" },
              { label: "Akash Chat API" },
              { label: "AI Art" },
              { label: "Jupyter Notebook" },
              { label: "Text-Generation-WebUI" },
              { label: "Mistral 7B"}, 
              { label: "Skypilot"},
              { label: "H2O"},
              { label: "H2O Flow"},
              { label: "H2O LLM Studio"},
              { label: "h2oGPT"},
              { label: "FlowiseAI"},
              { label: "Machine Learning Environments"},
              { label: "Deeplearning4j"},
              { label: "Keras"},
              { label: "Haystack"},
              { label: "AnythingLLM"},
              { label: "LocalAI"},
              { label: "LangFlow"},
              { label: "TensorFlow"},
              { label: "TensorLayer"},
              { label: "PyTorch"},
              { label: "DeepSeek V3"},
              { label: "Perplexity R1 1776"},
              { label: "OpenThinker-32B"},
              { label: "DeepSeek R1"},
            ],
          },
          {
            label: "Deployments",
            subItems: [
              { label: "TLS Termination of Akash Deployments" },
              { label: "Multi-Tiered Deployment" },
              { label: "Jackal S3 Gateway" },
              { label: "Caddy"},
              { label: "Nginx"},
              { label: "Apache HTTP Server"},
              { label: "LocalStack"},
            ],
          },
          {
            label: "Tooling",
            subItems: [
              { label: "Provider Utilization Dashboard"},
              { label: "Radicle" },
              { label: "Akash Playground" },
              { label: "Kong"},
              { label: "Jenkins"},
              { label: "Traefik"},
              { label: "Mautic"},
              { label: "RabbitMQ"},
              { label: "JetBrains Hub"},
              { label: "EMQX"},
              { label: "Apache Flink"},
              { label: "Lightstreamer"},
              { label: "RabbitMQ"},
              { label: "NATS"}, 
              { label: "Apache Airflow"},
              { label: "Apache Kafka"},
              { label: "Apache Storm"},
              { label: "Thirdweb"},
            ],
          },
          {
            label: "Blockchain",
            subItems: [
              { label: "Kava RPC Node Deployment" },
              { label: "Chia on Akash" },
              { label: "Polygon on Akash" },
              { label: "Deploying Iron Fish on Akash" },
            ],
          },
          {
            label: "Apps",

            subItems: [
              { label: "Waku" },
              { label: "qBittorrent" },
              { label: "Discourse" },
              { label: "Invidious" }, 
            ],
          },
          {
            label: "Databases",
            subItems: [
              { label: "JSON Server" },
              { label: "Dolt" },
              { label: "CouchDB" },
              { label: "MariaDB"},
              { label: "PostgreSQL" },
              { label: "ArangoDB"},
              { label: "OrientDB"},
              { label: "MongoDB"},
              { label: "Neo4j"},
            ],
          },
          {
            label: "Hosting",
            subItems:[
              { label: "Caddy"},
              { label: "WordPress"},
              { label: "Discourse"},
              { label: "Ghost"},
              { label: "Nextcloud"},
            ]
          },
          {
            label: "Data Analysis",
            subItems: [
              { label: "Redash" },
              { label: "Dash" },
              { label: "Metabase" },
              { label: "KNIME"},
              { label: "Dataiku"},
              { label: "Apache Superset"},
              { label: "Rstudio"},
              { label: "Apache Druid"},
              { label: "Grafana"},
              { label: "OpenSearch"}, 
              { label: "Matomo"},
              { label: "JupyterHub"},
              { label: "JATOS"},
            ],
          },
          {
            label: "Frameworks",
            subItems: [
              { label: "Django" },
              { label: "Flask"},
              { label: "Next.js" },
              { label: "React" },
              { label: "Astro" },
              { label: "Angular" },
              { label: "Nue JS"},
              { label: "Gatsby"},
              { label: "NextJS"},
              { label: "Vue.js"},
            ],
          },
          {
            label: "Benchmarkings",
            subItems: [
              { label: "Fast_com" },
              { label: "LibreSpeed"},
              { label: "Geekbench 5"},
            ],
          },
          {
            label: "Games",
            subItems: [
              { label: "Minecraft"},
            ],
          },
          {
            label: "Science",
            subItems:[
              { label: "GeoNetwork"},
              { label: "GNU Octave"},
              { label: "MATLAB"}
            ],
          },
          {
            label: "Network",
            subItems: [
              { label: "Overview"},
              { label: "Owncloud"},
              { label: "CJDNS PKT"},
              { label: "Tor"},
              { label: "X-UI"},
              { label: "SoftEther VPN"},
              { label: "Cloudflare"},
              { label: "Custom Domain"},
            ],
          },
          {
            label: "Storage",
            subItems: [
              { label: "Codex"},
            ],
          },
          {
            label: "Project Management",
            subItems: [
              { label: "Kanboard"},
              { label: "Redmine"},
              { label: "Jira"},
            ],
          },
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
          { label: "Fee Grants" },
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
        label: "Mainnet 13 Upgrade",
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