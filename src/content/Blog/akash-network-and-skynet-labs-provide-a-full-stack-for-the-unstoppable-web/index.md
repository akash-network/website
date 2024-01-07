---
title: "Akash Network and Skynet Labs Provide a Full Stack for the Unstoppable Web "
description: Everyone knows the term DeFi, but dWeb, or decentralized web, is still catching on in the lexicon of the mainstream press. What is the decentralized web?

pubDate: "2021-06-28"
draft: false

categories:
  - Partners
tags:
  - Partners
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---
Everyone knows the term DeFi, but dWeb, or decentralized web, is still catching on in the lexicon of the mainstream press. What is the decentralized web? The decentralized web (dWeb) is a major shift from computing resources being owned and operated by the three large cloud software giants (Amazon, Google, and Microsoft) to a decentralized network of cloud providers operating open-source software platforms and creating competition in an open marketplace with more providers and lower costs.

There is no centralized company or project that leads the development of the decentralized web. Sia Skynet and Akash Network are two projects with the same goal, to make it easy to join the decentralized Internet movement. Both are hosting platforms with strong developer communities releasing new code and projects every day. Both are well-funded and are openly challenging the cloud giants by reducing the cost for users to host their data and apps. Even the names have a similarity - Akash means "sky" in ancient Sanskrit. 

### **Which hosting platform is better, Akash or Skynet?** 

Actually, they work better together. The Akash Network provides decentralized compute, and Skynet through its underlying Sia network provides decentralized storage. By bringing together the compute and storage layers, developers can host their applications on a fully decentralized cloud. The developer communities also benefit from the network effect; as more users and developers switch to a decentralized architecture, more contributions are made to these open source projects.

### **What’s so Pinteresting?**

The first example of an integration that combines Akash and Skynet is a clone of Pinterest, now live at the website [http://pin.akash.host](https://pin.akash.host/). The Pinterest app runs a Postgres database on Akash and backs up the container to Skynet’s decentralized storage servers. 

### **How does Skynet work?**

Skynet provides decentralized storage, and unlike the traditional web, files uploaded to Skynet are immutable. Immutable data means you can upload files, and they are instantly accessible on any device and are fully verifiable on the Sia blockchain. As long as at least one public portal continues to pin the data, it will remain accessible forever.

Skynet also includes SDKs for popular programming languages - built with Web 2.0 developers in mind. Client-side web apps and static generators are perfect for using [Skynet](http://siasky.net/) to deploy. Skynet also supports mutable data with SkyDB, a key-value store. 

### **How does Akash Network work?**

Akash is an open-source deployment platform for hosting and managing containers where users can run any cloud-native application. The open-source nature of Akash’s platform allows it to be implemented across multiple cloud providers, breaking the vendor lock-in for selecting a cloud-hosted service.

The Akash platform is built with a set of cloud management services including Kubernetes to automate the deployment of containers and ensure the reliability of applications and workloads running on the containers. Originally developed by Google, Kubernetes is open-source and not designed specifically for any cloud provider. 

Akash is ideally suited for hosting any app that can run in a container including Ruby on Rails, NodeJS, fully featured databases like MySQL and Postgres, GraphQL APIs, and anything that you can find on Docker Hub (more on that later).

### **How do you integrate? Enter Filebase!**

The Pinterest app backs up to Skynet using [Filebase](https://filebase.com/), a company that recently raised a $2M seed round to provide encrypted and geo-redundant storage at a fraction of the price of Amazon and other centralized storage providers. 

Filebase’s S3 Compatible API functions as a drop-in replacement for existing applications and tools that use Amazon S3, and Filebase’s backend connects to both Sia and Skynet enabling data to be stored at the lowest cost possible. Filebase object storage has also been validated for use with several Kubernetes backup tools. 

With this integration from Filebase, apps running on Akash can now backup, restore, and migrate a database by connecting the containers running on Akash to persistent storage on Skynet. The [Akash documentation site](http://docs.akash.network/) has been updated with the official guides to run your own [Pinterest app on Rails](https://github.com/ovrclk/akash-on-rails) and a spin off to simply [backup and restore Postgres](https://docs.akash.network/deploy/postgresql-restore-backup) to Skynet storage. 

### **The “Full Stack” Integration**

One challenge for new developers is making architecture decisions on which stack they should run. Not every developer wants to build their app the same way as the Pinterest-clone. For a web application to work, it has to include an operating system, a web server, a database for storage, and a programming language. The widely popular LAMP stack is a set of open-source software including Linux, Apache, MySQL, and PHP, and became the foundation for Linux hosted web applications. 

Akash Founder and CEO, Greg Osuri launched a [challenge on Twitter](https://twitter.com/gregosuri/status/1390090199728676864) offering a $2,140 reward for the first developer to integrate Akash and [Skynet](http://siasky.net/) with a unique requirement, use Skynet as the front-end and Akash as the back-end to create a “full-stack” decentralized web application. 

This challenge was met quickly by the developers in the Akash and Skynet community. The [Unstoppable Web 2.0](https://docs.akash.network/deploy/unstoppable-web-2.0) project includes everything necessary for a fully decentralized web app. The application code, technology choices, and configuration used in this project provides a software development tool kit for future developers. The solution uses Skynet for the front-end, Akash for the back-end - running Postgres, and Filebase for the database backups to Skynet.

The full stack solution for a decentralized web is now a reality, with [Skynet](http://siasky.net/) as the front-end, Akash as the back-end app and database, and Filebase and Skynet as the backup. Each step of this partnership has been supported and developed by the community.

### **Decentralizing Docker Hub**

Akash plans to support these efforts long-term through community-targeted funding. While building apps in containers is easy, not every project needs to be built from scratch. [Docker Hub](https://hub.docker.com/) is a SaaS repository for sharing and managing containers, where you will find official Docker images from open-source projects and software vendors as well as unofficial images from the general public.

[OpenRegistry](https://forum.akash.network/t/openregistry-an-open-container-registry/76/10) is a new project to make Docker Hub redundant, and replace it with a decentralized version. With support from Akash and Skynet, OpenRegistry is building a new container registry that would be compatible with any container engine. Many developers rely on Docker’s Container Registry, but unfortunately it’s a centralized repository owned and operated by Docker, a single corporate entity.

Jasdeep Singh, the founder of OpenRegistry explained to the [Akash community](https://forum.akash.network/t/openregistry-an-open-container-registry/76), “when Docker Hub goes down, it causes a lot of service degradation for the entire industry. Docker’s new rate-limiting makes it even harder to use Docker.” 

Fortune 500 companies have been forced to use alternatives to Docker’s container registry, including Amazon’s centralized version. Mr. Singh added “We can show the tech industry how resilient and robust Akash Network is for Fault Tolerant Systems.”

**Join The Unstoppable Stack on Twitter Spaces June 29th at 6 pm PST!**