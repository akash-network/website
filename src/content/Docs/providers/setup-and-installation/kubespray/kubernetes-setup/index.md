---
categories: ["Providers"]
tags: ["Kubernetes", "Cluster Setup", "Infrastructure", "Kubespray"]
weight: 1
title: "Kubernetes Cluster Setup with Kubespray"
linkTitle: "Kubernetes Setup"
description: "Deploy a production-grade Kubernetes cluster using Kubespray 2.29"
---

**Deploy Kubernetes 1.33.5 using Kubespray for your Akash provider.**

This guide walks through deploying a production-ready Kubernetes cluster that will host your Akash provider. The cluster will run all provider leases as Kubernetes pods.

 **Time:** 30-45 minutes

---

## What You'll Deploy

Using Kubespray 2.29, you'll install:

- **Kubernetes 1.33.5** - Container orchestration
- **etcd 3.5.22** - Distributed key-value store
- **containerd 2.1.4** - Container runtime
- **Calico 3.30.3** - Container networking (CNI)

---

## Before You Begin

Ensure you have:
- **Reviewed [Hardware Requirements](/docs/providers/getting-started/hardware-requirements)
- **Ubuntu 24.04 LTS installed on all nodes
- **Root or sudo access to all nodes
- **Network connectivity between all nodes

---

## STEP 1 - Clone Kubespray

Clone Kubespray on a control machine (not on the cluster nodes themselves):

```bash
cd ~
git clone -b v2.29.0 --depth=1 https://github.com/kubernetes-sigs/kubespray.git
cd kubespray
```

> **Note:** We use Kubespray 2.29.0 which includes Kubernetes 1.33.5

---

## STEP 2 - Install Ansible

Install Python dependencies and create a virtual environment:

```bash
# Install system packages
apt-get update
apt-get install -y python3-pip python3-venv

# Create and activate virtual environment
cd ~/kubespray
python3 -m venv venv
source venv/bin/activate

# Install Ansible and dependencies
pip install -r requirements.txt
```

> **Important:** Remember to activate the virtual environment (`source ~/kubespray/venv/bin/activate`) before running any `ansible-playbook` commands.

---

## STEP 3 - Setup SSH Access

Configure passwordless SSH access to all cluster nodes:

### Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "$(hostname)" -f "$HOME/.ssh/id_ed25519" -N ""
```

### Display Your Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the entire output (starts with `ssh-ed25519`).

### Add Key to Each Node

Log into **each node** in your cluster and add the public key to the authorized_keys file:

```bash
# SSH into the node (use your existing access method)
ssh root@<node-ip>

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key (paste the key you copied above)
echo "ssh-ed25519 AAAA...your-public-key...== hostname" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Exit the node
exit
```

Repeat for **every node** in your cluster.

### Verify SSH Access

Test passwordless SSH to each node from your control machine:

```bash
ssh root@10.0.0.10 "hostname"
```

You should see the hostname returned without a password prompt.

---

## STEP 4 - Create Inventory

Create and configure the Ansible inventory:

```bash
cd ~/kubespray
cp -rfp inventory/sample inventory/akash
```

### Edit Inventory File

Open the inventory file:

```bash
nano ~/kubespray/inventory/akash/inventory.ini
```

Configure your nodes in the inventory. **Important:**
- Use **1 or 3** control plane nodes (odd numbers for consensus)
- List the same nodes under both `[kube_control_plane]` and `[etcd]`
- Add all worker nodes under `[kube_node]`

**Example for 3-node HA cluster:**

```ini
[kube_control_plane]
node1 ansible_host=10.0.0.10 ip=10.0.0.10 etcd_member_name=etcd1
node2 ansible_host=10.0.0.11 ip=10.0.0.11 etcd_member_name=etcd2
node3 ansible_host=10.0.0.12 ip=10.0.0.12 etcd_member_name=etcd3

[etcd:children]
kube_control_plane

[kube_node]
node4 ansible_host=10.0.0.13 ip=10.0.0.13
node5 ansible_host=10.0.0.14 ip=10.0.0.14
```

**Example for single-node cluster:**

```ini
[kube_control_plane]
node1 ansible_host=10.0.0.10 ip=10.0.0.10 etcd_member_name=etcd1

