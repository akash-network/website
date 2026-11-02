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

const { source, snapshot: HOURLY } = BID_PRICED["rtx-pro-6000-workstation"];
const UPDATED = SNAPSHOT_DATE;
const AS_OF = liveDate(UPDATED);
const { rate: RATE } = livePriceLabels(HOURLY);

const COMPARISON_POST = "/the-bid/rtx-pro-6000-blackwell-vs-h100-vs-h200-2026/";

const sales: GpuLink = {
  label: "Talk to sales",
  href: "/gpus-on-demand",
};

export const rtxPro6000Workstation: GpuDetailPage = {
  slug: "rtx-pro-6000-workstation",
  shortName: "RTX PRO 6000 Workstation",
  pricesUpdated: isoDate(UPDATED),
  livePrice: source,
  seo: {
    title: "NVIDIA RTX PRO 6000 Blackwell: 96GB Specs & Rental | Akash",
    description:
      "Rent NVIDIA RTX PRO 6000 Blackwell Workstation Edition GPUs on Akash. 96 GB GDDR7 with ECC, 4,000 AI TOPS and MIG for AI, rendering and simulation.",
  },
  hero: {
    title: "Rent NVIDIA RTX PRO 6000 Blackwell GPUs",
    description:
      "96 GB of GPU memory on a single Blackwell card. The RTX PRO 6000 Blackwell Workstation Edition combines AI, ray tracing and graphics for model inference, fine-tuning, rendering and simulation.",
    note: "This page covers the 600 W Workstation Edition, not the 300 W RTX PRO 6000 Blackwell Max-Q Workstation Edition.",
    specs: [
      "96 GB GDDR7 ECC",
      "1,792 GB/s",
      "Blackwell",
      "Up to 4,000 FP4 AI TOPS (with sparsity)",
    ],
    price: RATE,
    priceNote: "Multi-GPU and longer terms: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Pay per GPU-hour in Akash Console",
      "No egress fees",
    ],
    ctas: [deployLink, sales, allPricingLink],
  },
  pricing: {
    title: "Rent an RTX PRO 6000 on Akash",
    paragraphs: [
      `As of ${AS_OF}, on-demand RTX PRO 6000 Blackwell GPUs on Akash start at ${RATE} per GPU-hour.`,
    ],
    table: pricingTable(
      HOURLY,
      {
        single: "1x RTX PRO 6000 (96 GB)",
        quoted: "Multi-GPU or committed term",
      },
      { livePrice: true },
    ),
    note: `For how it stacks up against the H100 and H200 on memory, throughput and hourly cost, see [RTX PRO 6000 vs H100 vs H200](${COMPARISON_POST}).`,
  },
  highlights: [
    {
      title: "What the RTX PRO 6000 Blackwell brings",
      paragraphs: [],
      bullets: [
        {
          text: "96 GB of GDDR7 with ECC — enough to run large models on one card without splitting them across GPUs.",
        },
        {
          title: "5th-gen Tensor Cores with FP4",
          text: "up to 4,000 AI TOPS (FP4, with sparsity), and NVIDIA rates the Tensor Cores at up to 3× the previous generation.",
        },
        {
          title: "4th-gen RT Cores",
          text: "382 TFLOPS of ray tracing, up to 2× the previous generation.",
        },
        { text: "24,064 CUDA cores and 126 TFLOPS of FP32." },
        {
          title: "MIG",
          text: "split one card into up to 4 isolated GPUs of 24 GB each.",
        },
        {
          title: "Video",
          text: "4 NVENC and 4 NVDEC engines for encoding and transcoding.",
        },
      ],
    },
  ],
  fit: {
    title: "Is the RTX PRO 6000 the right GPU for you?",
    description:
      "Choose the RTX PRO 6000 when you need lots of memory on one card plus graphics and ray tracing.",
    choices: [
      {
        title: "Choose the RTX PRO 6000",
        text: "if your model needs up to 96 GB, you mix AI with rendering or simulation, or you want ECC memory.",
      },
      {
        title: "Choose the RTX 5090",
        text: "if 32 GB is enough for your model.",
      },
      {
        title: "Choose the H100 or H200",
        text: "if you need NVLink, HBM bandwidth and multi-GPU training. [See H100 pricing →](/pricing/gpus/h100/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the RTX PRO 6000 Blackwell used for?",
    paragraphs: [
      "The NVIDIA RTX PRO 6000 Blackwell is used for AI inference, fine-tuning, 3D rendering and simulation. Its 96 GB of memory and Blackwell Tensor and RT Cores make it suited to:",
    ],
    items: [
      {
        title: "Local LLMs and agentic AI",
        text: "Run autonomous AI agents, inference and LLM fine-tuning on one GPU; 96 GB holds 70B-class models.",
      },
      {
        title: "AI model prototyping and training",
        text: "Up to 4,000 FP4 AI TOPS with sparsity; GE HealthCare reports 2.5× faster AI training than RTX 6000 Ada.",
      },
      {
        title: "Physical AI and world models",
        text: "Supported hardware for NVIDIA Cosmos world-foundation-model microservices.",
      },
      {
        title: "Rendering and visualization",
        text: "3D modeling, animation, virtual production and architectural visualization with RTX Mega Geometry and DLSS 4.",
      },
      {
        title: "Engineering and scientific computing",
        text: "Genomic sequencing, drug discovery and seismic modeling; Sintavia reports 4.5× faster CFD than a 64-core CPU.",
      },
      {
        title: "Video and streaming pipelines",
        text: "4 NVENC and 4 NVDEC engines for livestreaming, real-time editing and 4K/8K workflows.",
      },
    ],
    note: "**Not ideal for:** multi-node training. The card has no NVLink; choose H100, H200 or B200 for large distributed training.",
  },
  deploy: {
    title: "Deploy an RTX PRO 6000 in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose RTX PRO 6000.",
        text: "Turn on GPU, select RTX PRO 6000 and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA RTX PRO 6000 Blackwell Workstation Edition specifications",
    columns: ["Spec", "RTX PRO 6000 Blackwell Workstation Edition"],
    rows: [
      ["Architecture", "NVIDIA Blackwell (GB202)"],
      ["GPU memory", "96 GB GDDR7 with ECC"],
      ["Memory interface", "512-bit"],
      ["Memory bandwidth", "1,792 GB/s"],
      ["CUDA cores", "24,064"],
      ["Tensor Cores", "752, 5th gen"],
      ["RT Cores", "188, 4th gen"],
      ["AI performance (FP4)", "2,015 TOPS dense · 4,000 TOPS sparse"],
      ["FP32", "126 TFLOPS"],
      ["RT performance", "382 TFLOPS"],
      ["MIG", "Up to 4 × 24 GB, 2 × 48 GB or 1 × 96 GB"],
      ["Video", "4× NVENC (9th gen), 4× NVDEC (6th gen)"],
      ["Interface", "PCIe 5.0 x16"],
      ["Max power", "600 W"],
      ["Cooling", "Double flow-through, dual slot"],
    ],
  },
  faqTitle: "NVIDIA RTX PRO 6000 Blackwell FAQ",
  faq: [
    {
      question: "What is the NVIDIA RTX PRO 6000 Blackwell?",
      answer:
        "The RTX PRO 6000 Blackwell is NVIDIA's professional Blackwell GPU with 96 GB of GDDR7, built for AI, rendering, simulation and graphics.",
    },
    {
      question: "How much memory does the RTX PRO 6000 have?",
      answer:
        "The RTX PRO 6000 Blackwell has 96 GB of GDDR7 with ECC and 1,792 GB/s of bandwidth on the Workstation Edition.",
    },
    {
      question: "What is the difference between the RTX PRO 6000 and RTX 5090?",
      answer:
        "Both use Blackwell, but the RTX PRO 6000 has 96 GB of ECC memory versus 32 GB, 24,064 CUDA cores versus 21,760, and supports MIG.",
    },
    {
      question:
        "What is the difference between the Workstation and Server Editions?",
      answer:
        "The Workstation Edition has an active double flow-through cooler and 1,792 GB/s of bandwidth. The Server Edition is passively cooled for data centers, runs at 1,597 GB/s and adds vGPU support. [See Server Edition →](/pricing/gpus/rtx-pro-6000-server/)",
    },
    {
      question: "How much does it cost to rent an RTX PRO 6000?",
      answer: `As of ${AS_OF}, on-demand RTX PRO 6000 Blackwell GPUs on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand.`,
    },
  ],
  closing: {
    title: "96 GB of Blackwell on one GPU",
    description:
      "Deploy an RTX PRO 6000 on-demand, or talk to sales about multi-GPU capacity.",
    ctas: [deployLink, sales],
  },
};
