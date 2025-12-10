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
    image: nvidia/cuda:12.0-runtime-ubuntu22.04
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
          denom: uakt
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
- `nvidia/cuda:12.0-runtime-ubuntu22.04` - Minimal CUDA runtime
- `nvidia/cuda:12.0-devel-ubuntu22.04` - CUDA development tools
- `nvidia/cuda:11.8-runtime-ubuntu22.04` - Older CUDA version
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
          denom: uakt
          amount: 100000
        webui:
          denom: uakt
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

## Related Topics

- [Persistent Storage](/docs/learn/core-concepts/persistent-storage) - Storing models
- [Providers & Leases](/docs/learn/core-concepts/providers-leases) - Choosing GPU providers

---

**Need GPU help?** Ask in [Discord](https://discord.akash.network) #deployments or #gpu-discussion channels!

