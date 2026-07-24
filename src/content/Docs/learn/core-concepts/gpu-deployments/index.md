---
categories: ["Learn", "Core Concepts"]
tags: ["GPU", "AI", "ML", "Graphics"]
weight: 6
title: "GPU Deployments"
linkTitle: "GPU Deployments"
description: "Deploy GPU workloads on Akash Network"
---

**Access affordable GPU compute for AI, ML, rendering, and more.**

Akash Network provides access to powerful NVIDIA GPUs at prices significantly below traditional cloud providers. This guide covers everything you need to know about deploying GPU workloads on Akash.

---

## Why Akash for GPU?

### Cost Advantage

**Typical savings:**
- **3-5x cheaper** than AWS/GCP/Azure for equivalent GPU
- **60-80% lower** than major GPU cloud providers
- No minimum commitments or complex pricing

**Example pricing (approximate):**
| GPU Model | Akash | AWS (on-demand) | Savings |
|-----------|-------|-----------------|---------|
| RTX 4090 | $0.50-1.50/hr | Not available | N/A |
| A100 40GB | $1.50-2.50/hr | $4.10/hr | ~50-65% |
| H100 | $2.50-4.00/hr | $8.03/hr | ~50-70% |

### GPU Availability

https://akash.network/pricing/gpus/

---

## GPU Use Cases

### AI & Machine Learning

**Training:**
- Fine-tuning LLMs (Llama, Mistral, GPT)
- Training custom models
- Transfer learning
- Model experimentation

**Inference:**
- LLM inference (Ollama, vLLM, Text Generation Inference)
- Image generation (Stable Diffusion, DALL-E)
- Real-time AI applications
- Batch processing

### Graphics & Rendering

**3D Rendering:**
- Blender rendering
- Cinema 4D
- 3ds Max
- V-Ray, OctaneRender

**Video Processing:**
- Transcoding
- Encoding/decoding
- Effects rendering
- Real-time streaming

### Scientific Computing

**Simulations:**
- Physics simulations
- Molecular dynamics
- Climate modeling
- Financial modeling

**Data Processing:**
- Large-scale data analysis
- Geospatial processing
- Signal processing

---

## SDL Configuration for GPU

### Basic GPU Request

```yaml
version: "2.0"

services:
  gpu-app:
    image: nvidia/cuda:12.0.0-runtime-ubuntu22.04
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    gpu-app:
      resources:
        cpu:
          units: 4.0
        memory:
          size: 16Gi
        storage:
          size: 100Gi
        gpu:
          units: 1  # Number of GPUs
          attributes:
            vendor:
              nvidia:  # GPU vendor

  placement:
    akash:
      pricing:
        gpu-app:
          denom: uact
          amount: 100000  # Price for compute + GPU

deployment:
  gpu-app:
    akash:
      profile: gpu-app
      count: 1
```

### Specific GPU Model

Request a specific GPU model:

```yaml
profiles:
  compute:
    gpu-app:
      resources:
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090  # Specific model
```

### Multiple GPU Models (Fallback)

Accept multiple models (provider picks):

```yaml
profiles:
  compute:
    gpu-app:
      resources:
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
                - model: rtx4080
                - model: a100
```

### GPU with RAM Requirement

Specify minimum GPU RAM:

```yaml
profiles:
  compute:
    gpu-app:
      resources:
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a100
                  ram: 40Gi  # Minimum GPU RAM
```

### Multiple GPUs

Request multiple GPUs:

```yaml
profiles:
  compute:
    gpu-app:
      resources:
        gpu:
          units: 2  # 2 GPUs
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
```

---

## Common GPU Models

### Consumer GPUs

#### RTX 4090 (24GB)
**Best for:**
- LLM inference (up to 70B parameters with quantization)
- Stable Diffusion
- Training small/medium models
- General AI workloads

**Typical price:** $0.50-1.50/hr on Akash

**SDL:**
```yaml
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: rtx4090
```

#### RTX 4080 (16GB)
**Best for:**
- Mid-size LLM inference
- Image generation
- Video processing
- Gaming/streaming

