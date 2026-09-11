---
title: "Top 10 Reasons AI Engineers Choose Bare-Metal GPUs in 2026"
pubDate: 2026-09-10
lastUpdated: 2026-09-10
author: "Sandeep Narahari, Contributor"
description: "AI engineers choose bare-metal GPUs because virtualization and GPU sharing break GPU-to-GPU peer-to-peer transfers, full NVLink and RDMA bandwidth, and predictable tail latency. See the 10 vendor-cited reasons, backed by NVIDIA, NIST, and peer-reviewed benchmarks."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "Top 10 Reasons AI Engineers Choose Bare-Metal GPUs"
metaDescription: "AI engineers choose bare-metal GPUs because virtualization breaks GPU peer-to-peer, NVLink bandwidth, and tail latency. 10 reasons, backed by NVIDIA and peer-reviewed benchmarks."
---

*By Sandeep Narahari, Contributor. Last updated: September 2026.*

AI engineers choose bare-metal GPUs because virtualization and GPU sharing break the three things large models depend on: GPU-to-GPU peer-to-peer transfers, full NVLink and RDMA bandwidth, and predictable tail latency. Single-GPU throughput is rarely the reason.

## TL;DR

- NVIDIA's own NCCL documentation states that PCIe Access Control Services (ACS) "needs to be disabled" for GPU Direct, and that "Virtual machines require ACS to function," so full-speed GPU peer-to-peer and VM isolation are mutually exclusive. ([NVIDIA NCCL User Guide](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/troubleshooting.html))
- Partitioning a GPU forecloses distributed training outright: "NCCL is currently not supported with MIG," and a single MIG slice is roughly one seventh of the SMs and one eighth of the memory. ([NVIDIA MIG User Guide](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/))
- Sharing a GPU between tenants has been measured causing "up to a 20x slowdown in tail latency," with time-slicing raising p99 latency by 252.3% in the same study. ([Tally, ASPLOS 2025](https://dl.acm.org/doi/10.1145/3676641.3716245))
- An H100 SXM gets 900 GB/s over NVLink versus 128 GB/s over PCIe Gen5, and Blackwell raises the NVLink figure to 1.8 TB/s per GPU. ([NVIDIA H100](https://www.nvidia.com/en-us/data-center/h100/), [NVIDIA GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/))
- Virtualization itself is not the villain. Well-configured GPU passthrough measured at 96% to 100% of native performance, and containers on bare metal measured within a few percent of the host. Topology, isolation, and I/O paths are where the losses live.

## The 10 reasons at a glance

1. **GPU peer-to-peer works.** Virtual machines require PCIe ACS, which NVIDIA says must be disabled for GPU Direct. Bare metal is the only place both can be true.
2. **Full NVLink bandwidth.** 900 GB/s per H100 SXM and 1.8 TB/s per Blackwell GPU, against 128 GB/s for PCIe Gen5.
3. **Distributed training runs at all.** NVIDIA states "NCCL is currently not supported with MIG," so partitioned GPUs cannot run PyTorch distributed, Megatron, or DeepSpeed.
4. **No noisy neighbors.** Sharing a GPU has been measured causing up to a 20x tail-latency slowdown, and 252.3% higher p99 latency under time-slicing.
5. **Real topology visibility.** NCCL plans its paths by reading `/sys`, and features such as PXN deliver more than 2x on all-to-all when the topology is visible.
6. **Multi-node RDMA.** GPUDirect RDMA requires the GPU and network adapter to share the same PCIe root complex, a hardware placement decision.
7. **Local NVMe data pipelines.** GPU idle time measured 26% on local storage against 98% on remote object storage.
8. **Fast checkpoint and recovery.** Job mean time to failure falls from 47.7 days at 8 GPUs to 7.9 hours at 1,024 GPUs, and 90% effective training time needs roughly 10-second checkpoints.
9. **Hardware telemetry and thermal headroom.** Bad-node detection cut large-job failures from 14% to 4%, and thermals alone moved Llama 3 throughput 1-2% across a day.
10. **Single-tenant isolation.** Dedicated hardware removes the shared-tenancy threat class NIST documents, and Hopper confidential computing adds a TEE at under 9% average overhead.

## What counts as bare-metal GPU access?

Bare-metal GPU access means your workload runs on the physical host with direct access to the GPUs, the PCIe topology, the network adapters, and the local disks, with no hypervisor translating between you and the hardware. The distinction that matters to AI engineers is not the absence of software abstraction, since containers are also an abstraction, but the absence of a translation layer in the path between GPUs, network adapters, and storage.

In practice, four provisioning models compete for the same job, and they are not interchangeable.

| Provisioning model | GPU peer-to-peer | NCCL multi-GPU | Isolation between tenants | Share of one GPU |
|---|---|---|---|---|
| Bare metal, container per GPU | Full, subject to host topology | Supported | Physical, one tenant per GPU | 100% |
| VM with GPU passthrough | Constrained: ACS required by the VM conflicts with GPU Direct | Supported inside the VM, topology permitting | Hypervisor-enforced | 100% |
| MIG partition | Same physical GPU only, per NVIDIA R570 | "Not supported" | Separate paths through the memory system | 1/7 SMs, 1/8 memory per slice |
| Time-sliced share | Not applicable | Unpredictable | "No memory or fault-isolation between replicas" | Variable |

**Takeaway:** the further right you move on that table, the more of the distributed-training toolchain stops working, which is why training teams and latency-sensitive inference teams keep landing on bare metal.

## 1. GPU peer-to-peer works: why does GPU Direct need bare metal?

GPU peer-to-peer transfers need bare metal because the PCIe features that make virtualization safe are the same features that break direct GPU-to-GPU traffic. NVIDIA states the conflict plainly in the [NCCL User Guide](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/troubleshooting.html): "IO virtualization (also known as VT-d or IOMMU) can interfere with GPU Direct by redirecting all PCI point-to-point traffic to the CPU root complex," that "If PCI switches have ACS enabled, it needs to be disabled," and that "Virtual machines require ACS to function, hence disabling ACS is not an option."

The [GPUDirect RDMA documentation](https://docs.nvidia.com/cuda/gpudirect-rdma/) is equally direct: the technology "relies upon all physical addresses being the same from the different PCI devices' point of view. This makes it incompatible with IOMMUs performing any form of translation other than 1:1, hence they must be disabled or configured for pass-through translation."

This is the single strongest technical argument for bare-metal GPUs, and it comes from the vendor, not from a cloud provider's marketing page.

## 2. Full NVLink bandwidth: how much do you lose without it?

Without full NVLink you lose roughly 7x the interconnect bandwidth on Hopper and roughly 14x on Blackwell. An [H100 SXM](https://www.nvidia.com/en-us/data-center/h100/) publishes 900 GB/s of NVLink bandwidth against 128 GB/s for PCIe Gen5, which NVIDIA describes as "7x the bandwidth of PCIe Gen 5." Blackwell's fifth-generation NVLink publishes "1.8 TB/s of GPU-to-GPU interconnect," which works out to about 14x PCIe Gen5 by simple arithmetic.

| Interconnect | Per-GPU bandwidth | Notes |
|---|---|---|
| PCIe Gen5 x16 | 128 GB/s | Baseline for PCIe-attached cards |
| NVLink, H100 PCIe with bridges | 600 GB/s total, "5x the bandwidth of PCIe Gen5" | Three bridges, 48 Rx/Tx lanes |
| NVLink 4, H100 and H200 SXM | 900 GB/s | 18 links |
| NVLink 5, Blackwell | 1.8 TB/s | GB200 NVL72 reaches 130 TB/s across 72 GPUs |

**Takeaway:** NVLink bandwidth is a property of the physical board and fabric, not something a scheduler can hand you later, which is why SXM systems are provisioned whole. See [GPU compute vs. bandwidth in 2026](/the-bid/gpu-compute-vs-bandwidth-2026/) for how this plays out across workload types. Sources: [NVIDIA H100](https://www.nvidia.com/en-us/data-center/h100/), [NVIDIA Hopper architecture deep dive](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/), H100 PCIe product brief, [GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/).

## 3. Distributed training runs at all: can you use NCCL on a partitioned GPU?

No. NVIDIA's [Multi-Instance GPU documentation](https://docs.nvidia.com/datacenter/tesla/mig-user-guide/) states that "NCCL is currently not supported with MIG," which removes the collective communication library that PyTorch distributed, Megatron, and DeepSpeed all depend on. MIG also restricts peer-to-peer: "With driver R570, Only P2P between MIG instances on the same GPU is supported. P2P between MIG instances on different GPUs, or between MIG instances to non-MIG mode GPU devices are not supported."

The size limits matter too. NVIDIA defines a memory slice as "roughly one eighth of the total GPU memory resources, including both capacity and bandwidth" and an SM slice as "roughly one seventh of the total number of SMs available in the GPU when configured in MIG mode." On an H100 80GB, the smallest profile is 1g.10gb and the largest partitioned profile still tops out at 4g.40gb.

To be fair to MIG, its isolation is genuinely strong: NVIDIA notes that each instance gets "separate and isolated paths through the entire memory system," delivering "predictable throughput and latency." MIG is a fractionalization tool for many small tenants, not a scale-up tool for one large job. Sources: MIG deployment considerations, MIG concepts, MIG profiles.

## 4. No noisy neighbors: how bad is interference on a shared GPU?

Shared GPUs have been measured causing up to a 20x tail-latency slowdown. The peer-reviewed [Tally paper at ASPLOS 2025](https://dl.acm.org/doi/10.1145/3676641.3716245) reports that "experiments on state-of-the-art GPU sharing mechanisms reveal that such interference can cause up to a 20x slowdown in tail latency," and quantifies the average p99 latency increase by mechanism: time-slicing 252.3%, MPS 345.0%, MPS-Priority 195.5%, and TGS 188.9%.

A separate 2026 study from Universidad Complutense de Madrid found MPS co-execution "systematically degrade[s] both applications' performance, reaching slowdowns of up to 2.5," while two-slice MIG stayed "below 2x in all cases."

NVIDIA itself does not oversell shared time-slicing in Kubernetes: "Unlike Multi-Instance GPU (MIG), there is no memory or fault-isolation between replicas," and time-slicing "trades the memory and fault-isolation that is provided by MIG for the ability to share a GPU by a larger number of users." For a production inference SLO measured at p99, that trade is usually unacceptable — see [what actually determines LLM inference speed](/the-bid/what-actually-determines-llm-inference-speed-2026/) for the other levers that move that number. Sources: Tally, ASPLOS 2025, MPS and MIG co-execution evaluation, NVIDIA GPU Operator time-slicing.

## 5. Real topology visibility: why does NCCL need to see the hardware?

NCCL needs the real hardware topology because it plans its communication paths by reading the machine, and a virtualized or badly mounted environment gives it the wrong map. NVIDIA states that "NCCL relies on /sys to discover the PCI topology of GPUs and network cards. When running inside a virtual machine or container, make sure /sys is properly mounted."

When NCCL can see the topology, the optimizations are worth real throughput. NVIDIA's PXN feature ("PCI x NVLink") routes a GPU's traffic over NVLink to a rail-matched network adapter so that data "only uses NVLink and PCI switches, guaranteeing maximum bandwidth," and NVIDIA's published figure shows more than a 2x improvement in all-to-all performance. Third-generation NVSwitch adds in-network SHARP reductions for "up to 2x throughput gain" on small-block collectives.

Bare-metal access is what makes those paths discoverable rather than something you fight with `NCCL_TOPO_FILE` overrides. Sources: NCCL GPU troubleshooting, Doubling all2all performance with NCCL 2.12, Hopper architecture deep dive.

## 6. Multi-node RDMA: does InfiniBand training require bare metal?

Multi-node training over InfiniBand requires direct hardware access because GPUDirect RDMA depends on physical PCIe placement. NVIDIA's [GPUDirect RDMA documentation](https://docs.nvidia.com/cuda/gpudirect-rdma/) states that "the two devices must share the same upstream PCI Express root complex," and that a path crossing sockets, "CPU/IOH <-> QPI/HT <-> CPU/IOH," may be "extremely performance-limited or even not work reliably."

The same document notes that "Pinning GPU device memory in BAR is an expensive operation, taking up to milliseconds," which is why the setup path matters as much as the steady-state bandwidth.

The practical consequence for AI engineers: a multi-node job needs the GPU and the host channel adapter on the right side of the topology, plus a fabric with an active subnet manager. That is a hardware provisioning decision, made before your container starts. [Akash's enterprise GPU infrastructure includes InfiniBand networking](/use-cases/enterprise/) for exactly this kind of multi-node, NCCL-based distributed training.

## 7. Local NVMe data pipelines: how much GPU idle time does remote storage cost?

Remote storage can leave a GPU idle up to 98% of the time. A study from IARAI Vienna profiling the PyTorch dataloader measured 26.08% GPU idle time on local storage against 98.04% when the same pipeline read from S3-style remote object storage, with a single batch taking "more than 30 s" from remote storage versus roughly 1.6 seconds locally.

Data loading is a common bottleneck even without remote storage: a 2026 study measured that "PyTorch's default data loaders can cause up to 76% GPU idleness," with average GPU utilization of 46.4%.

Direct hardware paths are the fix. NVIDIA reports GPUDirect Storage reading at 13.3 GB/s from local NVMe per PCIe tree against 12.0 GB/s for a CPU-mediated transfer, and cutting "end-to-end latency by 3.8x on 80 GB of data," because both GPUDirect technologies "avoid extra copies through a bounce buffer in the CPU's memory." Sources: Profiling and improving the PyTorch dataloader, MinatoLoader, GPUDirect Storage.

## 8. Fast checkpoint and recovery: what happens when hardware fails mid-run?

Long training runs fail often enough that recovery speed becomes a design constraint, and recovery speed is a hardware property. Meta's own measurements across 11 months, 4 million jobs, and over 150 million [A100](/the-bid/nvidia-a100-gpu-guide-2026-specs-benchmarks-pricing/) GPU hours show job mean time to failure collapsing from 47.7 days at 8 GPUs to 7.9 hours at 1,024 GPUs, with a projection of 1.8 hours at 16,384 GPUs.

The Llama 3 paper reports 466 job interruptions in a 54-day pre-training run on 16,384 H100 GPUs, 419 of them unexpected, with "approximately 78% of the unexpected interruptions" attributed to confirmed hardware issues and GPU problems accounting for 58.7% of unexpected issues. Earlier, the OPT-175B logbook recorded "at least 35 manual restarts and the cycling of over 100 hosts over the course of 2 months."

Meta's reliability paper puts a number on what that demands: to hold 90% effective training time at around 12,000 GPUs, "checkpoint write time overhead needs to be on the order of ~10 seconds." A ten-second checkpoint for a frontier-scale model is a local-NVMe-and-direct-fabric problem, not a network-storage problem. Sources: Revisiting reliability in large-scale ML research clusters, The Llama 3 Herd of Models, OPT-175B.

## 9. Hardware telemetry and thermal headroom: why do engineers want them?

Engineers want hardware-level telemetry because bad hardware and thermal behavior are measurable causes of lost throughput, and both are invisible from inside an abstracted instance. Meta's cluster team found that detecting "lemon" nodes, 1.2% of the footprint but 13% of daily jobs, cut large-job failure rates from 14% to 4%.

Thermals move throughput too. The Llama 3 team observed "1-2% throughput variation based on time-of-day" caused by "higher mid-day temperatures impacting GPU dynamic voltage and frequency scaling." NVIDIA's H100 PCIe product brief documents a hardware slowdown that halves clocks at the thermal limit: "At TLIMIT = -2C, there is a Hardware slowdown temperature (50% clock slowdown)."

Power envelopes are now large enough that the host matters: H100 SXM is configurable "Up to 700W," and HGX B200 up to 1,000 W per GPU. Sustained performance at those levels is a function of the physical chassis, airflow, and power delivery you are actually running on. Sources: Revisiting reliability, The Llama 3 Herd of Models, H100 PCIe product brief, NVIDIA HGX.

## 10. Single-tenant isolation: is dedicated hardware better for security and compliance?

Dedicated hardware removes a class of shared-tenancy risk, though standards bodies stop short of requiring it. NIST SP 800-125A Rev. 1 documents the threat model: "Rogue VMs manage to subvert the isolation function provided by the VMM/hypervisor to hardware resources such as memory pages and storage devices," and notes side-channel attacks "regarding some implicitly shared hardware resources such as CPU caches and Translation Lookaside Buffers (TLB)," adding that Spectre and Meltdown "also limit the assurance of trust on current hardware platforms."

To be accurate: NIST does not recommend dedicated hosts for sensitive workloads. It prescribes access controls and acknowledges that "VMs of different sensitivity levels are run on the same virtualized host."

Where extra assurance is needed on dedicated GPUs, NVIDIA Hopper adds confidential computing at MIG-instance granularity, and an independent benchmark study measured average overhead of "less than 9%," dropping to roughly no measurable penalty on compute-bound work such as Llama-3.1-70B inference, because "the main bottleneck lies in the CPU-GPU I/O, particularly when data is exchanged via PCIe." Sources: NIST SP 800-125A Rev. 1, Confidential computing on NVIDIA Hopper GPUs, Hopper architecture deep dive.

## Is virtualization always slower than bare metal for GPU work?

No, and the honest answer matters. A peer-reviewed IEEE CLOUD study of GPU passthrough found that "KVM achieves 98-100% of the base system's performance across two architectures, while Xen and VMWare achieve 96-99%." Containers are similarly cheap: an IBM Research study at IEEE ISPASS found that "Docker equals or exceeds KVM performance in every case we tested," and a GPU-specific study concluded that "running deep learning tools in docker containers has negligible overhead compared to running on host systems directly," with per-workload deltas inside roughly plus or minus 10%.

Two caveats on those numbers. The passthrough study used 2014-era Tesla hardware, and no equivalent peer-reviewed measurement exists for Hopper or Blackwell. The Docker deep-learning study used 2017-era consumer GPUs.

The correct conclusion is not "virtualization is slow." It is that the losses are concentrated in topology, peer-to-peer access, tenant interference, and I/O paths, which is exactly what the ten reasons above describe. Containers running directly on bare-metal hosts get most of what engineers want without a hypervisor in the peer-to-peer path. Sources: GPU passthrough performance, IEEE CLOUD 2014, An updated performance comparison of VMs and Linux containers, Performance evaluation of deep learning tools in Docker containers.

## When is bare metal the wrong choice?

Bare metal is the wrong choice when your job cannot fill a whole GPU. Because a container cannot take a fraction of a physical GPU, an inference endpoint that needs a few gigabytes of VRAM and handles bursty traffic pays for capacity it never uses.

Three cases where partitioning or sharing wins: many small inference tenants that fit inside a MIG profile and benefit from its isolated memory paths — see [managed API vs. self-hosting on GPU cloud](/the-bid/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/) for that trade-off in detail — interactive notebook and development work where idle time dominates, and batch jobs with loose latency targets where a 2x tail-latency penalty is not a problem.

Bare metal earns its cost when the job is large, long, distributed, latency-sensitive, or all four.

## Does Akash Network offer bare-metal GPUs?

Yes. [Akash offers dedicated physical GPU servers with no virtualization layer](/use-cases/enterprise/): full hardware control, near-native performance, and no shared tenancy. Bare metal is available under reserved arrangements, with reserved capacity for [B300](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/), B200, H200, H100, and A100 committed for your term and SLA-backed.

No virtualization layer and no shared tenancy remove the two structural blockers described above: the ACS and IOMMU conflict that breaks GPU peer-to-peer inside virtual machines, and the tenant interference measured driving up to a 20x tail-latency slowdown on shared GPUs.

Bare-metal and reserved pricing is quoted per engagement, so there is no hourly rate to publish here — for a sense of what on-demand costs, see current [H100](/the-bid/h100-rental-price-2026-cost-per-hour/) and [B300](/the-bid/b300-rental-price-2026-cost-per-hour/) rental rates.

## FAQ

**Is a bare-metal GPU faster than a virtualized GPU?** Not necessarily for a single GPU. A peer-reviewed study measured GPU passthrough under KVM at 98% to 100% of native performance. Bare metal wins on multi-GPU and multi-node work, where GPU peer-to-peer, NVLink bandwidth, and RDMA paths depend on direct hardware and topology access.

**Can you run NCCL or PyTorch distributed training on a MIG partition?** No. NVIDIA's MIG documentation states that "NCCL is currently not supported with MIG," which rules out PyTorch distributed, Megatron, and DeepSpeed on MIG slices. MIG also limits peer-to-peer to instances on the same physical GPU under driver R570, so cross-GPU collectives are unavailable.

**Why do virtual machines interfere with GPU Direct?** Virtual machines require PCIe Access Control Services to enforce isolation, while NVIDIA documentation states ACS "needs to be disabled" for GPU Direct and that IO virtualization "can interfere with GPU Direct by redirecting all PCI point-to-point traffic to the CPU root complex." The two requirements conflict directly.

**How much slower is a shared GPU for inference latency?** Measured tail-latency penalties on shared GPUs are large. The Tally study at ASPLOS 2025 reported up to a 20x tail-latency slowdown, with average p99 latency increases of 252.3% under time-slicing and 345.0% under MPS. NVIDIA also notes time-slicing provides no memory or fault isolation between replicas.

**Does bare metal help when GPUs fail during long training runs?** Yes, mainly through faster recovery. Job mean time to failure was measured falling from 47.7 days at 8 GPUs to 7.9 hours at 1,024 GPUs, and holding 90% effective training time at roughly 12,000 GPUs requires checkpoint writes on the order of 10 seconds, which depends on local NVMe and direct fabric access.

**Does Akash Network offer bare-metal GPU servers?** Yes. [Akash offers dedicated physical GPU servers](/use-cases/enterprise/) with no virtualization layer, full hardware control, near-native performance, and no shared tenancy. Bare metal is available under reserved arrangements, with reserved capacity for B300, B200, H200, H100, and A100 committed for your term and SLA-backed.

**When should you use a partitioned GPU instead of bare metal?** Use a partitioned GPU when the workload cannot fill a whole GPU: small inference endpoints, notebooks, and development work. NVIDIA MIG gives each instance isolated paths through the memory system, which delivers predictable latency for small tenants, at a ceiling of roughly one seventh of the SMs per slice.
