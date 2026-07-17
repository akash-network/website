---
categories: ["Providers"]
tags: ["IP Leases", "Advanced Features", "Networking"]
weight: 5
title: "IP Leases"
linkTitle: "IP Leases"
description: "Enable leased IP support on an Akash provider with MetalLB and akash-ip-operator"
---

# IP Leases — Provider Setup (MetalLB + akash-ip-operator)

This guide enables leased IP support on an Akash provider. It reflects verified behavior as of July 2026 (provider image `0.14.2`, MetalLB chart `0.14.9`, Kubernetes with kubespray/Calico) and includes a troubleshooting table with exact error strings.

IP leases are **optional**. If you do not intend to offer dedicated IPs, do not install the IP operator — nothing else in the provider stack depends on it.

---

## Compatibility warning (read first)

> **MetalLB chart 0.15+ is NOT compatible with the Akash IP operator.**
> Starting with MetalLB 0.15/0.16, controller metrics are served over **HTTPS only** (port 9120). The Akash IP operator scrapes `http://controller.metallb-system.svc.cluster.local:7472/metrics` over **plain HTTP** and cannot be configured otherwise. Installing the latest MetalLB chart results in a permanently erroring operator.
>
> **Pin the MetalLB chart to the 0.14.x line** (e.g. `--version 0.14.9`) until the IP operator supports HTTPS metrics.

## Prerequisites

- A running Akash provider (akash-provider, hostname-operator, inventory-operator healthy in `akash-services`).
- Your provider's on-chain address (`akash1...`). Retrieve it with:

  ```bash
  provider-services keys show <keyname> -a --keyring-backend file
  ```

- A block of public IPs **delivered on the same L2 segment (VLAN) as a node interface**. MetalLB L2 mode answers ARP for these IPs; if your datacenter routes the block elsewhere or the node only has private/NAT addressing, L2 mode will not work (see troubleshooting item 6).

---

## Step 1 — Install MetalLB (pinned version)

```bash
kubectl create ns metallb-system
helm repo add metallb https://metallb.github.io/metallb
helm repo update
helm install metallb metallb/metallb -n metallb-system --version 0.14.9 --wait
```

Verify:

```bash
kubectl -n metallb-system get pods
# metallb-controller-...   1/1 Running
# metallb-speaker-...      4/4 Running (one per node)
```

## Step 2 — Create the `controller` discovery service (exact shape required)

The IP operator discovers MetalLB via a **DNS SRV lookup**:

```
_monitoring._tcp.controller.metallb-system.svc.cluster.local
```

Kubernetes only creates SRV records for **named** service ports. The service must therefore be exactly: name `controller`, namespace `metallb-system`, one TCP port with `port: 7472` and `name: monitoring`, selecting the metallb-controller pods.

```bash
kubectl -n metallb-system expose deployment metallb-controller \
  --name=controller \
  --overrides='{"spec":{"ports":[{"protocol":"TCP","name":"monitoring","port":7472}]}}'
```

Verify all three properties:

```bash
kubectl -n metallb-system get svc controller -o yaml | grep -A6 'ports:'
# must show: name: monitoring, port: 7472
kubectl -n metallb-system get endpoints controller
# must show: <controller-pod-ip>:7472
```

> **Note:** This service is created by hand and is **not managed by any Helm release**. If MetalLB is ever uninstalled/reinstalled or upgraded, recreate it and re-verify the port name.

## Step 3 — Configure the IP address pool

Create `metal-lb.yml` (adjust addresses to your assigned block):

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
    - 64.31.61.235-64.31.61.238   # your public range
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: l2advertisement
  namespace: metallb-system
spec:
  ipAddressPools:
    - default
```

```bash
kubectl apply -f metal-lb.yml
kubectl -n metallb-system get ipaddresspools,l2advertisements
```

> **Note:** Uninstalling MetalLB deletes these CRs (and possibly the CRDs). Keep `metal-lb.yml` in your provider directory and reapply after any reinstall.

## Step 4 — Ensure nodes are eligible to announce

Control-plane nodes carry the label `node.kubernetes.io/exclude-from-external-load-balancers`, and **MetalLB refuses to announce from labeled nodes**. On single-node or control-plane-only clusters this silently results in zero announcements: the IP is allocated, the inventory looks healthy, but no ARP replies are ever sent and nothing is reachable.

Preferred (durable) fix — configure the speaker to ignore the label:

```bash
helm upgrade metallb metallb/metallb -n metallb-system --version 0.14.9 \
  --reuse-values \
  --set speaker.ignoreExcludeLB=true