**Typical price:** $0.40-1.00/hr on Akash

#### RTX 3090 (24GB)
**Best for:**
- Budget LLM inference
- Older but capable
- Good price/performance

**Typical price:** $0.30-0.80/hr on Akash

### Professional/Data Center GPUs

#### A100 (40GB/80GB)
**Best for:**
- Professional ML training
- Large-scale inference
- Multi-GPU setups
- Enterprise workloads

**Typical price:** $1.50-2.50/hr (40GB), $2.50-3.50/hr (80GB) on Akash

**SDL:**
```yaml
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          ram: 40Gi  # or 80Gi
```

#### H100 (80GB)
**Best for:**
- Cutting-edge AI training
- Very large models
- Maximum performance
- Latest features (FP8, Transformer Engine)

**Typical price:** $2.50-4.00/hr on Akash

**SDL:**
```yaml
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: h100
```

#### A6000 (48GB)
**Best for:**
- Professional rendering
- Large model inference
- Graphics workloads
- CAD/3D design

**Typical price:** $1.00-2.00/hr on Akash

---

## Container Requirements

### NVIDIA Docker Runtime

Your container must support NVIDIA Docker:

**Base images:**
- `nvidia/cuda:12.0.0-runtime-ubuntu22.04` - Minimal CUDA runtime
- `nvidia/cuda:12.0.0-devel-ubuntu22.04` - CUDA development tools
- `nvidia/cuda:11.8.0-runtime-ubuntu22.04` - Older CUDA version
- `pytorch/pytorch:latest` - PyTorch with CUDA
- `tensorflow/tensorflow:latest-gpu` - TensorFlow with GPU

### Verifying GPU Access

Test GPU availability in your container:

```bash
nvidia-smi
```

**Expected output:**
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 525.85.12    Driver Version: 525.85.12    CUDA Version: 12.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA RTX 4090     Off  | 00000000:01:00.0 Off |                  Off |
|  0%   45C    P0    60W / 450W |      0MiB / 24564MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

---

## Popular GPU Applications

### LLM Inference

#### Ollama
Run LLMs locally with ease:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    env:
      - OLLAMA_HOST=0.0.0.0
    expose:
      - port: 11434
        as: 80
        to:
          - global: true

profiles:
  compute:
    ollama:
      resources:
        cpu:
          units: 4.0
        memory:
          size: 16Gi
        storage:
          size: 50Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
```

**After deployment, pull a model:**
```bash
curl http://your-deployment-url/api/pull -d '{"name": "llama2"}'
```

#### Text Generation Inference (TGI)
High-performance LLM serving:

```yaml
services:
  tgi:
    image: ghcr.io/huggingface/text-generation-inference:latest
    env:
      - MODEL_ID=mistralai/Mistral-7B-Instruct-v0.1
      - NUM_SHARD=1
      - MAX_INPUT_LENGTH=2048
      - MAX_TOTAL_TOKENS=4096
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    tgi:
      resources:
        cpu:
          units: 8.0
        memory:
          size: 32Gi
        storage:
          size: 100Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a100
                  ram: 40Gi
```

### Stable Diffusion

#### AUTOMATIC1111 WebUI
Popular SD interface:

```yaml
services:
  stable-diffusion:
    image: universonic/auto1111:latest
    env:
      - CLI_ARGS=--listen --port 7860 --enable-insecure-extension-access
    expose:
      - port: 7860
        as: 80
        to:
          - global: true

profiles:
  compute:
    stable-diffusion:
      resources:
        cpu:
          units: 4.0
        memory:
          size: 16Gi
        storage:
          size: 50Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
                - model: rtx3090
```

#### ComfyUI
Node-based SD workflow:

```yaml
services:
  comfyui:
    image: yanwk/comfyui-boot:latest
    expose:
      - port: 8188
        as: 80
        to:
          - global: true

profiles:
  compute:
    comfyui:
      resources:
        cpu:
          units: 4.0
        memory:
          size: 16Gi
        storage:
          - size: 100Gi
            attributes:
              persistent: true  # Save models
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
```

### Jupyter Notebook with GPU

Data science environment:

```yaml
services:
  jupyter:
    image: cschranz/gpu-jupyter:latest
    env:
      - JUPYTER_ENABLE_LAB=yes
    expose:
      - port: 8888
        as: 80
        to:
          - global: true

