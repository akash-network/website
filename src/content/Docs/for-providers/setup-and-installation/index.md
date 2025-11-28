---
categories: ["For Providers"]
tags: ["Setup", "Installation", "Configuration"]
weight: 2
title: "Provider Setup & Installation"
linkTitle: "Setup & Installation"
---

**Choose your preferred method to set up an Akash provider.**

There are three ways to become an Akash provider, each suited for different use cases and skill levels.

---

## Setup Methods

### 1. [Provider Playbook](/docs/for-providers/setup-and-installation/provider-playbook) (Recommended)

**Automated setup using Ansible playbooks**

✅ **Best for:** Most users  
⏱️ **Time:** ~1 hour  
🎯 **Skill level:** Intermediate

**Features:**
- Automated Kubernetes installation
- Standardized deployment
- Infrastructure as Code
- Less room for error

**Choose this if:** You want a reliable, repeatable setup process with automation.

---

### 2. [Kubespray](/docs/for-providers/setup-and-installation/kubespray) (Advanced)

**Manual setup with Kubespray and Helm for complete control**

✅ **Best for:** Advanced users, custom configurations  
⏱️ **Time:** 1-2 hours  
🎯 **Skill level:** Advanced

**Features:**
- Full control over every aspect
- Maximum customization
- Production-grade setup with Kubernetes 1.33.5
- Best for large deployments

**Includes:**
- Kubernetes cluster setup with Kubespray 2.29
- Provider installation with Helm
- GPU support configuration
- Persistent storage setup
- IP leases enablement

**Choose this if:** You need complete control and have Kubernetes expertise.

---

### 3. [Provider Console](/docs/for-providers/setup-and-installation/provider-console) (No K8s Experience Required)

**Web-based setup with visual interface**

✅ **Best for:** Users with no Kubernetes experience  
⏱️ **Time:** 15-30 minutes  
🎯 **Skill level:** Beginner

**Features:**
- No command line required
- No Kubernetes knowledge needed
- Managed Kubernetes setup
- Visual setup wizard
- Real-time monitoring

**Choose this if:** You have no Kubernetes experience and want the easiest way to get started.

---

## Comparison

| Feature | Provider Playbook | Kubespray | Provider Console |
|---------|------------------|-----------|------------------|
| **Ease of Use** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup Time** | 2-4 hrs | 4-8 hrs | 1-2 hrs |
| **Customization** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Skill Required** | Medium | High | Low |
| **Best For** | Most users | Advanced users | Beginners |
| **CLI Required** | Yes | Yes | No |
| **Automation** | High | Low | High |

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

Start with **[Provider Console](/docs/for-providers/setup-and-installation/provider-console)** to test the waters, then migrate to **Provider Playbook** or **Kubespray** for production deployments.

---

**Ready to choose?** Select your preferred method above!