```

Alternative — remove the label (may be re-added by kubeadm/kubespray upgrades):

```bash
kubectl label node <node> node.kubernetes.io/exclude-from-external-load-balancers-
```

## Step 5 — Install the IP operator (provider address is mandatory)

```bash
helm install akash-ip-operator akash/akash-ip-operator -n akash-services \
  --set provider_address=<your akash1... address>
```

`provider_address` is **required**. The chart installs successfully without it, but the operator pod will CrashLoop (see troubleshooting item 1).

Verify:

```bash
kubectl -n akash-services get pods | grep operator-ip
kubectl -n akash-services logs deployment/operator-ip --tail=20
```

Healthy startup logs look like:

```
INF associated provider  addr=akash1... operator=ip
INF fetching existing IP passthroughs operator=ip
INF dns discovery success addrs=[{"Target":"controller.metallb-system.svc.cluster.local.","Port":7472,...}]
INF ip address inventory available=<N> in-use=0 operator=ip
INF barrier can now be passed operator=ip
```

## Step 6 — Advertise the capability on chain

Add to your `provider.yaml`:

```yaml
ipoperator: true

attributes:
  # ... existing attributes ...
  - key: capabilities/ip-lease
    value: "true"
  - key: feat-endpoint-ip
    value: "true"
```

`ipoperator: true` enables IP-lease integration in the provider service (`AKASH_IP_OPERATOR`). Both attributes advertise IP lease support on chain so IP-requesting orders can match you.

Then upgrade the provider and update the on-chain provider record:

```bash
helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

## Step 7 — End-to-end verification

After a tenant lease with an `ip` endpoint is created:

```bash
# operator sees it
kubectl -n akash-services logs deployment/operator-ip --tail=10
# -> ip address inventory available=<N> in-use=1

# LoadBalancer service got a pool IP
kubectl get svc -A | grep LoadBalancer
# -> EXTERNAL-IP shows one of your pool IPs (not <pending>)

# MetalLB is actually ANNOUNCING (this is the step most guides omit)
kubectl -n <lease-namespace> describe svc <lb-service-name> | tail -8
# Events must include BOTH:
#   IPAllocated    ... Assigned IP ["x.x.x.x"]
#   nodeAssigned   ... announcing from node "<node>" with protocol "layer2"
```

`IPAllocated` **without** `nodeAssigned` means the IP will never be reachable — see troubleshooting item 5.

Finally, test from outside the cluster network:

```bash
nc -vz <EXTERNAL-IP> <port>
```

---

## Troubleshooting

Inspection commands used throughout:

```bash
kubectl -n akash-services logs deployment/operator-ip --tail=20 [--previous]
kubectl -n akash-services get configmap operator-ip -o yaml
kubectl -n metallb-system get svc controller -o yaml
kubectl -n metallb-system get endpoints controller
kubectl -n metallb-system get ipaddresspools,l2advertisements
kubectl -n <lease-ns> describe svc <lb-service>
tcpdump -ni any '(arp host <EXTERNAL-IP>) or (tcp port <port>)'
```

### 1. `empty address string is not allowed: provider address must valid bech32`

Pod: `operator-ip` in CrashLoopBackOff.
**Cause:** chart installed without `provider_address`; ConfigMap `operator-ip` has `provider-address: ""`.
**Fix:**

```bash
helm upgrade akash-ip-operator akash/akash-ip-operator -n akash-services \
  --set provider_address=<akash1...>
kubectl -n akash-services rollout restart deployment operator-ip
```

### 2. `dial tcp <ip>:7472: connect: connection refused`

Log: `ERR observation stopped err="Get \"http://controller.metallb-system.svc.cluster.local.:7472//metrics\": ... connection refused"`
**Cause:** nothing is listening behind the `controller` service — typically MetalLB 0.15+/0.16 where the controller listens on **9120**, not 7472. Confirm with:

```bash
kubectl -n metallb-system get pod -l app.kubernetes.io/component=controller \
  -o jsonpath='{.items[0].spec.containers[0].args}'
# ["--port=9120", ...] and containerPort named "metricshttps" = incompatible version
```

**Fix:** do not patch around it — proceed to item 3; the metrics are HTTPS and the operator cannot use them. Downgrade MetalLB.

### 3. `Client sent an HTTP request to an HTTPS server.` (status 400)