profiles:
  compute:
    jupyter:
      resources:
        cpu:
          units: 8.0
        memory:
          size: 32Gi
        storage:
          - size: 100Gi
            attributes:
              persistent: true
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a100
```

---

## Performance Optimization

### CPU/Memory Pairing

**Guidelines:**
- RTX 4090: 4-8 CPU cores, 16-32GB RAM
- A100: 8-16 CPU cores, 32-64GB RAM
- H100: 16-32 CPU cores, 64-128GB RAM

**Why it matters:**
- Data loading/preprocessing needs CPU
- Model loading needs RAM
- Bottlenecks hurt GPU utilization

### Storage Considerations

**Model storage:**
- Small models (< 7B params): 10-20GB
- Medium models (7-13B params): 20-50GB
- Large models (70B+ params): 100-200GB

**Use persistent storage** for models to avoid redownloading:

```yaml
storage:
  - size: 1Gi  # Ephemeral for app
  - size: 100Gi  # Persistent for models
    attributes:
      persistent: true
```

### Multi-GPU Workloads

For multi-GPU training/inference:

```yaml
gpu:
  units: 4  # 4 GPUs
  attributes:
    vendor:
      nvidia:
        - model: a100
```

**Application must support multi-GPU:**
- PyTorch DDP (DistributedDataParallel)
- TensorFlow MirroredStrategy
- DeepSpeed
- Megatron-LM

---

## Cost Optimization

### Choose Right GPU

**For inference:**
- Small models (< 7B): RTX 4080 or RTX 3090
- Medium models (7-33B): RTX 4090
- Large models (70B+): A100 40GB or H100

**For training:**
- Prototyping: RTX 4090
- Serious training: A100 80GB
- Large-scale: Multiple A100/H100

### Batch Processing

Run batch jobs instead of 24/7:
- Process data in chunks
- Close deployment when done
- Much cheaper than continuous running

### Spot-Like Behavior

Akash pricing is dynamic:
- Lower prices during off-peak
- Shop multiple providers
- Consider lower-tier providers for non-critical work

### Right-Size Resources

Don't over-provision:
- Test with minimal resources first
- Scale up only if needed
- Monitor actual GPU utilization

---

## Troubleshooting

### "No GPU devices found"

**Causes:**
1. Wrong base image (no CUDA support)
2. Provider doesn't have GPU
3. GPU allocation failed

**Solutions:**
- Use nvidia/cuda base image
- Verify provider has GPUs
- Check provider logs

### "CUDA out of memory"

**Cause:** Model/batch size too large for GPU RAM

**Solutions:**
- Reduce batch size
- Use smaller model
- Enable gradient checkpointing
- Use model quantization (4-bit/8-bit)
- Request GPU with more RAM

### Poor GPU Performance

**Possible causes:**
1. **CPU bottleneck** - Increase CPU cores
2. **I/O bottleneck** - Use faster storage
3. **Memory bottleneck** - Increase RAM
4. **Thermal throttling** - Provider issue

**Diagnosis:**
```bash
# Monitor GPU utilization
nvidia-smi dmon

# Should see high GPU utilization (>80%)
# If low, bottleneck is elsewhere
```

### GPU Not Detected

**Check NVIDIA drivers:**
```bash
nvidia-smi
```

If command fails:
- Contact provider
- May need different provider
- Verify GPU attribute in SDL

---

## Model Quantization

Reduce GPU memory requirements:

### 4-bit Quantization
- **70B model**: ~40GB VRAM (RTX 4090 capable!)
- Quality: Minimal degradation
- Speed: Slightly faster inference

**Tools:**
- GPTQ
- bitsandbytes
- GGUF (llama.cpp)

### 8-bit Quantization
- **70B model**: ~70GB VRAM (A100 80GB)
- Quality: Very good
- Speed: Comparable to FP16

---

## Best Practices

### Development Workflow

**Test locally first** (if you have GPU)

**Start with smallest viable GPU**

**Use persistent storage** for models

**Monitor GPU utilization**

**Close deployments when not in use**

### Production Deployments

**Choose reputable providers**

**Use specific GPU models** in SDL

**Implement health checks**

**Monitor costs**

**Have failover plan**

### Cost Management

**Use batch processing** when possible

**Share GPU** across multiple inference requests

**Cache models** with persistent storage

**Right-size resources**

**Monitor utilization**

---

## Example: Complete LLM Inference Setup

Full-featured LLM deployment with Ollama:

```yaml
version: "2.0"

