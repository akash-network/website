import {
  allPricingLink,
  deployLink,
  DEPLOY_STEP_ADD_APP,
  DEPLOY_STEP_DEPLOY,
  ON_DEMAND_FROM,
  priceLabels,
  pricingTable,
} from "./shared";
import type { GpuDetailPage, GpuLink } from "./types";

const HOURLY = ON_DEMAND_FROM.a100;
const { rate: RATE } = priceLabels(HOURLY);

const reserve: GpuLink = {
  label: "Reserve A100 capacity",
  href: "/gpus-on-demand",
};
const sales: GpuLink = {
  label: "Talk to sales",
  href: "/gpus-on-demand",
};

export const a100: GpuDetailPage = {
  slug: "a100",
  shortName: "A100",
  seo: {
    title: "NVIDIA A100 80GB GPU: Specs & Rental | Akash",
    description:
      "Rent NVIDIA A100 80GB GPUs on Akash. 80 GB HBM2e, 2 TB/s bandwidth and MIG for AI training, inference and HPC. On-demand or reserved capacity, no egress fees.",
  },
  hero: {
    title: "Rent NVIDIA A100 GPUs",
    description:
      "A proven Ampere GPU for AI and HPC. Each A100 80GB delivers 80 GB of HBM2e at over 2 TB/s, and Multi-Instance GPU splits it into up to 7 isolated GPUs.",
    specs: ["80 GB HBM2e", "2,039 GB/s", "Ampere", "NVLink 600 GB/s"],
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
    title: "Rent an A100 on Akash",
    paragraphs: [
      `On-demand A100s on Akash start at ${RATE} per GPU-hour. Reserved clusters are custom-quoted by GPU count, term and workload.`,
    ],
    table: pricingTable(HOURLY, {
      single: "1x A100 80GB",
      node: "8x A100 80GB (640 GB total)",
      quoted: "Reserved cluster",
    }),
    options: [
      {
        title: "On-demand",
        description:
          "For fine-tuning, batch inference, research and development.",
        bullets: [
          "1x to 8x A100",
          "Billed per GPU-hour in Akash Console",
          "Launched from a template or any Docker image",
        ],
        cta: deployLink,
      },
      {
        title: "Reserved",
        description: "For steady training and serving workloads.",
        bullets: [
          "Dedicated 8-GPU A100 nodes linked by 600 GB/s NVLink",
          "Bare metal, SLA terms and USD invoicing",
        ],
        cta: sales,
      },
    ],
  },
  highlights: [
    {
      title: "Why teams still run the A100",
      paragraphs: [],
      bullets: [
        {
          text: "80 GB of HBM2e at 2,039 GB/s — room for mid-size models and large batches.",
        },
        {
          title: "Multi-Instance GPU",
          text: "up to 7 isolated instances of 10 GB each on one GPU.",
        },
        {
          title: "TF32 and BF16 Tensor Cores",
          text: "156 TFLOPS dense TF32 and 312 TFLOPS dense BF16 for training.",
        },
        {
          title: "FP64 Tensor Cores",
          text: "19.5 TFLOPS for HPC and simulation.",
        },
        {
          title: "Generational leap",
          text: "NVIDIA rates A100 Tensor Core performance at up to 20× the prior Volta generation for AI workloads.",
        },
      ],
    },
  ],
  fit: {
    title: "Is the NVIDIA A100 the right GPU for you?",
    description:
      "Choose the A100 when your workload fits in 80 GB and doesn't need FP8.",
    choices: [
      {
        title: "Choose the A100",
        text: "if you run BF16 or TF32 training, batch inference, or MIG-based multi-tenant workloads.",
      },
      {
        title: "Choose the H100",
        text: "if you need FP8 and the Transformer Engine. NVIDIA projects up to 4× faster GPT-3 training on H100. [See H100 pricing →](/pricing/gpus/h100/)",
      },
      {
        title: "Choose the H200",
        text: "if you need 141 GB per GPU. [See H200 pricing →](/pricing/gpus/h200/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the NVIDIA A100 used for?",
    paragraphs: [
      "The NVIDIA A100 is used for AI training, inference, data analytics and HPC. Its 80 GB of memory and MIG support make it suited to:",
    ],
    items: [
      { text: "Fine-tuning and training mid-size models in BF16 or TF32." },
      { text: "Batch and offline inference where FP8 isn't required." },
      { text: "Multi-tenant workloads — up to 7 MIG instances per GPU." },
      {
        text: "HPC and scientific computing with 19.5 TFLOPS of FP64 Tensor.",
      },
      {
        text: "Data analytics — NVIDIA cites 2× faster big-data analytics on A100 80GB than A100 40GB.",
      },
    ],
    note: "**Not ideal for:** FP8 or FP4 inference. The A100 has no FP8 or FP4 Tensor Cores; choose H100, H200 or Blackwell.",
  },
  deploy: {
    title: "Deploy an A100 in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose A100.",
        text: "Turn on GPU, select A100 and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA A100 specifications",
    columns: ["Spec", "A100 80GB SXM", "A100 80GB PCIe"],
    rows: [
      ["Architecture", "NVIDIA Ampere", "NVIDIA Ampere"],
      ["GPU memory", "80 GB HBM2e", "80 GB HBM2e"],
      ["Memory bandwidth", "2,039 GB/s", "1,935 GB/s"],
      ["FP64 / FP64 Tensor", "9.7 / 19.5 TFLOPS", "9.7 / 19.5 TFLOPS"],
      ["FP32", "19.5 TFLOPS", "19.5 TFLOPS"],
      ["TF32 Tensor", "156 dense · 312 sparse TFLOPS", "Same"],
      ["FP16 / BF16 Tensor", "312 dense · 624 sparse TFLOPS", "Same"],
      ["INT8 Tensor", "624 dense · 1,248 sparse TOPS", "Same"],
      ["NVLink", "600 GB/s", "600 GB/s (bridge, 2 GPUs)"],
      ["PCIe", "Gen 4, 64 GB/s", "Gen 4, 64 GB/s"],
      ["Max power", "400 W", "300 W"],
      ["MIG", "Up to 7 @ 10 GB", "Up to 7 @ 10 GB"],
    ],
    note: "The 40GB A100 uses HBM2 at 1,555 GB/s with up to 7 MIG instances of 5 GB.",
  },
  faqTitle: "NVIDIA A100 FAQ",
  faq: [
    {
      question: "What is the NVIDIA A100?",
      answer:
        "The NVIDIA A100 is an Ampere-architecture data center GPU for AI training, inference, data analytics and HPC, available in 40 GB and 80 GB versions.",
    },
    {
      question: "How much memory does the NVIDIA A100 have?",
      answer:
        "The A100 80GB has 80 GB of HBM2e with 2,039 GB/s of bandwidth on SXM. The A100 40GB has 40 GB of HBM2 at 1,555 GB/s.",
    },
    {
      question: "What is the difference between the A100 and H100?",
      answer:
        "The H100 adds FP8 Tensor Cores and the Transformer Engine and has 3.35 TB/s of bandwidth versus 2 TB/s. The A100 supports TF32, BF16 and INT8 but not FP8.",
    },
    {
      question: "How much does it cost to rent an NVIDIA A100?",
      answer: `On-demand A100s on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand; reserved clusters are custom-quoted.`,
    },
    {
      question: "Can the A100 be split into smaller GPUs?",
      answer:
        "Yes. Multi-Instance GPU splits one A100 80GB into up to 7 isolated instances of 10 GB each.",
    },
    {
      question: "Can I reserve a dedicated A100 cluster?",
      answer:
        "Yes. Reserved A100 clusters run on dedicated bare metal with NVLink, SLA-backed uptime and custom-quoted terms.",
    },
  ],
  closing: {
    title: "A proven GPU for AI and HPC",
    description:
      "Deploy A100 on-demand when capacity is available, or reserve a dedicated cluster for steady workloads.",
    ctas: [reserve, deployLink],
  },
};
