// Priority order for GPU models (after B300/B200 which are always first)
// Change this list to update the order across all GPU tables and filters
export const GPU_PRIORITY_MODELS: string[] = [
  "h200",
  "h100",
  "a100",
  "pro6000se",
  "rtx5090",
  "rtx4090",
  "rtx3090",
];

export type ModelPriority = {
  model: string;
  ramPreference?: string[];
  interfacePreference?: string[];
};

// Model-specific configurations for the onTop sort function
export const GPU_MODEL_PRIORITIES: ModelPriority[] = [
  {
    model: "h200",
  },
  {
    model: "h100",
  },
  {
    model: "a100",
    ramPreference: ["80Gi"],
    interfacePreference: ["SXM4"],
  },
  {
    model: "pro6000se",
  },
  {
    model: "rtx5090",
  },
  {
    model: "rtx4090",
  },
  {
    model: "rtx3090",
  },
];
