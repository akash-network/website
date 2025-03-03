---
aep: 15
title: "Persistent Storage"
author: Greg Osuri (@gosuri)
status: Final
type: Standard
category: Core
created: 2021-04-16
completed: 2021-04-23
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/19
roadmap: major
---

## Motivation

By default, Akash offers temporary storage that is wiped clean upon worload restarts. To maintain data integrity across reboots, we propose enabling persistent storage functionality, which ensures that information written to the disk remains intact.

## Summary

Akash's persistent storage feature ensures data continuity throughout a lease's duration. Deployments can restart or relocate within a provider while maintaining access to stored data, as the provider assigns a host-mounted volume to the deployment.

This capability mirrors storage solutions in public cloud environments, significantly enhancing various deployment scenarios. Future updates may explore data persistence across multiple leases, further expanding functionality. For more information, refer to the documentation.

Moreover, we suggest increasing resource limits for each deployment. Services will be able to utilize up to 256 CPUs individually, with a total of 512 CPUs per deployment, 32 TB of storage, and 512 GB of memory. Persistent storage is essential for many workloads, including large-scale blockchain node hosting and applications relying on databases.

## Announcements

* [Akash Network Unlocks Persistent Storage Through Mainnet 3 Upgrade](https://akash.network/blog/akash-network-unlocks-persistent-storage-through-mainnet-3-upgrade/)

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).