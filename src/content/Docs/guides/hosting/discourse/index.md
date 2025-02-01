---
categories: ["Guides"]
tags: ["Hosting"]
weight: 1
title: "Guide to Creating a Custom Website with Ghost and Deploying to Akash"
linkTitle: "Discourse"
---


## **Overview of Discourse**

**Discourse** is a modern, open-source discussion platform designed to improve online community interactions. Known for its robust features, it combines traditional forum-style discussions with modern tools for engagement. Features include real-time updates, robust moderation tools, extensive customization, and integration capabilities. Discourse is widely used by communities, businesses, and organizations to facilitate meaningful discussions.

### **Key Features:**
1. **Customizable Design:** Flexible theming options for personalized user experiences.
2. **Real-Time Notifications:** Alerts for replies, mentions, and updates.
3. **Trust System:** Automated moderation based on user behavior.
4. **Integration-Friendly:** Seamless integration with services like Slack, WordPress, and more.
5. **Rich API:** Enables advanced automation and integrations.

By deploying Discourse on Akash, you can leverage the decentralized cloud’s cost-effectiveness, scalability, and security to run your discussion forum in a trustless environment.

---

## **Why Deploy Discourse on Akash Network?**

**Akash Network** is a decentralized cloud computing platform, offering affordable and censorship-resistant hosting. Deploying Discourse on Akash enables users to run a secure and scalable community platform while reducing dependency on traditional centralized cloud providers.

**Benefits:**
1. **Cost-Effective:** Save on hosting costs compared to traditional providers.
2. **Scalable:** Dynamically allocate resources to meet traffic demands.
3. **Decentralized:** Resilient against censorship and outages.
4. **Open Source Compatibility:** Easily deploy applications with Docker and Kubernetes support.

---

## **Step-by-Step Deployment Guide**

