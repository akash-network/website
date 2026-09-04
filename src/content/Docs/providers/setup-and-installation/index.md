---
categories: ["Providers"]
tags: ["Setup", "Installation", "Configuration"]
weight: 2
title: "Provider Setup & Installation"
linkTitle: "Setup & Installation"
---

**Choose your preferred method to set up an Akash provider.**

There are three ways to become an Akash provider, each suited for different use cases and skill levels.

---

## Setup Methods

### 1. [Provider Playbook](/docs/providers/setup-and-installation/provider-playbook) (Recommended)

**Automated setup using Ansible playbooks**

**Best for:** Most users  
 **Time:** ~1 hour  
 **Skill level:** Intermediate

**Features:**

- Build with Kubespray or K3s, or use an existing Kubernetes cluster
- Guided SSH, network, location, wallet, hardware, GPU, and storage configuration
- Install only selected components; Kubespray is downloaded only when selected
- Generate a protected inventory without deploying by using configuration-only mode

**Choose this if:** You want a reliable, repeatable setup process with automation.

---

### 2. [Kubespray](/docs/providers/setup-and-installation/kubespray) (Advanced)

**Manual setup with Kubespray and Helm for complete control**

**Best for:** Advanced users, custom configurations  
 **Time:** 1-2 hours  
 **Skill level:** Advanced

**Features:**

- Full control over every aspect
- Maximum customization
- Production-grade setup with Kubernetes 1.35.4
- Best for large deployments

**Includes:**

- Kubernetes cluster setup with Kubespray 2.31.0
- Provider installation with Helm
- GPU support configuration
- Persistent storage setup
- IP leases enablement

**Choose this if:** You need complete control and have Kubernetes expertise.

---

### 3. [Provider Console](/docs/providers/setup-and-installation/provider-console) (No K8s Experience Required)

**Web-based setup with visual interface**

**Best for:** Users with no Kubernetes experience  
 **Time:** 15-30 minutes  
 **Skill level:** Beginner

**Features:**

- No command line required
- No Kubernetes knowledge needed
- Managed Kubernetes setup
- Visual setup wizard
- Real-time monitoring

**Choose this if:** You have no Kubernetes experience and want the easiest way to get started.

---

## Comparison

| Feature            | Provider Playbook | Kubespray      | Provider Console |
| ------------------ | ----------------- | -------------- | ---------------- |
| **Ease of Use**    | Guided            | Manual         | Managed          |
| **Setup Time**     | ~1 hour           | 1-2 hours      | 15-30 minutes    |
| **Customization**  | High              | Maximum        | Limited          |
| **Skill Required** | Medium            | High           | Low              |
| **Best For**       | Most users        | Advanced users | Beginners        |
| **CLI Required**   | Yes               | Yes            | No               |
| **Automation**     | High              | Low            | High             |

---

## Which Method Should You Choose?

### Choose Provider Playbook if:

- You want automation but flexibility
- You have basic Ansible knowledge
- You want a standardized deployment
- You're comfortable with command line

### Choose Kubespray if:

- You need complete control
- You have Kubernetes expertise
- You need custom configurations
- You're building a large provider

### Choose Provider Console if:

- You're new to providers
- You want to test quickly
- You prefer visual interfaces
- You want the easiest path

---

## Not Sure?

Choose the **[Provider Playbook](/docs/providers/setup-and-installation/provider-playbook)** for a guided, self-managed installation. Choose **[Provider Console](/docs/providers/setup-and-installation/provider-console)** when you prefer a managed, browser-based path.

---

**Ready to choose?** Select your preferred method above!
