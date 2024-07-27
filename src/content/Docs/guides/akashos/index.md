---
categories: ["Guides"]
tags: ["Deployment"]
weight: 1
title: "AkashOS"
linkTitle: "AkashOS"
---

## AkashOS: Akash Provider OS - Ubuntu Server 24.04 Edition

![](/docs/assets/akashos.png)

Welcome to AkashOS, an innovative solution for those aspiring to become a provider within the Akash Network. By utilizing Autoinstall and cloud-init, AkashOS offers a seamless, unattended installation of Ubuntu Server. It autonomously establishes a Kubernetes cluster and deploys Helm charts to configure the system as an Akash Network provider.

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
What is this image best used for?
You can use this image to take over any x86 machine or virtual machine that you want to configure as a provider on the Akash Network.

Target Audience for this ISO
Hypervisor (Proxmox/VMware)
Homelab
Unraid/TrueNas
DevOps/SRE/Kubernetes Admins
Full stack developers
Installation Difficulty Level
Medium (terminal experience required)
Human Dependencies: ~30 minutes
Acquire at least 50 AKT
Add DNS records
Forward ports
Software Dependencies: ~30 minutes
Install Akash OS
Configure Pricing
Dependencies
Human Requirements
Be ready to run workloads for dWeb. Understand what you are getting into and be prepared to learn.
Docker and Kubernetes experience will greatly help you, learn all you can.
With great power comes great responsibility. Be aware of the risks and use Lens to monitor your cluster.
Report any abuse, DDoS, spam, or other issues to the Akash team.
Software Requirements
Domain name (example.com) that you own and can manage DNS records.
50 AKT to send to the new provider wallet.
Access to your firewall/router for port forwarding.
Lens - Recommended for cluster daily operations; you'll need this to interact with your new cluster.
Balena Etcher, Rufus, or Ventoy for creating bootable USB drives on Linux, Mac, PC.
Dynamic DNS update client and domain for residential IPs.
Hardware Requirements
First Node
2 CPU / 4 Threads
8 GB Memory
64 GB Disk
Additional Nodes
1 CPU
2 GB Memory
8 GB Disk
Setup Instructions
Proxmox / VirtualBox / VMware
Download Akash OS ISO.
Create VM - Attach a disk drive with the ISO.
Start the VM.
Reboot when the install is completed and detach the ISO.
Login with default username and password "akash", follow the on-screen instructions.
Once the system has rebooted, go to the Control Panel address.
Update the provider attributes with the recommended values and click Save.
Click STOP next to Provider.
Click Re-Deploy Provider Button.
Send at least 5 AKT to the new wallet address to start the provider.
Click Download Kubeconfig and import it into Lens. Set the Namespace to "All" to see everything.
Bare Metal Datacenter with IPMI/ISO Support
Download Akash OS ISO.
Upload the ISO to the datacenter ISO storage location (Vultr/HostHatch/etc) or attach the ISO to your IPMI Virtual Console Session.
Start the machine with the ISO for the boot drive (F11 may be required).
Reboot when the install is completed and detach the ISO.
Login with default username and password "akash", follow the on-screen instructions.
Once the system has rebooted, go to the Control Panel address.
Update the provider attributes with the recommended values and click Save.
Click STOP next to Provider.
Click Re-Deploy Provider Button.
Send at least 5 AKT to the new wallet address to start the provider.
Click Download Kubeconfig and import it into Lens. Set the Namespace to "All" to see everything.
USB Key
Download Akash OS ISO.
Use Balena Etcher / Rufus / Ventoy to write the ISO to a USB key.
Insert the USB key into the computer you want to make an Akash provider.
Start the machine with the USB key for the boot drive (F11 may be required).
Reboot when the install is completed and unplug the USB key.
Login with default username and password "akash", follow the on-screen instructions.
Once the system has rebooted, go to the Control Panel address.
Update the provider attributes with the recommended values and click Save.
Click STOP next to Provider.
Click Re-Deploy Provider Button.
Send at least 5 AKT to the new wallet address to start the provider.
Click Download Kubeconfig and import it into Lens. Set the Namespace to "All" to see everything.
Todos
When changing pricing parameters, delete the configmap akash-provider-bidscripts from akash-services before re-deploying.
Remove the static/dynamic question during the initial boot as it confuses the user.
Show nodes in the cluster on the Dashboard with kubectl get nodes -A -o wide.
Allow adding a new node to the cluster with just an IP address.
Remove the question for adding a node to the cluster for the original IP; all add/remove operations should happen from the Dashboard only.
Update run-helm-k3s to use functions so each can be called separately.
Update the bid-engine script with the latest version.
Add/Remove Attributes from Dashboard and default GPU, etc.
Stack
lua
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