services:
  ollama:
    image: ollama/ollama:latest
    env:
      - OLLAMA_HOST=0.0.0.0
    expose:
      - port: 11434
        as: 80
        to:
          - global: true
        http_options:
          max_body_size: 104857600  # 100MB for large requests
  
  webui:
    image: ghcr.io/open-webui/open-webui:main
    env:
      - OLLAMA_BASE_URL=http://ollama:11434
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true

profiles:
  compute:
    ollama:
      resources:
        cpu:
          units: 8.0
        memory:
          size: 32Gi
        storage:
          - size: 1Gi  # App
          - size: 100Gi  # Models
            attributes:
              persistent: true
              class: beta2  # Faster storage
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
    webui:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 2Gi
        storage:
          size: 1Gi

  placement:
    akash:
      pricing:
        ollama:
          denom: uact
          amount: 100000
        webui:
          denom: uact
          amount: 10000

deployment:
  ollama:
    akash:
      profile: ollama
      count: 1
  webui:
    akash:
      profile: webui
      count: 1
```

---

## GPU Interconnect (Multi-Node RDMA)

Large models that don't fit on a single node need **multiple GPU nodes working as one job**, exchanging gradients or activations over a high-speed fabric. Akash exposes this as **GPU interconnect** — RDMA over InfiniBand or RoCE — through one SDL attribute: `gpu.attributes.interconnect`.

When you opt in, the provider:

- Schedules the peer services/replicas on **distinct nodes** (so each gets its own GPUs and RDMA devices).
- Attaches one RDMA device handle per GPU. These handles are shared from the node's physical HCA(s) — the device plugin exposes a pool (up to 63 per node), so a service with `gpu.units: 8` requests 8 handles, not 8 physical cards.
- **Auto-injects the NCCL environment** (`NCCL_IB_DISABLE=0`, `NCCL_IB_HCA`, and `NCCL_IB_GID_INDEX=3` on RoCE). You do **not** set these in your SDL — the provider fills them from the node's discovered hardware.

You choose *whether* to use interconnect and *how peers are grouped*; the provider chooses the fabric (InfiniBand vs RoCE) unless you pin it.

### The two forms

```yaml
# Form A — implicit group. Every service/replica that writes `[]` under the
# same placement joins one shared group (named "auto") and is spread across
# distinct nodes. This is what most multi-node jobs want.
gpu:
  units: 8
  attributes:
    vendor:
      nvidia:
        - model: h100
    interconnect: []

# Form B — explicit named group. Use when you need several independent
# groups in one deployment (e.g. two separate training pairs). The name
# "auto" is reserved and cannot be used here.
gpu:
  units: 8
  attributes:
    vendor:
      nvidia:
        - model: h100
    interconnect:
      group: pair0
```

### Rules

- Any service using `interconnect` **requires** the placement to request `capabilities/gpu-interconnect: "true"`. Without it the deployment is rejected.
- `gpu.units` must be greater than `0` — interconnect needs a GPU to attach a device to. It works with **any** count `≥ 1`; you are **not** required to request a full 8-GPU node. The 8-GPU examples below are just the common full-node training shape — see [Example 5](#example-5--small-footprint-single-gpu-services-in-groups) for a 1-GPU-per-service layout.
- Within one placement, don't mix the implicit (`[]`) and explicit (`{ group: ... }`) forms — pick one.
- `auto` is reserved for the implicit form; you can't write `group: auto`.

### Example 1 — Minimal two-node job (implicit group)

Two services on two nodes, both opting into the shared `auto` group. The worker reaches the head over Akash service DNS (`head`).

```yaml
version: "2.0"

