---
categories: ["Providers"]
tags: ["Akash Provider", "gVisor", "Issue Resolution"]
weight: 10
title: "gVisor Issue Resolution"
linkTitle: "gVisor Issue Resolution"
---


## Overview of Issue

If you are using a newer systemd then your container will get stuck in ContainerCreating state on your provider with gVisor enabled.

### Indication of Error

You may see the following Events in the logs upon use of _kubectl describe pod_

```
 Warning  FailedCreatePodSandBox  2m57s (x25 over 3m21s)  kubelet
Failed to create pod sandbox: rpc error: code = Unknown desc = failed to
create containerd task: failed to create shim: OCI runtime create failed:
creating container: cgroups V2 is not yet supported. Enable cgroups V1 and\
retry: unknown
```

```
 Warning  FailedCreatePodSandBox  0s (x13 over 12s)  kubelet  Failed to
create pod sandbox: rpc error: code = Unknown desc = failed to create 
containerd task: failed to create shim: OCI runtime create failed: creating
container: write 
/sys/fs/cgroup/kubepods/besteffort/pod7a38b06d-4c96-49ff-bc4a-3d8288892b3b/cgroup.procs: device or resource busy: unknown
```

### Cause of Error

The new systemd 247.2-2 has switched to a new "unified" cgroup hierarchy (i.e. cgroup v2) which is not supported by gVisor.

Ubuntu version 21.10 is affected.

### Support References

* systemd switches to the "unified" cgroup hierarchy [documentation](https://salsa.debian.org/systemd-team/systemd/-/commit/170fb124a32884bd9975ee4ea9e1ffbbc2ee26b4)
* systemd-cgroup support in gVisor [documentation](https://github.com/google/gvisor/issues/193)

## Workaround

Apply the following on each Kubernetes node in order to switch back to cgroup v1

```
echo 'GRUB_CMDLINE_LINUX=systemd.unified_cgroup_hierarchy=false' > /etc/default/grub.d/cgroup.cfg
update-grub
reboot
```