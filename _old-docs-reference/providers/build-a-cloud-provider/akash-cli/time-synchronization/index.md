---
categories: ["Providers"]
tags: ["Akash Provider", "Time", "Synchronization"]
weight: 12
title: "Time Synchronization"
linkTitle: "Time Synchronization"
---

To ensure your Akash node maintains accurate time synchronization, we recommend using `chrony` over `systemd-timesyncd`. Chrony is a versatile implementation of the Network Time Protocol (NTP) and ensures better time accuracy and reliability.

The guide is broken down into the following sections:

- [Installation](#installation)

## Installation

Chrony is straightforward to install and configure. Run the following command to install chrony:

```bash
apt -y install chrony
```

Chrony automatically disables the systemd-timesyncd service upon installation, so no additional configuration is needed.

**Rationale**

We found that some servers were out of sync, and all attempts to fix `systemd-timesyncd` were unsuccessful. Chrony, used in various production environments, ensures perfect time synchronization.
