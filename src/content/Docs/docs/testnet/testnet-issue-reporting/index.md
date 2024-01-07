---
categories: ["Testnet"]
tags: []
weight: 2
title: "Testnet Issue Reporting"
linkTitle: "Testnet Issue Reporting"
---


## Provider Log Collection

### Overview

To allow the Akash core team to investigate GPU Testnet provider issues, please collect logs via the steps covered in this guide.

Most of the time the kubectl logs command won't show the entire logs due to K8s log rotation, so please make sure to use this advanced technique to save the provider logs:

### Save akash-provider Logs

#### STEP 1 - Locate the running akash-provider pod

```
kubectl -n akash-services get pods -l app=akash-provider -o wide
```

#### STEP 2 - Locate the log directory of the akash-provider container on that

```
ssh <node>
crictl inspect $(crictl ps --name provider --state Running -q) | jq -r '.status.logPath'
```

#### STEP 3 - Archive the entire directory to the provider-logs.tar.gz file

> Make sure you remove the /0.log in the end of the logPath like so:

```
tar czf provider-logs.tar.gz /var/log/pods/akash-services_akash-provider-0_<unique-ID>/provider
```

#### STEP 4 - Upload the provider-logs.tar.gz file to the internet

```
curl -T provider-logs.tar.gz https://transfer.sh ; echo
```

This command will produce the output that looks like this:

```
https://transfer.sh/h5Op4hD54c/provider-logs.tar.gz
```

Share this link with the Akash Core Team for them to troubleshoot the issue.

#### Example from one of the real nodes of ours:

```
root@node1:~# kubectl -n akash-services get pods -l app=akash-provider -o wide
NAME               READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
akash-provider-0   1/1     Running   0          9d    10.233.90.133   node1   <none>           <none>

root@node1:~# crictl inspect $(crictl ps --name provider --state Running -q) | jq -r '.status.logPath'
/var/log/pods/akash-services_akash-provider-0_19426f5d-2d7f-4649-b956-fe4d26b1fbb8/provider/0.log

root@node1:~# tar czf provider-logs.tar.gz /var/log/pods/akash-services_akash-provider-0_19426f5d-2d7f-4649-b956-fe4d26b1fbb8/provider

root@node1:~# curl -T provider-logs.tar.gz https://transfer.sh ; echo
```