// Starting points for the usage calculator: the Akash Console templates tagged "popular"
// (GET https://console-api.akash.network/v1/templates-list), with resources copied from each
// template's SDL (GET /v1/templates/{id}). Sizes are in GiB as written in the SDLs; RAM-class
// scratch space (shm) is not included because providers don't bill it as storage.

export interface UsagePreset {
  /** Akash Console template id. */
  id: string;
  name: string;
  /** One line on what it is, condensed from the template's own summary. */
  description: string;
  cpu: number;
  memoryGi: number;
  ephemeralGi: number;
  persistentGi: number;
  /** `model: null` means the SDL accepts any NVIDIA GPU. */
  gpu: { units: number; model: string | null } | null;
}

// Ordered from the simplest workload to the most demanding.
export const USAGE_PRESETS: UsagePreset[] = [
  {
    id: "akash-network-awesome-akash-ssh-ubuntu",
    name: "Ubuntu SSH",
    description: "Plain Linux server with SSH access",
    cpu: 0.1,
    memoryGi: 0.5,
    ephemeralGi: 1,
    persistentGi: 0,
    gpu: null,
  },
  {
    id: "akash-network-awesome-akash-openclaw",
    name: "OpenClaw",
    description: "Personal AI assistant",
    cpu: 3,
    memoryGi: 6,
    ephemeralGi: 5,
    persistentGi: 10,
    gpu: null,
  },
  {
    id: "akash-network-awesome-akash-comfyui",
    name: "ComfyUI",
    description: "Stable Diffusion image generation",
    cpu: 6,
    memoryGi: 35,
    ephemeralGi: 50,
    persistentGi: 0,
    gpu: { units: 1, model: null },
  },
  {
    id: "akash-network-awesome-akash-DeepSeek-V3.1",
    name: "DeepSeek-V3.1",
    description: "671B-parameter language model",
    cpu: 64,
    memoryGi: 256,
    ephemeralGi: 100,
    persistentGi: 900,
    gpu: { units: 8, model: "h200" },
  },
];
