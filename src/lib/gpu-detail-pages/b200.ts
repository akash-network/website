import { blackwellHourlyPrice } from "@/components/pricing-page/gpus/gpu-models";
import {
  allPricingLink,
  BUILD_DATE,
  deployLink,
  DEPLOY_STEP_ADD_APP,
  DEPLOY_STEP_DEPLOY,
  liveDate,
  isoDate,
  priceLabels,
  pricingTable,
} from "./shared";
import type { GpuDetailPage, GpuLink } from "./types";

// Same fixed rate the pricing table lists, so the two never drift apart.
const HOURLY = blackwellHourlyPrice("b200") ?? 5;
const { rate: RATE, rateShort: RATE_SHORT } = priceLabels(HOURLY);
// A fixed rate, so it is current as of every build.
const UPDATED = BUILD_DATE;
const AS_OF = liveDate(UPDATED);

const reserve: GpuLink = {
  label: "Reserve B200 capacity",
  href: "/nvidia-blackwell-gpus",
};
const sales: GpuLink = {
  label: "Talk to sales",
  href: "/nvidia-blackwell-gpus",
};

export const b200: GpuDetailPage = {
  slug: "b200",
  shortName: "B200",
  pricesUpdated: isoDate(UPDATED),
  seo: {
    title: "NVIDIA B200 GPU: 180GB HBM3e Specs & Rental | Akash",
    description:
      "Rent NVIDIA B200 GPUs on Akash. 180 GB HBM3e, 8 TB/s bandwidth and native FP4 for AI training and inference. On-demand or reserved capacity, no egress fees.",
  },
  hero: {
    title: "Rent NVIDIA B200 GPUs",
    description:
      "Blackwell-generation performance for training and inference. Each B200 pairs 180 GB of HBM3e with native FP4, and an 8-GPU node delivers 1.44 TB of GPU memory linked by 1.8 TB/s NVLink.",
    specs: ["180 GB HBM3e", "8 TB/s", "Blackwell", "NVLink 1.8 TB/s"],
    price: RATE_SHORT,
    priceNote: "Reserved clusters: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Dedicated bare metal available for reserved deployments",
      "No egress fees",
    ],
    ctas: [reserve, deployLink, allPricingLink],
  },
  pricing: {
    title: "Rent a B200 on Akash",
    paragraphs: [
      `As of ${AS_OF}, on-demand B200s on Akash start at ${RATE} per GPU-hour. Reserved clusters are custom-quoted by GPU count, term and workload.`,
    ],
    table: pricingTable(HOURLY, {
      single: "1x B200 (180 GB)",
      node: "8x B200 (1.44 TB total)",
      quoted: "Reserved cluster",
    }),
    options: [
      {
        title: "On-demand",
        description:
          "For model testing, fine-tuning, evaluation and bursty inference.",
        bullets: [
          "1x to 8x B200",
          "Billed per GPU-hour in Akash Console",
          "Launched from a template or any Docker image",
        ],
        cta: deployLink,
      },
      {
        title: "Reserved",
        description: "For production serving and multi-node training.",
        bullets: [
          "Dedicated 8-GPU B200 nodes linked by 1.8 TB/s NVLink",
          "Multi-node clusters with up to 400 Gb/s networking in supported configurations",
          "Bare metal, SLA terms and USD invoicing",
        ],
        cta: sales,
      },
    ],
  },
  highlights: [
    {
      title: "What Blackwell brings",
      paragraphs: [],
      bullets: [
        {
          title: "Native FP4",
          text: "9 PFLOPS of dense FP4 per GPU, a format Hopper GPUs don't support.",
        },
        {
          title: "More memory",
          text: "180 GB of HBM3e per GPU, up from 141 GB on H200.",
        },
        { title: "More bandwidth", text: "8 TB/s per GPU, 1.67× the H200." },
        {
          title: "Faster NVLink",
          text: "5th-gen NVLink at 1.8 TB/s per GPU, double the H200.",
        },
        {
          title: "Strong FP64",
          text: "about 37 TFLOPS per GPU, so B200 still handles scientific computing.",
        },
        {
          title: "Confidential computing",
          text: 'NVIDIA calls Blackwell "the first TEE-I/O capable GPU in the industry"; full protection requires a compatible TEE-I/O host and configuration.',
        },
      ],
      note: "NVIDIA projects DGX B200 system performance at 3× the training and 15× the inference performance of DGX H100. These are system-level projections; results vary by workload and configuration.",
    },
  ],
  fit: {
    title: "Is the NVIDIA B200 the right GPU for you?",
    description:
      "Choose the B200 when you need Blackwell compute and FP4 but your workload fits in 180 GB per GPU.",
    choices: [
      {
        title: "Choose the B200",
        text: "if you train or fine-tune large models, serve FP4 or FP8 models at scale, or need strong FP64 alongside AI.",
      },
      {
        title: "Choose the B300",
        text: "if you need up to 288 GB per GPU for trillion-parameter models or very long context. [See B300 pricing →](/pricing/gpus/b300/)",
      },
      {
        title: "Choose the H200",
        text: "if your workload fits in 141 GB and your stack is tuned for Hopper. [See H200 pricing →](/pricing/gpus/h200/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the NVIDIA B200 used for?",
    paragraphs: [
      "The NVIDIA B200 is used to train, fine-tune and serve large AI models. Its native FP4, 180 GB of memory and 8 TB/s bandwidth make it suited to:",
    ],
    items: [
      {
        title: "Reasoning-model inference in FP4",
        text: "Serve reasoning models in NVFP4 with accuracy within about 1% of FP8 and far more tokens per GPU. An 8× B200 node delivers over 30,000 tokens/s on DeepSeek-R1.",
      },
      {
        title: "Mixture-of-experts serving",
        text: "Run large MoE models with multi-token prediction and NVFP4 for big throughput gains over FP8.",
      },
      {
        title: "Agentic AI with long inputs",
        text: "Disaggregated serving with NVIDIA Dynamo gives up to 4× faster per-user token speed for code generation, summarization and agent workflows on 8× B200.",
      },
      {
        title: "Low-cost token generation",
        text: "Around $0.02 per million tokens on gpt-oss-120b, roughly 4.5× cheaper than Hopper.",
      },
      {
        title: "Large-model training and post-training",
        text: "Around 3× the training performance of an H100 system, with NVFP4 now speeding up training as well as inference.",
      },
      {
        title: "Confidential AI inference",
        text: "Run private inference with confidential computing on and keep 96–98% of normal throughput.",
      },
    ],
  },
  deploy: {
    title: "Deploy a B200 in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose B200.",
        text: "Turn on GPU, select B200 and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA B200 specifications",
    columns: ["Spec", "B200 (per GPU, 8-GPU HGX/DGX B200)"],
    rows: [
      ["Architecture", "NVIDIA Blackwell, 208B transistors, 2 dies"],
      ["Form factor", "SXM"],
      ["GPU memory", "180 GB HBM3e (1,440 GB per 8-GPU system)"],
      ["Memory bandwidth", "Up to 8 TB/s"],
      ["FP4 Tensor", "9 PFLOPS dense · 18 PFLOPS sparse"],
      ["FP8 / FP6 Tensor", "4.5 PFLOPS dense · 9 PFLOPS sparse"],
      ["INT8 Tensor", "4.5 POPS dense · 9 POPS sparse"],
      ["FP16 / BF16 Tensor", "2.25 PFLOPS dense · 4.5 PFLOPS sparse"],
      ["TF32 Tensor", "1.125 PFLOPS dense · 2.25 PFLOPS sparse"],
      ["FP32", "75 TFLOPS"],
      ["FP64 / FP64 Tensor", "37 TFLOPS"],
      ["NVLink", "5th gen, 1.8 TB/s per GPU (14.4 TB/s per system)"],
      [
        "Networking",
        "Up to 400 Gb/s in supported HGX B200 configurations; depends on server and network configuration",
      ],
      ["Power", "Up to 1,000 W per GPU"],
      ["MIG", "Up to 7 instances per GPU"],
      ["Confidential computing", "Supported (TEE-I/O)"],
    ],
    note: "Per-GPU figures are NVIDIA's HGX B200 system figures divided by 8.",
  },
  faqTitle: "NVIDIA B200 FAQ",
  faq: [
    {
      question: "What is the NVIDIA B200?",
      answer:
        "The NVIDIA B200 is a Blackwell-generation data center GPU for AI training and inference. It is the GPU used in 8-GPU HGX B200 and DGX B200 systems.",
    },
    {
      question: "How much memory does the NVIDIA B200 have?",
      answer:
        "Each B200 has 180 GB of HBM3e with up to 8 TB/s of bandwidth. An 8-GPU B200 system has 1,440 GB of GPU memory.",
    },
    {
      question: "What is the difference between the B200 and H200?",
      answer:
        "The B200 has 180 GB of memory versus 141 GB on the H200, 1.67× the bandwidth, double the NVLink bandwidth and native FP4, which the Hopper-based H200 lacks.",
    },
    {
      question: "How much does it cost to rent an NVIDIA B200?",
      answer: `As of ${AS_OF}, on-demand B200s on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand; reserved clusters are custom-quoted.`,
    },
    {
      question: "Is the B200 good for scientific computing?",
      answer:
        "Yes. The B200 delivers about 37 TFLOPS of FP64 per GPU, so it handles double-precision simulation as well as AI.",
    },
    {
      question: "Can I reserve a dedicated B200 cluster?",
      answer:
        "Yes. Reserved B200 clusters run on dedicated bare metal with NVLink and high-speed networking, SLA-backed uptime and custom-quoted terms.",
    },
  ],
  closing: {
    title: "Blackwell performance for training and inference",
    description:
      "Deploy B200 on-demand when capacity is available, or reserve a dedicated cluster for production.",
    ctas: [reserve, deployLink],
  },
};
