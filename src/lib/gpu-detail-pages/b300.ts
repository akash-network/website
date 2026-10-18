import { blackwellHourlyPrice } from "@/components/pricing-page/gpus/gpu-models";
import type { GpuDetailPage, GpuLink } from "./types";

// Same fixed rate the pricing table lists, so the two never drift apart.
const HOURLY = blackwellHourlyPrice("b300") ?? 6;
const usd = (value: number) => `$${value.toFixed(2)}`;
const RATE = usd(HOURLY);
const RATE_SHORT = Number.isInteger(HOURLY) ? `$${HOURLY}` : RATE;
const NODE_HOURLY = `$${(HOURLY * 8).toLocaleString("en-US")}`;
// One GPU running 24/7 for a 30-day month (720 hours).
const MONTHLY = `$${Math.round(HOURLY * 720).toLocaleString("en-US")}`;

const PRICE_POST = "/the-bid/b300-rental-price-2026-cost-per-hour/";
const COMPARISON_POST =
  "/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/";

const deploy: GpuLink = {
  label: "Deploy on-demand",
  href: "https://console.akash.network/new-deployment",
  external: true,
};
const reserve: GpuLink = {
  label: "Reserve B300 capacity",
  href: "/nvidia-blackwell-gpus",
};
const sales: GpuLink = {
  label: "Talk to sales",
  href: "/nvidia-blackwell-gpus",
};
const allPricing: GpuLink = {
  label: "See all GPU pricing",
  href: "/pricing/gpus/",
};

