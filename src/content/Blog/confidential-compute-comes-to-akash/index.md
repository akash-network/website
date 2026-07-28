---
title: "Confidential Compute Comes to Akash"
description: "One line of SDL, and your workload runs where the machine's owner can't see it"
pubDate: "2026-07-28"

categories:
  - Product
tags:
  - Product
  - AI Infrastructure
  - Decentralized Cloud
contributors:
  - Greg Osuri

bannerImage: ./banner.png
---

Decentralized compute has always faced an underlying question that requires a direct, transparent answer rather than a reassuring platitude: what prevents a completely unknown provider from accessing your data when you rent their GPU?

Previously, the solution relied on provider reputation, security audits, and the assumption that operators lacked the time or incentive to inspect individual containers. While acceptable for minor tasks like hosting a game server, this baseline falls short when protecting sensitive medical records, proprietary algorithmic trading models, or core company intellectual property embedded in model weights.

Akash is introducing a definitive solution today with the launch of confidential compute across the network. Workloads can now run inside hardware-enforced trusted execution environments (TEEs). In this setup, memory encryption is managed directly by the CPU, rendering the data inaccessible to the host operating system, the hypervisor, and anyone with physical access to the infrastructure.

The most notable aspect of this feature is the minimal effort required to implement it.

## One Line

Here is the entire SDL change:

```yaml
services:
  my-workload:
    image: my-image:latest
    params:
      tee: cpu-gpu
```

Integrating confidential computing requires no SDKs, rebuilt container images, separate orchestrators, or new deployment types. You simply utilize `params.tee`, which configures `cpu` for CPU-isolated workloads or `cpu-gpu` when an enclave-protected GPU is necessary.

The marketplace handles matching seamlessly behind the scenes. The SDL builder translates the designated `tee` value into a placement requirement, ensuring only providers verifying confidential compute capability bid on your order. Rather than manually selecting a specific TEE vendor, the hardware infrastructure dictates whether you receive Intel TDX or AMD SEV-SNP, while provider software automatically provisions the appropriate runtime class.

Once a lease is finalized, your container runs isolated within a Kata Containers micro-VM, utilizing a dedicated kernel and encrypted memory instead of sharing host kernel resources. If your configuration requests a GPU, pass-through is managed via VFIO into NVIDIA Confidential Computing mode, safeguarding all data moving across the PCIe bus with AES-GCM-256 encryption.

