---
categories: ["Providers"]
tags: ["Akash Provider", "Kubernetes", "Cluster Setup"]
weight: 1
title: "Kubernetes Cluster Setup"
linkTitle: "Kubernetes Cluster Setup"
description: "Guide for setting up a Kubernetes cluster for Akash providers using Kubespray"
---

Akash leases are deployed as Kubernetes pods on provider clusters. This guide details the build of the provider's Kubernetes control plane and worker nodes.

The setup of a Kubernetes cluster is the responsibility of the provider. This guide provides best practices and recommendations for setting up a Kubernetes cluster. This document is not a comprehensive guide and assumes pre-existing Kubernetes knowledge.


The Kubernetes Cluster created is then ready for the Akash Provider build detailed [here](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/).


## Prerequisites

The Kubernetes instructions in this guide are intended for audiences that have the following skills sets and knowledge.

- **Server Administration Skills** - necessary for setting up servers/network making up the Kubernetes cluster
- **Kubernetes Experience** - a base level of Kubernetes administration is highly recommended

> Please consider using the [Akash Provider Console](https://provider-console.akash.network/) application to build an Akash Provider for small and medium sized environments which require little customization.

## Guide Sections

- [Clone the Kubespray Project](#clone-the-kubespray-project)
- [Install Ansible](#step-2---install-ansible)
- [Ansible Access to Kubernetes Cluster](#step-3---ansible-access-to-kubernetes-cluster)
- [Ansible Inventory](#step-4---ansible-inventory)
- [Additional Verifications](#step-5---additional-verificationsconfig)
- [DNS Configuration](#step-6---dns-configuration)
- [Provider Ephemeral Storage Config](#step-7---provider-ephemeral-storage-config-optional)
- [Create Kubernetes Cluster](#step-8---create-kubernetes-cluster)
- [Confirm Kubernetes Cluster](#step-9---confirm-kubernetes-cluster)
- [Custom Kernel Parameters](#step-9---custom-kernel-parameters)
- [Review Firewall Policies](#step-10---review-firewall-policies)

## STEP 1 - Clone the Kubespray Project

### Cluster Recommendations

We recommend using the Kubespray project to deploy a cluster. Kubespray uses Ansible to make the deployment of a Kubernetes cluster easy.

The recommended minimum number of hosts is four for a production Provider Kubernetes cluster. This is meant to allow:

- Three hosts serving as a redundant control plane (aka master)/etcd instances
- One host to serve as Kubernetes worker node to host provider leases.

#### Additional Cluster Sizing Considerations

- While a production Kubernetes cluster would typically require three redundant control plane nodes, in circumstances in which the control plane node is easily recoverable the use of a single control instance for Akash providers should suffice.

- The number of control plane nodes in the cluster should always be an odd number to allow the cluster to reach consensus.

- We recommend running a single worker node per physical server as CPU is typically the largest resource bottleneck. The use of a single worker node allows larger workloads to be deployed on your provider.

- If you intended to build a provider with persistent storage please refer to host storage requirements detailed [here](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/).

### Kubernetes Cluster Software/Hardware Requirements and Recommendations

#### Software Recommendation

Akash Providers have been tested on **Ubuntu 22.04** with the default Linux kernel. Your experience may vary should install be attempted using a different Linux distro/kernel.

#### Kubernetes Control Plane Node Requirements

- Minimum Specs
  - 2 CPU
  - 4 GB RAM
  - 30 GB disk
- Recommended Specs
  - 4 CPU
  - 8 GB RAM
  - 40 GB disk

#### Kubernetes Worker Node Requirements

- Minimum Specs
  - 4 CPU
  - 8 GB RAM
  - 100 GB disk
- Recommendations
  - The more resources the better depending on your goal of maximum number of concurrent deployments.
  - Especially important to note that worker node needs to have as much CPU as possible, because if it's got, say 8 CPU and, 100 GB RAM, and 2 TB disk -> the cpu would likely be a bottleneck. Since people tend to deploy at least 1 CPU per deployment, the server could only host 8 deployments maximum and likely about 6 deployments as other \~2 CPU will be reserved by the Kubernetes system components.

### **etcd Hardware Recommendations**

- Use this [guide](https://etcd.io/docs/v3.5/op-guide/hardware) to ensure Kubernetes control plane nodes meet the recommendations for hosting a `etcd` database.

### **Kubespray Clone**

Install Kubespray on a machine that has connectivity to the hosts that will serve as the Kubernetes cluster. Kubespray should not be installed on the Kubernetes hosts themselves but rather on a machine that has connectivity to the Kubernetes hosts.

#### Kubespray Host Recommendation

We recommend installing Kubespray on Ubuntu 22.04. Versions prior it Ubuntu 20.X may experience issues with recent Ansible versions specified in later steps.

#### Clone the Kubespray Project

Obtain Kubespray and navigate into the created local directory:

> NOTE: It is recommended to try a newer version of Kubespray than `v2.26.0` -- https://github.com/kubernetes-sigs/kubespray/releases  

```
cd ~

git clone -b v2.26.0 --depth=1 https://github.com/kubernetes-sigs/kubespray.git

cd kubespray
```

### Cluster Updates

To update the Kubernetes cluster in the future, review the[ latest Kubespray documentation](https://github.com/kubernetes-sigs/kubespray/blob/master/docs/upgrades.md) to take advantage of recent bug fixes and enhancements.

## STEP 2 - Install Ansible

> _**NOTE**_ - the commands in this section and in all remaining sections of this guide assume that the `root` user is used. For ease we suggest using the `root` user for the Kubernetes and Akash Provider install. If a non-root user is used instead, minor command adjustments may be necessary such as using `sudo` command prefixes and updating the home directory in command syntaxes.

When you launch Kubespray it will use an Ansible playbook to deploy a Kubernetes cluster. In this step we will install Ansible.

Depending on your operating system it may be necessary to install OS patches, pip3, and virtualenv. Example steps for a Ubuntu OS are detailed below.

```
apt-get update ; apt-get install -y python3-pip virtualenv
```

Within the kubespray directory use the following commands for the purpose of:

- Opening a Python virtual environment for the Ansible install
- Installing Ansible and other necessary packages specified in the requirements.txt file
- Please remember to `cd kubespray` AND `source venv/bin/activate` - as detailed in the code block below - each time you want to use the `ansible-playbook` commands in upcoming sections. &#x20;

```
cd ~/kubespray

virtualenv --python=python3 venv

source venv/bin/activate

pip3 install -r requirements.txt
```

## STEP 3 - Ansible Access to Kubernetes Cluster

Ansible will configure the Kubernetes hosts via SSH. The user Ansible connects with must be root or have the capability of escalating privileges to root.

Commands in this step provide an example of SSH configuration and access to Kubernetes hosts and testing those connections.

### Section Overview

The command sets provided in this section may be copied and pasted into your terminal without edit unless otherwise noted.

### **Create SSH Keys on Ansible Host**

- Accept the defaults to create a public-private key pair

```
ssh-keygen -t rsa -C $(hostname) -f "$HOME/.ssh/id_rsa" -P "" ; cat ~/.ssh/id_rsa.pub
```

#### **Confirm SSH Keys**

- The keys will be stored in the user's home directory
- Use these commands to verify keys

```
cd ~/.ssh ; ls
```

##### **Example files created**

```
authorized_keys  id_rsa  id_rsa.pub
```

### **Copy Public Key to the Kubernetes Hosts**

#### **Template**

- Replace the username and IP address variables in the template with your own settings. Refer to the Example for further clarification.

```
ssh-copy-id -i ~/.ssh/id_rsa.pub <username>@<ip-address>
```

#### **Example**

- Conduct this step for every Kubernetes control plane and worker node in the cluster

```
ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.88.94.5
```

### **Confirm SSH to the Kubernetes Hosts**

- Ansible should be able to access all Kubernetes hosts with no password

#### **Template**

- Replace the username and IP address variables in the template with your own settings. Refer to the Example for further clarification.

```
ssh -i ~/.ssh/id_rsa <username>@<ip-address>
```

#### **Example**

- Conduct this access test for every Kubernetes control plane and worker node in the cluster

```
ssh -i ~/.ssh/id_rsa root@10.88.94.5
```

## STEP 4 - Ansible Inventory

Ansible will use an inventory file to determine the hosts Kubernetes should be installed on.

### **Inventory File**

- Use the following commands on the Ansible host and in the "kubespray" directory
- Replace the IP addresses in the declare command with the addresses of your Kubernetes hosts (master/control-plane and worker nodes)
- Running these commands will create a hosts.yaml file within the kubespray/inventory/akash directory
- NOTE - ensure that you are still within the Python virtual environment when running these commands. Your cursor should have a "(venv)" prefix. If needed - re-enter the virtual environment by issuing:
  - `source venv/bin/activate`

```
cd ~/kubespray

cp -rfp inventory/sample inventory/akash

#REPLACE IP ADDRESSES BELOW WITH YOUR KUBERNETES CLUSTER IP ADDRESSES
declare -a IPS=(10.0.10.136 10.0.10.239 10.0.10.253 10.0.10.9)

CONFIG_FILE=inventory/akash/hosts.yaml python3 contrib/inventory_builder/inventory.py ${IPS[@]}
```

#### **Expected Result (Example)**

```
(venv) root@ip-10-0-10-145:/home/ubuntu/kubespray# CONFIG_FILE=inventory/akash/hosts.yaml python3 contrib/inventory_builder/inventory.py ${IPS[@]}

DEBUG: Adding group all
DEBUG: Adding group kube_control_plane
DEBUG: Adding group kube_node
DEBUG: Adding group etcd
DEBUG: Adding group k8s_cluster
DEBUG: Adding group calico_rr
DEBUG: adding host node1 to group all
DEBUG: adding host node2 to group all
DEBUG: adding host node3 to group all
DEBUG: adding host node4 to group all
DEBUG: adding host node1 to group etcd
DEBUG: adding host node2 to group etcd
DEBUG: adding host node3 to group etcd
DEBUG: adding host node1 to group kube_control_plane
DEBUG: adding host node2 to group kube_control_plane
DEBUG: adding host node3 to group kube_control_plane

DEBUG: adding host node1 to group kube_node
DEBUG: adding host node2 to group kube_node
DEBUG: adding host node3 to group kube_node
DEBUG: adding host node4 to group kube_node
```

#### **Verification of Generated File**

- Open the hosts.yaml file in VI (Visual Editor) or nano
- Update the kube_control_plane category if needed with full list of hosts that should be master nodes
- Ensure you have either 1 or 3 Kubernetes control plane nodes under `kube_control_plane`. If 2 are listed, change that to 1 or 3, depending on whether you want Kubernetes be Highly Available.
- Ensure you have only control plane nodes listed under `etcd`. If you would like to review additional best practices for etcd, please review this [guide](https://rafay.co/the-kubernetes-current/etcd-kubernetes-what-you-should-know/).
- For additional details regarding `hosts.yaml` best practices and example configurations, review this [guide](/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/additional-k8s-resources/#kubespray-hostsyaml-examples).

```
vi ~/kubespray/inventory/akash/hosts.yaml
```

##### **Example hosts.yaml File**

- Additional hosts.yaml examples, based on different Kubernetes cluster topologies, may be found [here](/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/additional-k8s-resources/#kubespray-hostsyaml-examples)

```
all:
  hosts:
    node1:
      ansible_host: 10.0.10.136
      ip: 10.0.10.136
      access_ip: 10.0.10.136
    node2:
      ansible_host: 10.0.10.239
      ip: 10.0.10.239
      access_ip: 10.0.10.239
    node3:
      ansible_host: 10.0.10.253
      ip: 10.0.10.253
      access_ip: 10.0.10.253
    node4:
      ansible_host: 10.0.10.9
      ip: 10.0.10.9
      access_ip: 10.0.10.9
  children:
    kube_control_plane:
      hosts:
        node1:
        node2:
        node3:
    kube_node:
      hosts:
        node1:
        node2:
        node3:
        node4:
    etcd:
      hosts:
        node1:
        node2:
        node3:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```

### Manual Edits/Insertions of the hosts.yaml Inventory File

- Open the hosts.yaml file in VI (Visual Editor) or nano

```
vi ~/kubespray/inventory/akash/hosts.yaml
```

- Within the YAML file's "all" stanza and prior to the "hosts" sub-stanza level - insert the following vars stanza

```
vars:
  ansible_user: root
```

- The hosts.yaml file should look like this once finished

```
all:
  vars:
    ansible_user: root
  hosts:
    node1:
      ansible_host: 10.0.10.136
      ip: 10.0.10.136
      access_ip: 10.0.10.136
    node2:
      ansible_host: 10.0.10.239
      ip: 10.0.10.239
      access_ip: 10.0.10.239
    node3:
      ansible_host: 10.0.10.253
      ip: 10.0.10.253
      access_ip: 10.0.10.253
    node4:
      ansible_host: 10.0.10.9
      ip: 10.0.10.9
      access_ip: 10.0.10.9
  children:
    kube_control_plane:
      hosts:
        node1:
        node2:
        node3:
    kube_node:
      hosts:
        node1:
        node2:
        node3:
        node4:
    etcd:
      hosts:
        node1:
        node2:
        node3:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```

### Additional Kubespray Documentation

Use these resources for a more through understanding of Kubespray and for troubleshooting purposes

- [Adding/replacing a node](https://github.com/kubernetes-sigs/kubespray/blob/9dfade5641a43c/docs/nodes.md)
- [Upgrading Kubernetes in Kubespray](https://github.com/kubernetes-sigs/kubespray/blob/e9c89132485989/docs/upgrades.md)

## STEP 5 - Additional Verifications/Config

In this section we will enable gVisor which provides basic container security.

### Containerd Edit/Verification

- Change into the directory of the config file

```
cd ~/kubespray/inventory/akash/group_vars/k8s_cluster
```

- Using VI or nano edit the k8s-cluster.yml file:

```
vi k8s-cluster.yml
```

- Add/update the container_manager key if necessary to containerd

```
container_manager: containerd
```

### **gVisor Issue - No system-cgroup v2 Support**

> Skip if you are not using gVisor


If you are using a newer systemd version, your container will get stuck in ContainerCreating state on your provider with gVisor enabled. Please reference [this document](/docs/providers/build-a-cloud-provider/akash-cli/gvisor-issue-no-system-cgroup-v2-support/) for details regarding this issue and the recommended workaround.


## STEP 6 - DNS Configuration

### Upstream DNS Servers

Add `upstream_dns_servers` in your Ansible inventory

> _**NOTE**_ - the steps in this section should be conducted on the Kubespray host

```
cd ~/kubespray
```

#### Verify Current Upstream DNS Server Config

```
grep -A2 upstream_dns_servers inventory/akash/group_vars/all/all.yml
```

_**Expected/Example Output**_

- Note that in the default configuration of a new Kubespray host the Upstream DNS Server settings are commented out via the `#` prefix.

```
#upstream_dns_servers:
  #- 8.8.8.8
  #- 1.1.1.1
```

#### Update Upstream DNS Server Config

```
vim inventory/akash/group_vars/all/all.yml
```

- Uncomment the `upstream_dns_servers` and the public DNS server line entries.
- When complete the associated lines should appears as:

```
## Upstream dns servers
upstream_dns_servers:
  - 8.8.8.8
  - 1.1.1.1
```

It is best to use two different DNS nameserver providers as in this example - Google DNS (8.8.8.8) and Cloudflare (1.1.1.1).

## STEP 7 - Provider Ephemeral Storage Config (OPTIONAL)

### Overview

Ensure that the provider is configured to offer more ephemeral storage than is available at the OS root partition.

Objective of this guide - move /var/lib/kubelet (nodefs) and /var/lib/containerd (imagefs) onto the RAID0 NVME disk mounted over the /data directory.

- _**nodefs**_: The node's main filesystem, used for local disk volumes, emptyDir, log storage, and more. For example - nodefs contains /var/lib/kubelet/.
- _**imagefs**_: An optional filesystem that container runtimes use to store container images and container writable layers.

### Ephemeral and Persistent Storage Considerations

Notes to consider when planning your provider storage allocations:

- Ephemeral storage is faster (in terms of IOPS) and persistent storage can be slower (in terms of IOPS). This is due to network latency associated with persistent storage and as the storage nodes (or the pods to storage nodes) are connected over the network.
- Some types of deployments - such as Chia workloads - do not need persistent storage and need just ephemeral storage

### Observations

Stopping `kubelet` alone does not clear the `/var/lib/kubelet` open file handles locked by pods using it. Hence, `kubelet` should be disabled, node restarted.

`kubectl drain` (& `kubectl uncordon` after) is not sufficient as `Ceph OSD` can't be evicted due to PDB (Pod's Disruption Budget).

Associated error when attempting to stop/start `kubelet`:

```
error when evicting pods/"rook-ceph-osd-60-5fb688f86b-9hzt2" -n "rook-ceph" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.
```

```
$ kubectl -n rook-ceph describe pdb
Name:             rook-ceph-osd
Namespace:        rook-ceph
Max unavailable:  1
Selector:         app=rook-ceph-osd
Status:
    Allowed disruptions:  0
    Current:              119
    Desired:              119
    Total:                120
Events:                   <none>
```

### Recommended Steps

#### STEP 1 - Stop and disable `Kubelet` & `containerd`

```
systemctl stop kubelet
systemctl disable kubelet

systemctl stop containerd
systemctl disable containerd
```

#### STEP 2 - Reboot the node

- Have to reboot the node so it will release the `/var/lib/kubelet` and `/var/lib/containerd`

_**Verify**_

```
root@k8s-node-1:~# lsof -Pn 2>/dev/null |grep -E '/var/lib/kubelet|/var/lib/containerd'
# should be no response here, this will indicate /var/lib/kubelet and /var/lib/containerd are not used.
```

#### STEP 3 - Find 2 free NVME disks

```
root@k8s-node-0:~# lsblk
...
nvme0n1                                                                                               259:0    0   1.5T  0 disk
nvme1n1                                                                                               259:1    0   1.5T  0 disk
```

#### STEP 4 - Create RAID0 over 2 NVME

```
root@k8s-node-0:~# mdadm --create /dev/md0 --level=raid0 --metadata=1.2 --raid-devices=2 /dev/nvme0n1 /dev/nvme1n1
mdadm: array /dev/md0 started.
```

_**Verify:**_

```
root@k8s-node-0:~# cat /proc/mdstat
Personalities : [linear] [multipath] [raid0] [raid1] [raid6] [raid5] [raid4] [raid10]
md0 : active raid0 nvme1n1[1] nvme0n1[0]
      3125626880 blocks super 1.2 512k chunks

unused devices: <none>
```

#### STEP 5 - Format /dev/md0

```
root@k8s-node-0:~# mkfs.ext4 /dev/md0
```

#### STEP 6 - Move old kubelet data

```
mv /var/lib/kubelet /var/lib/kubelet-backup
```

#### STEP 7 - Update fstab with the new /dev/md0

##### **Backup fstab**

```
cp -p /etc/fstab /etc/fstab.1
```

##### Update fstab

> Remove ,discard after defaults if you are NOT using SSD/NVME disks!

```
cat >> /etc/fstab << EOF
UUID="$(blkid /dev/md0 -s UUID -o value)"  /data        ext4   defaults,discard  0 0
EOF
```

##### Verify

```
diff -Nur /etc/fstab.1 /etc/fstab
```

#### STEP 8- Mount /dev/md0 as /data

```
mkdir /data
mount /data
```

##### Verify

```
root@k8s-node-0:~# df -Ph /data
Filesystem      Size  Used Avail Use% Mounted on
/dev/md0        2.9T   89M  2.8T   1% /data
```

#### STEP 9 - Generate mdadm.conf so it gets detected on boot

```
root@k8s-node-0:~# /usr/share/mdadm/mkconf > /etc/mdadm/mdadm.conf
```

##### Verify

```
root@k8s-node-0:~# cat /etc/mdadm/mdadm.conf | grep -v ^\#


HOMEHOST <system>

MAILADDR root

ARRAY /dev/md/0  metadata=1.2 UUID=a96501a3:955faf1e:06f8087d:503e8c36 name=k8s-node-0.mainnet-1.ca:0
```

#### STEP 10 - Regenerate initramfs so the new mdadm.conf gets there

```
root@k8s-node-0:~# update-initramfs -c -k all
```

#### STEP 11 - Move kubelet data onto RAID0

```
mv /var/lib/kubelet-backup /data/kubelet
```

##### Verify

```
root@k8s-node-0:~# df -Ph /data
Filesystem      Size  Used Avail Use% Mounted on
/dev/md0        2.9T   43G  2.7T   2% /data
```

#### STEP 12 - Move the containerd to the new path

```
mv /var/lib/containerd /data/containerd
```

#### STEP 13 - kubespray the cluster with the following config

- This configuration entry should be made in the file of `group_vars/k8s_cluster/k8s-cluster.yml` on the Kubespray host

```
containerd_storage_dir: "/data/containerd"
kubelet_custom_flags:
  "--root-dir=/data/kubelet"
```

#### STEP 14 - Start and enable containerd

```
systemctl start containerd
systemctl enable containerd
```

#### STEP 15 - Start and enable kubelet

```
systemctl start kubelet
systemctl enable kubelet
```

##### Verify

```
journalctl -u kubelet -f
```

#### STEP 16 - Wait until all pods are Running

```
kubectl get pods -A -o wide | grep <your node>
```

### Make applications aware of the new nodefs location

> If you aren't using `rook-ceph` / `velero`, then skip this section

#### Ceph's rook-ceph-operator

```
csi:
  kubeletDirPath: /data/kubelet
```

#### Velero restic

> velero helm-chart config

```
restic:
  podVolumePath: /data/kubelet/pods
```

## STEP 8 - Create Kubernetes Cluster

### Create Cluster

With inventory in place we are ready to build the Kubernetes cluster via Ansible.

- Note - the cluster creation may take several minutes to complete
- If the Kubespray process fails or is interpreted, run the Ansible playbook again and it will complete any incomplete steps on the subsequent run


> _**NOTE**_ - if you intend to enable GPU resources on your provider - consider completing this [step](/docs/providers/build-a-cloud-provider/akash-cli/gpu-resource-enablement/#gpu-provider-configuration) now to avoid having to run Kubespray on multiple occasions. Only the `NVIDIA Runtime Configuration` section of the `GPU Resource Enablement` guide should be completed at this time and then return to this guide/step.


```
cd ~/kubespray

ansible-playbook -i inventory/akash/hosts.yaml -b -v --private-key=~/.ssh/id_rsa cluster.yml
```

## STEP 9 - Confirm Kubernetes Cluster

A couple of quick Kubernetes cluster checks are in order before moving into next steps.

### SSH into Kubernetes Master Node

- The verifications in this section must be completed on a master node with kubectl access to the cluster.

### Confirm Kubernetes Nodes

```
kubectl get nodes
```

#### **Example output from a healthy Kubernetes cluster**

```
root@node1:/home/ubuntu# kubectl get nodes

NAME    STATUS   ROLES                  AGE     VERSION
node1   Ready    control-plane,master   5m48s   v1.22.5
node2   Ready    control-plane,master   5m22s   v1.22.5
node3   Ready    control-plane,master   5m12s   v1.22.5
node4   Ready    <none>                 4m7s    v1.22.5
```

### **Confirm Kubernetes Pods**

```
kubectl get pods -n kube-system
```

#### Example output of the pods that are the brains of the cluster

```
root@node1:/home/ubuntu# kubectl get pods -n kube-system

NAME                                      READY   STATUS    RESTARTS        AGE
calico-kube-controllers-5788f6558-mzm64   1/1     Running   1 (4m53s ago)   4m54s
calico-node-2g4pr                         1/1     Running   0               5m29s
calico-node-6hrj4                         1/1     Running   0               5m29s
calico-node-9dqc4                         1/1     Running   0               5m29s
calico-node-zt8ls                         1/1     Running   0               5m29s
coredns-8474476ff8-9sgm5                  1/1     Running   0               4m32s
coredns-8474476ff8-x67xd                  1/1     Running   0               4m27s
dns-autoscaler-5ffdc7f89d-lnpmm           1/1     Running   0               4m28s
kube-apiserver-node1                      1/1     Running   1               7m30s
kube-apiserver-node2                      1/1     Running   1               7m13s
kube-apiserver-node3                      1/1     Running   1               7m3s
kube-controller-manager-node1             1/1     Running   1               7m30s
kube-controller-manager-node2             1/1     Running   1               7m13s
kube-controller-manager-node3             1/1     Running   1               7m3s
kube-proxy-75s7d                          1/1     Running   0               5m56s
kube-proxy-kpxtm                          1/1     Running   0               5m56s
kube-proxy-stgwd                          1/1     Running   0               5m56s
kube-proxy-vndvs                          1/1     Running   0               5m56s
kube-scheduler-node1                      1/1     Running   1               7m37s
kube-scheduler-node2                      1/1     Running   1               7m13s
kube-scheduler-node3                      1/1     Running   1               7m3s
nginx-proxy-node4                         1/1     Running   0               5m58s
nodelocaldns-7znkj                        1/1     Running   0               4m28s
nodelocaldns-g8dqm                        1/1     Running   0               4m27s
nodelocaldns-gf58m                        1/1     Running   0               4m28s
nodelocaldns-n88fj                        1/1     Running   0               4m28s
```

### Confirm DNS

#### Verify CoreDNS Config

> This is to verify that Kubespray properly set the expected upstream servers in the DNS Configuration previous step

```
kubectl -n kube-system get cm coredns -o yaml | grep forward
```

#### Verify All DNS Related Pods Are in a Running State

```
kubectl -n kube-system get pods -l k8s-app=kube-dns
kubectl -n kube-system get pods -l k8s-app=nodelocaldns
```

With kubespray version >= `2.22.x`:

```
kubectl -n kube-system get pods -l k8s-app=node-local-dns
```

### Verify etcd Status and Health

> Commands should be run on the control plane node to ensure health of the Kubernetes `etcd` database

```
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl check perf
```

## STEP 9 - Custom Kernel Parameters

### Create and apply custom kernel parameters

Apply these settings to ALL Kubernetes worker nodes to guard against `too many open files` errors.

#### Create Config

```
cat > /etc/sysctl.d/90-akash.conf << EOF
# Common: tackle "failed to create fsnotify watcher: too many open files"
fs.inotify.max_user_instances = 512
fs.inotify.max_user_watches = 1048576

# Custom: increase memory mapped files limit to allow Solana node
# https://docs.solana.com/running-validator/validator-start
vm.max_map_count = 1000000
EOF
```

#### Apply Config

```
sysctl -p /etc/sysctl.d/90-akash.conf
```

## STEP 10 - Review Firewall Policies

If local firewall instances are running on Kubernetes control-plane and worker nodes, add the following policies.

### Kubernetes Port List

In this step we will cover common Kubernetes ports that need to be opened for cross server communications. For an exhaustive and constantly updated reference, please use the following list published by the Kubernetes developers.

- [Exhaustive list of Kubernetes Ports](https://kubernetes.io/docs/reference/ports-and-protocols/)

### **Etcd Key Value Store Policies**

Ensure the following ports are open in between all Kubernetes etcd instances:

```
- 2379/tcp for client requests; (Kubernetes control plane to etcd)
- 2380/tcp for peer communication; (etcd to etcd communication)
```

### **API Server Policies**

Ensure the following ports are open in between all Kubernetes API server instances:

```
- 6443/tcp - Kubernetes API server
```

### Worker Node Policies

Ensure the following ports are open in between all Kubernetes worker nodes:

```
- 10250/tcp - Kubelet API server; (Kubernetes control plane to kubelet)
```
