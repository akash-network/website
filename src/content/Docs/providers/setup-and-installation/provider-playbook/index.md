---
categories: ["Providers"]
tags: ["Provider Playbook", "Automation", "Ansible", "Setup"]
weight: 1
title: "Provider Playbook - Automated Setup"
linkTitle: "Provider Playbook"
description: "Build or extend an Akash provider with the guided Ansible installer"
---

The Provider Playbook is the recommended guided installer for self-managed Akash providers. It can build Kubernetes with Kubespray or K3s, or add provider components to an existing cluster.

The terminal wizard validates access before making changes, detects host capabilities over SSH, recommends safe defaults, shows a redacted review, and installs only the components you select.

## Before you start

The installer supports Ubuntu 24.04 LTS on x86-64 hosts. Review the [provider hardware requirements](/docs/providers/getting-started/hardware-requirements) before provisioning nodes.

You also need:

- Root access on the machine where you run the installer.
- SSH console or out-of-band access to every node so you can authorize an SSH public key.
- Passwordless `sudo` for every non-root SSH user. Password-based SSH is not supported.
- A domain you control and the ability to create its DNS records.
- A funded Akash wallet, or funds to transfer to a wallet created by the wizard.
- For GPU installation, clean NVIDIA hosts without a preinstalled driver, CUDA driver package, Container Toolkit, or legacy NVIDIA device-plugin Helm release.
- For Rook-Ceph, at least two dedicated, empty physical disks across the cluster. Three storage hosts are recommended for production availability.

The reachable SSH address, user, and port for each node are the only host details you must know in advance. Location, CPU, memory, GPUs, network addresses, and eligible Ceph disks are detected after SSH access succeeds.

## Install

Connect to the first node, clone the repository, and run the wizard as root:

```bash
git clone https://github.com/akash-network/provider-playbooks.git
cd provider-playbooks
sudo ./scripts/setup_provider.sh
```

Successful prerequisite commands keep package-manager output hidden. If a command fails, the wizard prints its captured output with the failing step.

## Installer workflow

### 1. Choose the Kubernetes foundation

| Mode             | Use it when                                       | Behavior                                                                |
| ---------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| Kubespray        | You want a production-oriented Kubernetes cluster | Downloads the pinned Kubespray release only for this mode               |
| K3s              | You want a lean Kubernetes installation           | Uses the playbook's K3s role and never downloads Kubespray              |
| Existing cluster | Kubernetes is already installed                   | Leaves the distribution untouched and installs only selected components |

For clusters built by the wizard, every control-plane node is also a worker:

| Node count | Control planes              | Workers               |
| ---------: | --------------------------- | --------------------- |
|          1 | `node1`                     | `node1`               |
|          2 | `node1`                     | `node1`, `node2`      |
|  3 or more | `node1`, or `node1`–`node3` | Every configured node |

Kubespray prompts for kubelet and containerd data directories. K3s keeps kubelet data at `/var/lib/kubelet` and prompts only for the K3s data directory, which defaults to `/var/lib/rancher/k3s`.

When using an existing cluster, the first entered host must map to a control-plane node where `sudo kubectl` works. The wizard maps each SSH host to a unique Kubernetes node and does not ask Kubernetes to advertise different node addresses.

### 2. Select components

The wizard can install:

- Provider OS tuning and maintenance jobs.
- NVIDIA GPU Operator on detected GPU nodes.
- Rook-Ceph persistent storage.
- The Akash node, gateway, provider, hostname operator, and inventory operator.
- Optional Tailscale access.

OS tuning and the provider stack are selected by default. GPU, Rook-Ceph, and Tailscale are opt in.

### 3. Establish SSH access

Enter a reachable IPv4 address, SSH user, and SSH port for each node. The wizard then selects a compatible local key or creates a dedicated Ed25519 key and displays the public key and target users.

Add that public key to each target user's `~/.ssh/authorized_keys`, then continue. The wizard loops until every host accepts key-only SSH and every non-root user can run non-interactive `sudo`.

For a new Kubespray or K3s cluster, private and public addresses are detected over the verified SSH connection. When both are available, the wizard recommends private addresses for Kubernetes inter-node traffic. SSH continues to use the reachable address you entered.

