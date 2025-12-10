---
categories: ["Providers"]
tags: ["Provider Playbook", "Automation", "Ansible", "Setup"]
weight: 1
title: "Provider Playbook - Automated Setup"
linkTitle: "Provider Playbook"
description: "Automated provider setup using Ansible playbooks"
---

**The fastest way to set up an Akash provider using automated Ansible playbooks.**

The Provider Playbook features an interactive setup script that guides you through the entire process, automating Kubernetes installation, provider deployment, and configuration.

 **Setup Time:** ~1 hour

---

## Why Provider Playbook?

### **Advantages
- **Interactive wizard** - Guides you through every step
- **Automated setup** - Handles all the heavy lifting
- **Multiple Kubernetes options** - Choose Kubespray (production) or K3s (lightweight)
- **Flexible configuration** - Select only what you need
- **Standardized deployment** - Consistent, repeatable process
- **Infrastructure as Code** - All configurations versioned

###  Considerations
- Requires command-line comfort
- SSH access to all nodes required
- Still requires Linux/networking understanding

---

## What It Automates

The interactive script handles:
- **Prerequisite installation (Python, Ansible, tools)
- **Kubernetes cluster deployment (Kubespray or K3s)
- **Wallet setup (create new or import existing)
- **GPU detection and NVIDIA driver installation
- **Storage configuration (Rook-Ceph for persistent storage)
- **Provider software installation and configuration
- **OS optimizations and cron jobs
- **Tailscale VPN setup (optional)
- **SSH key distribution across nodes

---

## Prerequisites

### System Requirements
- **Ubuntu 24.04 LTS Server** (officially supported)
- **Root or sudo access** on all nodes
- **SSH access** to all nodes

### Hardware Requirements
See [Hardware Requirements](/docs/providers/getting-started/hardware-requirements) for detailed specifications.

### Information You'll Need

Have this ready before starting:

**1. Provider Details:**
- Provider domain name (e.g., `provider.example.com`)
- Provider region (e.g., `us-west`)
- Organization name
- Contact email
- Organization website

**2. Node Information:**
- Number of nodes in your cluster
- IP addresses for each node
- SSH credentials (username/port) for each node

**3. Wallet (one of the following):**
- Create a new wallet during setup (recommended)
- Existing wallet key file to import
- Existing wallet mnemonic phrase
- Existing AKT address with base64 encoded key

**4. Storage Configuration (if using persistent storage):**
- Storage device names (e.g., `/dev/sdb`, `/dev/nvme0n1`)
- Number of OSDs per device
- Storage device type (HDD/SSD/NVMe)
- Which nodes will provide storage

**5. Tailscale (optional):**
- Tailscale auth key for secure remote access

---

## Installation

### Step 1: SSH into Your First Node

```bash
ssh user@node1-ip-address
```

The setup script should be run from your first node (node1) which will become part of your cluster.

### Step 2: Clone the Repository

```bash
git clone https://github.com/akash-network/provider-playbooks.git
cd provider-playbooks
```

### Step 3: Run the Setup Script

```bash
./scripts/setup_provider.sh
```

The script will:
1. Display a welcome banner
2. Guide you through playbook selection
3. Install all prerequisites automatically
4. Collect your configuration information
5. Set up SSH keys across all nodes
6. Run the selected playbooks

---

## Interactive Setup Process

### Playbook Selection

The script will ask you to select which components to install:

**Kubernetes Installation** (required for new clusters)
- **Kubespray**: Production-grade, full-featured Kubernetes (recommended)
- **K3s**: Lightweight, single binary, ideal for edge/IoT

**Optional Components:**
- **OS**: Basic OS configuration and optimizations
- **GPU**: NVIDIA driver and container toolkit installation
- **Provider**: Akash Provider service installation
- **Tailscale**: VPN setup for secure remote access
- **Rook-Ceph**: Storage operator installation and configuration

### Configuration Collection

The script will interactively collect:
- Provider domain and region
- Organization details
- Node IP addresses and SSH credentials
- Wallet setup (create or import)
- Storage configuration (if using Rook-Ceph)
- Tailscale auth key (if using Tailscale)

### Automated Execution

Once configured, the script will:
- Install Python 3.12, Ansible, and dependencies
- Clone Kubespray (if using Kubespray)
- Set up SSH keys on all nodes
- Create Ansible inventory files
- Run selected Ansible playbooks
- Optionally reboot nodes after completion

---

## What Happens During Installation

### Prerequisite Installation
The script automatically installs:
- Python 3.12 with venv
- Ansible and dependencies
- `yq`, `jq`, `unzip`, and other tools
- `provider-services` CLI
- Kubespray repository (if using Kubespray)

### SSH Key Setup
- Generates SSH key if none exists
- Distributes key to all nodes
- Supports password-based authentication for initial setup
- Falls back to manual setup instructions if needed

### Wallet Setup
Choose one of the following:
- **Create new wallet**: Script generates a new wallet and exports the key
- **Import key file**: Import existing `key.pem` file
- **Import seed phrase**: Recover wallet from mnemonic
- **Paste existing**: Provide AKT address and base64 encoded key

The script will:
- Export and base64 encode your key
- Save it to `host_vars/node1.yml`
- Securely prompt for your key password

### Kubernetes Installation

**If using Kubespray:**
- Clones Kubespray v2.28.0
- Creates Python virtual environment
- Installs Kubespray requirements
- Generates inventory files
- Configures containerd with NVIDIA runtime
- Deploys Kubernetes cluster
- Installs local-path-provisioner (if not using Rook-Ceph)

