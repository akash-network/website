---
categories: ["For Providers"]
tags: ["Operations", "Updates", "Maintenance"]
weight: 2
title: "Updates & Maintenance"
linkTitle: "Updates & Maintenance"
description: "Keep your provider updated and maintained"
---

This guide covers routine maintenance procedures, certificate management, and advanced operational tasks for Akash providers.

## Stop Provider Services for Maintenance

**Critical:** Always stop the `akash-provider` service before performing maintenance on your Kubernetes cluster. Failure to do so may result in lost leases.

See [GitHub Issue #64](https://github.com/akash-network/provider/issues/64) for details.

### Stop the Provider

```bash
kubectl -n akash-services get statefulsets
kubectl -n akash-services scale statefulsets akash-provider --replicas=0
```

### Verify Provider Stopped

```bash
kubectl -n akash-services get statefulsets
kubectl -n akash-services get pods -l app=akash-provider
```

Expected: No `akash-provider` pods running.

### Restart Provider After Maintenance

```bash
kubectl -n akash-services scale statefulsets akash-provider --replicas=1
```

## Kubernetes Certificate Rotation

**References:**
- [Kubernetes Certificate Management](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/)
- [Manual Certificate Renewal Guide](https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes)

When Kubernetes certificates expire, cluster access will fail with `Unauthorized` errors. Rotate certificates proactively to avoid downtime.

### Check Certificate Expiration

```bash
kubeadm certs check-expiration
```

#### Example Output

```
CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Feb 20, 2026 17:12 UTC   364d            ca                      no
apiserver                  Feb 20, 2026 17:12 UTC   364d            ca                      no
apiserver-etcd-client      Feb 20, 2026 17:12 UTC   364d            etcd-ca                 no
apiserver-kubelet-client   Feb 20, 2026 17:12 UTC   364d            ca                      no
controller-manager.conf    Feb 20, 2026 17:12 UTC   364d            ca                      no
etcd-healthcheck-client    Feb 20, 2026 17:12 UTC   364d            etcd-ca                 no
etcd-peer                  Feb 20, 2026 17:12 UTC   364d            etcd-ca                 no
etcd-server                Feb 20, 2026 17:12 UTC   364d            etcd-ca                 no
front-proxy-client         Feb 20, 2026 17:12 UTC   364d            front-proxy-ca          no
scheduler.conf             Feb 20, 2026 17:12 UTC   364d            ca                      no
```

### Backup etcd Database

**Critical:** Always backup etcd before rotating certificates. The etcd database contains your entire cluster state.

```bash
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl snapshot save node1.etcd.backup
```

### Backup Current Certificates (Optional)

```bash
tar czf etc_kubernetes_ssl_etcd_bkp.tar.gz /etc/kubernetes /etc/ssl/etcd
```

### Renew Certificates

**HA Clusters:** For HA Kubernetes clusters with multiple control plane nodes:
1. Perform these steps **on one control plane node at a time**
2. Start with the primary control plane node
3. Verify cluster health before proceeding to the next node
4. This ensures the cluster remains operational during renewal

To check if you have HA:
```bash
kubectl get nodes -l node-role.kubernetes.io/control-plane
```

#### Step 1: Renew All Certificates

```bash
kubeadm certs renew all
```

#### Step 2: Update kubeconfig

```bash
mv -vi /root/.kube/config /root/.kube/config.old
cp -pi /etc/kubernetes/admin.conf /root/.kube/config
```

#### Step 3: Restart Control Plane Components

Restart in this specific order:

```bash
kubectl -n kube-system delete pods -l component=kube-apiserver
kubectl -n kube-system delete pods -l component=kube-scheduler
kubectl -n kube-system delete pods -l component=kube-controller-manager
systemctl restart etcd.service
```

#### Step 4: Verify Renewal

```bash
kubeadm certs check-expiration
```

All certificates should show ~365 days remaining.

#### Step 5: Repeat for Other Control Plane Nodes

If you have a HA cluster, repeat Steps 1-4 on each additional control plane node, **one at a time**.

---

## Related Resources

- [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation)
- [Kubernetes Setup](/docs/for-providers/setup-and-installation/kubespray/kubernetes-setup)
- [Provider Verification](/docs/for-providers/operations/provider-verification)

