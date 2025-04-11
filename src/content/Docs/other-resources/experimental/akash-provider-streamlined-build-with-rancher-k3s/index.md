---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Akash Provider Streamlined Build with Rancher K3s"
linkTitle: "Akash Provider Streamlined Build with Rancher K3s"
---

An Akash Provider leases compute to users launching new deployments. Follow the steps in this guide to build your own provider using a streamlined Kubernetes install process.

This guide uses a Rancher K3s to build a single control plane and worker node "all in one" Kubernetes cluster with little effort. The Kubernetes cluster is then utilized for the Akash Provider install and configuration steps.

Overview and links to the steps involved in Akash Provider Build using K3s:

- [Install K3s and Initial Cluster Config](#step-1---install-k3s-and-initial-cluster-config)
- [Install the Akash CLI for Provider Use](#step-2---install-akash-cli)
- [Akash Provider Wallet](#step-3---akash-provider-wallet)
- [Export Provider Wallet](#step-4---export-provider-wallet)
- [Install Helm](#step-5---install-helm)
- [Provider Build via Helm Chart](#step-6---provider-build-via-helm-chart)
- [Hostname Operator Build](#step-7---hostname-operator-build)
- [Ingress Controller Install](#step-8---ingress-controller-install)
- [Next Steps - Provider Health Check and Optional Services](#step-9---next-steps---provider-health-check-and-optional-services)

## STEP 1 - Install K3s and Initial Cluster Config

### Overview

In this section we will deploy a Kubernetes control plane and worker node on a single server using [Rancher K3s](https://www.rancher.com/products/k3s). The use of K3s allows a very simple Kubernetes cluster install appropriate for single server production and lab environments.

### Install K3s

```
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -s -
```

### Configure Kubeconfig

```
mkdir ~/.kube

sudo cat /etc/rancher/k3s/k3s.yaml | tee ~/.kube/config >/dev/null
```

### Confirm Kubectl Access to the Kubernetes Cluster

```
kubectl get nodes
```

##### Expected/Example Output

```
kubectl get nodes

NAME              STATUS   ROLES                  AGE    VERSION
ip-172-31-3-111   Ready    control-plane,master   3m4s   v1.25.6+k3s1
```

### Create Necessary Labels for the Akash Provider

```
kubectl create ns akash-services
kubectl label ns akash-services akash.network/name=akash-services akash.network=true

kubectl create ns ingress-nginx
kubectl label ns ingress-nginx app.kubernetes.io/name=ingress-nginx app.kubernetes.io/instance=ingress-nginx

kubectl create ns lease
kubectl label ns lease akash.network=true
```

### Removing K3s

To uninstall K3s follow [this link](https://docs.k3s.io/installation/uninstall)

## STEP 2 - Install Akash CLI

### Install the Akash CLI for Provider Use

```
cd ~

apt install jq -y

apt install unzip -y

curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | bash

echo 'alias provider-services="/root/bin/provider-services"' >> ~/.bashrc

. ~/.bashrc
```

### Verify Akash CLI Install

```
provider-services version
```

##### Expected/Example Output

```
provider-services version

v0.4.6
```

## STEP 3 - Akash Provider Wallet

Placing a bid on an order requires a 0.5 AKT deposit placed into collateral per bid won. If the provider desired 2 concurrent leases, the provider’s wallet would need minimum funding of 10AKT.

As every deployment request bid requires 0.5 AKT to be deposited in the escrow account, it's always good to have more so your provider can keep bidding. If your provider is ready to offer 10 deployments, then it's best to have .5 x 10 = 5 AKT and a little more to make sure the provider can pay the fees for broadcasting the transactions on Akash Network.

The steps to create an Akash wallet are covered in the following documentation sections:

- [Create an Account](/docs/deployments/akash-cli/installation/#create-an-account)
- [Fund Your Account](/docs/deployments/akash-cli/installation/#fund-your-account)

### Import the Wallet onto the Akash Provider

- Capture the Akash Account in the output of `provider-services keys add` for use in the subsequent step

```
###Replace YOUR_KEY_NAME
export AKASH_KEY_NAME={YOUR_KEY_NAME}'
export AKASH_KEYRING_BACKEND=os'

###Import keys using the mnemonic phrase from your Kepler wallet
provider-services keys add $AKASH_KEY_NAME --recover
```

### Configure Network And Account Settings

```
export AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
export AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | shuf -n 1)"

###Replace the YOUR_ACCOUNT variable with your provider account (I.e. akash1qt5jjuhwf1232vn7696s6y6c0lwfv2ggetz)
export AKASH_ACCOUNT_ADDRESS={YOUR_ACCOUNT}
```

### Check Provider Wallet Balance

```
provider-services query bank balances --node $AKASH_NODE $AKASH_ACCOUNT_ADDRESS
```

##### Expected/Example Output

```
provider-services query bank balances --node $AKASH_NODE $AKASH_ACCOUNT_ADDRESS

balances:
- amount: "30735641"
  denom: uakt
pagination:
  next_key: null
  total: "0"
```

## STEP 4 - Export Provider Wallet

In this section we will export the pre-existing, funded wallet to store the private key in a local file. To conduct the commands in this section the Akash CLI must be installed which is detailed in this [guide ](/docs/deployments/akash-cli/installation/)(STEP 1 only).

The wallet used will be used for the following purposes:

- Pay for provider transaction gas fees
- Pay for bid collateral which is discussed further in this section

> Make sure to create a new Akash account for the provider and do not reuse an account used for deployment purposes. Bids will not be generated from your provider if the deployment orders are created with the same key as the provider.

### List Available Keys

- Print the key names available in the local OS keychain for use in the subsequent step

```
provider-services keys list
```

#### Example/Expected Output

```
provider-services keys list
- name: ""
  type: local
  address: akash1<redacted>
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"<redacted>"}'
  mnemonic: ""
- name: mykey
  type: local
  address: akash1<redacted>
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"<redacted>"}'
  mnemonic: ""
```

### **Export Private Key to Local File**

- The key-name can be any name of your choice
- Note the passphrase used to protect the private key as it will be used in future steps

> _**NOTE**_ - The passhprase MUST be at least 8 characters long. Otherwise provider will encounter `failed to decrypt private key: ciphertext decryption failed error` when `keys import` is executed.

#### STEP 1 - Export Provider Key

```
cd ~

provider-services keys export mykey1
```

##### Expected/Example Output

```
provider-services keys export mykey1

Enter passphrase to encrypt the exported key:
Enter keyring passphrase:
-----BEGIN TENDERMINT PRIVATE KEY-----
kdf: bcrypt
salt: REDACTED
type: secp256k1

REDACTED
-----END TENDERMINT PRIVATE KEY-----
```

#### STEP 2 - Create key.pem and Copy Output Into File

- Copy the contents of the prior step into the `key.pem` file

> _**NOTE -**_ file should contain only what's between `-----BEGIN TENDERMINT PRIVATE KEY-----` and `-----END TENDERMINT PRIVATE KEY-----` (including the `BEGIN` and `END` lines):

##### Example/Expected File Contents

```
cat key.pem
-----BEGIN TENDERMINT PRIVATE KEY-----
kdf: bcrypt
salt: REDACTED
type: secp256k1

REDACTED
-----END TENDERMINT PRIVATE KEY-----
```

## STEP 5 - Install Helm

### Helm Installation

```
wget https://get.helm.sh/helm-v3.11.0-linux-amd64.tar.gz

tar -zxvf helm-v3.11.0-linux-amd64.tar.gz

mv linux-amd64/helm /usr/local/bin/helm
```

### Verify Helm Install

```
helm version
```

##### Expected/Example Output

```
helm version

GitCommit:"472c5736ab01133de504a826bd9ee12cbe4e7904", GitTreeState:"clean", GoVersion:"go1.18.10"}
```

### Add Akash Helm Repository

```
helm repo remove akash
helm repo add akash https://akash-network.github.io/helm-charts
```

## STEP 6 - Provider Build via Helm Chart

### **Overview**

In this section the Akash Provider will be installed and customized via the use of Helm Charts.

> _**NOTE**_ - when the Helm Chart is installed the Provider instance/details will be created on the blockchain and your provider will be registered in the Akash open cloud marketplace. The associated transaction for Provider creation is detailed [here](https://github.com/akash-network/docs/blob/master/cli/provider-services_tx_provider_create.md).

### **Environment Variables**

- Declare the following environment variables for Helm use
- Replace the variables with your own settings

1. Set akash provider address that starts with `akash1`

> This allows the akash-provider to decrypt the key

```
ACCOUNT_ADDRESS=akash1XXXX
```

2\. Set the password you have entered upon akash keys export > key.pem

```
KEY_PASSWORD=12341234
```

3\. Set your domain. Register DNS A and wildcard address as specified in previous step, i.e. `provider.test.com` DNS A record and `*.ingress.test.com` DNS wildcard record.

> Domain should be a publicly accessible DNS name dedicated for your provider use such as test.com.
>
> The domain specified in this variable will be used by Helm during the Provider chart install process to produce the "provider.yourdomain.com" sub-domain name and the "ingress.yourdomain.com" sub-domain name. The domain specified will also be used by Helm during the Ingress Controller install steps coming up in this guide. Once your provider is up and running the \*.ingress.yourdomain.com URI will be used for web app deployments such as abc123.ingress.yourdomain.com.

```
DOMAIN=test.com
```

4\. Set the Akash RPC node for your provider to use

- If you are going to deploy Akash RPC Node using Helm-Charts then set the node to http://akash-node-1:26657 It is recommended that you install your own Akash RPC node. Follow [this guide](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/) to do so.

```
NODE=http://akash-node-1:26657
```

### **Provider Withdraw Period**

- Akash providers may dictate how often they withdraw funds consumed by active deployments/tenants escrow accounts
- Few things to consider regarding the provider withdraw period:
  - The default withdraw setting in the Helm Charts is one (1) hour
  - An advantage of the one hour default setting is assurance that a deployment may not breach the escrow account dramatically. If the withdraw period were set to 12 hours instead - the deployment could exhaust the amount in escrow in one hour (for example) but the provider would not calculate this until many hours later and the deployment would essentially operate for free in the interim.
  - A disadvantage of frequent withdraws is the possibility of losing profitability based on fees incurred by the providers withdraw transactions. If the provider hosts primarily low resource workloads, it is very possible that fees could exceed deployment cost/profit.

##### OPTIONAL - Update the Provider Withdraw Period

- If it is desired to change the withdrawal period from the default one hour setting, update the `withdrawalperiod` setting in the provider.yaml file created subsequently in this section.
- In the example the Provider Build section of this doc the withdrawal period has been set to 12 hours. Please adjust as preferred.

### **Provider Build Prep**

- Ensure you are applying the latest version of subsequent Helm Charts install/upgrade steps

```
helm repo update
```

#### Create a provider.yaml File

- Issue the following command to build your Akash Provider
- Update the following keys for your unique use case
  - `region`
  - `organization`
- Optional Parameters - the following parameters may be added at the same level as `from` and `key` if you which to advertise your support email address and company website URL.
  - `email`
  - `website`

```
cd ~

mkdir provider

cd provider

cat > provider.yaml << EOF
---
from: "$ACCOUNT_ADDRESS"
key: "$(cat ~/key.pem | openssl base64 -A)"
keysecret: "$(echo $KEY_PASSWORD | openssl base64 -A)"
domain: "$DOMAIN"
node: "$NODE"
withdrawalperiod: 12h
attributes:
  - key: region
    value: "<YOUR REGION>"   # set your region here, e.g. "us-west"
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: "<YOUR ORG>"      # set your organization name here
EOF
```

##### **Example provider.yaml File Creation**

```
root@linux-server ~ % cat > provider.yaml << EOF
---
from: "$ACCOUNT_ADDRESS"
key: "$(cat ./key.pem | openssl base64 -A)"
keysecret: "$(echo $KEY_PASSWORD | openssl base64 -A)"
domain: "$DOMAIN"
node: "$NODE"
withdrawalperiod: 12h
attributes:
  - key: region
    value: us-east
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: myorganization
EOF
```

#### &#x20;Verification of provider.yaml File

- &#x20;Issue the following commands to verify the `provider.yaml` file created in previous steps

```
cd ~/provider

cat provider.yaml
```

##### Example provider.yaml Verification Output

- Ensure there are no empty values

```
from: akash1<REDACTED>
key: LS0tLS1CRU<REDACTED>0tLS0tCg==
keysecret: QUtB<REDACTED>XIK
domain: test.com
node: http://<rpc-address>:26657
withdrawalperiod: 12h
attributes:
- key: region
  value: us-east
- key: host
  value: akash
- key: tier
  value: community
- key: organization
  value: mycompany
```

### **Provider Bid Defaults**

- When a provider is created the default bid engine settings are used. If desired these settings could be updated and added to the `provider.yaml` file. But we would recommend initially using the default values.
- Note - the `bidpricestoragescale` value will get overridden by `-f provider-storage.yaml` covered in [Provider Persistent Storage](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/) documentation.
- Note - if you want to use a shellScript bid price strategy, pass the bid price script via `bidpricescript` variable detailed in the [bid pricing script doc](/docs/providers/build-a-cloud-provider/akash-cli/akash-provider-bid-pricing-calculation/). This will automatically suppress all `bidprice<cpu|memory|endpoint|storage>scale` settings.

```
bidpricecpuscale: "0.004" # cpu pricing scale in uakt per millicpu
bidpricememoryscale: "0.0016" # memory pricing scale in uakt per megabyte
bidpriceendpointscale: "0" # endpoint pricing scale in uakt per endpoint
bidpricestoragescale: "0.00016" # storage pricing scale in uakt per megabyte
```

### **Install the Provider Helm Chart**

```
helm install akash-provider akash/provider -n akash-services -f provider.yaml
```

##### **Expected Output of Provider Helm Install**

```
NAME: akash-provider
LAST DEPLOYED: Thu Apr 28 18:58:10 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

### **Provider Confirmation**

```
kubectl get pods -n akash-services
```

##### **Expected output (example and name following akash-provider will differ)**

```
root@node1:~# kubectl get pods -n akash-services

NAME                              READY   STATUS    RESTARTS   AGE
akash-provider-6d7c455dfb-qkf5z   1/1     Running   0          4m37s
```

##### Troubleshooting

If your Akash Provider pod status displays `init:0/1` for a prolonged period of time, use the following command to view Init container logs. Often the Provider may have a RPC issue and this should be revealed in these logs. RPC issues may be caused by an incorrect declaration in the NODE variable declaration issued previously in this section. Or possibly your custom RPC node is not in sync.

```
kubectl -n akash-services logs -l app=akash-provider -c init --tail 200 -f
```

### Helm Chart Uninstall Process

- Should a need arise to uninstall the Helm Chart and attempt the process anew, the following step can be used
- Only conduct this step if there is a problem with Akash Provider Helm Chart install
- This Helm uninstall technique can be used for this or any subsequent chart installs
- Following this step - if needed - start the Provider Helm Chart install anew via the prior step in this page

```
helm uninstall akash-provider -n akash-services
```

## STEP 7 - Hostname Operator Build

- Run the following command to build the Kubernetes hostname operator
- Note - if a need arises to use a different software version other than the one defined in the Chart.yaml Helm file - include the following switch. In most circumstances this should not be necessary.
  - `--set image.tag=<image-name>`
  - Example: `--set image.tag=0.1.0`

```
helm install akash-hostname-operator akash/akash-hostname-operator -n akash-services
```

##### Expected/Example Output

```
NAME: akash-hostname-operator
LAST DEPLOYED: Thu Apr 28 19:06:30 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace akash-services -l "app.kubernetes.io/name=hostname-operator,app.kubernetes.io/instance=hostname-operator" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace akash-services $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace akash-services port-forward $POD_NAME 8080:$CONTAINER_PORT
```

### **Hostname Operator Confirmation**

```
kubectl get pods -n akash-services
```

##### **Expected output (example and name following akash-provider will differ)**

```bash
root@node1:~# kubectl get pods -n akash-services

NAME                                       READY     STATUS    RESTARTS   AGE
akash-provider-6d7c455dfb-qkf5z             1/1     Running       0      4m37s
akash-hostname-operator-84977c6fd9-qvnsm    1/1     Running       0      3m29s

```

## Step 8 - Ingress Controller Install

### Create Upstream Ingress-Nginx Config

- Create an `ingress-nginx-custom.yaml` file with the following contents:

```
controller:
  service:
    type: ClusterIP
  ingressClassResource:
    name: "akash-ingress-class"
  kind: DaemonSet
  hostPort:
    enabled: true
  admissionWebhooks:
    port: 7443
  config:
    allow-snippet-annotations: false
    compute-full-forwarded-for: true
    proxy-buffer-size: "16k"
  metrics:
    enabled: true
  extraArgs:
    enable-ssl-passthrough: true
tcp:
  "8443": "akash-services/akash-provider:8443"
```

### Install Upstream Ingress-Nginx

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --version 4.12.0 \
  --namespace ingress-nginx --create-namespace \
  -f ingress-nginx-custom.yaml
```

### Apply Necessary Labels

- Label the `ingress-nginx` namespace and the `akash-ingress-class` ingressclass

```
kubectl label ns ingress-nginx app.kubernetes.io/name=ingress-nginx app.kubernetes.io/instance=ingress-nginx

kubectl label ingressclass akash-ingress-class akash.network=true
```

## STEP 9 - Next Steps - Provider Health Check and Optional Services

### Akash Provider Checkup

Following the initial build of your Akash Provider, use the [Akash Provider Checkup](/docs/providers/build-a-cloud-provider/akash-cli/akash-provider-checkup/) guide to ensure basic functionality.

### Persistent Storage Enablement (OPTIONAL)

Use the [Helm Based Provider Persistent Storage Enablement](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/) guide to host persistent volumes that will survive Kubernetes pod restarts for hosted deployments and workloads.

### IP Leases Enablement (OPTIONAL)

Use the [IP Leases Provider Enablement](/docs/network-features/ip-leases/) guide to allow static IP address/port assignment for hosted deployments and workloads.

### Akash Provider Setup Complete

With these steps your Akash Provider setup and post install verifications should be complete!
