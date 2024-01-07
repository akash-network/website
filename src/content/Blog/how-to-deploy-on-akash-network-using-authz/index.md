---
title: "How to Deploy on Akash Network Using AuthZ"
description: AuthZ is a feature that allows one wallet to spend the funds in another wallet, up to a specified limit.

pubDate: "2022-09-13"
draft: false

categories:
  - Developers
tags:
  - Developers
contributors:
  - Zach Horn

bannerImage: ./banner-image.png
---
AuthZ is a feature that allows one wallet to spend the funds in another wallet, up to a specified limit.

Deploying with AuthZ on Akash
-----------------------------

Let’s walk through a simple “Hello World” deployment with Cloudmos' deploy tool, using AuthZ to pay for the deployment.

After following the on-screen instructions to set up your Cloudmos wallet and create a certificate, you should see the screen below:

![](https://www.datocms-assets.com/45776/1663102509-screen-shot-2022-09-13-at-4-45-50-pm.png)

Create the Deployment
---------------------

Click **“Hello Akash World”**

Then **“Create Deployment”**

![](https://www.datocms-assets.com/45776/1663102593-screen-shot-2022-09-13-at-4-46-52-pm.png)

Specify the Funding Wallet
--------------------------

In the box below, set the initial deposit amount. Then select **“Use Depositor”** and input the funding wallet address. 

![](https://www.datocms-assets.com/45776/1663102612-screen-shot-2022-09-13-at-4-47-06-pm.png)

![](https://www.datocms-assets.com/45776/1663102628-screen-shot-2022-09-13-at-4-50-30-pm.png)

_Note: You should replace "akash123..." with the funding wallet address._

Then click **“Deposit”**

Finish the Deployment
---------------------

From there, follow the on-screen instructions to select your bid and finish the deployment process. Please refer to [Akash Network’s documentation](https://docs.akash.network/) for more information, and feel free to join [Akash’s Discord](https://discord.com/invite/akash) if you have any further questions.