services:
  head:
    image: my-registry/trainer:latest
    env:
      - RANK=0
      - WORLD_SIZE=2
      - MASTER_ADDR=head
      - MASTER_PORT=29500
    expose:
      - port: 29500
        to:
          - service: worker
  worker:
    image: my-registry/trainer:latest
    env:
      - RANK=1
      - WORLD_SIZE=2
      - MASTER_ADDR=head
      - MASTER_PORT=29500

profiles:
  compute:
    trainer:
      resources:
        cpu:
          units: 32
        memory:
          size: 128Gi
        storage:
          - size: 100Gi
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
            interconnect: []          # implicit "auto" group
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"   # required for interconnect
      pricing:
        trainer:
          denom: uact
          amount: 1000000

deployment:
  head:
    dcloud:
      profile: trainer
      count: 1
  worker:
    dcloud:
      profile: trainer
      count: 1
```

### Example 2 — Replicas as a group (single service, `count > 1`)

A single service with `count: 2` and `interconnect: []`. Both replicas share the `auto` group, so the provider places them on distinct nodes. Use this when your launcher (e.g. `torchrun` with a rendezvous backend) handles rank assignment across identical replicas.

```yaml
version: "2.0"

services:
  train:
    image: my-registry/trainer:latest
    env:
      - WORLD_SIZE=2

profiles:
  compute:
    train:
      resources:
        cpu:
          units: 32
        memory:
          size: 128Gi
        storage:
          - size: 100Gi
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
            interconnect: []
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"
      pricing:
        train:
          denom: uact
          amount: 1000000

deployment:
  train:
    dcloud:
      profile: train
      count: 2          # two replicas → two distinct nodes, one "auto" group
```

### Example 3 — Explicit named group

Functionally the same two-node pair as Example 1, but with an explicit group label. Prefer this when a deployment contains **more than one** interconnect group.

```yaml
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
            interconnect:
              group: pair0
```

### Example 4 — Multiple independent groups in one deployment

Two separate GPU pairs (`pair0` and `pair1`) in the same placement. Peers within a group are spread across distinct nodes; the two groups are independent and may share nodes with each other.

```yaml
version: "2.0"

services:
  a-head:
    image: my-registry/trainer:latest
  a-worker:
    image: my-registry/trainer:latest
  b-head:
    image: my-registry/trainer:latest
  b-worker:
    image: my-registry/trainer:latest

profiles:
  compute:
    group-a:
      resources:
        cpu: { units: 32 }
        memory: { size: 128Gi }
        storage:
          - size: 100Gi
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
            interconnect:
              group: pair0
    group-b:
      resources:
        cpu: { units: 32 }
        memory: { size: 128Gi }
        storage:
          - size: 100Gi
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
            interconnect:
              group: pair1
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"
      pricing:
        group-a: { denom: uact, amount: 1000000 }
        group-b: { denom: uact, amount: 1000000 }

deployment:
  a-head:   { dcloud: { profile: group-a, count: 1 } }
  a-worker: { dcloud: { profile: group-a, count: 1 } }
  b-head:   { dcloud: { profile: group-b, count: 1 } }
  b-worker: { dcloud: { profile: group-b, count: 1 } }
```

### Example 5 — Small footprint: single-GPU services in groups

Interconnect scales **down** as well as up. Here four single-GPU services form two independent pairs — `pair0` (`a-0`, `a-1`) and `pair1` (`b-0`, `b-1`) — for **4 GPUs total, one per service**. Each pair is spread across distinct nodes; the two pairs are independent. No 8-GPU node required.

```yaml
version: "2.0"

services:
  a-0:
    image: my-registry/trainer:latest
  a-1:
    image: my-registry/trainer:latest
  b-0:
    image: my-registry/trainer:latest
  b-1:
    image: my-registry/trainer:latest