**If using K3s:**
- Installs lightweight K3s distribution
- Configures custom kubelet and data directories
- Sets up Calico CNI
- Includes local-path-provisioner by default

### Provider Installation
- Detects GPU hardware automatically
- Creates provider configuration
- Sets up pricing script
- Deploys provider service
- Configures provider attributes

### Storage Setup (Rook-Ceph)
If selected:
- Creates OSD configuration
- Deploys Rook operator
- Configures Ceph cluster
- Sets up storage classes (beta1/beta2/beta3)
- Handles ZFS ephemeral storage if needed

---

## Ephemeral Storage Configuration

The script will ask if you use separate ephemeral storage:

**Separate ephemeral storage:**
- Specify mount location (e.g., `/mnt/ephemeral`)
- Script configures kubelet and containerd paths
- Useful for RAID or dedicated fast storage

**Default ephemeral storage:**
- Uses standard system paths
- `/var/lib/kubelet` for kubelet
- `/var/lib/containerd` for containerd
- `/var/lib/rancher/k3s` for K3s

---

## Post-Installation

After the playbook completes:

1. **Node Reboot (Optional)**
   - Script offers to reboot all nodes
   - Nodes reboot in reverse order
   - Recommended for applying all system changes

2. **Verify Installation**
   ```bash
   # Check Kubernetes cluster
   kubectl get nodes
   
   # Check all pods are running
   kubectl get pods -A
   
   # Check provider pods specifically
   kubectl get pods -n akash-services
   
   # View provider logs
   kubectl logs -n akash-services -l app=akash-provider -f
   ```

3. **Next Steps**
   - Configure provider pricing
   - Set up monitoring
   - Test with a deployment
   - Review provider attributes

See [Operations](/docs/providers/operations) for ongoing management.

---

## Troubleshooting

### SSH Connection Issues
- **Error**: "Permission denied (publickey)"
  - **Solution**: The script will offer to use password authentication or provide manual setup instructions

- **Error**: "Connection refused"
  - **Solution**: Verify node IP address and SSH port are correct

### Kubernetes Installation Issues
- **Kubespray fails**: 
  - Check system requirements meet [Hardware Requirements](/docs/providers/getting-started/hardware-requirements)
  - Verify network connectivity between nodes
  - Review kubespray logs in the terminal output

- **K3s fails**:
  - Check systemd status: `systemctl status k3s`
  - Review logs: `journalctl -u k3s -f`

### Provider Service Issues
- **Wallet errors**:
  - Verify wallet has sufficient AKT (minimum 0.5 AKT, recommended 50 AKT)
  - Check key password was entered correctly
  - Ensure key is properly base64 encoded

- **Provider won't start**:
  - Check provider logs: `kubectl logs -n akash-services -l app=akash-provider`
  - Verify domain name is correctly configured
  - Ensure ports 8443 and 8444 are accessible

### Storage Issues
- **Rook-Ceph fails**:
  - Verify storage devices are clean and available: `lsblk`
  - Check device names match configuration
  - Ensure at least one storage node is selected
  - Review Ceph operator logs: `kubectl logs -n rook-ceph -l app=rook-ceph-operator`

For more help, see [Provider Verification](/docs/providers/operations/provider-verification).

---

## Advanced Configuration

### Manual Execution

If you need to run specific playbooks manually after initial setup:

```bash
# Activate virtual environment
source ~/kubespray/venv/bin/activate

# Run all playbooks
ansible-playbook -i ~/kubespray/inventory/akash/inventory.ini playbooks.yml

# Run specific playbooks using tags
ansible-playbook -i ~/kubespray/inventory/akash/inventory.ini playbooks.yml -t os,provider,gpu

# Run K3s specific playbooks
ansible-playbook -i ~/kubespray/inventory/akash/inventory.ini playbooks.yml -t k3s

# Run Rook-Ceph playbook
ansible-playbook -i ~/kubespray/inventory/akash/inventory.ini playbooks.yml -t rook-ceph
```

### Configuration Files

After setup, your configuration will be in:

- **Inventory**: `~/kubespray/inventory/akash/inventory.ini`
- **Host Variables**: `/root/provider-playbooks/host_vars/`
- **Kubespray Config**: `~/kubespray/inventory/akash/group_vars/`
- **Provider Config**: Generated during provider playbook execution

### Customizing Playbooks

You can customize the playbooks by editing:

- `~/provider-playbooks/roles/*/defaults/main.yml` - Default variables
- `/root/provider-playbooks/host_vars/node*.yml` - Per-node configuration
- `~/kubespray/inventory/akash/group_vars/` - Kubernetes cluster settings

---

## Next Steps

**After setup:**
- [Operations →](/docs/providers/operations) - Daily provider management
- [Provider Verification →](/docs/providers/operations/provider-verification) - Verify your setup

**Alternative methods:**
- [Kubespray →](/docs/providers/setup-and-installation/kubespray) - Full control with manual setup
- [Provider Console →](/docs/providers/setup-and-installation/provider-console) - Web-based setup

---

## Resources

- **GitHub Repository:** [akash-network/provider-playbooks](https://github.com/akash-network/provider-playbooks)
- **Report Issues:** [GitHub Issues](https://github.com/akash-network/provider-playbooks/issues)
- **Discord:** [discord.akash.network](https://discord.akash.network) - #providers channel
- **Documentation:** [docs.akash.network](https://docs.akash.network)