### 4. Detect provider capabilities

Discovery runs over SSH after access validation:

- The first node's public egress address is used to suggest country, city code, UTC offset, and a valid Akash `location-region`. If lookup fails or you decline the result, a guided region picker builds the attributes.
- `lscpu` and firmware data provide CPU vendor, architecture, memory generation, and ECC. The wizard asks only for values the host does not expose or that you decline.
- PCI display devices are matched against a pinned Akash GPU database. The wizard derives the provider's GPU model, memory, interface, CUDA, and Fabric Manager settings. SXM GPUs enable Fabric Manager automatically.
- If Rook-Ceph is selected, every configured host is scanned read-only for eligible whole disks.

### 5. Configure the provider

The wizard collects the base domain without a `provider.` prefix, organization and contact attributes, network attributes, and TLS method. Production TLS can use Cloudflare or Google Cloud DNS-01; a self-signed certificate is available for bootstrap and testing.

Wallet creation, recovery, lookup, and export use only the unified [`akt` CLI](/docs/developers/deployment/akt). The installer uses a dedicated context named `provider`, creating it for mainnet when it is absent instead of launching `akt`'s general first-run network picker. If that context already exists, verify that it points to mainnet before continuing.

Wallet options are:

- Use an existing key from the provider context.
- Create a new key and display its recovery mnemonic.
- Recover a key from a mnemonic.
- Supply an address and pre-encoded provider secrets.

The keyring password is collected once and reused only for the current wallet operation. A separate provider export password is generated automatically and stored only in the protected inventory. If a requested key name already exists, the wizard offers to use it or enter another name.

### 6. Review and deploy

Before writing generated inventory or deploying roles, the wizard displays a redacted installation profile with hosts, topology, components, provider attributes, and storage choices. After confirmation, it generates the protected inventory and starts deployment.

The component order is:

1. Kubernetes foundation and cluster verification.
2. NVIDIA GPU Operator.
3. Rook-Ceph storage.
4. Akash provider stack.

OS preparation runs before the optional infrastructure components. Cluster-scoped Helm operations run once from the first control-plane host; they are not repeated on every node.

## Ceph disk discovery and recommendations

Storage discovery never wipes or modifies a disk. It excludes a device when it is:

- Read-only, removable, or smaller than 5 GiB.
- Partitioned, mapped, mounted, or used as swap.
- Marked with filesystem, RAID, LVM, or Ceph signatures.
- Held by another block device.
- Missing a stable `/dev/disk/by-id` identity.

The recommendation prioritizes three storage hosts, then two storage hosts, then two physical disks on one host. It prefers the fastest homogeneous media tier that preserves the best available topology. If mixed media are selected, the provider advertises the slowest selected tier:

| Media | Akash storage class |
| ----- | ------------------- |
| HDD   | `beta1`             |
| SSD   | `beta2`             |
| NVMe  | `beta3`             |

Rook creates exactly one OSD per selected physical disk, including NVMe. At least two disks are required cluster-wide.

| Selected topology                | Replica layout      | Failure domain |
| -------------------------------- | ------------------- | -------------- |
| Three or more storage hosts      | 3 copies, minimum 2 | Host           |
| Two storage hosts                | 2 copies, minimum 1 | Host           |
| One host with at least two disks | 2 copies, minimum 1 | OSD            |

A one-host layout can survive one disk failure but not loss of that host. Use at least three storage hosts for production host-level availability.

The wizard shows every exact stable disk path and requires explicit confirmation before deployment. Rook consumes the selected disks after confirmation. On rerun, an existing Ceph cluster reuses its recorded exact layout; the installer stops instead of guessing replacement disks when that protected record is unavailable.

After installation, the Rook role verifies the expected OSD count, per-node distribution, Ceph health, and StorageClass. When the provider is selected, the provider role also provisions and mounts a temporary claim before advertising persistent storage; that claim check works with Rook or another compatible storage class.

## Generated files and secrets

Normal installation creates these paths in the repository:

- `.venv/` — the pinned Ansible environment for this project.
- `.generated/inventory/` — generated inventory and encoded credentials.
- `.cache/kubespray/` — Kubespray checkout and environment, created only when Kubespray is selected.

