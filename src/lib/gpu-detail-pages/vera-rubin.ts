import { allPricingLink } from "./shared";
import type { GpuDetailPage, GpuLink } from "./types";

// Vera Rubin is offered on request as reserved capacity: the page takes interest through the
// next-gen access form and has no live price. Each H2 carries a search term, so the section
// order differs from the other GPU pages. Specs are per Rubin GPU from NVIDIA's Vera Rubin
// NVL72 product page (checked 2026-11-20).

const PRICE_POST = "/the-bid/blackwell-vera-rubin-gpu-prices-2027/";
const GB300_POST = "/the-bid/nvidia-gb300-nvl72-specs-vs-b300-2026/";
// The form's GPU option id is "rubin", the same placeholder id the pricing table uses.
const ACCESS_HREF = "/next-gen-gpus/?gpu=rubin#request-access";

const register: GpuLink = { label: "Register interest", href: ACCESS_HREF };

export const veraRubin: GpuDetailPage = {
  slug: "vera-rubin",
  shortName: "Vera Rubin",
  modifiedAtBuild: true,
  seo: {
    title: "NVIDIA Vera Rubin NVL72 Rack & Rubin GPU Specs | Akash",
    description:
      "NVIDIA Vera Rubin platform details: Rubin GPU specs, the Vera Rubin NVL72 rack, NVIDIA Vera CPU, Rubin vs Blackwell and the NVIDIA Rubin release date.",
  },
  hero: {
    title: "NVIDIA Vera Rubin GPU",
    description:
      "Rubin GPU specs, the Vera Rubin NVL72 rack and the NVIDIA Vera CPU, with reserved capacity on Akash.",
    specs: ["288 GB HBM4", "up to 19.2 TB/s", "NVLink 6", "Vera CPU"],
    priceLabel: "Availability",
    price: "Register interest",
    priceNote: "Reserved clusters: custom quote",
    bullets: [
      "No multi-year commitment required to get started",
      "Dedicated bare metal available for reserved deployments",
      "No egress fees",
    ],
    ctas: [register, allPricingLink],
  },
  intro:
    "NVIDIA Vera Rubin is NVIDIA's data center platform after Blackwell. It pairs the Rubin GPU, with 288 GB of HBM4 and up to 19.2 TB/s of memory bandwidth, with the 88-core NVIDIA Vera CPU and sixth-generation NVLink. It is built for frontier-scale training, mixture-of-experts models and agentic inference. On Akash, Vera Rubin capacity is offered on request as reserved clusters.",
  pricing: {
    title: "NVIDIA Rubin release date and availability",
    paragraphs: [
      "NVIDIA announced the Rubin platform on January 5, 2026, said it was in full production, and said Rubin-based products would be available from partners in the second half of 2026. Its Vera Rubin NVL72 page now lists the system as available.",
      "On Akash, Vera Rubin is offered on request. Share GPU count, term and workload in the interest form and the team will get in touch with availability and pricing.",
    ],
    table: {
      columns: ["Configuration", "Availability on Akash"],
      rows: [
        ["1x Rubin GPU (288 GB)", "Register interest"],
        ["8x Rubin GPU, HGX Rubin NVL8 (~2.3 TB)", "Register interest"],
        ["Vera Rubin NVL72 rack / reserved cluster", "Custom quote"],
      ],
    },
    note: `Need 288 GB per GPU now? [B300](/pricing/gpus/b300/) has the same memory per GPU, in HBM3e, and is available on request. For where next-generation GPU prices are heading, see [Blackwell & Vera Rubin GPU price increase 2027](${PRICE_POST}).`,
  },
  highlights: [
    {
      title: "NVIDIA Vera Rubin platform details",
      paragraphs: [
        "The Vera Rubin platform is a set of new NVIDIA chips designed to work as one system: the Rubin GPU, the Vera CPU, the NVLink 6 switch, ConnectX-9 SuperNICs, BlueField-4 DPUs and Spectrum-6 Ethernet switches. NVIDIA says the platform delivers up to 10x lower inference cost per token and trains mixture-of-experts models with 4x fewer GPUs than Blackwell.",
      ],
      table: {
        columns: ["Name", "What it is"],
        rows: [
          [
            "Rubin",
            "The GPU: 288 GB of HBM4, two compute dies, 336 billion transistors",
          ],
          ["Vera", "The CPU: 88 custom Olympus cores, up to 1.5 TB of LPDDR5X"],
          [
            "Vera Rubin superchip",
            "One Vera CPU and two Rubin GPUs, 576 GB of HBM4",
          ],
          [
            "Vera Rubin NVL72",
            "The rack: 72 Rubin GPUs and 36 Vera CPUs in one NVLink 6 domain",
          ],
          [
            "HGX Rubin NVL8",
            "Eight Rubin GPUs on one board, with Vera or x86 CPUs",
          ],
        ],
      },
    },
    {
      title: "NVIDIA Rubin GPU",
      paragraphs: [
        "The NVIDIA Rubin GPU is the accelerator at the center of the platform: 288 GB of HBM4 per GPU, 50 PFLOPS of NVFP4 inference and 35 PFLOPS of NVFP4 training. It is used to train and serve the largest AI models:",
      ],
      cards: [
        {
          title: "Frontier model training",
          text: "NVLink 6 and ConnectX-9 networking for large multi-node runs.",
        },
        {
          title: "Mixture-of-experts serving",
          text: "Up to 72 GPUs in one NVLink domain for the all-to-all traffic between experts.",
        },
        {
          title: "Reasoning and agentic AI",
          text: "High memory bandwidth for long reasoning chains and agents that call tools.",
        },
        {
          title: "Long-context inference",
          text: "288 GB per GPU holds large KV caches.",
        },
        {
          title: "4-bit inference",
          text: "Native NVFP4 cuts weight memory by about 4× compared with 16-bit.",
        },
        {
          title: "Scientific computing",
          text: "33 TFLOPS of FP64 per GPU alongside AI precision formats.",
        },
      ],
    },
    {
      title: "NVIDIA Rubin architecture",
      paragraphs: [],
      bullets: [
        {
          title: "HBM4 memory",
          text: "288 GB per GPU at up to 19.2 TB/s. HBM4 doubles the interface width of HBM3e, and NVIDIA says it nearly triples memory bandwidth compared with Blackwell.",
        },
        {
          title: "Two compute dies",
          text: "336 billion transistors and 224 streaming multiprocessors.",
        },
        {
          title: "Low-precision compute",
          text: "50 PFLOPS NVFP4 inference (sparse) and 35 PFLOPS NVFP4 training (dense) per GPU, with a new Transformer Engine.",
        },
        {
          title: "NVLink 6",
          text: "Sixth-generation NVLink doubles GPU-to-GPU bandwidth over Blackwell; NVLink-C2C doubles CPU-to-GPU bandwidth to 1.8 TB/s.",
        },
        {
          title: "FP64",
          text: "33 TFLOPS per GPU, up from about 1.25 TFLOPS on the B300.",
        },
      ],
    },
    {
      title: "NVIDIA Vera CPU",
      paragraphs: [
        "The NVIDIA Vera CPU replaces Grace in Vera Rubin systems. It has 88 custom NVIDIA Olympus cores with Spatial Multithreading (176 threads), up to 1.5 TB of LPDDR5X at up to 1.2 TB/s, and connects to Rubin GPUs over 1.8 TB/s NVLink-C2C. It supports confidential computing, which Grace did not.",
      ],
    },
    {
      title: "NVIDIA Vera Rubin NVL72 rack",
      paragraphs: [
        "Vera Rubin NVL72 is NVIDIA's rack-scale system. One rack links 72 Rubin GPUs and 36 Vera CPUs in a single NVLink 6 domain, so the rack works as one accelerator for the largest training and inference jobs. NVIDIA says it delivers up to 10x more tokens per megawatt than GB200 NVL72.",
      ],
      table: {
        columns: ["Spec", "Vera Rubin NVL72"],
        rows: [
          ["Configuration", "72 Rubin GPUs, 36 Vera CPUs"],
          ["NVFP4 inference", "3,600 PFLOPS (sparse)"],
          ["NVFP4 training", "2,520 PFLOPS (dense)"],
          ["FP8 / FP6 training", "1,260 PFLOPS (dense)"],
          ["GPU memory", "20.7 TB HBM4, 1,400 TB/s"],
          ["NVLink bandwidth", "216 TB/s"],
          ["CPU cores", "3,168 Olympus cores, 6,336 threads"],
          ["CPU memory", "Up to 54 TB LPDDR5X"],
          ["Networking bandwidth", "32.4 TB/s (bi-directional)"],
        ],
      },
      note: `For the previous generation, see [GB300 NVL72 specs vs B300](${GB300_POST}).`,
      subsections: [
        {
          title: "Vera Rubin superchip",
          paragraphs: [
            "The Vera Rubin superchip pairs one Vera CPU with two Rubin GPUs: 576 GB of HBM4 and 100 PFLOPS of NVFP4 inference.",
          ],
        },
        {
          title: "HGX Rubin NVL8",
          paragraphs: [
            "HGX Rubin NVL8 puts eight Rubin GPUs on one board with sixth-generation NVLink and 400 PFLOPS of NVFP4 compute. It runs with Vera CPUs (HGX Vera Rubin NVL8) or x86 CPUs.",
          ],
        },
      ],
    },
  ],
  fit: {
    title: "NVIDIA Rubin vs Blackwell",
    table: {
      columns: ["Spec", "Rubin", "B300 (Blackwell Ultra)", "B200 (Blackwell)"],
      rows: [
        ["GPU memory", "288 GB HBM4", "288 GB HBM3e", "180 GB HBM3e"],
        [
          "Memory bandwidth",
          "Up to 19.2 TB/s",
          "Up to 8 TB/s",
          "[See B200 page](/pricing/gpus/b200/)",
        ],
        [
          "NVFP4",
          "50 PFLOPS sparse · 35 PFLOPS dense (training)",
          "18 PFLOPS sparse · 13.5 PFLOPS dense",
          "[See B200 page](/pricing/gpus/b200/)",
        ],
        [
          "NVLink",
          "6th gen, 3 TB/s per GPU",
          "5th gen, 1.8 TB/s",
          "5th gen, 1.8 TB/s",
        ],
        [
          "FP64",
          "33 TFLOPS",
          "~1.25 TFLOPS",
          "[See B200 page](/pricing/gpus/b200/)",
        ],
        ["CPU pairing", "Vera", "Grace or x86", "Grace or x86"],
        ["On Akash", "Register interest", "Request access", "Request access"],
      ],
    },
    tableNote:
      "Each GPU's figures come from its own spec sheet ([Rubin](https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/), [B300](/pricing/gpus/b300/#specs), [B200](/pricing/gpus/b200/#specs)); compare sparse with sparse and dense with dense.",
    choices: [
      {
        title: "Choose Rubin",
        text: "for frontier-scale training, the largest mixture-of-experts and reasoning models, or the lowest cost per token in agentic inference.",
      },
      {
        title: "Choose the B300",
        text: "if you need 288 GB per GPU today. See the [B300 page](/pricing/gpus/b300/).",
      },
      {
        title: "Choose the B200 or H200",
        text: "if your models fit in 180 GB or 141 GB per GPU.",
      },
    ],
    paragraphs: [],
  },
  specs: {
    title: "NVIDIA Vera Rubin specs",
    columns: ["Spec", "Rubin GPU"],
    rows: [
      ["Architecture", "Rubin"],
      ["Form factor", "Vera Rubin superchip, HGX Rubin NVL8"],
      ["GPU memory", "288 GB HBM4"],
      ["Memory bandwidth", "Up to 19.2 TB/s"],
      [
        "NVFP4 Tensor",
        "50 PFLOPS sparse (inference) · 35 PFLOPS dense (training)",
      ],
      ["FP8 / FP6 Tensor", "17.5 PFLOPS dense"],
      ["FP16 / BF16 Tensor", "4 PFLOPS dense"],
      ["TF32 Tensor", "2 PFLOPS dense"],
      ["FP32", "130 TFLOPS"],
      ["FP64", "33 TFLOPS"],
      ["NVLink", "6th gen, 3 TB/s per GPU"],
      ["Networking", "0.45 TB/s per GPU (bi-directional)"],
      ["Confidential computing", "Supported, rack-scale on Vera Rubin NVL72"],
      ["HGX Rubin NVL8 total memory", "~2.3 TB"],
      ["Vera Rubin NVL72 total memory", "20.7 TB"],
    ],
    note: "Per Rubin GPU in a Vera Rubin NVL72 system, from [NVIDIA's specifications](https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/). Figures can differ by system.",
  },
  faqTitle: "NVIDIA Vera Rubin FAQ",
  faq: [
    {
      question: "What is NVIDIA Vera Rubin?",
      answer:
        "NVIDIA Vera Rubin is NVIDIA's data center platform after Blackwell. It pairs the Rubin GPU, with 288 GB of HBM4, with the Vera CPU and sixth-generation NVLink. Its flagship system, Vera Rubin NVL72, links 72 Rubin GPUs and 36 Vera CPUs in one rack.",
    },
    {
      question: "What are the NVIDIA Rubin GPU specs?",
      answer:
        "Each Rubin GPU has 288 GB of HBM4 at up to 19.2 TB/s, 50 PFLOPS of NVFP4 inference (sparse), 35 PFLOPS of NVFP4 training (dense) and 3 TB/s of sixth-generation NVLink, per NVIDIA's Vera Rubin NVL72 specifications.",
    },
    {
      question: "What is the NVIDIA Vera Rubin NVL72 rack?",
      answer:
        "It is NVIDIA's rack-scale Vera Rubin system: 72 Rubin GPUs and 36 Vera CPUs in one NVLink 6 domain, with 20.7 TB of HBM4 and 3,600 PFLOPS of NVFP4 inference.",
    },
    {
      question: "What is the NVIDIA Vera CPU?",
      answer:
        "Vera is NVIDIA's CPU for the Rubin platform: 88 custom Olympus cores, 176 threads, up to 1.5 TB of LPDDR5X and 1.8 TB/s NVLink-C2C to the Rubin GPUs.",
    },
    {
      question: "How much HBM4 does Vera Rubin have?",
      answer:
        "Each Rubin GPU has 288 GB of HBM4. A Vera Rubin superchip has 576 GB, an HGX Rubin NVL8 board about 2.3 TB, and a Vera Rubin NVL72 rack 20.7 TB.",
    },
    {
      question: "What is the difference between NVIDIA Rubin and Blackwell?",
      answer:
        "Rubin moves to HBM4 memory, doubles NVLink bandwidth with NVLink 6, and pairs with the new Vera CPU. NVIDIA says the Rubin platform cuts inference cost per token by up to 10x and trains mixture-of-experts models with 4x fewer GPUs than Blackwell.",
    },
    {
      question: "What is the NVIDIA Rubin release date?",
      answer: `NVIDIA said in January 2026 that Rubin was in full production, with Rubin-based products from partners in the second half of 2026. On Akash, [register interest](${ACCESS_HREF}) to reserve Vera Rubin capacity.`,
    },
  ],
  closing: {
    title: "NVIDIA Vera Rubin on Akash",
    description:
      "Register interest in NVIDIA Vera Rubin capacity on Akash, or start today on B300 with the same 288 GB per GPU.",
    ctas: [register, { label: "See B300", href: "/pricing/gpus/b300/" }],
  },
};
