---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Provider build using Ansible Playbooks"
linkTitle: "Provider build using Ansible Playbooks"
---

**NOTE** - the steps in this guide are currently deemed experimental pending security enhancements that will be introduced prior to becoming production grade. At this time, please only use this guide for experimentation or non-production use.

### Building an Akash Provider Using Ansible Playbooks

This guide walks you through the process of building an Akash Provider using Ansible Playbooks, which automates the deployment and configuration process.



#### To run the Complete Cluster Provider Build


#### STEP 1 - Clone the Kubespray Repository
```bash
cd ~
git clone -b v2.24.1 --depth=1 https://github.com/kubernetes-sigs/kubespray.git
```

#### STEP 2 - Install Ansible
```bash
cd ~/kubespray
virtualenv --python=python3 venv
source venv/bin/activate
pip3 install -r requirements.txt
```

#### STEP 3 - Clone the Provider Playbooks Repository
```bash
cd ~
git clone https://github.com/akash-network/provider-playbooks.git
```

Append the provider-playbook in the cluster.yml
```bash
cat >> /root/kubespray/cluster.yml << EOF
  tags: kubespray

- name: Run Akash provider setup
  import_playbook: ../provider-playbooks/playbooks.yml
EOF
```

***Verify:***
```bash
cat /root/kubespray/cluster.yml
---
- name: Install Kubernetes
  ansible.builtin.import_playbook: playbooks/cluster.yml
  tags: kubespray

- name: Run Akash provider setup
  import_playbook: ../provider-playbooks/playbooks.yml
```

#### STEP 4 - Ansible Inventory
```bash
cd ~/kubespray

cp -rfp inventory/sample inventory/akash

#REPLACE IP ADDRESSES BELOW WITH YOUR KUBERNETES CLUSTER IP ADDRESSES
declare -a IPS=(10.4.8.196)

CONFIG_FILE=inventory/akash/hosts.yaml python3 contrib/inventory_builder/inventory.py ${IPS[@]}
```
#### **Expected Result(Example)**
```bash
(venv) root@node1:~/kubespray# CONFIG_FILE=inventory/akash/hosts.yaml python3 contrib/inventory_builder/inventory.py ${IPS[@]}
DEBUG: Adding group all
DEBUG: Adding group kube_control_plane
DEBUG: Adding group kube_node
DEBUG: Adding group etcd
DEBUG: Adding group k8s_cluster
DEBUG: Adding group calico_rr
DEBUG: adding host node1 to group all
DEBUG: adding host node1 to group etcd
DEBUG: adding host node1 to group kube_control_plane
DEBUG: adding host node1 to group kube_node
```

#### **Verification of Generated File**