[etcd:children]
kube_control_plane

[kube_node]
node1 ansible_host=10.0.0.10 ip=10.0.0.10
```

---

## STEP 5 - Configure Container Runtime

Verify containerd is set as the container runtime:

```bash
nano ~/kubespray/inventory/akash/group_vars/k8s_cluster/k8s-cluster.yml
```

Ensure this line exists:

```yaml
container_manager: containerd
```

---

## STEP 6 - Configure DNS

Configure upstream DNS servers:

```bash
nano ~/kubespray/inventory/akash/group_vars/all/all.yml
```

Uncomment and configure the DNS servers:

```yaml
upstream_dns_servers:
  - 8.8.8.8
  - 1.1.1.1
```

> **Best Practice:** Use DNS servers from different providers (Google 8.8.8.8, Cloudflare 1.1.1.1)

---

## STEP 7 - Configure GPU Support (OPTIONAL)

> **Skip this step** if you don't have NVIDIA GPUs.

If you have NVIDIA GPUs, configure the container runtime **before** deploying the cluster:

```bash
mkdir -p ~/kubespray/inventory/akash/group_vars/all
cat > ~/kubespray/inventory/akash/group_vars/all/akash.yml << 'EOF'
# NVIDIA container runtime for GPU-enabled nodes
containerd_additional_runtimes:
  - name: nvidia
    type: "io.containerd.runc.v2"
    engine: ""
    root: ""
    options:
      BinaryName: '/usr/bin/nvidia-container-runtime'
EOF
```

This configures containerd to support GPU workloads. The actual NVIDIA drivers and device plugin will be installed later.

---

## STEP 8 - Deploy the Cluster

Now deploy Kubernetes using Ansible:

```bash
cd ~/kubespray
source venv/bin/activate
ansible-playbook -i inventory/akash/inventory.ini -b -v --private-key=~/.ssh/id_ed25519 cluster.yml
```

This will take **10-15 minutes**. The playbook is idempotent - if it fails, you can safely run it again.

---

## STEP 9 - Verify Cluster

SSH to one of your control plane nodes and verify the cluster:

### Check Nodes

```bash
kubectl get nodes
```

All nodes should show `STATUS: Ready`.

### Check System Pods

```bash
kubectl get pods -A
```

All pods should be in `Running` or `Completed` status.

### Verify DNS

```bash
kubectl -n kube-system get pods -l k8s-app=node-local-dns
```

All DNS pods should be `Running`.

### Check etcd Health

On a control plane node, verify etcd status:

```bash
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl check perf
```

**Expected output from `etcdctl check perf`:**
```
...
PASS: Throughput is 150 writes/s
PASS: Slowest request took 0.155139s
PASS: Stddev is 0.007739s
PASS
```

All endpoints should show `healthy` and performance checks should `PASS`.

---

## STEP 10 - Apply Kernel Parameters

On **all worker nodes**, apply these kernel parameters to prevent `too many open files` errors:

```bash
cat > /etc/sysctl.d/90-akash.conf << 'EOF'
fs.inotify.max_user_instances = 512
fs.inotify.max_user_watches = 1048576
vm.max_map_count = 1000000
EOF

sysctl -p /etc/sysctl.d/90-akash.conf
```

---

## STEP 11 - Install Zombie Process Killer (Recommended)

Some tenant containers don't properly manage subprocesses, creating zombie processes that accumulate over time. While zombies don't consume CPU/memory, they occupy process table slots. If the process table fills, no new processes can spawn, causing system failures.

**This step installs an automated script to prevent zombie process accumulation.**

### Create the Script

On **all worker nodes**, create `/usr/local/bin/kill_zombie_parents.sh`:

```bash
cat > /usr/local/bin/kill_zombie_parents.sh <<'EOF'
#!/bin/bash
# This script detects zombie processes descended from containerd-shim
# and attempts to reap them by signaling the parent process.