profiles:
  compute:
    single-gpu-a:
      resources:
        cpu: { units: 8 }
        memory: { size: 32Gi }
        storage:
          - size: 50Gi
        gpu:
          units: 1                 # one GPU per service instance
          attributes:
            vendor:
              nvidia:
                - model: a100
            interconnect:
              group: pair0
    single-gpu-b:
      resources:
        cpu: { units: 8 }
        memory: { size: 32Gi }
        storage:
          - size: 50Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a100
            interconnect:
              group: pair1
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"
      pricing:
        single-gpu-a: { denom: uact, amount: 200000 }
        single-gpu-b: { denom: uact, amount: 200000 }

deployment:
  a-0: { dcloud: { profile: single-gpu-a, count: 1 } }
  a-1: { dcloud: { profile: single-gpu-a, count: 1 } }
  b-0: { dcloud: { profile: single-gpu-b, count: 1 } }
  b-1: { dcloud: { profile: single-gpu-b, count: 1 } }
```

### Example 6 — Require a specific fabric (InfiniBand)

By default the provider serves whichever fabric it has. If your workload specifically needs InfiniBand (or RoCE), pin it with an extra placement attribute — only providers advertising that fabric will bid.

```yaml
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"
        capabilities/gpu-interconnect/fabric/infiniband: "true"   # or .../fabric/roce
      pricing:
        trainer:
          denom: uact
          amount: 1000000
```

### Example 7 — Full multi-node LLM training (2 × 8× H100)

A complete, deployable two-node job pinned to InfiniBand. Note there are **no `NCCL_IB_*` variables** — the provider injects them.

```yaml
version: "2.0"

services:
  head:
    image: my-registry/megatron:latest
    args:
      - torchrun
      - --nnodes=2
      - --node_rank=0
      - --master_addr=head
      - --master_port=29500
      - train.py
    env:
      - NCCL_DEBUG=INFO        # app-level logging only; IB env is provider-injected
    expose:
      - port: 29500
        to:
          - service: worker
  worker:
    image: my-registry/megatron:latest
    args:
      - torchrun
      - --nnodes=2
      - --node_rank=1
      - --master_addr=head
      - --master_port=29500
      - train.py

profiles:
  compute:
    node:
      resources:
        cpu:
          units: 64
        memory:
          size: 512Gi
        storage:
          - size: 500Gi
            attributes:
              persistent: true
              class: beta3
        gpu:
          units: 8
          attributes:
            vendor:
              nvidia:
                - model: h100
                  interface: sxm
            interconnect: []
  placement:
    dcloud:
      attributes:
        capabilities/gpu-interconnect: "true"
        capabilities/gpu-interconnect/fabric/infiniband: "true"
      pricing:
        node:
          denom: uact
          amount: 5000000

deployment:
  head:
    dcloud:
      profile: node
      count: 1
  worker:
    dcloud:
      profile: node
      count: 1
```

### What you still handle in your container

The provider wires the **fabric** (RDMA devices + NCCL IB env). Your image still handles the **application-level** distributed setup:

- Rank / world-size / master-address wiring (`RANK`, `WORLD_SIZE`, `MASTER_ADDR`, `MASTER_PORT`, or a `torchrun` rendezvous).
- Reaching peers by Akash **service name** (`head`, `worker`, …) via an `expose … to: - service: <name>` rule.
- Enough shared memory for your framework (set `/dev/shm` sizing in your container/launcher as usual).

> **Verifying a provider supports interconnect:** it advertises `capabilities/gpu-interconnect` (and a `capabilities/gpu-interconnect/fabric/...` value) in its on-chain attributes. Providers set this up following [GPU & InfiniBand Support](/docs/providers/setup-and-installation/kubespray/gpu-support#part-2--infiniband--rdma-optional).

---

## Related Topics

- [Persistent Storage](/docs/learn/core-concepts/persistent-storage) - Storing models
- [Providers & Leases](/docs/learn/core-concepts/providers-leases) - Choosing GPU providers
- [SDL syntax reference — GPU](/docs/developers/deployment/akash-sdl/syntax-reference/#gpu-section) - The `interconnect` attribute

---

**Need GPU help?** Ask in [Discord](https://discord.akash.network) #deployments or #gpu-discussion channels!

