---
title: "Everyone's a Winner in the Sovrython Hackathon Sponsored by Akash"
description: Every dev who submitted for one of our challenges at the Sovrython Hackathon, powered by Gitcoin won prizes up to $10,000. Sovrython was a 6-week long hackathon that invited developers from all chains to collaborate on decentralization/privacy, data science, integrations, and finance with a shared goal to accelerate the future of DeFi.

pubDate: "2021-08-02"
draft: false

categories:
  - Developers
tags:
  - Developers
  - News
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---

Every dev who submitted for one of our challenges at the [Sovrython Hackathon, powered by Gitcoin](https://gitcoin.co/hackathon/sovrython/onboard) won prizes up to $10,000. Sovrython was a 6-week long hackathon that invited developers from all chains to collaborate on decentralization/privacy, data science, integrations, and finance with a shared goal to accelerate the future of DeFi.

With over $500,000 in awards and grants, this event is the highest value DeFi Hackathon bounty program ever offered on Gitcoin. The event was produced by Sovryn’s [exiledsurfer](https://gitcoin.co/exiledsurfer) and hosted on [Gitcoin](http://gitcoin.co), the platform where developers get paid to work on open-source software.

Akash committed $100,000 in $AKT to the winners of our three challenges including:

1.  Securely deploy the Sovryn node using Akash Network
2.  Design an easy-to-use UI to help developers deploy any app on Akash
3.  Build an app that leverages decentralized storage such as Skynet and run it on Akash

**You can find all of the submissions with demo videos on the** [**Akash Community**](https://forum.akash.network/t/everyone-s-a-winner-in-the-sovrynthon-hackathon/)**.**

## Sovryn Node Challenge:

The challenge was to securely deploy a Sovryn node on the Akash Mainnet and submit a detailed guide on how it works.

## 1st Place: [End to End Automated Node](https://github.com/lebeau-remy/Sovryn-Node) by EoM Games

Before the hackathon, [EoM Games](https://github.com/lebeau-remy/Sovryn-Node) had already completed the challenge and published a YouTube video walking through how to run a Sovryn node on Akash. ​​The Sovryn Nodes on Akash now automatically deploy on Akash using Github Actions. These GitHub actions can be used to automate the deployment of any app from a simple GitHub push to a production app running on the Akash Network.

**“The Sovryn Node being deployed on Akash demonstrates some tooling I’ve built while slightly extending the use of Akash’s own end to end testing. With some secrets from Akash’s GitHub repo it can automatically tear down and stand up giving rise to a complete CI/CD platform anyone can use," said EoM Games.**

If you have [Metamask](http://metamask.io) installed on your Tor browser, browsing to [https://sovryntor.eth](https://sovryntor.eth) will resolve the onion address and website. If you don’t have this setup, you can see the Akash hosted URL by [clicking here.](http://ce3ueoed7lbr3fak3igb8hc170.ingress.sjc1p0.mainnet.akashian.io/)

## 2nd Place: Vault Security by Rustam Abdullin

There is no doubt that a lot of time and effort was put into [Rustam Abdullin](https://github.com/rustamabdullin/sovryn-node-123)’s submission. Just take a look at his very detailed guide, [here](https://forum.akash.network/t/akash-sovryn-node-deployment-guideline-telegram-rsk-wallet-secrets-management-rstm/386/9). This project aims to protect the private key using the HashiCorp Vault. The private key can be gathered using the one-time token that can be unwrapped using short TTL wrapping token only. Even the user or the system that created the initial token won't see the original value. The original Sovryn Node repository keeps the private key (or private key password) in a clear text format.

![](https://www.datocms-assets.com/45776/1627919884-sovryn-vault-interaction-diagram-v01.png)

“The idea is to completely avoid storing private keys and their password in a cleartext format,” said Rustam Abdullin, Hackathon Winner.

Rustam’s node is still running today, [click here to view the front-end](http://ce3ueoed7lbr3fak3igb8hc170.ingress.sjc1p0.mainnet.akashian.io/), and the [docker image](https://hub.docker.com/r/rus7am/sovryn-node-vault03) is ready for someone else to deploy.  [See the demo, here.](https://www.youtube.com/watch?v=aQVzrhOT5Yc)

## 3rd Place: Container Security by Sara Robertson 

[Sara Robertson](https://github.com/sarasioux/akash-sovryn-node) tackled the security challenge of running a Sovryn node on Akash by getting the private keys and wallet configuration onto the containerized image without compromising security. Sara took an elegant approach and rather than use a key manager, this project uses a disposable or ephemeral container that you can recreate at any time, and the keys are ephemeral in the environment.

## 4th Place: Sovryn Node by Tanishq Dsharma

[Tanishq Dsharma](https://github.com/TanishqDsharma/SovrynNode-on-Akash) completed the challenge and deployed a Sovryn node on Akash and wrote a very detailed guide with step-by-step instructions for developers to follow. His node is still up and running and you can check it out, [here](http://io375ka6dldvb3drt7do4s1q78.ingress.sjc1p0.mainnet.akashian.io/). At the same time, he submitted for the Open Cloud Challenge!

# Open Cloud Challenge:

The challenge was to build an open-source app on the Akash Mainnet that leverages decentralized storage such as Skynet or Sia.

## 1st Place: [OpenRegistry.dev](http://openregistry.dev) by Jasdeep Singh

Jasdeep Singh and his partner Guacamole launched [OpenRegistry](https://github.com/jay-dee7/OpenRegistry) a decentralized container registry, which would be fully OCI Distribution Specification compliant. This means that OpenRegistry would be completely compatible with any relatively new version of container engines like Docker, Containerd, Podman, etc.

**“OpenRegistry uses Akash Network as its compute layer and SkyNet for storage. Since Akash Network provides a marketplace for compute, the fault tolerance, scalability, and resiliency were our priorities from day one.” Jasdeep Sing, OpenRegistry founder.**

Working with OpenRegistry is no different than working with any other container registry. Head over to [Parachute by OpenRegistry](https://parachute.openregistry.dev/) and sign yourself up for the beta.

## 2nd Place: [FanNFT](https://github.com/script-money/FanNFT) by ScriptMoney

[ScriptMoney](https://github.com/script-money/FanNFT) built a decentralized App that allows an influencer - Key Opinion Leader (KOL) - to easily give NFTs to their fans. ScriptMoney explains the use case, **“KOL can set up promotional content and create NFT gift packs. Fans will have a chance to win an NFT drop by simply tapping retweet to my Twitter. The server will automatically crawl the tweets, randomly select the lucky winners and generate NFT gifts to send to them.”**

![](https://www.datocms-assets.com/45776/1627898785-overview.png)

Hosted on [Akash](https://akash.network/), using [flow blockchain](https://www.onflow.org/) smart contracts, each NFT image is saved on [Skynet](https://siasky.net/). The FanNFT application has an automatic schedule runner that needs to be deployed using Akash's unique server-side container capability instead of renting a traditional cloud server. To store the NFT, one solution is to convert to base64 and store it directly into the contract.. The disadvantage is that on-chain storage is expensive, and each request will get the full data, and the client cannot use the cache which causes slow loading. Instead, the FanNFT has a component to upload a file to be stored in Skynet’s decentralized storage and returns a Skylink to the file.

## 3rd Place: [Email Analyzer](https://github.com/TanishqDsharma/EmailAnalyzer-Akash-CLoud) by Tanishq Dsharma

[Tanishq](https://github.com/TanishqDsharma/EmailAnalyzer-Akash-CLoud) built an email forensics dApp that will allow the user to inspect email headers to verify that the email was from a trusted source and not from an attacker/malicious user. This app analyzes your email data on the basis of email headers which helps to determine if the user that sent the email is genuine or fake.

![](https://www.datocms-assets.com/45776/1627897702-screen-shot-2021-08-02-at-2-47-51-am.png)

The Home page of the application will have a text area field where the user will paste his/her email data, the user clicks submit, and the email is analyzed. The app will analyze all the security-related email headers and display them in the response.

## 4th Place: dApps by Piyush

Last but not least, [Piyush](https://github.com/Developer-piyush/AKASHCLOUD) built a set of dApps and apps to demonstrate correct usage of Ethereum apps, specifically, the EthJS module. Many of these examples simulate an Ethereum node running in the browser.

**“It feels so good to visit the Akash forum every day and see new amazing projects and their implementation.” - Piyush**

# Deploy UI Challenge: 

The challenge was to build a UI to allow app developers to quickly deploy an open-source application on the Akash Mainnet. Submit a detailed guide on how to use the UI and how it works.

## 1st Place: [Akashlytics Deploy](https://www.akashlytics.com/deploy)

[Akashlytics Deploy](https://github.com/Akashlytics/akashlytics-deploy) can create or import a wallet, fund the wallet, create a certificate, create a deployment, accept a bid to create a lease and finally, send the manifest. The process of creating and hosting a web app on Akash inspired the [Akashlytics](https://www.akashlytics.com) team to create a fully dependency-free desktop app that can be installed in a few clicks on Windows, Mac, and Linux and be able to do all the steps required to deploy on Akash in the same app.

**“The main goals were to make it easy to use, secure, and accessible across all platforms.” Akashlytics founder Maxime Beachamp**

For the first beta version running on Windows, Akashlytics had to build custom wallet interfaces for transactions and ported some of the Akash CLI code written in Go to JavaScript to support all the operations. Since this is a desktop app, the user is in complete control of its certificate and most importantly, its private key or mnemonic. The latest version of the tool can be downloaded from the Akashlytics website, [https://www.akashlytics.com/deploy](https://www.akashlytics.com/deploy)

## 2nd Place: [Akash Deploy UI](https://github.com/spacepotahto/akash-deploy-ui) by SpacePotato

The [Akash Deploy Website](https://github.com/spacepotahto/akash-deploy-ui) interacts with the [Keplr wallet](https://keplr.xyz/) browser extension to allow visitors to quickly deploy to Akash using a hosted deploy website.  The Deploy Website leverages a new [AkashJS](https://github.com/spacepotahto/akashjs) library that replaces the command line functionality with JavaScript. [Click here to see the live website](https://2g0cl9g6u0mn6vrbiajv5p9h508vbfq07j6fm060dl8lci85k436jh0.siasky.net/).

**“A deploy UI can lessen the learning curve and reduce friction. In my opinion, the ideal UI should be in the form of a website with Keplr wallet integration. There should be no setup or installation. One should just be able to visit the website with some AKT in their Keplr wallet, and click a couple of buttons to deploy.” SpacePotato says.**

## 3rd Place: [Harbinger](https://github.com/Grubbly/Harbinger) by Grubbly

[Harbinger](https://github.com/Grubbly/Harbinger) is a cross-platform deployment manager for the Akash Network. It directly interfaces with the Akash CLI via a REST API hosted locally on your system, which by nature grants you absolute control over your keys, deployments, and data. [Click here to read the guide.](https://github.com/Grubbly/Harbinger/blob/main/docs/hackathon.md)

![](https://www.datocms-assets.com/45776/1627896268-earlyfrontend.gif)

Nothing is ever stored on a central server and you own your data. [Harbinger](https://github.com/Grubbly/Harbinger) is completely open-source, transparent, and uses whatever version of Akash CLI that is installed on your system path to execute commands. This approach allows users to audit both Harbinger and Akash code bases to ensure nothing fishy is going on and commands are doing what they say they are doing.

## 4th Place: VSCode Extension by Waylad

[Waylad](https://github.com/waylad/akash-vscode-extension) built an integration for one of the most popular IDE’s VSCode. The result is a [VSCode extension](https://github.com/waylad/akash-vscode-extension) that makes Akash deployments _**directly**_ from VSCode. To install, go to your VSCode extensions and click the three dots in the top right corner, then `Install from VSIX` and choose the `akash.vsix` from this repository. VSCode is one of the most popular IDEs and this project could become one of the most impactful efforts in the hackathon.

## 5th Place: MyEtherWallet by SpecterofNet

SpecterofNet deployed the [MyEtherWallet](https://specterofnet.medium.com/how-to-deploy-online-wallet-on-a-8bbdbc86b774) on Akash. While this doesn’t meet the requirements of our challenge, we encourage all developers to get involved in Akash. The new Developer Grant Program will offer $100 for developers who can deploy on Akash. [Learn how to apply](https://forum.akash.network/c/grants/) on the [Akash's Community.](http://forum.akash.network/)

# Watch the Livestream as we announce the winners

Join me on the Sovrython Results Livestream today, Monday August 2nd at 1PM PST / 8PM UTC hosted by Sovryn’s @EdanYago and @exiledsurfer live on the Sovrython website [sovrython.sovryn.app](http://sovrython.sovryn.app/) or on YouTube. [Click here to watch on YouTube.](https://youtu.be/fa8BAm17WAQ)