export const b300: GpuDetailPage = {
  slug: "b300",
  shortName: "B300",
  seo: {
    title: "NVIDIA B300 GPU: 288GB HBM3e Specs & On-Demand Rental | Akash",
    description:
      "The NVIDIA B300 GPU on Akash: 288 GB HBM3e, up to 8 TB/s, Blackwell Ultra. Full specs, use cases, and on-demand or reserved capacity.",
  },
  hero: {
    title: "Rent NVIDIA B300 GPUs",
    description:
      "Up to 288 GB of HBM3e per GPU for the largest AI models. Serve trillion-parameter MoE models on a single 8-GPU node.",
    specs: [
      "288 GB HBM3e",
      "up to 8 TB/s",
      "Blackwell Ultra",
      "NVLink 1.8 TB/s",
    ],
    price: RATE_SHORT,
    priceNote: "Reserved clusters: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Dedicated bare metal available for reserved deployments",
      "No egress fees",
    ],
    ctas: [reserve, deploy, allPricing],
  },
  intro: `The NVIDIA B300 GPU is a Blackwell Ultra data center GPU with 288 GB of HBM3e memory and up to 8 TB/s of memory bandwidth, built for large-model AI inference, training, fine-tuning and long-context workloads. On Akash, you can rent a B300 on demand from ${RATE_SHORT} per GPU-hour, or reserve a dedicated B300 cluster for production.`,
  pricing: {
    title: "Rent a B300 on Akash",
    paragraphs: [
      `As of October 2026, on-demand B300s on Akash start at ${RATE} per GPU-hour. Reserved B300 clusters are quoted on GPU count, term and workload.`,
    ],
    table: {
      columns: ["Configuration", "Per hour"],
      numericColumns: [1],
      rows: [
        ["1x B300 (288 GB)", RATE],
        ["8x B300 (~2.1 TB total)", usd(HOURLY * 8)],
        ["Reserved cluster", "Custom quote"],
      ],
    },
    note: `For the cost per day, month and year, and whether to rent or buy, see [B300 price and rent vs buy](${PRICE_POST}).`,
    optionsTitle: "Two ways to get B300s",
    options: [
      {
        title: "On-demand",
        description:
          "For model testing, short fine-tunes, evaluation and bursty inference.",
        bullets: [
          "1x to 8x B300 configurations",
          "Pay through Akash Console, billed per GPU-hour",
          "Launch from a template or any Docker image",
        ],
        cta: deploy,
      },
      {
        title: "Reserved",
        description:
          "For production serving, predictable capacity and multi-node training.",
        bullets: [
          "Dedicated 8-GPU HGX B300 nodes, linked by 1.8 TB/s NVLink",
          "Multi-node B300 clusters with up to 800 Gb/s per GPU between nodes, for distributed training",
          "Bare metal, SLA terms and USD invoicing through Akash Enterprise",
        ],
        cta: sales,
      },
    ],
    optionsNote:
      "Not sure yet? Pilot your workload on-demand, then move steady workloads to reserved capacity.",
  },
  highlights: [
    {
      title: "Built for low-precision inference",
      paragraphs: [
        "The B300 is designed for low-precision AI workloads, including NVFP4 inference. Low-precision checkpoints cut the memory needed for model weights, leaving more room for KV cache, longer context and higher concurrency.",
      ],
    },
    {
      title: "What's new in Blackwell Ultra",
      paragraphs: [],
      bullets: [
        {
          title: "More memory per GPU",
          text: "288 GB of HBM3e from 12-high stacks, 50% more than the B200.",
        },
        {
          title: "More low-precision compute",
          text: "13.5 PFLOPS dense NVFP4, 1.5x the B200.",
        },
        {
          title: "Faster attention",
          text: "NVIDIA rates attention-layer throughput at about 2x the B200, which helps reasoning and long-context models.",
        },
        {
          title: "Faster networking",
          text: "Up to 800 Gb/s per GPU with ConnectX-8, for multi-node training.",
        },
        {
          title: "Less FP64",
          text: "About 1.25 TFLOPS, because silicon moved to AI precision formats.",
        },
      ],
      note: "For the latest benchmark results, see [MLCommons MLPerf Inference](https://mlcommons.org/benchmarks/inference-datacenter/).",
    },
  ],
  fit: {
    title: "Is the NVIDIA B300 the Right GPU for You?",
    choices: [
      {
        title: "Choose the B300",
        text: "if you need up to 288 GB of HBM3e memory per GPU, are running memory-intensive LLM or MoE workloads, or need to serve large models and long-context inference workloads.",
      },
      {
        title: "Choose the B200",
        text: "if 180 GB of GPU memory per GPU is sufficient for your workload and you want Blackwell-generation GPU performance at a lower hourly rate.",
      },
      {
        title: "Choose the H200",
        text: "if your workload fits within 141 GB of HBM3e memory per GPU, or if your software and infrastructure are already optimized for the Hopper architecture.",
      },
    ],
    paragraphs: [
      "For FP64-heavy scientific simulations, B200 or H200 can be a better fit than B300 because B300 prioritizes AI workloads and offers substantially lower FP64 throughput.",
      `For the full side-by-side on specs, speed and cost, see [B300 vs B200 vs H200](${COMPARISON_POST}).`,
      "The B300 is the GPU inside 8-GPU HGX and DGX B300 systems. GB300 NVL72 is a separate rack-scale platform that pairs 72 Blackwell Ultra GPUs with 36 Grace CPUs.",
    ],
  },
  useCases: {
    title: "What is the NVIDIA B300 used for?",
    paragraphs: [
      "The NVIDIA B300 is used to serve and train the largest AI models, especially mixture-of-experts and reasoning models that need more memory than earlier GPUs provide. Its 288 GB per GPU, native 4-bit (NVFP4) compute and faster attention make it best suited to:",
    ],
    items: [
      {
        title: "Trillion-parameter model serving",
        text: "288 GB per GPU lets the largest open models run on a single 8-GPU server instead of two.",
      },
      {
        title: "Reasoning and agent workloads",
        text: "Up to 2× faster attention than B200 helps models that generate long chains of thought before answering.",
      },
      {
        title: "Long-context inference",
        text: "Extra memory holds the large KV cache that 100K–1M-token context windows need.",
      },
      {
        title: "4-bit inference at scale",
        text: "Native NVFP4 runs 4-bit checkpoints at full speed, cutting memory per model by about 4× compared with 16-bit.",
      },
      {
        title: "Large-model fine-tuning and RL",
        text: "1.8 TB/s NVLink links all 8 GPUs inside a server, and InfiniBand links servers for multi-node training.",
      },
      {
        title: "Video and multimodal generation",
        text: "High-resolution image, video and speech models use the extra memory for longer sequences and larger batches.",
      },
    ],
  },
  deploy: {
    title: "Deploy a B300 in three steps",
    steps: [
      {
        title: "Add your app.",
        text: "Pick a template or paste a Docker image.",
      },
      {
        title: "Choose B300.",
        text: "Turn on GPU and select B300.",
      },
      {
        title: "Deploy.",
        text: "Accept a matching bid and start your workload.",
      },
    ],
    cta: deploy,
  },
  specs: {
    title: "NVIDIA B300 GPU specifications",
    columns: ["Spec", "B300 (per GPU)"],
    rows: [
      ["Architecture", "Blackwell Ultra"],
      ["Form factor", "SXM"],
      ["GPU memory", "288 GB HBM3e"],
      ["Memory bandwidth", "Up to 8 TB/s"],
      ["FP4 Tensor", "13.5 PFLOPS dense · 18 PFLOPS sparse"],
      ["FP8 / FP6 Tensor", "4.5 PFLOPS dense · 9 PFLOPS sparse"],
      ["FP16 / BF16 Tensor", "2.25 PFLOPS dense · 4.5 PFLOPS sparse"],
      ["TF32 Tensor", "1.125 PFLOPS dense · 2.25 PFLOPS sparse"],
      ["FP64", "~1.25 TFLOPS"],
      ["NVLink", "5th gen, 1.8 TB/s GPU-to-GPU"],
      ["Networking", "Up to 800 Gb/s per GPU with NVIDIA ConnectX-8"],
      ["GPU power limit", "Up to 1,400 W"],
      ["Confidential computing", "Supported on compatible systems"],
      ["8-GPU HGX B300 total memory", "~2.1 TB"],
    ],
  },
  faqTitle: "NVIDIA B300 FAQ",
  faq: [
    {
      question: "What is the NVIDIA B300?",
      answer:
        "The NVIDIA B300 is a Blackwell Ultra data center GPU built for large-model AI inference, long-context serving, fine-tuning and training. It is the GPU used in 8-GPU HGX and DGX B300 systems.",
    },
    {
      question: "What are the NVIDIA B300 specs?",
      answer:
        "The B300 delivers 13.5 PFLOPS of dense FP4 compute with native NVFP4 support, up to 8 TB/s of memory bandwidth, 5th-gen NVLink at 1.8 TB/s per GPU and a power limit of up to 1,400 W.",
    },
    {
      question: "How much memory does the NVIDIA B300 have?",
      answer:
        "Each B300 has 288 GB of HBM3e. An 8-GPU HGX B300 system has about 2.1 TB of total GPU memory, enough for trillion-parameter MoE models in 4-bit precision.",
    },
    {
      question: "How much does it cost to rent an NVIDIA B300?",
      answer: `On-demand B300s on Akash start at ${RATE} per GPU-hour, about ${MONTHLY} a month running 24/7, or ${NODE_HOURLY} per hour for an 8-GPU server. Pricing changes with marketplace supply and demand.`,
    },
    {
      question: "Is the NVIDIA B300 available on demand?",
      answer:
        "Yes, but B300 capacity is in high demand and changes through the day. Check live availability in Akash Console before you plan a deployment.",
    },
    {
      question: "Is the B300 good for scientific computing?",
      answer:
        "B300 is optimized for AI, not FP64-heavy computing. Its FP64 performance is about 1.25 TFLOPS per GPU, so for double-precision simulations, B200 or H200 may be a better fit.",
    },
    {
      question: "Can I reserve a dedicated B300 cluster?",
      answer:
        "Yes. Reserved B300 clusters run on dedicated bare metal with InfiniBand for multi-node training and large-model serving, with SLA-backed uptime and terms custom-quoted for your workload.",
    },
  ],
  closing: {
    title: "Run the biggest models on fewer GPUs",
    description:
      "Deploy the NVIDIA B300 on-demand, or request a dedicated reserved cluster for production. The B300 pairs 288 GB of HBM3e with Blackwell Ultra compute for large-model inference, fine-tuning and training.",
    ctas: [reserve, deploy],
  },
};
