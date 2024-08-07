---
categories: ["Guides"]
tags: ["Deployment"]
weight: 1
title: "AkashOS: Akash Provider OS - Ubuntu Server 24.04 Edition"
linkTitle: "AkashOS"
---


![](../../../assets/akashos.png)

                                                                                                                               
[AkashOS](https://github.com/cryptoandcoffee/akashos/releases) is an innovative solution for those aspiring to become a provider within the Akash Network. By utilizing Autoinstall and cloud-init, AkashOS offers a seamless, unattended installation of Ubuntu Server. It autonomously establishes a Kubernetes cluster and deploys Helm charts to configure the system as an Akash Network provider.

After installation, users can configure the provider via a user-friendly Dashboard/GUI or through SSH, providing a versatile approach to provider configuration. The installation process is designed to be intuitive, requiring users to answer a few straightforward questions, ensuring a smooth setup experience.

## 🌟 Become a Provider with Ease!

Start your journey as a provider with a minimal investment of 25 AKT, valued at $75 at the time of writing. Explore unlimited earning possibilities within the Akash Network.

-  🧮 **Estimate Your Earnings:** Curious about what your hardware could be earning? Check out the [Akash Calculator](https://akashcalcualtor.com)!
- 📊 **Explore Existing Provider Earnings:** Discover what existing providers are earning in real-time on the Akash Network at [Akash Dash](https://akashdash.com).


## 🛠 Quick & Easy Setup!
Download and attach the latest AkashOS Release ISO to your chosen hardware: Bare-Metal, VPS, or Virtual Machine. and watch it transform into a provider on the Akash Network!

## 💡 Why AkashOS?
- **Streamlined & Automated:** Effortlessly install Ubuntu Server and configure your system with this automated setup.
- **Infinite Earnings:** Unlock unparalleled earning potential as a provider.
- **Versatile Application:** Compatible with various setups, ensuring everyone can join.

## What is this image best used for?

You can use this image to take over any x86 machine or virtual machine that you want to configure as a provider on the Akash Network.

## Target Audience for this ISO 

You should be familiar with at least one of the following:

1. Hypervisor (Proxmox/VMware) 
2. Homelab
3. Unraid/TrueNas
4. DevOps/SRE/Kubernetes Administration
4. Full-stack development

## Installation Difficulty Level

### Medium (terminal experience required)

Human requirements, estimated time: ~30 minutes

- Acquire at least 50 AKT
- Add DNS records
- Forward ports

Software requirements, estimated time: ~30 minutes

- Install [AkashOS](https://github.com/cryptoandcoffee/akashos/releases)
- Configure Pricing

## Dependencies

### Human Requirements

1. Be ready to run workloads for dWeb. Understand what you are getting into and be prepared to learn.
2. Docker and Kubernetes experience will greatly help you, learn all you can.
3. With great power comes great responsibility. Be aware of the risks and use [Lens](https://k8slens.dev/) to monitor your cluster.
4. Report any offending wallet if you experience any abuse, DDoS, spam, or other issues to [Akash](https://discord.akash.network/).

### Software Requirements

1. Domain name (example.com) that you own and can manage DNS records.
2. 50 AKT to send to the new provider's wallet.
3. Access to your firewall/router for port forwarding.
4. [Lens](https://k8slens.dev/) - Recommended for cluster daily operations; you'll need this to interact with your new cluster.
5. One of [Balena Etcher](https://www.balena.io/etcher/), [Rufus](https://rufus.ie/), or [Ventoy](https://www.ventoy.net/en/index.html) for creating bootable USB drives on Linux, Mac, PC.
6. Dynamic DNS update client and domain for residential IPs.

### Minimum Hardware Requirements
**First Node**

- 2 CPU / 4 Threads
- 8 GB Memory
- 64 GB Disk

**Additional Nodes**

- 1 CPU
- 2 GB Memory
- 8 GB Disk

### Setup Instructions

**Proxmox / VirtualBox / VMware**

1. Download the [AkashOS ISO](https://github.com/cryptoandcoffee/akashos/releases).
2. Create VM - Attach a disk drive with the ISO.
3. Start the VM.
4. Reboot when the install is completed and detach the ISO.
5. Login with default username and password (both of which are `akash`) and then follow the on-screen instructions.
6. Once the system has rebooted, go to the Control Panel.
7. Update the provider attributes with the recommended values and click Save.
8. Click STOP next to Provider.
9. Click "Re-Deploy Provider" Button.
10. Send at least 5 AKT to the new wallet address to start the provider.
11. Click Download Kubeconfig and import it into Lens. Set the Namespace to "All" to see everything.


**Bare Metal Datacenter with IPMI/ISO Support**

1. Download the [AkashOS ISO](https://github.com/cryptoandcoffee/akashos/releases).
2. Upload the ISO to the datacenter ISO storage location (Vultr/HostHatch/etc) or attach the ISO to your IPMI Virtual Console Session.
3. Start the machine with the ISO for the boot drive (F11 may be required).
4. Reboot when the install is completed and detach the ISO.
5. Login with default username and password (both of which are `akash`) and then follow the on-screen instructions.
6. Once the system has rebooted, go to the Control Panel.
7. Update the provider attributes with the recommended values and click Save.
8. Click STOP next to Provider.
9. Click "Re-Deploy Provider" Button.
10. Send at least 5 AKT to the new wallet address to start the provider.
11. Click "Download Kubeconfig" and import it into Lens. Set the Namespace to "All" to see everything.

**USB Key**

1. Download the [AkashOS ISO](https://github.com/cryptoandcoffee/akashos/releases).
2. Use one of [Balena Etcher](https://www.balena.io/etcher/), [Rufus](https://rufus.ie/), or [Ventoy](https://www.ventoy.net/en/index.html) to write the ISO to a USB key.
3. Insert the USB key into the computer you want to make an Akash provider.
4. Start the machine with the USB key for the boot drive (F11 may be required).
5. Reboot when the install is completed and unplug the USB key.
6. Login with default username and password (both of which are `akash`) and then follow the on-screen instructions.
7. Once the system has rebooted, go to the Control Panel.
8. Update the provider attributes with the recommended values and click Save.
9. Click STOP next to Provider.
10. Click "Re-Deploy Provider" Button.
11. Send at least 5 AKT to the new wallet address to start the provider.
12. Click "Download Kubeconfig" and import it into Lens. Set the Namespace to "All" to see everything.

### Todos
- When changing pricing parameters, delete the configmap `akash-provider-bidscripts` from `akash-services` before re-deploying.
- Remove the static/dynamic question during the initial boot as it may confuse users.
- Show nodes in the cluster on the Dashboard with `kubectl get nodes -A -o wide`.
- Allow adding a new node to the cluster with just an IP address.
- Remove the question for adding a node to the cluster for the original IP; all add/remove operations should happen from the Dashboard only.
- Update `run-helm-k3s` to use functions so each can be called separately.
- Update the bid-engine script with the latest version.
- Add/Remove Attributes from Dashboard and default GPU, etc.


Stack

```

Copy code
     Akash Provider
           ||
     -------------
    | Helm Charts |
     -------------
           ||
     -------------
   |  Kubernetes  |
     -------------
           ||
  -----------------------
|     cloud-init         |
  -----------------------
           ||
  -------------------------
|  Ubuntu 22.04 AutoInstall |
  --------------------------

  ```