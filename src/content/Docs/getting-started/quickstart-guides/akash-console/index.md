---
categories: ["Getting Started"]
tags: []
title: "Akash Console"
linkTitle: "Akash Console"
weight: 3
---

This guide will walk you through deploying a simple "Hello World" Next.JS application onto the Akash Network via Akash Console. This guide is beginner-friendly and requires no previous knowledge of navigating Console or Akash Network in general.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/ZJaRzAR7uzU?si=Yp5e_xxgcaqq9dpV" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

#### Before Getting Started

Console is compatible with two wallets as of now, Keplr and Leap wallet. The Keplr or Leap browser extensions must be installed and with sufficient funds (0.5 AKT minimum for a single deployment plus a small amount for transaction fees).

Follow [Keplr Wallet](/docs/getting-started/token-and-wallets/#keplr-wallet) or [Leap Cosmos Wallet](/docs/getting-started/token-and-wallets/#leap-cosmos-wallet) guides to create your first wallet if necessary.

#### Akash Console Access

The Akash Console web app is available via the following URL:

- https://console.akash.network/

### STEP 1 - Connect your Keplr or Leap wallet

![Untitled](./assets/1.jpg)

After clicking connect wallet, you will see an option to choose either Keplr or Leap. Choose your desired option:

![Untitled](./assets/2.jpg)

### STEP 2 - Click the "Getting started with Akash Console" option

![Untitled](./assets/3.jpg)

Now click the Deploy button:

![image](./assets/4.png)

Now, an SDL file will be loaded for your deployment, which will have the docker image and all the needed resources specified. Click the create deployment option:

![image](./assets/5.png)

### STEP 3 - Proceed to pay the deployment deposit

Click the continue button and approve the transaction:

![image](./assets/6.png)

Now approve the transaction:

![image](./assets/7.png)

### STEP 4 - Select the best bid

Now you will see a list of providers with prices. Select whichever you want, preferably the lowest one, and click the Accept Bid button:

![image](./assets/8.png)

Now approve the transaction fee once again:

![image](./assets/9.png)

#### STEP 5 - Confirm the deployment

Now the only thing left to do is to confirm that the deployment was successful. Click the Leases section:

![image](./assets/10.png)

Now visit the URI link:

![image](./assets/11.png)

You will be able to see the website you just deployed:

![image](./assets/12.png)

Once the 'Hello World' application is deployed, you can easily close it and get refunded. Just click the Close option and once again approve the transaction:

![image](./assets/13.png)

![image](./assets/14.png)

#### Conclusion

You have successfully deployed a simple hello world application using Console. Follow similar flow for other deployments, only the SDL file along with docker image and resources is to be configured as per the need.
