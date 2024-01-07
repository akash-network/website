---
title: "Serverless is bigger than FaaS"
description: There is a growing excitement in the developer community around the serverless paradigm, an idea that lets developers to deliver workloads without provisioning or managing servers.

pubDate: "2017-11-28"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Greg Osuri

bannerImage: ./banner-image.jpg
---
There is a growing excitement in the developer community around the serverless paradigm, an idea that lets developers to deliver workloads without provisioning or managing servers.

At its core, serverless architecture relies on orchestrating a vibrant eco-system of fully managed services. With increasing number of such backend services — namely backend-as-a-service (BaaS) — supported by all the key cloud infrastructure (IaaS) providers, I think it’s fair to say 2018 will be the year of serverless.

With all the excitement, there’s also confusion as to what constitutes to serverless architecture. Conventional wisdom — catalyzed by cloud providers’ rhetoric — is that only Function-as-a-Service (FaaS) implementations represent a serverless architecture.

I wrote this post to challenge some of those viewpoints in a hope to present a case for expanding this definition beyond functional level abstraction to application level abstraction to be considered as serverless.

#### Serverless 1.0

The idea of an absence of the server concept during software development — or serverless — is not new. Heroku was perhaps the first to introduce this concept around 2008 that had broad adoption by the developer community (a case can be made about Google App Engine being the first, but will keep that for another post).

With a developer first mentality, Heroku promised three main things:

1.  Cheaper, by isolating workloads in much small container images compared to VMs by IaaS providers, optimal to run most application workloads
    
2.  Comprehensive set of fully managed backends, accessible from a marketplace with federated identity and consolidated billing
    
3.  Great developer experience using a fantastic command line tool to develop, debug and deliver workloads
    

For applications written in a language/framework that Heroku supports and adhere to a simple standard — called the 12-factor methodology — developers could follow a very familiar git-based workflow to deploy their code. Heroku would seamlessly handle the availability and scaling of the workloads. The declarative formats of 12-factor methodology promised to maximize iteration speed and provided a clean contract with the underlying OS, offering maximum portability

As containers have much smaller footprint than VMs, they allowed Heroku to efficiently schedule workloads across a diverse set of machines with various configurations and optimize for price-performance.

To make this a reality, Heroku built container runtimes and orchestration engines that ran on top of Amazon Web Services that were closed off from the user.

The simplicity promised by the 12-factor design, however, lacked the flexibility do deploy workloads with complex needs. You couldn’t deploy any workload that was wasn’t 12-factor or have your workloads run in a private network. The marketplace — being comprised mostly of external vendors — paid little or no attention to latency between the application and backends that often resulted in degraded performance.

The closed approached, the lack of flexibility and a degraded performance kept Heroku away from being adopted by enterprises with complex needs and drove it to remain as a much-loved platform for “hobby” developers.

This gap in the market gave birth to platforms — called platform-as-as-services (PaaS) — like CloudFoundry (an EMC and VMWare spin-off), Makara (RedHat OpenShift) and DotCloud (Later renamed to Docker)

By embracing an open approach, these platforms promised the ease-of-use of Heroku style workflows while providing the flexibility or using your own hardware with a focus on simplicity

Like Heroku, these platforms also relied heavily upon Linux containers — a relatively old but unknown concept at the time — as a packaging and isolation mechanism to deliver workloads. The native container runtime provided by Linux — called LXC — was hard and unpleasant to use; limited its adoption to advanced teams at companies like Google and ones building infrastructure tools.

DotCloud, a relatively unknown company with a product that couldn’t differentiate from the competition — facing a possibility of extinction — open sourced a tool they’ve developed to simplify the use to LXC called “Docker.”

Docker’s key to simplicity was the image format — contents the image, declared in a manifest file is then used to build an image that can be built anywhere and shared with others by storing in a central repository. This build once, run anywhere approach gave way for developers to solve the particularly tricky, development-to-production parity problem.

It didn’t take long for developers to embrace Docker that lead to a Cambrian exposition of the cloud-native ecosystem. While Docker provided the image format and runtime for a single workload, tools like Kubernetes were born to orchestrate a variety of these workloads and schedule them in a fault tolerant manner.

What began as a serverless promise by Heroku — the application runtime abstraction — paved the way for a thriving ecosystem that changed the fundamental way we design the delivery of distributed workloads

#### Serverless 2.0

With increased number of workloads moving to the cloud, it didn’t take long for IaaS providers to understand the value of providing fully-managed backends — such as databases, caches, load balancers, etc — the support infrastructure required by the workloads

For providers such as Amazon Web Services (AWS), that began with a simple, managed object store offering, expanded into over 70 services (as of the writing of the post); for many providers, a way to orchestrate these rich set backends was evident next step. By leveraging the orchestration and containerization wave, it made it possible to rethink abstraction levels.

This gave birth to a new level of abstraction — function-as-a-service. AWS Lambda is a product that provides functional abstraction with the same promise of faster iteration speed, zero administration, and a much granular pricing model.

The difference here is that development focus is on a single function or module rather than a service with a large surface area like in the application runtime abstraction.

Another fundamental difference between application level abstraction and functional level abstraction is where and how you define invocation mechanism for workloads. In application abstraction, the invocation mechanism is described in the application code itself and provides the flexibility for the developer to choose the framework. For functional, the invocation is defined in a manifest file designed by provider. In case of AWS Lamda, an asynchronous invocation by placing a message on a managed queue (SQS), and a web-based invocation by calling a predefined endpoint on a managed router (API Gateway)

In essence, FaaS is an application framework created and managed by the provider. This makes FaaS appealing for developers that don’t necessarily care about vendor lock-in and are flexible to adopt the provider’s manifest in exchange for a piece of mind.

#### Conclusion

It’s evident by now that application and functional runtime abstraction deliver the promise of serverless — a future where developers can focus on writing code that provides functionality to their users instead of dealing with complexities of delivering that code.

_This post was originally published on_ [_Hacker Noon_](https://hackernoon.com/serverless-is-bigger-than-faas-a5fe0f088981) _on Nov 28, 2017_