Log: `ERR checking metal lb metrics returned body="Client sent an HTTP request to an HTTPS server.\n" client=metallb operator=ip status=400`
**Cause:** MetalLB 0.15+ serves metrics HTTPS-only; there is no chart value to restore plain HTTP.
**Fix:** reinstall MetalLB pinned to 0.14.x:

```bash
helm uninstall metallb -n metallb-system
helm install metallb metallb/metallb -n metallb-system --version 0.14.9 --wait
```

Then: recreate the `controller` service (Step 2), reapply `metal-lb.yml` (Step 3), and re-verify node eligibility (Step 4). If the 0.14 controller complains about CRD fields left over from 0.16, delete the MetalLB CRDs between uninstall and reinstall (`kubectl get crds | grep metallb.io`), then reapply your pool config.

### 4. `dns discovery failed ... lookup _monitoring._TCP.controller.metallb-system.svc.cluster.local ... no such host`

**Cause:** the `controller` service's port is missing `name: monitoring`. Kubernetes creates SRV records only for named ports; the operator's autodetection depends on that SRV record.
**Fix:**

```bash
kubectl -n metallb-system patch svc controller --type merge \
  -p '{"spec":{"ports":[{"name":"monitoring","port":7472,"targetPort":7472,"protocol":"TCP"}]}}'
kubectl -n akash-services rollout restart deployment operator-ip
```

### 5. IP allocated but unreachable; ARP `who-has` arrives, no reply; service has `IPAllocated` but **no** `nodeAssigned` event

Symptoms: `kubectl describe svc` shows only `IPAllocated`; `tcpdump -ni any arp host <IP>` shows the gateway's `who-has` broadcasts reaching the node with no `is-at` reply; connections from the node itself to the external IP work, external connections time out.
**Cause:** every eligible node carries `node.kubernetes.io/exclude-from-external-load-balancers` (default on control-plane nodes), so no speaker announces the IP. Common on single-node providers.
**Fix:** Step 4 above (`speaker.ignoreExcludeLB=true`, or remove the label). Success is a `nodeAssigned: announcing from node "<node>" with protocol "layer2"` event appearing within seconds.

### 6. `no pools configured on Metal LB` / `ip address inventory available=0`

**Cause:** no IPAddressPool exists (fresh install, or CRs deleted by a MetalLB reinstall), or the L2Advertisement references a pool name that doesn't exist.
**Fix:** apply Step 3 and confirm the pool name referenced by the L2Advertisement matches `kubectl -n metallb-system get ipaddresspools` exactly.

### 7. Everything above healthy, external traffic still never arrives

If `tcpdump` shows **no ARP requests and no SYNs at all** for the external IP: the datacenter is not delivering the block to your node's L2 segment. Check with your host whether the block is (a) switched onto your VLAN (works with L2 mode), (b) routed to your primary IP (needs different handling), or (c) not provisioned/firewalled upstream. If the node has only RFC1918 addressing behind NAT, L2 mode cannot announce public IPs at all.
If SYNs arrive but no replies leave: check node firewall (`iptables-save | grep <port>`, ufw/firewalld) and `sysctl net.ipv4.conf.all.rp_filter` (strict rp_filter can drop asymmetric traffic; set to `2` on the external interface).

Note: `curl: (1) Received HTTP/0.9 when not allowed` is **not** a connectivity failure — the TCP path works and a backend answered; the workload simply isn't speaking HTTP on that port.

---

## Reinstall / upgrade checklist

Any time MetalLB is reinstalled or upgraded, re-verify all of:

1. Chart version is still 0.14.x
2. `controller` service exists with port `7472` **named `monitoring`**, endpoints populated
3. IPAddressPool + L2Advertisement reapplied (`metal-lb.yml`)
4. `speaker.ignoreExcludeLB=true` still set (or exclusion label still absent)
5. `operator-ip` logs show `dns discovery success` → `barrier can now be passed` → `available=<N>`
6. A test lease's service shows **both** `IPAllocated` and `nodeAssigned` events

---

## Next Steps

**Optional enhancements:**

- [Provider installation – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) — **Required** for all providers: cert-manager and Gateway TLS

**Resources:**

- [MetalLB Documentation](https://metallb.universe.tf/) — Official MetalLB docs
- [Provider Verification](/docs/providers/operations/provider-verification/) — Health checks and verification
- [IP Operator architecture](/docs/providers/architecture/operators/ip/) — How the operator integrates with MetalLB
