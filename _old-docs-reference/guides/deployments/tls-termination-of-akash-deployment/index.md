---
categories: ["Deployments"]
tags: ["Blockchain"]
weight: 1
title: "TLS Termination of Akash Deployments"
linkTitle: "TLS Termination of Akash Deployments"
---

Currently only self-signed certificates are available from Akash Providers.

In this guide we detail a Cloudflare TLS termination strategy which will give Akash deployments valid public certificates. Cloudflare will proxy traffic intended for the Akash deployment and allow end to end encrypted communication.

**STEP 1** - [Prerequisites](#prerequisites)

**STEP 2** - [Akash with TLS Example](#akash-with-tls-example)

**STEP 3** - [Find IP Address of Deployment](#find-ip-address-of-deployment)

**STEP 4** -[ Cloudflare Configuration](#cloudflare-configuration)

**STEP 5** - [Verify HTTPS](#verify-https)

**STEP 6** - [Troubleshooting](#troubleshooting)

## Prerequisites

Cloudflare proxy of traffic is only possible if one of the following is in place:

- Register your domain in Cloudflare
- &#x20;Transfer control of domain from current DNS provider to Cloudflare’s control&#x20;
- &#x20;Point domain records from current nameservers of the DNS provider to Cloudflare nameservers instead

## Akash with TLS Example

An example Akash deployment with TLS step by step example. We will use Ghost, a very simple web app, for the demo.

### **Deploy Ghost**

Make sure to specify the hostname you control, in this example it is “ghost.akash.pro”. Set the “https” when setting the “url” environment variable – this will get picked by the Ghost blogging platform so it knows to serve these HTTPS links.

When you deploy with 80/tcp port exposed in Akash, the nginx-ingress-controller on the provider will automatically get 443/tcp exposed too. This makes Full TLS termination possible.

If you are not familiar with Akash deployments, visit the documentation for the web app [Akash Console](/docs/deployments/akash-console/) as an easy way to get started.

```
---
version: "2.0"

services:
  ghost:
    image: ghost:4.36.3-alpine
    env:
      - 'url=https://ghost.akash.pro'
    expose:
      - port: 2368
        as: 80
        accept:
          - "ghost.akash.pro"
        to:
          - global: true

profiles:
  compute:
    ghost:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        ghost:
          denom: uakt
          amount: 100

deployment:
  ghost:
    akash:
      profile: ghost
      count: 1
```

## Find IP Address of Deployment

We will need to lookup the IP address of the deployment to later use in the Cloudflare configuration

### Domain of the Deployment

- Find the domain name of the deployment in the Akash Console Deployment Detail page

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2F1OLAZX7ITvAbCClUClxb%2FcloudflareURL.png?alt=media&token=c3a3e6f0-5e71-49dc-8688-afe8a58d57a8)

### IP Address of Deployment

- From your terminal ping the domain name of the deployment and the IP address will be revealed
- In the example shown the IP address is listed as `147.75.75.107`

```
scarruthers@Scotts-MacBook-Pro ghost % ping t2ns2f7105b7t38aukju1calp4.ingress.provider-2.prod.ewr1.akash.pub

PING t2ns2f7105b7t38aukju1calp4.ingress.provider-2.prod.ewr1.akash.pub (147.75.75.107): 56 data bytes

64 bytes from 147.75.75.107: icmp_seq=0 ttl=53 time=47.975 ms
64 bytes from 147.75.75.107: icmp_seq=1 ttl=53 time=49.651 ms
64 bytes from 147.75.75.107: icmp_seq=2 ttl=53 time=51.948 ms
```

## Cloudflare Configuration

## Point Domain Name to Deployment IP

These configs are necessary in Cloudflare:

- Point the domain name of the deployment to the IP address of the deployment captured in the last step
- Set Proxy Status to `Proxied`

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2FPkRELRx4bWZqN65xAtdo%2FcloudflareDNS.png?alt=media&token=f0dd85fd-72f1-4247-baaa-43391005dc4b)

### Cloudflare Recommendation

Cloudflare recommends orange-clouding the record so that any dig query against that record returns a Cloudflare IP address and your origin server IP address remains concealed from the public.&#x20;

DNS proxied means it will be shown a Cloudflare IP if you look it up. Thus all attacks at that domain will DDoS Cloudflare and not you host directly. Non proxied means all traffic goes directly to your own IP without Cloudflare being a safety net in front.

### **Ensure SSL/TLS Encryption Set to Full**

In most situations we want Full TLS mode specified in Cloudflare based on:

- **Full TLS termination mode:** if the backend understands it is behind the Full TLS termination balancer (be that Cloudflare or anything else), it should then keep serving HTTPS
- **Flexible TLS termination mode:** this is when the backend is only serving HTTP requests and does not understand that something is terminating the TLS in front, then it will only work if it is NOT trying to serve full scheme URI's (i.e. uri's containing "http://" in them). Otherwise you get a mixed content error (see the comment on Mixed Content error is below).

> _**NOTE**_ - we advise using a **Full TLS termination mode** since Akash deployments exposed over the port 80/tcp HTTP (as: 80 in SDL manifest) are also automatically getting exposed over the 443/tcp HTTPS (TLS), though with the default self-signed certificates. This mode will ensure the traffic between Cloudflare and the Akash deployment gets encrypted.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2FnbC4Bqsj8Eo4nTCMNgp1%2FcloudflareTLS.png?alt=media&token=af45f034-a99b-4125-af5e-7e8c9ecd357c)

## Verify HTTPS

- Test end to end HTTPS for your deployment

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2FWsUrM07CQNXwhQgUE2QT%2FcloudflareHttpsTest.png?alt=media&token=33350171-58a6-4731-8d73-4df77322f6c4)

## Troubleshooting

- In this section we review a couple of common problems encountered

### **Mixed Content Errors**

In the example below you’ve noticed the “https” was set - “https://ghost.akash.pro”**.** That is to make sure the backend (Ghost) is serving the HTTPD links only, since our goal was to enable HTTPS via TLS termination over Cloudflare.

In situations when the backend server is not HTTPS aware, you will see the content would not load due to a mixed content (this is when the server is offering non-HTTPS links while being accessed over HTTPS).

Here is an example of that, the deployment is set to “http://ghost.akash.pro” while “https://ghost.akash.pro” is opened in the browser.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LrNFlfuifzmQ_NMKu9C-887967055%2Fuploads%2F3zaPRHd62wRj1oQrewrN%2FcloudflareMixedMedia.png?alt=media&token=30738db8-7611-4480-9c71-076c6a839d32)
