---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Provider build using Ansible Playbooks"
linkTitle: "Provider build using Ansible Playbooks"
---

**NOTE** - the steps in this guide are currently deemed experimental pending security enhancements that will be introduced prior to becoming production grade. At this time, please only use this guide for experimentation or non-production use.

# Building an Akash Provider Using Ansible Playbooks
This guide walks you through the process of building an Akash Provider using Ansible Playbooks, which automates the deployment and configuration process.

## Prerequisites
1. Create a new item under the Providers Vault in 1Password UI and populate the required variables as shown in the below screenshot.
![Alt text](../../../../../../../website/public/images/1Password.png)

2. Follow the below steps to install Ansible in the MacOS.
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip3 install -r requirements.txt
    ```
## STEP 1 - Build the Kubernetes cluster with Kubespray
Folow the [Kubernetes Cluster for Akash Providers](https://akash.network/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers/) guide to build your Kubernetes cluster using the Kubespray project.

Before creating the cluster, make the following important configurations:

### Configure Ephemeral Storage
Ensure your provider is configured to offer more ephemeral storage compared to the root volume by modifying group_vars/k8s_cluster/k8s-cluster.yml on the Kubespray host.
```yml
containerd_storage_dir: "/data/containerd"
kubelet_custom_flags:
  "--root-dir=/data/kubelet"
```

### Configure Scheduler Profiles
Add the following configuration to group_vars/k8s_cluster/k8s-cluster.yml:
```yml
kube_scheduler_profiles:
- pluginConfig:
    - name: NodeResourcesFit
    args:
        scoringStrategy:
        type: MostAllocated
        resources:
            - name: nvidia.com/gpu
            weight: 10
            - name: memory
            weight: 1
            - name: cpu
            weight: 1
            - name: ephemeral-storage
            weight: 1
```

### Enable Helm Installation
Add the following configuration to group_vars/k8s_cluster/addson.yml:

```yml
# Helm deployment
helm_enabled: true
```


## STEP 2 - Clone the Repository
We recommend setting up the provider build steps on Ubuntu 22.04.

```bash
cd ~

git https://github.com/akash-network/provider-playbooks.git

cd provider-playbooks
```

## STEP 3 - Building Provider using Ansible
Run the complete Ansible playbook with the necessary variables:

```bash
ansible-playbook playbooks.yml -i inventory.yml -e 'host=<host(s)>' -v
```

> Note: Each role requires specific variables. Refer to the Configuration Variables in the README under each role.

## Example Configuration
### Example Inventory File

Create an inventory file (inventory.yml) for an All-In-One node (single control plane + etcd node):

```yml
#inventory.yml
all:
  hosts:
    node1.t100.abc.xy.akash.pub:
```

### Example command
```bash
ansible-playbook playbooks.yml -i inventory.yml -e 'host=node1.t100.abc.xy.akash.pub tailscale_authkey='tskey-authxxxx' tailscale_hostname=node1.t100.abc.xy.akash.pub provider_name=t100.abc.xy.akash.pub provider_version=0.6.9' -v
```
> Note: For an All-in-One node setup, using extra vars makes sense as it's a simpler deployment with all components on a single node.
However, when dealing with a Kubernetes cluster involving multiple nodes, using host_vars is the better approach. This allows you to define specific variables for each host in the cluster, providing more granular configuration control and better organization of your infrastructure as code.

### Role-Specific Variables
Each role in the playbook has specific configuration variables that can be set to customize your deployment. These variables can be defined in your inventory files, host_vars files, or passed directly using the -e parameter.

#### Tailscale Role
Tailscale is a simple networking tool that creates a secure private network between your devices with minimal configuration. It lets you access services safely without public internet exposure by handling complex security and connection details automatically.

`tailscale_authkey`: Your Tailscale authentication key -  allows a device to join your Tailscale network securely
`tailscale_hostname`: The hostname for the Tailscale node
Refer [here](https://github.com/akash-network/provider-playbooks/blob/main/roles/tailscale/README.md#configuration-variables) for optional variables that can be customized.

> Note: Tailscale is entirely optional when deploying an Akash provider.

#### OS Role
No additional variables required beyond host specification.

#### OP Role
`provider_name`: The name of your Akash provider
Refer [here](https://github.com/akash-network/provider-playbooks/blob/main/roles/op/README.md#configuration-variables) for optional variables that can be customized.

> Note: OP is entirely optional when deploying an Akash provider.

#### Provider Role

`provider_name`: The name of your Akash provider .
`provider_version`: The version of the Akash provider to deploy.
`akash1_address`: Your Akash wallet address
Refer [here](https://github.com/akash-network/provider-playbooks/blob/main/roles/provider/README.md#configuration-variables) for optional variables that can be customized.

#### GPU Role
No additional variables required beyond host specification.
Refer [here](https://github.com/akash-network/provider-playbooks/blob/main/roles/provider/README.md#configuration-variables) for optional variables that can be customized.