find_zombie_and_parents() {
  for pid in /proc/[0-9]*; do
    if [[ -r $pid/stat ]]; then
      read -r proc_pid comm state ppid < <(cut -d' ' -f1,2,3,4 "$pid/stat")
      if [[ $state == "Z" ]]; then
        echo "$proc_pid $ppid"
        return 0
      fi
    fi
  done
  return 1
}

get_parent_chain() {
  local pid=$1
  local chain=""
  while [[ $pid -ne 1 ]]; do
    if [[ ! -r /proc/$pid/stat ]]; then
      break
    fi
    read -r ppid cmd < <(awk '{print $4, $2}' /proc/$pid/stat)
    chain="$pid:$cmd $chain"
    pid=$ppid
  done
  echo "$chain"
}

is_process_zombie() {
  local pid=$1
  if [[ -r /proc/$pid/stat ]]; then
    read -r state < <(cut -d' ' -f3 /proc/$pid/stat)
    [[ $state == "Z" ]]
  else
    return 1
  fi
}

attempt_kill() {
  local pid=$1
  local signal=$2
  local wait_time=$3
  local signal_name=${4:-$signal}

  echo "Attempting to send $signal_name to parent process $pid"
  kill $signal $pid
  sleep $wait_time

  if is_process_zombie $zombie_pid; then
    echo "Zombie process $zombie_pid still exists after $signal_name"
    return 1
  else
    echo "Zombie process $zombie_pid no longer exists after $signal_name"
    return 0
  fi
}

if zombie_info=$(find_zombie_and_parents); then
  zombie_pid=$(echo "$zombie_info" | awk '{print $1}')
  parent_pid=$(echo "$zombie_info" | awk '{print $2}')

  echo "Found zombie process $zombie_pid with immediate parent $parent_pid"

  parent_chain=$(get_parent_chain "$parent_pid")
  echo "Parent chain: $parent_chain"

  if [[ $parent_chain == *"containerd-shim"* ]]; then
    echo "Top-level parent is containerd-shim"
    immediate_parent=$(echo "$parent_chain" | awk -F' ' '{print $1}' | cut -d':' -f1)
    if [[ $immediate_parent != $parent_pid ]]; then
      if attempt_kill $parent_pid -SIGCHLD 15 "SIGCHLD"; then
        echo "Zombie process cleaned up after SIGCHLD"
      elif attempt_kill $parent_pid -SIGTERM 15 "SIGTERM"; then
        echo "Zombie process cleaned up after SIGTERM"
      elif attempt_kill $parent_pid -SIGKILL 5 "SIGKILL"; then
        echo "Zombie process cleaned up after SIGKILL"
      else
        echo "Failed to clean up zombie process after all attempts"
      fi
    else
      echo "Immediate parent is containerd-shim. Not killing."
    fi
  else
    echo "Top-level parent is not containerd-shim. No action taken."
  fi
fi
EOF
```

### Make Executable

```bash
chmod +x /usr/local/bin/kill_zombie_parents.sh
```

### Create Cron Job

Create `/etc/cron.d/kill_zombie_parents`:

```bash
cat > /etc/cron.d/kill_zombie_parents << 'EOF'
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/kill_zombie_parents.sh | logger -t kill_zombie_parents
EOF
```

This runs every 5 minutes and logs output to syslog.

---

## STEP 12 - Verify Firewall

Ensure these ports are open between nodes:

**Control Plane:**
- `6443/tcp` - Kubernetes API server
- `2379-2380/tcp` - etcd client and peer

**All Nodes:**
- `10250/tcp` - Kubelet API

See [Kubernetes port reference](https://kubernetes.io/docs/reference/ports-and-protocols/) for a complete list.

---

## Advanced Configuration

**Custom Ephemeral Storage:** If you need to use a separate mount point for ephemeral storage (RAID array, dedicated NVMe, etc.), this must be configured **before** deploying the cluster. This is an advanced configuration most users won't need. See the advanced guides for details.

---

## Next Steps

Your Kubernetes cluster is now ready!
- Otherwise: **→ [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)**

**Additional optional features:**
- [TLS Certificates](/docs/providers/setup-and-installation/kubespray/tls-certificates) - Automatic SSL certificates
- [IP Leases](/docs/providers/setup-and-installation/kubespray/ip-leases) - Enable static IPs for deployments
