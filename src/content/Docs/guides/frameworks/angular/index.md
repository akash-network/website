---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "Deploying an Angular App on Akash"
linkTitle: "Angular"
---

To deploy an Angular application to the Akash Network, you'll follow a series of steps, including building your Angular app, creating a deployment file, and using Akash CLI or the console to deploy. Below is a step-by-step guide to help you through the process.

## Step 1: Build Your Angular Application

### 1. Install Angular CLI (if not already installed):

```
npm install -g @angular/cli
```

### 2. Navigate to Your Angular Project:

```
cd /path/to/your/angular-app
```

### 3. Build the Angular App for Production: 

This command will create a `dist` directory with your production-ready application. 

```
ng build --prod
```

The output will be in the `dist/your-app-name` directory.

## Step 2: Prepare the Deployment File

To deploy your application on Akash, you need to define an SDL (Stack Definition Language) file that specifies how your application should be deployed. Here's a sample SDL file that you can customize:

```
---
version: "2.0"

services:
  web:
    image: nginx:alpine
    env:
      - NGINX_PORT=80
    expose:
      - port: 80
        as: 80
        to:
          - global
    resources:
      cpu:
        units: 1
      memory:
        size: 512Mi
      storage:
        size: 1Gi
    deployment:
      replicas: 1
    args:
      - /bin/sh
      - -c
      - |
        cp -r /myapp/* /usr/share/nginx/html
        nginx -g "daemon off;"

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    akash:
      profile: web
      count: 1
```

## Customizing the SDL File:

1. **Copy your Angular app files**: Ensure your Angular app files (the contents of `dist/your-app-name`) are copied to `/myapp/` in the container.

2. **NGINX Configuration**: By default, this SDL file assumes you are serving your Angular app with NGINX. The `nginx:alpine` image is lightweight and perfect for static websites.

3. Resource Allocation: You can adjust the `cpu`, `memory`, and `storage` parameters based on the needs of your application.

## Step 3: Deploy Using Akash CLI

1. **Install Akash CLI**: Follow the instructions to install the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) on your system from the Akash Documentation.

2. **Authenticate with Akash**: Ensure your account is funded with some AKT tokens and that your wallet is properly configured.

3. **Deploy the App**:

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

    ```

4. **Access the Application**: Once your deployment is live, you can access your Angular application through the public URL provided by the Akash provider.

## Step 4: Deploy Using Akash Console (Alternative Method)

1. **Visit the Akash Console**: Navigate to the [Akash Console](https://console.akash.network/).

2. **Authenticate**: Log in using your Keplr wallet or another supported wallet.

3. **Create a Deployment**:

    - Use the console's guided interface to create a new deployment.
    - Upload your SDL file and follow the prompts to complete the deployment process.
    - Monitor and Manage: The console provides an easy-to-use interface for monitoring your deployment, checking logs, and managing resources.

## Final Notes

- **Scaling**: You can scale your application by increasing the replicas count in the SDL file.

- **SSL/TLS**: Consider using Akash’s capabilities to manage SSL/TLS certificates for your domain.