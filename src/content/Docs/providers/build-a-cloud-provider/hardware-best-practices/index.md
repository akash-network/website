---
categories: ["Providers"]
tags: ["Akash Provider", "Hardware", "Best Practices"]
weight: 4
title: "Hardware Best Practices"
linkTitle: "Hardware Best Practices"
description: "Guidelines for hardware requirements and best practices when setting up an Akash provider"
--- 

# Hardware Best Practices

This guide outlines the hardware requirements and best practices for setting up an Akash provider.

## Table of Contents

- [System Requirements](#system-requirements)
  - [Operating System](#operating-system)
  - [CPU Architecture](#cpu-architecture)
  - [Hardware Specifications](#hardware-specifications)
    - [Control Plane Node Requirements](#control-plane-node-requirements)
    - [Worker Node Requirements](#worker-node-requirements)
- [GPU Requirements](#gpu-requirements)
  - [Important Considerations](#important-considerations)
  - [Supported GPU Types](#supported-gpu-types)
- [Persistent Storage Guidelines](#persistent-storage-guidelines)
- [Network Requirements](#network-requirements)
  - [External Network Access](#external-network-access)
  - [Firewall Rules](#firewall-rules)
  - [Internal Network Requirements](#internal-network-requirements)
    - [Network Topology](#network-topology)
    - [Network Configuration](#network-configuration)
  - [Network Performance](#network-performance)
  - [Security](#security)
- [System Configuration](#system-configuration)
  - [DNS Configuration](#dns-configuration)

## System Requirements

### Operating System
- Ubuntu 24.04 LTS Server is the recommended operating system for all nodes
- Ensure all nodes are fully updated with the latest security patches

### CPU Architecture
- Only x86_64 processors are officially supported
- ARM processors are not currently supported
- This requirement applies to all nodes in the cluster

### Hardware Specifications

#### Control Plane Node Requirements
- Minimum Requirements (Per Node)
  - CPU: 2 cores
  - RAM: 4GB
  - Storage: 30GB
- Recommended Specifications (Per Node)
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 40GB

#### Worker Node Requirements
- Minimum Requirements (Per Node)
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 100GB
- Important Considerations
  - CPU is typically the largest resource bottleneck
  - Reserve approximately 2 CPU cores for Kubernetes system components
  - The more resources available, the more concurrent deployments can be supported
  - Example: A node with 8 CPU, 100GB RAM, and 2TB disk can host approximately 6 deployments (8 CPU - 2 reserved = 6 available)

## GPU Requirements

### Important Considerations
- Each node in the cluster should only support one type of GPU
- Mixing different GPU models on the same node is not recommended
- Ensure proper GPU drivers are installed and configured on all nodes
- GPU requirements are per node

### Supported GPU Types
- NVIDIA GPUs only.

## Persistent Storage Guidelines
- All persistent storage must be of the same type across the entire cluster
- SSD or NVMe storage is required for optimal performance
- Do not mix different storage types (e.g., SSD and HDD) within the cluster
- Recommended minimum storage size: 1TB per node
- Storage requirements are per node

## Network Requirements

### External Network Access
- Outbound internet access required
- Must be reachable from the internet
- External access requirements:
  - Option 1: At least one Static Public IP must be available to forward to the cluster
  - Option 2: Use a Dynamic DNS (DDNS) service if static IP is not available

### Firewall Rules
- Required open ports:
  - 8443/tcp - for manifest uploads
  - 80/tcp - for web app deployments
  - 443/tcp - for web app deployments
  - 30000-32767/tcp - for Kubernetes node port range
  - 30000-32767/udp - for Kubernetes node port range

### Internal Network Requirements

#### Network Topology
- All nodes must be on the same internal network
- Use a dedicated network for cluster communication
- Ensure low latency (<1ms) between all nodes
- Implement proper network segmentation

#### Network Configuration
- Static IP addressing required for all nodes
- Configure proper DNS resolution within the cluster
- Disable search domains to prevent DNS issues
- Disable IPv6 Router Advertisement (RA)

### Network Performance
- Minimum 1Gbps internal network connection per node
- Recommended 10Gbps for high-performance deployments
- Ensure consistent network performance across all nodes
- Monitor network latency and packet loss

### Security
- Implement proper network segmentation
- Configure firewall rules between nodes
- Use secure network protocols
- Implement proper access controls

## System Configuration

### DNS Configuration
- Configure proper DNS resolution
- Disable search domains
- Set up proper upstream DNS servers
- Ensure proper domain name configuration for provider services
