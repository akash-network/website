---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Fractional uAKT"
linkTitle: "Fractional uAKT"
---

Fractional uAKT is the removal of the implicit minimum cost of deployment. In the past, a deployment could not be cheaper than one uAKT per block. Meaning, extremely light workloads like a crypto wallet, or perhaps a personal blog could end up being more expensive than necessary. The limitation also would have more severe consequences as token price increases. A lightweight deployment could increase from $1 to $5 per month if the token were to double or triple in price. With fractional uAKT, prices can be adjusted better so resource consumption can be accurate to the cost.

In this guide we will use the Akash Console tool to launch deployments using fractional uAKT. If this is your first time using Akash Console, use either this [guide](/docs/deployments/akash-cli/overview/) to install the CLI app, or this [one](/docs/deployments/akash-console/) to use the [Akash Console]web app,  and get started.


## Relevant SDL Declaration and Example Use

For the purpose of demonstrating the use of fractional uAKT we will utilize the popular Hello World web application and SDL that can be found in the [Awesome Akash repository](https://github.com/akash-network/awesome-akash). The example SDL file will be modified to take advantage of the new fractional uAKT option.

The [Akash Console](/docs/deployments/akash-console/) application will be used to launch the deployment.

### **Example Fractional uAKT Use in Akash Console**

Within Akash Console:

- [ ] Create a new deployment
- [ ] Select Hello-world from the available templates

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2FsFfTMYjuy3sh5mH9NyXi%2FfractionalCreateDeployment.png?alt=media&token=0b9bf90d-5a35-4bf6-8fec-33d010913337)

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2F4iI0PjLQlYtrotySEIS6%2FfractionalHelloWorld.png?alt=media&token=24b93d25-d5aa-4e8b-aebd-cf14ce7892f7)

### Edit the Template with a Fractional uAKT Amount

- Update the template to use a fractional uAKT amount of 100.1 as seen in the capture
- Additionally ensure that any signBy and attributes sections are removed to mimic the screenshot below
- The necessary template is also shown in text below the screenshot
- Proceed thru the remaining steps to complete the deployment

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2FxB48MXLbSpBdYfnfUHC7%2FtestnetFractionalUpdated.png?alt=media&token=0eb1cfd9-e8a0-4e87-8939-424ad2ab1ee0)

- The SDL should be as follows post update

```
---
version: "2.0"

services:
  web:
    image: tombeynon/akash-hello-world:release-v0.1.1
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    dcloud:
      attributes:
        host: akash
      pricing:
        web:
          denom: uakt
          amount: 100.1

deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

### Verification of Fractional uAKT Use

The verification of fractional uAKT functionality comes in two forms:

1. The deployment progress and will eventually complete with a fractional uAKT per block price of 100.1
2. The bids received from providers come in fractional uAKT amounts

Continue with these steps:

- Select a fractional uAKT bid from a provider and then select “ACCEPT BID”
- Proceed the remaining steps of the deployment process
- When the deployment completes - we have successfully tested fractional uAKT

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2F2uSiK0ZeItEQeuPGDAm3%2FfractionalBid.png?alt=media&token=3a44ce7b-6dd7-429e-add8-ad16ce12602b)
