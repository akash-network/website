import type { Gpus } from "./gpu-table";

export const DUMMY_GPU_DATA: Gpus = {
  availability: {
    total: 260,
    available: 169,
  },
  models: [
    {
      vendor: "nvidia",
      model: "a100",
      ram: "80Gi",
      interface: "SXM4",
      availability: {
        total: 16,
        available: 13,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 1.08,
        max: 1.08,
        avg: 1.08,
        weightedAverage: 1.08,
        med: 1.08,
      },
    },
    {
      vendor: "nvidia",
      model: "gt1030",
      ram: "2Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.12,
        max: 0.12,
        avg: 0.12,
        weightedAverage: 0.12,
        med: 0.12,
      },
    },
    {
      vendor: "nvidia",
      model: "gtx1070ti",
      ram: "8Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0,
        max: 0,
        avg: 0,
        weightedAverage: 0,
        med: 0,
      },
    },
    {
      vendor: "nvidia",
      model: "gtx1080",
      ram: "8Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.6,
        max: 0.6,
        avg: 0.6,
        weightedAverage: 0.6,
        med: 0.6,
      },
    },
    {
      vendor: "nvidia",
      model: "gtx1080ti",
      ram: "11Gi",
      interface: "PCIe",
      availability: {
        total: 2,
        available: 2,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.11,
        max: 0.11,
        avg: 0.11,
        weightedAverage: 0.11,
        med: 0.11,
      },
    },
    {
      vendor: "nvidia",
      model: "h100",
      ram: "80Gi",
      interface: "SXM5",
      availability: {
        total: 104,
        available: 63,
      },
      providerAvailability: {
        total: 3,
        available: 3,
      },
      price: {
        min: 1.25,
        max: 1.25,
        avg: 1.25,
        weightedAverage: 1.25,
        med: 1.25,
      },
    },
    {
      vendor: "nvidia",
      model: "h200",
      ram: "141Gi",
      interface: "SXM5",
      availability: {
        total: 72,
        available: 42,
      },
      providerAvailability: {
        total: 4,
        available: 4,
      },
      price: {
        min: 2.9,
        max: 3.06,
        avg: 3.02,
        weightedAverage: 3.02,
        med: 3.06,
      },
    },
    {
      vendor: "nvidia",
      model: "p40",
      ram: "24Gi",
      interface: "PCIe",
      availability: {
        total: 2,
        available: 2,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.07,
        max: 0.07,
        avg: 0.07,
        weightedAverage: 0.07,
        med: 0.07,
      },
    },
    {
      vendor: "nvidia",
      model: "pro6000se",
      ram: "96Gi",
      interface: "PCIe",
      availability: {
        total: 24,
        available: 24,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 1.63,
        max: 1.63,
        avg: 1.63,
        weightedAverage: 1.63,
        med: 1.63,
      },
    },
    {
      vendor: "nvidia",
      model: "pro6000we",
      ram: "96Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 0,
      },
      providerAvailability: {
        total: 1,
        available: 0,
      },
      price: {
        min: 1.51,
        max: 1.51,
        avg: 1.51,
        weightedAverage: 1.51,
        med: 1.51,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx3060",
      ram: "12Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.13,
        max: 0.13,
        avg: 0.13,
        weightedAverage: 0.13,
        med: 0.13,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx3090",
      ram: "24Gi",
      interface: "PCIe",
      availability: {
        total: 5,
        available: 4,
      },
      providerAvailability: {
        total: 2,
        available: 2,
      },
      price: {
        min: 0.14,
        max: 0.4,
        avg: 0.27,
        weightedAverage: 0.19,
        med: 0.27,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx3090ti",
      ram: "24Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.36,
        max: 0.36,
        avg: 0.36,
        weightedAverage: 0.36,
        med: 0.36,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx4000ada",
      ram: "20Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.36,
        max: 0.36,
        avg: 0.36,
        weightedAverage: 0.36,
        med: 0.36,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx4060ti",
      ram: "16Gi",
      interface: "PCIe",
      availability: {
        total: 1,
        available: 1,
      },
      providerAvailability: {
        total: 1,
        available: 1,
      },
      price: {
        min: 0.04,
        max: 0.04,
        avg: 0.04,
        weightedAverage: 0.04,
        med: 0.04,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx4090",
      ram: "24Gi",
      interface: "PCIe",
      availability: {
        total: 13,
        available: 3,
      },
      providerAvailability: {
        total: 5,
        available: 3,
      },
      price: {
        min: 0.17,
        max: 0.48,
        avg: 0.34,
        weightedAverage: 0.4,
        med: 0.37,
      },
    },
    {
      vendor: "nvidia",
      model: "rtx5090",
      ram: "32Gi",
      interface: "PCIe",
      availability: {
        total: 9,
        available: 4,
      },
      providerAvailability: {
        total: 2,
        available: 2,
      },
      price: {
        min: 0.6,
        max: 1.26,
        avg: 0.93,
        weightedAverage: 0.67,
        med: 0.93,
      },
    },
    {
      vendor: "nvidia",
      model: "t4",
      ram: "16Gi",
      interface: "PCIe",
      availability: {
        total: 5,
        available: 5,
      },
      providerAvailability: {
        total: 2,
        available: 2,
      },
      price: {
        min: 0.12,
        max: 0.12,
        avg: 0.12,
        weightedAverage: 0.12,
        med: 0.12,
      },
    },
  ],
};