All are ignored by Git. Files containing wallet, DNS, Tailscale, or rendered provider credentials are written with mode `0600`. Base64-encoded material is still secret; do not copy `.generated` into source control or share it.

## Generate configuration without installing

Use configuration-only mode to inspect the inventory before installing packages or changing hosts:

```bash
./scripts/setup_provider.sh --config-only
```

This mode still validates SSH and performs remote discovery. It does not create `.venv`, install the isolated Python runtime on hosts, download Kubespray, install `akt`, or deploy roles. Because wallet tooling is not installed, provide pre-encoded wallet material when prompted.

The resulting inventory is not immediately runnable on a fresh clone. Follow the repository's [manual bootstrap instructions](https://github.com/akash-network/provider-playbooks#manual-execution) before invoking Ansible yourself.

## Current component versions

The repository keeps compatibility pins in [`versions.yml`](https://github.com/akash-network/provider-playbooks/blob/main/versions.yml). The installer loads this matrix rather than selecting unbounded `latest` releases.

| Component           | Pinned version                       |
| ------------------- | ------------------------------------ |
| Kubespray           | `v2.31.0`                            |
| K3s                 | `v1.35.3+k3s1`                       |
| Calico              | `v3.31.5`                            |
| Helm                | `v4.2.4`                             |
| NVIDIA GPU Operator | `v26.7.0`                            |
| Rook-Ceph           | `1.19.10`                            |
| Ceph                | `quay.io/ceph/ceph:v19.2.6-20260818` |
| `akt`               | `0.1.1`                              |

Treat `versions.yml` as the source of truth if this table and the repository ever differ.

## Verify the installation

Some Helm releases intentionally return after Kubernetes accepts them, while their controllers and pods continue reconciling. In particular, the GPU Operator, Akash node, and provider are not treated as synchronous readiness gates.

A new provider wallet has no funds. Fund its address before expecting the provider pod to become ready and register or bid on-chain.

Check progress with:

```bash
sudo kubectl get nodes
sudo kubectl get pods --all-namespaces
sudo kubectl get pods --namespace akash-services
sudo kubectl logs --namespace akash-services akash-provider-0 --follow
```

Verify the provider's on-chain record with the installer context selected explicitly:

```bash
sudo --set-home akt --context provider query provider <provider-address>
```

See [Provider Verification](/docs/providers/operations/provider-verification) for the complete checklist.

## Rerun a component

The normal installer runs as root, so rerun Ansible as root from the repository root to retain access to its virtual environment, generated inventory, SSH key, and `akt` context:

```bash
sudo --set-home env ANSIBLE_CONFIG="$PWD/ansible.cfg" \
  .venv/bin/ansible-playbook \
  --inventory .generated/inventory/hosts.ini \
  playbooks.yml \
  --tags provider
```

Available tags include `preflight`, `tailscale`, `k3s`, `os`, `local-path`, `gpu`, `rook-ceph`, and `provider`.

## Troubleshooting

### SSH validation fails

- Add the displayed public key to the exact user's `~/.ssh/authorized_keys` on every node.
- Verify the entered IPv4 address and port are reachable.
- For non-root users, confirm `sudo -n true` succeeds without a password prompt.
- Password authentication is deliberately unsupported.

### No Ceph disks are eligible

Review the exclusion reason shown for each disk. Ceph devices must be dedicated, empty whole disks with stable `/dev/disk/by-id` paths. The wizard will not clean an in-use or previously formatted device for you.

### A newly installed component is not ready yet

Helm acceptance does not mean every controller, image pull, blockchain sync, GPU driver build, or provider pod is complete. Inspect the relevant namespace with `kubectl get pods` and `kubectl describe pod`, then follow the failing pod's logs.

For ongoing management, continue to [Provider Operations](/docs/providers/operations).

## Resources

- [Provider Playbooks repository](https://github.com/akash-network/provider-playbooks)
- [Provider Playbooks issues](https://github.com/akash-network/provider-playbooks/issues)
- [Manual Kubespray setup](/docs/providers/setup-and-installation/kubespray)
- [Akash Discord](https://discord.akash.network) — `#providers`
