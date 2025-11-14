---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Hardware and Software Recommendations"
linkTitle: "Hardware and Software Recommendations"
---

## Provider Software

## Kubernetes Cluster Options

### **Easy**

[**Akash Provider Console (previously known as Praetor App)**](https://provider-console.akash.network/) **(Web based setup/Keplr wallet)**

Web based setup / Requires [Keplr](https://www.keplr.app/) wallet and uses SSH to install k3s

[**HandyHost**](https://handyhost.computer/) **(ISO method)**

[OS Based setup](https://github.com/HandyOSS/HandyHost/releases) / take over machine - great for old laptops or unused machines around the house

### **Medium Difficulty**

Requires terminal skills and general knowledge of dev-ops. &#x20;

#### [k3s](https://k3s.io/) + [Helm Charts](https://github.com/akash-network/helm-charts)

The most lightweight option for Kubernetes with the lowest minimum specifications.

#### [microk8s](https://microk8s.io/) + [Helm Charts](https://github.com/akash-network/helm-charts)

Built into Ubuntu by default - microk8s requires snapd is a great way to easily manage a large cluster

#### [Rancher](https://rancher.com/) + [Helm Charts](https://github.com/akash-network/helm-charts)

Rancher uses Docker to create a Kubernetes cluster on the master and worker nodes

### **Advanced**

#### [Kubespray](https://github.com/kubernetes-sigs/kubespray) + [Helm Charts](https://github.com/akash-network/helm-charts)

Configure bare-metal hosts on-prem or in datacenters to create a Kubernetes cluster using etcd.

### **Additional Paths**

#### [k3sup](https://github.com/alexellis/k3sup) + [Helm Charts](https://github.com/akash-network/helm-charts)

Easily create a Kubernetes cluster with a simple CLI.&#x20;

#### akashOS

Coming Soon!

### Cluster Management Tools

Use tools like Lens to easily manage your Kubernetes cluster.

[Lens](https://k8slens.dev)\
[Rancher](https://rancher.com)\
[Portainer](https://www.portainer.io)

## Provider Hardware

### General Info

**Adding compute to the Akash network has never been easier! Here are some of the recommended builds to get you started. You should plan to pair at least 1Gb of memory for each thread. We recommend providers always have unmetered / unlimited bandwidth to avoid any unexpected fees.**

**NOTE** Availablity of hardware entirely depends on manufacturers and stockists.


## Build Guides

### NUC Prebuilds

If you don't have much room for additional hardware, NUC's are a great way to jump into the Akash ecosystem! These systems from MinisForum have the latest generation AMD processors.

[MinisForum HM90](https://store.minisforum.com/collections/all-product/products/hm90) | $699 | AMD 5900HX | 8 Core / 16 Thread | 32GB DDR4 | 512GB NVMe SSD

![](https://m.media-amazon.com/images/I/61Uaf5uhwcL._AC_SY355_.jpg)

[MinisForum HX90](https://store.minisforum.com/products/hx90) | $839 | AMD 5900HX | 8 Core / 16 Thread | 32GB DDR4 | 512GB NVMe SSD

![](https://m.media-amazon.com/images/I/61X0pzeW63L._AC_SS450_.jpg)

### $600 : Budget Desktop Build - New

Recommended System Requirements

CPU: 6 core / 12 threads\
Memory : 32Gb\
Disk: 1Tb

![](<../../../assets/image (14).png>)

[PCPartPicker Part List](https://pcpartpicker.com/list/WsvYW4)

| Type             | Item                                                                                                                                                                                             | Price            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **CPU**          | [AMD Ryzen 5 5600G 3.9 GHz 6-Core Processor](https://pcpartpicker.com/product/sYmmP6/amd-ryzen-5-5600g-39-ghz-6-core-processor-100-100000252box)                                                 | $166.99 @ Amazon |
| **Motherboard**  | [ASRock A520M Pro4 Micro ATX AM4 Motherboard](https://pcpartpicker.com/product/2pwkcf/asrock-a520m-pro4-micro-atx-am4-motherboard-a520m-pro4)                                                    | $74.99 @ Newegg  |
| **Memory**       | [G.Skill Ripjaws V 32 GB (2 x 16 GB) DDR4-3200 CL16 Memory](https://pcpartpicker.com/product/kXbkcf/gskill-memory-f43200c16d32gvk)                                                               | $97.79 @ Newegg  |
| **Storage**      | [Western Digital Black SN750 SE 1 TB M.2-2280 NVME Solid State Drive](https://pcpartpicker.com/product/P8Z9TW/western-digital-wd_black-sn750-se-1-tb-m2-2280-nvme-solid-state-drive-wds100t1b0e) | $94.99 @ Amazon  |
| **Case**         | [Lian Li LANCOOL 205M MicroATX Mid Tower Case](https://pcpartpicker.com/product/Dq2bt6/lian-li-lancool-205m-microatx-mid-tower-case-lancool-205m-black)                                          | $85.99 @ Amazon  |
| **Power Supply** | [SeaSonic S12III 650 W 80+ Bronze Certified ATX Power Supply](https://pcpartpicker.com/product/Rxprxr/seasonic-s12iii-650-w-80-bronze-certified-atx-power-supply-ssr-650gb3)                     | $68.98 @ Amazon  |
| **Total**        | Generated by [PCPartPicker](https://pcpartpicker.com) 2022-07-08 16:32 EDT-0400                                                                                                                  | **$589.73**      |

### $600 : Budget Server Build - **Used**

Recommended System Requirements

CPU: 10 core / 20 threads\
Memory : 32Gb\
Disk: 1Tb

![](../../../assets/image.png)

Configure and Buy: Dell R630 | Xeon 2650L v3 | 128Gb DDD4 | 2.5" SSD/HD SAS

[TheServerStore](https://www.theserverstore.com/dell-poweredge-r630-8x-sff-1u-server.html)\
[TechMikeNY](https://techmikeny.com/products/dell-poweredge-r630-10-bay-2-5-1u-server?_pos=1&_sid=fda91727d&_ss=r)\
\
Best CPU Choices:\
Intel Xeon 2650L v4 1.8Ghz 14-Core/28 Thread\
Intel Xeon 2695 v4 2.1Ghz 18-Core/36 Thread\
Intel Xeon 2696/2699 v4 2.2Ghz 22-Core/44 Thread

### **$2000 : Insider Desktop Build - New**

Recommended System Requirements

CPU: 16 core / 32 threads\
Memory : 32Gb\
Disk: 1Tb&#x20;

![](<../../../assets/image (14).png>)

[PCPartPicker Part List](https://pcpartpicker.com/list/mgpRFg)

| Type             | Item                                                                                                                                                                                                                     | Price            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **CPU**          | [AMD Ryzen 9 5950X 3.4 GHz 16-Core Processor](https://pcpartpicker.com/product/Qk2bt6/amd-ryzen-9-5950x-34-ghz-16-core-processor-100-100000059wof)                                                                       | $548.89 @ Amazon |
| **CPU Cooler**   | [Noctua NH-D15 82.5 CFM CPU Cooler](https://pcpartpicker.com/product/4vzv6h/noctua-nh-d15-825-cfm-cpu-cooler-nh-d15)                                                                                                     | $99.95 @ Amazon  |
| **Motherboard**  | [ASRock A520M Pro4 Micro ATX AM4 Motherboard](https://pcpartpicker.com/product/2pwkcf/asrock-a520m-pro4-micro-atx-am4-motherboard-a520m-pro4)                                                                            | $74.99 @ Newegg  |
| **Memory**       | [G.Skill Ripjaws V 64 GB (2 x 32 GB) DDR4-2666 CL18 Memory](https://pcpartpicker.com/product/VqbCmG/gskill-ripjaws-v-64-gb-2-x-32-gb-ddr4-2666-memory-f4-2666c18d-64gvk)                                                 | $184.99 @ Amazon |
| **Storage**      | [Western Digital Black SN750 SE 250 GB M.2-2280 NVME Solid State Drive](https://pcpartpicker.com/product/JphFf7/western-digital-wd_black-sn750-se-250-gb-m2-2280-nvme-solid-state-drive-wds250g1b0e)                     | $49.99 @ Amazon  |
| **Storage**      | [Western Digital Red Pro 18 TB 3.5" 7200RPM Internal Hard Drive](https://pcpartpicker.com/product/R4RgXL/western-digital-red-pro-18-tb-35-7200rpm-internal-hard-drive-wd181kfgx)                                         | $398.39 @ Amazon |
| **Case**         | [Lian Li LANCOOL 215 ATX Mid Tower Case](https://pcpartpicker.com/product/YCH8TW/lian-li-lancool-215-atx-mid-tower-case-lancool-215-black)                                                                               | $89.99 @ B\&H    |
| **Power Supply** | [SeaSonic FOCUS Plus 750 Gold 750 W 80+ Gold Certified Fully Modular ATX Power Supply](https://pcpartpicker.com/product/64cMnQ/seasonic-focus-plus-gold-750w-80-gold-certified-fully-modular-atx-power-supply-ssr-750fx) | $139.00 @ B\&H   |
| **Total**        | Generated by [PCPartPicker](https://pcpartpicker.com) 2022-07-08 16:34 EDT-0400                                                                                                                                          | **$1586.19**     |

### $2000 : Insider Server Build - Used

Recommended System Requirements

CPU: 20 Core / 40 Thread Intel Xeon\
Memory : 128GB DDR4\
Disk: 4TB SSD/SAS

![](<../../../assets/image (3).png>)

Dell R720 | 128Gb DDD4 | 3.5" SSD/HD SAS&#x20;

Best CPU Choices:\
Intel Xeon 2650L v4 1.8Ghz 14-Core/28 Thread\
Intel Xeon 2695 v4 2.1Ghz 18-Core/36 Thread\
Intel Xeon 2696/2699 v4 2.2Ghz 22-Core/44 Thread

### Prosumer Desktop Build

Recommended System Requirements

24 Core / 48 Thread AMD Epyc/Threadripper\
128GB DDR4\
4TB NVMe / 2x 18TB HDD

![](<../../../assets/image (13).png>)

[PCPartPicker Part List](https://pcpartpicker.com/list/jJBbC6)

| Type             | Item                                                                                                                                                                                                                                 | Price             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| **CPU**          | [AMD Threadripper 2970WX 3 GHz 24-Core Processor](https://pcpartpicker.com/product/LRXnTW/amd-threadripper-2970wx-3-ghz-24-core-processor-yd297xazafwof)                                                                             | $1089.99 @ Amazon |
| **CPU Cooler**   | [Noctua NH-U14S TR4-SP3 82.52 CFM CPU Cooler](https://pcpartpicker.com/product/nCNypg/noctua-nh-u14s-tr4-sp3-1402-cfm-cpu-cooler-nh-u14s-tr4-sp3)                                                                                    | $89.95 @ Amazon   |
| **Motherboard**  | [ASRock X399 Taichi ATX sTR4 Motherboard](https://pcpartpicker.com/product/kjmxFT/asrock-x399-taichi-atx-tr4-motherboard-x399-taichi)                                                                                                | $348.99 @ Newegg  |
| **Memory**       | [Corsair Vengeance LPX 128 GB (8 x 16 GB) DDR4-2666 CL15 Memory](https://pcpartpicker.com/product/hgbkcf/corsair-memory-cmk128gx4m8a2666c16)                                                                                         | $469.99 @ Newegg  |
| **Storage**      | [Crucial P3 4 TB M.2-2280 NVME Solid State Drive](https://pcpartpicker.com/product/JhzhP6/crucial-p3-4-tb-m2-2280-nvme-solid-state-drive-ct4000p3ssd8)                                                                               | $349.99 @ B\&H    |
| **Storage**      | [Seagate EXOS Enterprise X18 18 TB 3.5" 7200RPM Internal Hard Drive](https://pcpartpicker.com/product/xtvqqs/seagate-exos-enterprise-x18-18-tb-35-7200rpm-internal-hard-drive-st18000nm000j)                                         | $281.99 @ Amazon  |
| **Video Card**   | [EVGA GeForce RTX 3090 24 GB FTW3 ULTRA GAMING Video Card](https://pcpartpicker.com/product/PG848d/evga-geforce-rtx-3090-24-gb-ftw3-ultra-gaming-video-card-24g-p5-3987-kr)                                                          | $1349.99 @ Amazon |
| **Case**         | [Lian Li LANCOOL 215 ATX Mid Tower Case](https://pcpartpicker.com/product/YCH8TW/lian-li-lancool-215-atx-mid-tower-case-lancool-215-black)                                                                                           | $89.99 @ B\&H     |
| **Power Supply** | [SeaSonic FOCUS Plus Platinum 850 W 80+ Platinum Certified Fully Modular ATX Power Supply](https://pcpartpicker.com/product/P638TW/seasonic-focus-plus-platinum-850w-80-platinum-certified-fully-modular-atx-power-supply-ssr-850px) | $169.99 @ B\&H    |
| **Total**        | Generated by [PCPartPicker](https://pcpartpicker.com) 2022-07-09 11:30 EDT-0400                                                                                                                                                      | **$4240.87**      |

### Prosumer Server Build

Recommended System Requirements

24 Core / 48 Thread AMD Epyc\
128GB DDR4\
4TB SSD / 2TB NVMe / 8TB HD SAS

![](<../../../assets/image (17).png>)

[AsRock Rack ROMED6U-2L2T](https://www.asrockrack.com/general/productdetail.asp?Model=ROMED6U-2L2T#Specifications)

[CPU Support List](https://www.asrockrack.com/general/productdetail.asp?Model=ROMED6U-2L2T#CPU)

Buy on [Newegg](https://www.newegg.com/asrock-rack-romed6u-2l2t-amd-epyc-7002-and-7001-series-processor/p/N82E16813140046?Item=N82E16813140046&Description=asrock%20rack&cm_re=asrock_rack-_-13-140-046-_-Product)

### Datacenter Server Build - New

Recommended System Requirements

32 Core / 64 Thread\
512GB DDR4\
4TB SSD / 2TB NVMe / 8TB HD SAS

![](<../../../assets/image (9).png>)

Buy on [Newegg](https://www.newegg.com/supermicro-mbd-h11dsi-n702-ma015-o-dual-amd-epyc-7000-series/p/N82E16813183691)
