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

const { source, snapshot: HOURLY } = BID_PRICED["rtx-pro-6000-server"];
const UPDATED = SNAPSHOT_DATE;
const AS_OF = liveDate(UPDATED);
const { rate: RATE } = livePriceLabels(HOURLY);

const COMPARISON_POST = "/the-bid/rtx-pro-6000-blackwell-vs-h100-vs-h200-2026/";

const sales: GpuLink = {
  label: "Talk to sales",
  href: "/gpus-on-demand",
};

export const rtxPro6000Server: GpuDetailPage = {
  slug: "rtx-pro-6000-server",
  shortName: "RTX PRO 6000 Server",
  pricesUpdated: isoDate(UPDATED),
  livePrice: source,
  seo: {
    title: "NVIDIA RTX PRO 6000 Server Edition: Specs & Rental | Akash",
    description:
      "Rent NVIDIA RTX PRO 6000 Blackwell Server Edition GPUs on Akash. 96 GB GDDR7, FP4 and confidential computing in a data center GPU built to run 24/7.",
  },
  hero: {
    title: "Rent NVIDIA RTX PRO 6000 Blackwell Server Edition GPUs",
    description:
      "A universal Blackwell GPU built for the data center. The RTX PRO 6000 Server Edition runs AI inference, video, rendering and virtual workstations on one passively cooled card with 96 GB of memory.",
    specs: ["96 GB GDDR7 ECC", "1,597 GB/s", "Blackwell", "FP4"],
    price: RATE,
    priceNote: "Multi-GPU servers: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Data center GPU built to run 24/7",
      "No egress fees",
    ],
    ctas: [deployLink, sales, allPricingLink],
  },
  pricing: {
    title: "Rent an RTX PRO 6000 Server Edition on Akash",
    paragraphs: [
      `As of ${AS_OF}, on-demand RTX PRO 6000 Server Edition GPUs on Akash start at ${RATE} per GPU-hour.`,
    ],
    table: pricingTable(
      HOURLY,
      {
        single: "1x RTX PRO 6000 Server Edition (96 GB)",
        node: "8x RTX PRO 6000 Server Edition (768 GB total)",
        quoted: "Committed capacity",
      },
      { livePrice: true },
    ),
    note: `For how it stacks up against the H100 and H200 on memory, throughput and hourly cost, see [RTX PRO 6000 vs H100 vs H200](${COMPARISON_POST}).`,
  },
  highlights: [
    {
      title: "Built for data center inference",
      paragraphs: [],
      bullets: [
        {
          text: "Passively cooled for 24/7 operation in standard servers, with air- and liquid-cooled versions.",
        },
        {
          title: "Faster than L40S",
          text: "NVIDIA cites up to 5× higher LLM inference throughput for agentic AI and 3.3× faster text-to-video generation versus the L40S.",
        },
        {
          title: "FP4 Tensor Cores",
          text: "4 PFLOPS of FP4 and 2 PFLOPS of FP8.",
        },
        {
          title: "Confidential computing",
          text: "NVIDIA describes it as the first universal GPU to enable secure AI with NVIDIA Confidential Computing.",
        },
        {
          title: "Multi-tenant",
          text: "MIG splits one card into up to 4 isolated GPUs of 24 GB, and NVIDIA vGPU profiles range from 8 GB to 96 GB.",
        },
      ],
    },
  ],
  fit: {
    title: "Is the RTX PRO 6000 Server Edition the right GPU for you?",
    description:
      "Choose the Server Edition when you need a large-memory inference GPU that also handles graphics and video.",
    choices: [
      {
        title: "Choose the RTX PRO 6000 Server Edition",
        text: "if you serve models up to 96 GB, run video or rendering pipelines, or need isolated multi-tenant GPUs.",
      },
      {
        title: "Choose the H100 or H200",
        text: "if you train across many GPUs and need NVLink and HBM bandwidth. [See H100 pricing →](/pricing/gpus/h100/)",
      },
      {
        title: "Choose the Workstation Edition",
        text: "if you want the highest single-card bandwidth (1,792 GB/s). [See Workstation Edition →](/pricing/gpus/rtx-pro-6000-workstation/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the RTX PRO 6000 Server Edition used for?",
    paragraphs: [
      "The NVIDIA RTX PRO 6000 Blackwell Server Edition is used for AI inference, video generation, rendering and virtual workstations in the data center. NVIDIA benchmarks against the L40S show:",
    ],
    items: [
      {
        title: "Agentic AI and LLM inference",
        text: "Up to 5× higher LLM inference throughput than L40S, with an optimized NIM profile for gpt-oss-120b.",
      },
      {
        title: "Multimodal and video generation",
        text: "3.3× faster text-to-video generation than L40S.",
      },
      {
        title: "Genomics and drug discovery",
        text: "Nearly 7× faster genomics sequencing and up to 4.8× faster OpenFold2 inference than L40S.",
      },
      {
        title: "Physical AI and digital twins",
        text: "Robotics simulation and industrial digital twins on Omniverse; supported hardware for Cosmos world-model microservices.",
      },
      {
        title: "Rendering and recommender systems",
        text: "Over 2× faster rendering and nearly 2× faster recommender inference than L40S.",
      },
      {
        title: "Virtual workstations and secure multi-tenant AI",
        text: "VGPU with up to 48 concurrent VMs per GPU, MIG isolation and confidential computing for finance, healthcare and government.",
      },
    ],
    note: "**Not ideal for:** large multi-node training. Choose H100, H200 or B200 for NVLink-connected training clusters.",
  },
  deploy: {
    title: "Deploy an RTX PRO 6000 Server Edition in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose RTX PRO 6000 Server Edition.",
        text: "Turn on GPU, select it and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA RTX PRO 6000 Blackwell Server Edition specifications",
    columns: ["Spec", "RTX PRO 6000 Blackwell Server Edition"],
    rows: [
      ["Architecture", "NVIDIA Blackwell"],
      ["GPU memory", "96 GB GDDR7 with ECC"],
      ["Memory interface", "512-bit"],
      ["Memory bandwidth", "1,597 GB/s"],
      ["CUDA cores", "24,064"],
      ["Tensor Cores", "5th gen"],
      ["RT Cores", "188, 4th gen"],
      ["FP4 Tensor", "4 PFLOPS (peak)"],
      ["FP8 Tensor", "2 PFLOPS (peak)"],
      ["FP16 / BF16 Tensor", "1 PFLOPS (peak)"],
      ["TF32 Tensor", "234 TFLOPS (peak)"],
      ["FP32", "120 TFLOPS"],
      ["RT performance", "355 TFLOPS"],
      ["MIG", "Up to 4 instances (24 GB each)"],
      ["vGPU", "Supported"],
      ["Video", "4× NVENC (9th gen), 4× NVDEC (6th gen)"],
      ["Interface", "PCIe Gen 5 x16"],
      ["Max power", "Up to 600 W (configurable)"],
      [
        "Cooling / form factor",
        "Passive air dual-slot FHFL, or liquid single-slot FHXL",
      ],
    ],
    note: "NVIDIA does not state whether the Server Edition tensor figures are sparse or dense; they are listed as peak.",
  },
  faqTitle: "NVIDIA RTX PRO 6000 Server Edition FAQ",
  faq: [
    {
      question: "What is the NVIDIA RTX PRO 6000 Blackwell Server Edition?",
      answer:
        "It is NVIDIA's data center version of the RTX PRO 6000 Blackwell: a passively cooled, 96 GB GPU for AI inference, video, rendering and virtual workstations.",
    },
    {
      question: "How does it compare with the L40S?",
      answer:
        "NVIDIA reports up to 5× higher LLM inference throughput, 3.3× faster text-to-video generation and over 2× faster rendering than the L40S.",
    },
    {
      question: "Does it support confidential computing and vGPU?",
      answer:
        "Yes. NVIDIA supports Confidential Computing and NVIDIA vGPU on the Server Edition, with vGPU profiles from 8 GB to 96 GB.",
    },
    {
      question: "How much does it cost to rent an RTX PRO 6000 Server Edition?",
      answer: `As of ${AS_OF}, on-demand RTX PRO 6000 Server Edition GPUs on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand.`,
    },
    {
      question: "Is it a good alternative to the H100?",
      answer:
        "For inference, video and rendering that fit in 96 GB, yes. For multi-GPU training that needs NVLink and HBM bandwidth, the H100 is the better fit.",
    },
  ],
  closing: {
    title: "One GPU for AI, video and graphics",
    description:
      "Deploy the RTX PRO 6000 Server Edition on-demand, or talk to sales about multi-GPU servers.",
    ctas: [deployLink, sales],
  },
};
