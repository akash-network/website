---
title: "How To Access Chia’s Bladebit Disk on Akash Network"
description: Chia has launched the beta of their Bladebit Disk plotting software, which takes the high performance of the original Bladebit and adds flexibility to support plotting across a wide range of systems. With Bladebit Disk, a Chia user has greater flexibility to create plots according to their time and cost preference.

pubDate: "2022-09-08"
draft: false

categories:
  - Developers
tags:
  - Developers
contributors:
  - Zach Horn

bannerImage: ./banner-image.png
---
Chia has launched the beta of their Bladebit Disk plotting software, which takes the high performance of the original Bladebit and adds flexibility to support plotting across a wide range of systems. With Bladebit Disk, a Chia user has greater flexibility to create plots according to their time and cost preference.

Chia currently has three software options for plotting: MadMax, Bladebit, and Bladebit Disk. MadMax optimizes the original Chia reference plotting software while maintaining similar performance. Bladebit has very high system requirements (416GB of DRAM), making it suited to high-performance systems or those with access to virtual compute environments. With the addition of Bladebit Disk, users can create plots with more flexible system requirements. 

Bladebit Disk is compatible with most home computing setups but also scales exceptionally well in virtualized Kubernetes environments. This makes Bladebit Disk the best choice for those looking to create Chia plots from their home system—and especially those creating plots via Akash Network.

How much can Akash providers earn from Bladebit Disk?
-----------------------------------------------------

Chia plotting on Akash Network is a very profitable workload for Akash providers. This is due to the high demand for Chia plots and the flexibility of using Akash for Plotting-as-a-Service. 

Currently, providers can earn between $200-350/month with a $0.15/plot cost on modern hardware (defined as hardware produced within the last three years).

As a reference for Bladebit and MadMax pricing, the chart below is from our Summer Sale—which offered Chia plots for $0.10/plot.

![](https://www.datocms-assets.com/45776/1662672470-screen-shot-2022-09-08-at-5-27-30-pm.png)

How do Akash providers upgrade to support Bladebit Disk?
--------------------------------------------------------

As a provider, becoming compatible with Bladebit Disk is as simple as upgrading your hardware. Below are the ideal requirements for running Bladebit Disk:

*   24 CPUs
    
*   128 GB DRAM 
    
*   1TB Ephemeral Storage (NVMe or RAID SSDs)
    

If any providers have questions about upgrading their hardware, or about Bladebit Disk in general—please reach out through the [Akash Network Community Discord](https://discord.gg/RAJSe4a7JG).

How to run Bladebit Disk on Akash
---------------------------------

Anyone who would like to run Bladebit Disk today can do so using the steps below:

1.  Launch [**Cloudmos**](http://cloudmos.io/) (formerly Akashlytics)
    
2.  Navigate to **Templates**
    
3.  Then **Mining**
    
4.  Run **Bladebit Disk**
    

Akash is a fast and flexible way to run any application
-------------------------------------------------------

Bladebit Disk was live on Akash Network only eight hours after its launch. There are only a few simple steps to bring any application to the network. Create a Docker file, publish it to our Awesome Akash repository, and create a pull request. If the pull request is accepted into the main branch, it will be available for providers and through [Cloudmos](http://cloudmos.io/) (formerly Akashlytics). The speed and efficiency of this process are how Akash was able to be the first to run Bladebit Disk.

This entire process is seamless and is available to anyone who would like to make a pull request to our [Awesome Akash](https://github.com/ovrclk/awesome-akash) repository. 

This simple process showcases how seamless it is to make new software available to everyone on Akash Network. Anyone can publish any application. Akash is fast and flexible but also robust and distributed—a powerful combination for a distributed network.