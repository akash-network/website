---
title: "From Git to Skynet: How to Host Large Files on Sia"
description: At Akash Network, we are always looking for amazing ways to use our network adjacent to technologies that align with our mission and vision of a true and complete decentralized web.

pubDate: "2021-07-22"
draft: false

categories:
  - Developers
tags:
  - Developers
contributors:
  - Derek Anderson

bannerImage: ./banner-image.png
---
At Akash Network, we are always looking for amazing ways to use our network adjacent to technologies that align with our mission and vision of a true and complete decentralized web. 

One service that pairs well with our network is Skynet. Built on the Sia block technology stack, Skynet enables fluid and easy file serving through portals which allow users to easily upload and share media without needing to interact with the blockchain. 

The real beauty of Sia is the heavy investment in a JavaScript SDK. 

I thought about what kinds of use cases in which we could use this SDK at Akash Network. One of the primary uses floating around today is Git Large File Support or Git LFS. Natively, you can find this service on GitHub and you can find integrations using AWS S3 buckets but I couldn’t find one with Skynet integration.

### **The Importance of Using Git**

Using Git to store code and large files has a lot of advantages. In scientific communities, storing references to large datasets and offloading those data sets can be both cost effective and a necessity. Creatives might want source control for binaries but want better tracking and checkout like subversion.

For Akash, we’re continuing our focus on reducing deployment barriers and increasing developer efficiency while maintaining our value for open-source software. We want to use this integration to continue to move deployment tooling in-line and beyond our Web 2.0 counterparts.

Currently, there are a few LFS server implementations. The version 1 specification of Git LFS has been around for almost five years. While you still need to download and enable the LFS extension, the base Git client now ships with support during some of its main actions such as automatically pulling in binaries from the LFS server.

### **Configuring Git LFS**

Configuring Git LFS is pretty straightforward. Download and install the latest version from [Git Large File Storage](https://git-lfs.github.com/). Once you completed the install step use the command below:

`git lfs install`

### **Tracking png Files**

Next, let’s add tracking for the binary files that you want to send to Skynet. Luckily, there is an easy command to include files in tracking:

`git lfs track "*.png"`

The previous command will start tracking any ‘png’ files in the project, these will be swapped out for text versions that contain tracking hashes.

Now, anytime we commit and push the binary versions of the files, they will be uploaded to the LFS endpoint on our Git server. To accomplish zero config, the LFS client assumes your LFS server is attached to your Git repository host, which isn’t the case in our guide today.

### **Redirecting the LFS Client**

To redirect the LFS client, we simply need to add a dot file to our project. This file is appropriately named `.lfsconfig.`

`[lfs]`

`url = "http://localhost:3000/akashnetwork/testFile"`

We’ll point our Git client to our local LFS server that’s going to send our files to Skynet. 

### **Starting your LFS Server**

Our next step is to start that LFS server. Akash has done the leg work of creating an out of the box server built upon the ‘Fastify’ server by Nearform. Now, the extensible server is ready to upload to Skynet. 

To use this server, you’ll need [Node 16](https://nodejs.org/en/download/current/) and a local version of [MongoDB](https://www.mongodb.com/) installed to track uploads for the LFS server. First, head over to [MongoDB](https://www.mongodb.com/) to install a local version of the database server - there is no configuration needed here.

To start the server you can simply use `npx` to automatically download and execute the server for use.

`npx @akashnetwork/lfs`

You should see output on the terminal indicating the server is up and running and ready to accept inbound connections.

### **You’re Almost There!** 

Now you’re ready to add and push tracked files to the sky.

`git add file.png`

`git commit -m "Add cool image"`

`git push origin main`

While working locally, Git will keep your binary files in the working directory. When pushed, resource ids are sent to the remote repository and upon cloning the binaries, will be ushered back into the Git repository.

You can see a demo of the working implementation on our YouTube channel [here](https://youtu.be/W2pVpefAtA8), or try it for yourself! We’re excited to keep developing tools to rapidly accelerate decentralized use and adoption.