### **Prerequisites:**
1. **Akash CLI Installed:** Set up the [Akash CLI](https://docs.akash.network/) for managing deployments.
2. **Discourse Requirements:**
   - A domain name with DNS configuration for SSL.
   - Minimum of 2GB RAM and 1 CPU for Discourse.
   - Docker installed in your environment.
3. **Akash Wallet:** Ensure your wallet is funded with $AKT tokens to pay for deployment.

---

### **1. Prepare Discourse Docker Setup**
Discourse requires a Dockerized setup for deployment. Prepare the necessary Docker image and environment variables.

- Use the official Discourse image: `discourse/discourse`.
- Set up the following environment variables in a file (e.g., `.env`):
  ```
  DISCOURSE_HOSTNAME=forum.yourdomain.com
  DISCOURSE_SMTP_ADDRESS=smtp.your-email-provider.com
  DISCOURSE_SMTP_PORT=587
  DISCOURSE_SMTP_USER_NAME=your-email@example.com
  DISCOURSE_SMTP_PASSWORD=your-password
  ```

### **2. Create the Akash Deployment File**
Write an SDL (Service Definition Language) file that describes your deployment. Here’s an example:

```yaml
version: "2.0"

services:
  discourse:
    image: discourse/discourse:latest
    env:
      - DISCOURSE_HOSTNAME=forum.yourdomain.com
      - DISCOURSE_SMTP_ADDRESS=smtp.your-email-provider.com
      - DISCOURSE_SMTP_PORT=587
      - DISCOURSE_SMTP_USER_NAME=your-email@example.com
      - DISCOURSE_SMTP_PASSWORD=your-password
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    resources:
      cpu:
        units: 2
      memory:
        size: 2Gi
      storage:
        size: 20Gi

profiles:
  compute:
    discourse:
      resources:
        cpu:
          units: 2
        memory:
          size: 2Gi
        storage:
          size: 20Gi
  placement:
    akash:
      attributes:
        region: us-west

deployment:
  discourse:
    discourse:
      profile: discourse
      count: 1
```

### **3. Deploy on Akash**
- Create your Certificate

Akash requires an account to have a valid certificate associated with it to start participating in the deployment process. In this section of the guide, we will create a certificate locally, and then proceed to store this certificate on the Akash blockchain. To do this, ensure you have followed all the steps outlined in this guide up to this point. Additionally, these transactions must be executed from an Akash account in possession of some $AKT tokens.

Once an account has a certificate associated with it, it can begin deploying services on the Akash blockchain. **A certificate needs to be created only once per account. After creation, it can be used across any number of deployments for as long as it remains valid.**


```
provider-services tx cert generate client -from $AKASH_KEY_NAME
```

- Publish Cert to the Blockchain

```
provider-services tx cert publish client -from $AKASH_KEY_NAME
```

- Create your Deployment

- CPU Support

Only x86_64 processors are officially supported for Akash deployments. This may change in the future and when ARM processors are supported it will be announced and documented.

- Akash Deployment

> _**NOTE**_ - if your current terminal session has been used to create prior deployments, issue the command `unset AKASH_DSEQ` to prevent receipt of error message `Deployment Exists`

To deploy on Akash, run:

```
provider-services tx deployment create deploy.yaml -from $AKASH_KEY_NAME
```

You should see a response similar to:

```javascript
{
  "height":"140325",
  "txhash":"2AF4A01B9C3DE12CC4094A95E9D0474875DFE24FD088BB443238AC06E36D98EA",
  "codespace":"",
  "code":0,
  "data":"0A130A116372656174652D6465706C6F796D656E74",
  "raw_log":"[{\"events\":[{\"type\":\"akash.v1\",\"attributes\":[{\"key\":\"module\",\"value\":\"deployment\"},{\"key\":\"action\",\"value\":\"deployment-created\"},{\"key\":\"version\",\"value\":\"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"module\",\"value\":\"market\"},{\"key\":\"action\",\"value\":\"order-created\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"gseq\",\"value\":\"1\"},{\"key\":\"oseq\",\"value\":\"1\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"create-deployment\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000uakt\"},{\"key\":\"recipient\",\"value\":\"akash14pphss726thpwws3yc458hggufynm9x77l4l2u\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000000uakt\"}]}]}]",
  "logs":[
    {
      "msg_index":0,
      "log":"",
      "events":[
        {
          "type":"akash.v1",
          "attributes":[
            {
              "key":"module",
              "value":"deployment"
            },
            {
              "key":"action",
              "value":"deployment-created"
            },
            {
              "key":"version",
              "value":"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"module",
              "value":"market"
            },
            {
              "key":"action",
              "value":"order-created"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"gseq",
              "value":"1"
            },
            {
              "key":"oseq",
              "value":"1"
            }
          ]
        },
        {
          "type":"message",
          "attributes":[
            {
              "key":"action",
              "value":"create-deployment"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            }
          ]
        },
        {
          "type":"transfer",
          "attributes":[
            {
              "key":"recipient",
              "value":"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000uakt"
            },
            {
              "key":"recipient",
              "value":"akash14pphss726thpwws3yc458hggufynm9x77l4l2u"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000000uakt"
            }
          ]
        }
      ]
    }
  ],
  "info":"",
  "gas_wanted":"100000",
  "gas_used":"94653",
  "tx":null,
  "timestamp":""
}
```

- Find your Deployment \-

Find the Deployment Sequence (DSEQ) in the deployment you just created. You will need to replace the AKASH_DSEQ with the number from your deployment to configure a shell variable.

```bash
export AKASH_DSEQ=CHANGETHIS
```

Now set the Order Sequence (OSEQ) and Group Sequence (GSEQ). Note that if this is your first time deploying on Akash, OSEQ and GSEQ will be 1.

```bash
AKASH_OSEQ=1
AKASH_GSEQ=1
```

Verify we have the right values populated by running:

```bash
echo $AKASH_DSEQ $AKASH_OSEQ $AKASH_GSEQ
```

- View your Bids

After a short time, you should see bids from providers for this deployment with the following command:

```bash
provider-services query market bid list -owner=$AKASH_ACCOUNT_ADDRESS -node $AKASH_NODE -dseq $AKASH_DSEQ -state=open
```

- Choose a Provider

Note that there are bids from multiple different providers. In this case, both providers happen to be willing to accept a price of _1 uAKT_. This means that the lease can be created using _1 uAKT_ or _0.000001 AKT_ per block to execute the container. You should see a response similar to:

```
bids:
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    owner: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    owner: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
```

For this example, we will choose `akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal` Run this command to set the provider shell variable:

```
AKASH_PROVIDER=akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
```

Verify we have the right value populated by running:

```
echo $AKASH_PROVIDER
```

- Create a Lease

Create a lease for the bid from the chosen provider above by running this command:

```
provider-services tx market lease create -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
```

- Confirm the Lease

You can check the status of your lease by running:

```
provider-services query market lease list -owner $AKASH_ACCOUNT_ADDRESS -node $AKASH_NODE -dseq $AKASH_DSEQ
```

Note the bids will close automatically after 5 minutes, and you may get the response:

```
bid not open
```

If this happens, close your deployment and open a new deployment again. To close your deployment run this command:

```
provider-services tx deployment close -dseq $AKASH_DSEQ  -owner $AKASH_ACCOUNT_ADDRESS -from $AKASH_KEY_NAME
```

If your lease was successful you should see a response that ends with:

```
    state: active
```

{/* {% hint style="info" %} */}
Please note that once the lease is created, the provider will begin debiting your deployment's escrow account, even if you have not completed the deployment process by uploading the manifest in the following step.
{/* {% endhint %} */}

- Send the Manifest

Upload the manifest using the values from above step:

```
provider-services send-manifest deploy.yaml -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
```

- Confirm the URL

Now that the manifest is uploaded, your image is deployed. You can retrieve the access details by running the below:

```
provider-services lease-status -dseq $AKASH_DSEQ -from $AKASH_KEY_NAME -provider $AKASH_PROVIDER
```

You should see a response similar to:

```javascript
{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "rga3h05jetf9h3p6dbk62m19ck.ingress.ewr1p0.mainnet.akashian.io"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {}
}
```

You can access the application by visiting the hostnames mapped to your deployment. Look for a URL/URI and copy it to your web browser.

- View your logs

You can view your application logs to debug issues or watch progress like so:

```bash
provider-services lease-logs \
  -dseq "$AKASH_DSEQ" \
  -provider "$AKASH_PROVIDER" \
  -from "$AKASH_KEY_NAME"
```

- Update the Deployment

- Update the Manifest

Update the deploy.yaml manifest file with the desired change.

_**NOTE:**_\*\* Not all attributes of the manifest file are eligible for deployment update. If the hardware specs of the manifest are updated (I.e. CPU count), a re-deployment of the workload is necessary. Other attributes, such as deployment image and funding, are eligible for updates.

- Issue Transaction for On Chain Update

```
provider-services tx deployment update deploy.yaml -dseq $AKASH_DSEQ -from $AKASH_KEY_NAME
```

- Send Updated Manifest to Provider

```
provider-services send-manifest deploy.yaml -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
```

### **4. Set Up SSL**
Use a tool like **Certbot** to generate SSL certificates or integrate Let's Encrypt to secure your Discourse instance. Update your Nginx or Traefik configuration for SSL termination.

### **5. Final Configuration**
- Access your Discourse forum via the browser at `http://forum.yourdomain.com`.
- Follow the setup wizard to complete the configuration.
- Customize your forum with themes, plugins, and settings.

---

## **Maintenance Tips**
- **Monitor Usage:** Regularly monitor resource usage and scale as needed.
- **Backup Data:** Use Akash’s storage features or external storage solutions like Filecoin or S3-compatible storage for regular backups.
- **Update Discourse:** Periodically update the Docker image to stay current with Discourse releases.

---

By following this guide, you can host a robust, scalable, and decentralized Discourse forum on Akash Network, unlocking a new level of cost-efficiency and resilience for your community.