Developed publicly under [AEP-83](https://akash.network/roadmap/aep-83) and inheriting foundations from [AEP-65](https://akash.network/roadmap/aep-65) and [AEP-29](https://akash.network/roadmap/aep-29), this architecture maintains a deliberately constrained SDL surface. By prioritizing the reuse of existing frameworks and minimizing new additions, confidential computing remains strictly opt-in, preserving current deployments entirely without disruption.

## A private LLM in one deployment

To demonstrate how this abstraction works in practice without overstating its simplicity, a complete, functional example called `ollama-tee` has been added to the [awesome-akash](https://github.com/akash-network/awesome-akash) repository.

It runs Ollama with Llama 3.2 3B on a GPU, inside a TEE:

```yaml
---
version: "2.0"

services:
  ollama:
    image: ollama/ollama:latest
    expose:
      - port: 11434
        as: 11434
        to:
          - global: true
    command:
      - bash
      - "-lc"
    args:
      - |
        /bin/ollama serve &
        until /bin/ollama ps >/dev/null 2>&1; do sleep 1; done
        /bin/ollama pull llama3.2:3b
        wait
    params:
      tee: cpu-gpu

profiles:
  compute:
    ollama:
      resources:
        cpu:
          units: 4
        memory:
          size: 16Gi
        storage:
          - size: 20Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
  placement:
    dcloud:
      pricing:
        ollama:
          denom: uact
          amount: 100000
      signedBy:
        anyOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63

deployment:
  ollama:
    dcloud:
      profile: ollama
      count: 1
```

Note the image: it's the stock `ollama/ollama:latest` from Docker Hub. Nothing in it knows or cares that it's running in an enclave.

Deploy it, wait for the model to pull, and query it the way you'd query any Ollama instance:

```shell
curl http://<your-endpoint>/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Which continent is the USA in?",
  "stream": false
}'
```

```json
{
  "model": "llama3.2:3b",
  "created_at": "2026-07-27T17:14:48.038986841Z",
  "response": "The United States of America (USA) is located on the continent of North America."
}
```

An ordinary API response, but with one crucial difference: the weights, prompt, and completion were all handled within memory that remains completely hidden from the machine's operator.

This encapsulates the entire value proposition of confidential computing, explaining why the SDL modifications are restricted to a single line. Most people will simply avoid privacy measures if they demand a complete application rewrite.

## What this protects, and what it doesn't

Let's be exact about our security guarantees.

 **Hardware Protection Capabilities:** The CPU's memory encryption engine encrypts guest memory, keeping it hidden from the host OS, the hypervisor, or root operators on the machine. It also encrypts CPU-to-GPU communication via the PCIe bus, turns off GPU performance counters to eliminate side channels, and runs every workload with a dedicated kernel inside its own micro-VM.

 **Limitations of TEE Configuration Alone:** Simply requesting a TEE does not confirm that you are operating within a genuine, uncompromised environment, as isolation is distinct from proof. Verification requires remote attestation, which gathers signed data from within the VM (such as an SEV-SNP report or TDX quote, alongside GPU data from NVIDIA's NVTrust) to validate it against baseline measurements and generate a token for relying parties. In setups combining CPU and GPU TEEs, this becomes composite attestation, where the CPU TEE serves as the primary trust anchor for the GPU.

 While the `ollama-tee` demonstration highlights isolation and placement, it does not perform attestation. Because attestation is mandatory for regulated applications, we want to be straightforward instead of overstating TEE capabilities. We are currently developing tooling to integrate attestation as a smooth, integrated component of the deployment lifecycle.

 We should also note two technical details regarding Hopper GPUs: CPU-to-GPU data transfers within a TEE are restricted to roughly 4 GB/s due to a software bounce buffer, which slows down model loading rather than active inference. This bottleneck is resolved in Blackwell through PCIe IDE and TDISP. Additionally, NVLink communication between Hopper GPUs lacks encryption, which is important when sharding models, but Blackwell introduces NVLink encryption to fix this.


## Why this matters now

Historically, the exact workloads that stood to benefit the most from decentralized infrastructure were completely blocked from adopting it. For example, a medical network reviewing an AI diagnostics system cannot expose confidential health records to an unaudited machine. Similarly, engineering groups managing high-value proprietary model weights cannot risk deploying them to an unidentified operator. Furthermore, any autonomous agent managing client PII must fully comply with the privacy mandates bound to that data.

The core obstacle for these operations has never been about infrastructure costs or hardware constraints, especially since Akash has continuously delivered compute resources at a fraction of traditional hyperscaler pricing. Instead, the real limitation stemmed from compliance; a policy requiring teams to simply "trust the operator" cannot serve as a verifiable security control within formal regulatory documentation.

By introducing hardware-enforced confidentiality, reliance on operational trust is substituted with a far more narrow and verifiable premise: that the physical silicon executes precisely as specified by the manufacturer. This shift fundamentally alters the security dynamic, finally making decentralized compute accessible for sensitive, enterprise-grade workloads that require absolute data privacy.

## Get started

* Deploy the example: [`ollama-tee`](https://github.com/akash-network/awesome-akash) in awesome-akash  
* Read the spec: [AEP-83](https://akash.network/roadmap/aep-83)  
* Deploy from the browser: [Akash Console](https://console.akash.network/)  
* Bring questions: [Akash Discord](https://discord.com/invite/akash)

Because confidential compute remains opt-in and provider capacity is in its early stages, you might encounter initial challenges—such as receiving no bids, facing SDL validation errors, or discovering attestation questions left unanswered by the documentation. If you run into these obstacles, please reach out to us on Discord. The specification is completely open, the core implementation uses the Apache 2.0 license, and user feedback at this critical phase directly influences the final design.
