import {
  allPricingLink,
  BID_PRICED,
  deployLink,
  DEPLOY_STEP_ADD_APP,
  DEPLOY_STEP_DEPLOY,
  isoDate,
  liveDate,
  livePriceLabels,
  pricingTable,
  SNAPSHOT_DATE,
} from "./shared";
import type { GpuDetailPage, GpuLink } from "./types";

const { source, snapshot: HOURLY } = BID_PRICED.h100;
const UPDATED = SNAPSHOT_DATE;
const AS_OF = liveDate(UPDATED);
const { rate: RATE } = livePriceLabels(HOURLY);

const PRICE_POST = "/the-bid/h100-rental-price-2026-cost-per-hour/";
const CONTEXT_POST = "/the-bid/h100-vs-h200-long-context-llms/";

const reserve: GpuLink = {
  label: "Reserve H100 capacity",
  href: "/gpus-on-demand",
};
const sales: GpuLink = {
  label: "Talk to sales",
  href: "/gpus-on-demand",
};

export const h100: GpuDetailPage = {
  slug: "h100",
  shortName: "H100",
  pricesUpdated: isoDate(UPDATED),
  livePrice: source,
  seo: {
    title: "NVIDIA H100 GPU: 80GB Specs & Rental | Akash",
    description:
      "Rent NVIDIA H100 GPUs on Akash. 80 GB HBM3, 3.35 TB/s and FP8 Transformer Engine for AI training and inference. On-demand or reserved capacity, no egress fees.",
  },
  hero: {
    title: "Rent NVIDIA H100 GPUs",
    description:
      "The proven Hopper workhorse for AI training and inference. Each H100 delivers 80 GB of HBM3, 3.35 TB/s of bandwidth and FP8 Tensor Cores, supported by major AI frameworks and runtimes.",
    specs: ["80 GB HBM3", "3.35 TB/s", "Hopper", "NVLink 900 GB/s"],
    price: RATE,
    priceNote: "Reserved clusters: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Dedicated bare metal available for reserved deployments",
      "No egress fees",
    ],
    ctas: [reserve, deployLink, allPricingLink],
  },
  pricing: {
    title: "Rent an H100 on Akash",
    paragraphs: [
      `As of ${AS_OF}, on-demand H100s on Akash start at ${RATE} per GPU-hour. Reserved clusters are custom-quoted by GPU count, term and workload.`,
    ],
    table: pricingTable(
      HOURLY,
      {
        single: "1x H100 (80 GB)",
        node: "8x H100 (640 GB total)",
        quoted: "Reserved cluster",
      },
      { livePrice: true },
    ),
    note: `For rates across other providers, the on-demand, reserved and spot split, and the cost per month and year, see [H100 rental price](${PRICE_POST}).`,
    options: [
      {
        title: "On-demand",
        description:
          "For fine-tuning, inference endpoints, research and experiments.",
        bullets: [
          "1x to 8x H100",
          "Billed per GPU-hour in Akash Console",
          "Launched from a template or any Docker image",
        ],
        cta: deployLink,
      },
      {
        title: "Reserved",
        description: "For production training and serving.",
        bullets: [
          "Dedicated 8-GPU H100 nodes linked by 900 GB/s NVLink",
          "Bare metal, SLA terms and USD invoicing",
        ],
        cta: sales,
      },
    ],
  },
  highlights: [
    {
      title: "Why the H100 is still the standard",
      paragraphs: [],
      bullets: [
        {
          title: "FP8 Transformer Engine",
          text: "1,979 TFLOPS of dense FP8 per GPU for faster training and inference.",
        },
        {
          title: "Big leap over A100",
          text: "NVIDIA projects up to 4× faster GPT-3 175B training and up to 30× faster inference on a 530B-parameter model versus A100.",
        },
        {
          title: "HPC",
          text: "67 TFLOPS of FP64 Tensor per GPU and DPX instructions, with NVIDIA citing up to 7× higher HPC performance than A100.",
        },
        {
          title: "Confidential computing",
          text: 'NVIDIA calls H100 "the world\'s first accelerator" with confidential computing.',
        },
        {
          title: "Broad support",
          text: "supported across major AI frameworks and serving engines.",
        },
      ],
    },
  ],
  fit: {
    title: "Is the NVIDIA H100 the right GPU for you?",
    description:
      "Choose the H100 when your workload fits in 80 GB per GPU and you want proven Hopper performance.",
    choices: [
      {
        title: "Choose the H100",
        text: "if you fine-tune or serve models that fit in 80 GB, need FP8, or want the most mature software stack.",
      },
      {
        title: "Choose the H200",
        text: "if you need more memory: 141 GB per GPU with the same compute. [See H200 pricing →](/pricing/gpus/h200/)",
      },
      {
        title: "Choose the A100",
        text: "if you don't need FP8 and want an established Ampere GPU. [See A100 pricing →](/pricing/gpus/a100/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the NVIDIA H100 used for?",
    paragraphs: [
      "The NVIDIA H100 is used for AI training, fine-tuning, inference and HPC. Its FP8 Transformer Engine and 3.35 TB/s bandwidth make it suited to:",
    ],
    items: [
      {
        title: "Large language model training",
        text: "Up to 4× faster GPT-3 175B training than A100; Llama 3.1 405B was trained on more than 16,000 H100s.",
      },
      {
        title: "LLM inference with FP8",
        text: "1,979 TFLOPS of dense FP8 through the Transformer Engine; up to 5× A100 on Llama 2 70B.",
      },
      {
        title: "Reasoning-model serving",
        text: "Disaggregated serving with NVIDIA Dynamo more than doubles Llama 70B throughput on Hopper.",
      },
      {
        title: "RLHF and post-training",
        text: "Up to 5.6× faster RLHF with TensorRT-LLM; the standard GPU for Nemotron reasoning-model fine-tuning recipes.",
      },
      {
        title: "Enterprise AI with RAG, vision and speech",
        text: "NIM microservices plus MIG partitioning into up to 7 instances for multi-tenant deployments.",
      },
      {
        title: "HPC and genomics",
        text: "67 TFLOPS of FP64 Tensor and DPX instructions deliver up to 7× A100 on dynamic-programming workloads such as DNA sequence alignment.",
      },
    ],
  },
  deploy: {
    title: "Deploy an H100 in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose H100.",
        text: "Turn on GPU, select H100 and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA H100 specifications",
    columns: ["Spec", "H100 SXM (per GPU)"],
    rows: [
      ["Architecture", "NVIDIA Hopper"],
      ["Form factor", "SXM"],
      ["GPU memory", "80 GB HBM3"],
      ["Memory bandwidth", "3.35 TB/s"],
      ["FP8 Tensor", "1,979 TFLOPS dense · 3,958 TFLOPS sparse"],
      ["INT8 Tensor", "1,979 TOPS dense · 3,958 TOPS sparse"],
      ["FP16 / BF16 Tensor", "989 TFLOPS dense · 1,979 TFLOPS sparse"],
      ["TF32 Tensor", "495 TFLOPS dense · 989 TFLOPS sparse"],
      ["FP32", "67 TFLOPS"],
      ["FP64 / FP64 Tensor", "34 / 67 TFLOPS"],
      ["NVLink", "900 GB/s"],
      ["PCIe", "Gen 5, 128 GB/s"],
      ["Max power", "Up to 700 W (configurable)"],
      ["MIG", "Up to 7 instances @ 10 GB"],
      ["Confidential computing", "Supported"],
      ["Decoders", "7 NVDEC, 7 JPEG"],
    ],
    note: "H100 NVL (PCIe) has 94 GB per GPU and 3.9 TB/s; confirm which version providers offer.",
  },
  faqTitle: "NVIDIA H100 FAQ",
  faq: [
    {
      question: "What is the NVIDIA H100?",
      answer:
        "The NVIDIA H100 is a Hopper-architecture data center GPU for AI training, inference and HPC, built around FP8 Tensor Cores and the Transformer Engine.",
    },
    {
      question: "How much memory does the NVIDIA H100 have?",
      answer:
        "The H100 SXM has 80 GB of HBM3 with 3.35 TB/s of bandwidth. An 8-GPU H100 system has 640 GB of GPU memory.",
    },
    {
      question: "Does the H100 support FP8?",
      answer:
        "Yes. The H100 introduced FP8 Tensor Cores and the Transformer Engine, delivering 1,979 TFLOPS of dense FP8 per GPU for faster training and inference.",
    },
    {
      question: "How much does it cost to rent an NVIDIA H100?",
      answer: `As of ${AS_OF}, on-demand H100s on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand; reserved clusters are custom-quoted.`,
    },
    {
      question: "Is the H100 still worth using?",
      answer: `Yes, for workloads that fit in 80 GB per GPU. It shares the H200's compute and runs on a mature, widely supported Hopper software stack. For how 80 GB compares with the H200's 141 GB once KV cache is accounted for, see [H100 vs H200 for long-context LLMs](${CONTEXT_POST}).`,
    },
    {
      question: "Can I reserve a dedicated H100 cluster?",
      answer:
        "Yes. Reserved H100 clusters run on dedicated bare metal with NVLink, SLA-backed uptime and custom-quoted terms.",
    },
  ],
  closing: {
    title: "Proven performance for AI training and inference",
    description:
      "Deploy H100 on-demand when capacity is available, or reserve a dedicated cluster for production.",
    ctas: [reserve, deployLink],
  },
};
