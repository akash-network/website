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

const { source, snapshot: HOURLY } = BID_PRICED.h200;
const UPDATED = SNAPSHOT_DATE;
const AS_OF = liveDate(UPDATED);
const { rate: RATE } = livePriceLabels(HOURLY);

const GUIDE_POST =
  "/the-bid/nvidia-h200-gpu-guide-2026-specs-benchmarks-pricing/";
const CONTEXT_POST = "/the-bid/h100-vs-h200-long-context-llms/";

const reserve: GpuLink = {
  label: "Reserve H200 capacity",
  href: "/gpus-on-demand",
};
const sales: GpuLink = {
  label: "Talk to sales",
  href: "/gpus-on-demand",
};

export const h200: GpuDetailPage = {
  slug: "h200",
  shortName: "H200",
  pricesUpdated: isoDate(UPDATED),
  livePrice: source,
  seo: {
    title: "NVIDIA H200 GPU: 141GB HBM3e Specs & Rental | Akash",
    description:
      "Rent NVIDIA H200 GPUs on Akash. 141 GB HBM3e and 4.8 TB/s for LLM inference and fine-tuning on Hopper. On-demand or reserved capacity, no egress fees.",
  },
  hero: {
    title: "Rent NVIDIA H200 GPUs",
    description:
      "The Hopper GPU with the most memory. Each H200 has 141 GB of HBM3e at 4.8 TB/s — nearly double the H100's capacity with the same compute — for larger models and longer context on fewer GPUs.",
    specs: ["141 GB HBM3e", "4.8 TB/s", "Hopper", "NVLink 900 GB/s"],
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
    title: "Rent an H200 on Akash",
    paragraphs: [
      `As of ${AS_OF}, on-demand H200s on Akash start at ${RATE} per GPU-hour. Reserved clusters are custom-quoted by GPU count, term and workload.`,
    ],
    table: pricingTable(
      HOURLY,
      {
        single: "1x H200 (141 GB)",
        node: "8x H200 (1.13 TB total)",
        quoted: "Reserved cluster",
      },
      { livePrice: true },
    ),
    note: `For benchmarks and rates across other providers, see the [NVIDIA H200 guide](${GUIDE_POST}).`,
    options: [
      {
        title: "On-demand",
        description:
          "For inference endpoints, fine-tuning, evaluation and experiments.",
        bullets: [
          "1x to 8x H200",
          "Billed per GPU-hour in Akash Console",
          "Launched from a template or any Docker image",
        ],
        cta: deployLink,
      },
      {
        title: "Reserved",
        description: "For production LLM serving and multi-node training.",
        bullets: [
          "Dedicated 8-GPU H200 nodes linked by 900 GB/s NVLink",
          "Bare metal, SLA terms and USD invoicing",
        ],
        cta: sales,
      },
    ],
  },
  highlights: [
    {
      title: "Why the H200 stands out",
      paragraphs: [],
      bullets: [
        {
          title: "Memory",
          text: '141 GB of HBM3e per GPU — NVIDIA describes it as "nearly double the capacity" of the H100.',
        },
        { title: "Bandwidth", text: "4.8 TB/s, 1.4× the H100." },
        {
          title: "Faster LLM inference",
          text: "NVIDIA reports up to 1.9× higher Llama 2 70B inference throughput and 1.6× higher GPT-3 175B throughput than H100 in its published benchmarks. Results depend on model, batch size and configuration.",
        },
        {
          title: "Same power profile",
          text: 'NVIDIA notes the gains come "within the same power profile as the H100."',
        },
        {
          title: "Mature software",
          text: "the Hopper architecture, with FP8 and the Transformer Engine, is supported across major frameworks.",
        },
      ],
    },
  ],
  fit: {
    title: "Is the NVIDIA H200 the right GPU for you?",
    description:
      "Choose the H200 when you need more memory than an H100 but want to stay on Hopper.",
    choices: [
      {
        title: "Choose the H200",
        text: "if your model or KV cache doesn't fit in 80 GB, you serve 70B-class models with long context, or your stack is tuned for Hopper.",
      },
      {
        title: "Choose the H100",
        text: "if your workload fits in 80 GB per GPU. [See H100 pricing →](/pricing/gpus/h100/)",
      },
      {
        title: "Choose the B200",
        text: "if you want Blackwell, native FP4 and 180 GB per GPU. [See B200 pricing →](/pricing/gpus/b200/)",
      },
    ],
    paragraphs: [],
  },
  useCases: {
    title: "What is the NVIDIA H200 used for?",
    paragraphs: [
      "The NVIDIA H200 is used for LLM inference, fine-tuning and HPC on the Hopper architecture. Its 141 GB of memory and 4.8 TB/s bandwidth make it suited to:",
    ],
    items: [
      {
        title: "Large-model LLM inference",
        text: "Up to 1.9× higher Llama 2 70B throughput and 1.6× higher GPT-3 175B throughput than H100.",
      },
      {
        title: "Long-context serving",
        text: "One 8× H200 node holds a 405B-parameter model in FP8 and serves 128K-token inputs.",
      },
      {
        title: "Speculative decoding",
        text: "Up to 3.6× higher throughput with draft-target speculative decoding in TensorRT-LLM.",
      },
      {
        title: "LLM fine-tuning",
        text: "Fine-tune 70B models at over 15,000 tokens/s on an 8× H200 node with NeMo.",
      },
      {
        title: "RAG, speech and vision AI",
        text: "Deploy retrieval-augmented generation, computer vision and speech pipelines with NIM microservices.",
      },
      {
        title: "HPC and simulation",
        text: "Up to 110× faster time to results than CPUs on scientific workloads, in the same power profile as H100.",
      },
    ],
  },
  deploy: {
    title: "Deploy an H200 in three steps",
    steps: [
      DEPLOY_STEP_ADD_APP,
      {
        title: "Choose H200.",
        text: "Turn on GPU, select H200 and check current provider capacity.",
      },
      DEPLOY_STEP_DEPLOY,
    ],
    cta: deployLink,
  },
  specs: {
    title: "NVIDIA H200 specifications",
    columns: ["Spec", "H200 SXM (per GPU)"],
    rows: [
      ["Architecture", "NVIDIA Hopper"],
      ["Form factor", "SXM"],
      ["GPU memory", "141 GB HBM3e"],
      ["Memory bandwidth", "4.8 TB/s"],
      ["FP8 Tensor", "1,979 TFLOPS dense · 3,958 TFLOPS sparse"],
      ["INT8 Tensor", "1,979 TOPS dense · 3,958 TOPS sparse"],
      ["FP16 / BF16 Tensor", "989.5 TFLOPS dense · 1,979 TFLOPS sparse"],
      ["TF32 Tensor", "494.5 TFLOPS dense · 989 TFLOPS sparse"],
      ["FP32", "67 TFLOPS"],
      ["FP64 / FP64 Tensor", "34 / 67 TFLOPS"],
      ["NVLink", "900 GB/s"],
      ["PCIe", "Gen 5, 128 GB/s"],
      ["Max power", "Up to 700 W (configurable)"],
      ["MIG", "Up to 7 instances @ 18 GB"],
      ["Confidential computing", "Supported"],
      ["Decoders", "7 NVDEC, 7 JPEG"],
    ],
    note: "NVIDIA lists H200 specifications as preliminary. Dense tensor figures are NVIDIA's sparse figures divided by 2.",
  },
  faqTitle: "NVIDIA H200 FAQ",
  faq: [
    {
      question: "What is the NVIDIA H200?",
      answer:
        "The NVIDIA H200 is a Hopper-architecture data center GPU and the first GPU with 141 GB of HBM3e. It is built for generative AI, LLM inference and HPC.",
    },
    {
      question: "How much memory does the NVIDIA H200 have?",
      answer:
        "Each H200 has 141 GB of HBM3e with 4.8 TB/s of bandwidth. An 8-GPU H200 system has about 1.13 TB of GPU memory.",
    },
    {
      question: "What is the difference between the H200 and H100?",
      answer: `The H200 has the same compute as the H100 SXM but 141 GB of memory versus 80 GB and 1.4× the bandwidth. In NVIDIA's published benchmarks, the H200 delivers up to 1.9× higher Llama 2 70B inference throughput. For what that extra memory is worth on long-context serving, see [H100 vs H200 for long-context LLMs](${CONTEXT_POST}).`,
    },
    {
      question: "How much does it cost to rent an NVIDIA H200?",
      answer: `As of ${AS_OF}, on-demand H200s on Akash start at ${RATE} per GPU-hour. Pricing changes with marketplace supply and demand; reserved clusters are custom-quoted.`,
    },
    {
      question: "Can I split an H200 into smaller GPUs?",
      answer:
        "Yes. Multi-Instance GPU (MIG) splits one H200 into up to 7 isolated instances of 18 GB each.",
    },
    {
      question: "Can I reserve a dedicated H200 cluster?",
      answer:
        "Yes. Reserved H200 clusters run on dedicated bare metal with NVLink, SLA-backed uptime and custom-quoted terms.",
    },
  ],
  closing: {
    title: "More memory on proven Hopper",
    description:
      "Deploy H200 on-demand when capacity is available, or reserve a dedicated cluster for production.",
    ctas: [reserve, deployLink],
  },
};