- Open the hosts.yaml file in VI (Visual Editor) or nano
- Update the kube_control_plane category if needed with full list of hosts that should be master nodes
- Ensure you have either 1 or 3 Kubernetes control plane nodes under `kube_control_plane`. If 2 are listed, change that to 1 or 3, depending on whether you want Kubernetes be Highly Available.
- Ensure you have only control plane nodes listed under `etcd`. If you would like to review additional best practices for etcd, please review this [guide](https://rafay.co/the-kubernetes-current/etcd-kubernetes-what-you-should-know/).
- For additional details regarding `hosts.yaml` best practices and example configurations, review this [guide](/docs/providers/build-a-cloud-provider/kubernetes-cluster-for-akash-providers/additional-k8s-resources/#kubespray-hostsyaml-examples).

```bash
vi ~/kubespray/inventory/akash/hosts.yaml
```

##### Example hosts.yaml File

- Additional hosts.yaml examples, based on different Kubernetes cluster topologies, may be found [here](/Docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/additional-k8s-resources/index.md#kubespray-hostsyaml-examples)

```yml
all:
  hosts:
    node1:
      ansible_host: 10.4.8.196
      ip: 10.4.8.196
      access_ip: 10.4.8.196
  children:
    kube_control_plane:
      hosts:
        node1:
    kube_node:
      hosts:
        node1:
    etcd:
      hosts:
        node1:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```

### Manual Edits/Insertions of the hosts.yaml Inventory File

- Open the hosts.yaml file in VI (Visual Editor) or nano

```bash
vi ~/kubespray/inventory/akash/hosts.yaml
```

- Within the YAML file’s “all” stanza and prior to the “hosts” sub-stanza level - insert the following vars stanza

```yml
vars:
  ansible_user: root
```

- The hosts.yaml file should look like this once finished


```yml
all:
  vars:
    ansible_user: root
  hosts:
    node1:
      ansible_host: 10.4.8.196
      ip: 10.4.8.196
      access_ip: 10.4.8.196
  children:
    kube_control_plane:
      hosts:
        node1:
    kube_node:
      hosts:
        node1:
    etcd:
      hosts:
        node1:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```

#### Additional Kubespray Documentation

Use these resources for a more through understanding of Kubespray and for troubleshooting purposes

- [Adding/replacing a node](https://github.com/kubernetes-sigs/kubespray/blob/9dfade5641a43c/docs/nodes.md)
- [Upgrading Kubernetes in Kubespray](https://github.com/kubernetes-sigs/kubespray/blob/e9c89132485989/docs/upgrades.md)

#### STEP 5 - Configure Ephemeral Storage
The cluster specific variables can be defined in the group vars and they are located here */root/kubespray/inventory/akash/group_vars//k8s_cluster/k8s-cluster.yml*. Ensure your provider is configured to offer more ephemeral storage compared to the root volume by modifying group_vars/k8s_cluster/k8s-cluster.yml on the Kubespray host.

```bash 
nano /root/kubespray/inventory/akash/group_vars/k8s_cluster/k8s-cluster.yml 
```


And add these lines

```bash
containerd_storage_dir: "/data/containerd"
kubelet_custom_flags: "--root-dir=/data/kubelet"
```

#### STEP 6 - Configure Scheduler Profiles
Add the following configuration to */root/kubespray/inventory/akash/group_vars/k8s_cluster/k8s-cluster.yml*:

```bash 
nano /root/kubespray/inventory/akash/group_vars/k8s_cluster/k8s-cluster.yml
```


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

#### STEP 7 - Enable Helm Installation
Add the following configuration to */root/kubespray/inventory/akash/group_vars/k8s_cluster/addson.yml*:
```bash
vi /root/kubespray/inventory/akash/group_vars/k8s_cluster/addson.yml
```

```yml
# Helm deployment
helm_enabled: true
```

#### STEP 8 - DNS Configuration

#### Upstream DNS Servers

Add `upstream_dns_servers` in your Ansible inventory

> _**NOTE**_ - the steps in this section should be conducted on the Kubespray host

```yml
cd ~/kubespray
```

#### Verify Current Upstream DNS Server Config

```yml
grep -A2 upstream_dns_servers inventory/akash/group_vars/all/all.yml
```

_**Expected/Example Output**_

- Note that in the default configuration of a new Kubespray host the Upstream DNS Server settings are commented out via the `#` prefix.

```yml
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

```yml
## Upstream dns servers
upstream_dns_servers:
  - 8.8.8.8
  - 1.1.1.1
```

It is best to use two different DNS nameserver providers as in this example - Google DNS (8.8.8.8) and Cloudflare (1.1.1.1).


#### STEP 8 - Host vars creation for Provider Deployment
Create host_vars file for each node defined in your kubespray hosts.yaml file. The host_vars files contain the configuration specific to each node in your Akash provider setup.

1) Create a host_vars file for each node in your /root/provider-playbooks/host_vars directory
2) Use the same hostname as defined in your hosts.yaml file from Step 4


Based on the host keys under `hosts` that was defined in the STEP 4 Example (`/root/kubespray/inventory/akash/hosts.yml )`, create the host_vars file in `/root/provider-playbooks/host_vars`

```bash
# Create the host_vars directory if it doesn't exist
mkdir -p /root/provider-playbooks/host_vars

#Create the host_vars file for each node (example for node1)
cat >> /root/provider-playbooks/host_vars/node1.yml << EOF
# Node Configuration - Host Vars File

## Provider Identification
akash1_address: ""  # Your Akash wallet address

## Security Credentials
provider_b64_key: ""        # Base64-encoded provider key
provider_b64_keysecret: ""  # Base64-encoded provider key secret

## Network Configuration
domain: t100.abc.xy.akash.pub
region: "us-central"

## Organization Details
host: ""          # Provider node hostname
organization: ""  # Your organization name
email: ""         # Contact email address
website: ""       # Organization website

## Notes:
# - Replace empty values with your actual configuration
# - Keep sensitive values secure and never share them publicly
# - Ensure domain format follows Akash naming conventions
EOF
```
#### Important Notes

- Create a separate .yml file for each node in your cluster
- Keep the placeholders for keys if you haven't generated them yet
- You'll fill in the empty values after generating keys and certificates
- For multi-node deployments, repeat this process with appropriate values for each node

#### STEP 9 - Running the Ansible Playbook

Deploy your Akash Provider by running the Ansible playbook:

```bash
ansible-playbook -i inventory/akash/hosts.yaml cluster.yml -t kubespray,os,provider,gpu -e 'host=node1' -v
```

#### Notes:

- The command includes the following tags:
  - *kubespray*: Sets up the Kubernetes cluster
  - *os*: Configures the operating system
  - *provider*: Deploys the Akash provider software
  - *gpu*: Configures GPU support if available


- For single-node cluster, using command-line variables with -e is sufficient
- For multi-node clusters, using the host_vars files created in Step 8 is recommended for better organization
- Each role has specific variable requirements - refer to the README in each role directory for details

### Role-Specific Variables

Each role in the playbook has specific configuration variables that can be set to customize your deployment. These variables can be defined in your inventory files, host_vars files, or passed directly using the -e parameter.

#### Tailscale Role (OPTIONAL)

Tailscale is a simple networking tool that creates a secure private network between your devices with minimal configuration. It lets you access services safely without public internet exposure by handling complex security and connection details automatically.

`tailscale_authkey`: Your Tailscale authentication key - allows a device to join your Tailscale network securely.
`tailscale_hostname`: The hostname for the Tailscale node.
Refer [here](https://github.com/akash-network/provider-playbooks/blob/main/roles/tailscale/README.md#configuration-variables) for optional variables that can be customized.

> Note: Tailscale is entirely optional when deploying an Akash provider.

#### OS Role
No additional variables required beyond host specification.

#### OP Role (OPTIONAL)

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
