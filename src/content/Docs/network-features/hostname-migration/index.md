---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Hostname Migration"
linkTitle: "Hostname Migration"
---


Deployment of an updated workload encounters a challenge when the DNS hostname remains active on the existing deployment.  An example scenario is presented to ensure understanding of the challenge - followed by a review of the mechanism introduced in this release to migrate a hostname to the new deployment.

## **Overview of Hostname Migration Need**

In this scenario two identical deployments will be launched mimicking an initial instance/deployment and a secondary updated deployment.

The following SDL is utilized in this example.  Note the presence of the highlighted accept key dictating the DNS name of the deployment (supermariotest.akash.network).

![](https://lh6.googleusercontent.com/aXCyB9D5ScqRmD6ZfBQbI56wZkpQdlxj38AKc3wKB-\_tmJR2DXbsPNo1S7nQgqByR5ejykf\_MgxO57HUghtFqeKLZVYfBtKT-rb8gIcLiVPKQ9updFikKNRm-aSZeQ31vXyT-MXP=s0)

* Two instances of the deployment are provoked (referred to as “OriginalDeployment” and “UpdatedDeployment” in this guide for clarity)
* The OriginalDeployment lease status displays URIs for both the Akash full domain name (ending in akashian.io) and the SDL specified domain name of “supermariotest.akash.network”
* Note - the DSEQ for this deployment is - 241027.  The DSEQ reference point will be of importance for later validations.

![](https://lh6.googleusercontent.com/xaohN1p97gj1v\_kyGOX5-4CtMxf25bZp9GGom9s8JH-KFwZ\_zSE6O\_o0yBiNavdaeMtUS15bfsuZEJCo0Qe7PBtebU8CPuAVcQXavfWa\_N1zMAU2EcpQHDRUUhT-RcFS8jb9QEuT=s0)

* The UpdatedDeployment lease status displays a single URI - the Akash full domain name (ending in akashian.io) - and the SDL specified domain name of “supermariotest.akash.network” is not present
* The hostname of “supermariotest.akash.network” was not migrated when the new deployment generated despite the declaration of the hostname in the SDL’s accept key-value pair
* If the initial deployment (OriginalDeployment) had been destroyed prior to the creation of the upgraded instance (UpdatedDeployment) the hostname would have been free and the new deployment would have assumed this domain name per the SDL specification.
* But often to ensure continuity of services the desirable strategy would be to activate the new instance prior to removing a pre-existing instance and only migrate production traffic to a readied upgraded instance.
* The hostname migration commands introduced - and discussed subsequently - allows such graceful migration.
* Note - the DSEQ for the UpdatedDeployment is - 241064.  The DSEQ reference point will be of importance for later validations.

![](https://lh5.googleusercontent.com/lofd32uDsrfnWKWeUwxtxkgj9B\_z0hSwJevZJ5YHusIlXPLm-TXYoFmxiM6XCeWiG0IEOm7OD0qnWBpfN47uTcnIT8bxQGsEJ0VXgETiZLrqXVJ5qOhjst9QOcOVhX6cfVG-DeW9=s0)

## **Hostname Migration Command**

The example hostname migration will continue with the two deployment scenarios provoked in the prior sub-section.

* Hostname migration command syntax with variable bracketing as such \<variable-name>

```
provider-services migrate-hostnames --from <key-name> --dseq <dseq-number> --provider=<provider-address> <hostname>
```

* Example, populated hostname migration command
* In referencing the deployment DSEQ the hostname is migrated to the UpdatedDeployment instance with a DSEQ of 241064 and simultaneously removing the hostname from OriginalDeployment (DSEQ 241027)

```
provider-services migrate-hostnames --from mykey --dseq 241064 --provider=akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww supermariotest.akash.network
```

## **Validation of Hostname Migration**

#### **Hostname/URI Configuration Validations**

Validations of hostname migration are provided in the sample OriginalDeployment and UpdatedDeployment scenario.\


* The lease-status command is utilized in the section to display active URIs/hostnames associated with specific deployments
* The syntax for the lease-status command is as follows

```
provider-services lease-status --node $AKASH_NODE --home ~/.akash --dseq $AKASH_DSEQ --from $AKASH_KEY_NAME --provider $AKASH_PROVIDER
```



In the depiction which follows the state of the OriginalDeployment instance proves:

* Prior to the migrate-hostnames command invoke the hostname specified in the SDL is married to the instance
* The migrate-hostnames command is invoked specifying the DSEQ of the upgraded deployment instance
* Post invoke of migrate-hostnames the SDL specified hostname is no longer married to the original instance

![](https://lh3.googleusercontent.com/NjH7BDfxfVsmlG7ct9jmf2yPBJmGGKyt4jwJ4\_N9d2Zpqv1Xlr9MaXCjNlI9jGWduoDwieu2324H91qxI7Kuwau8yNGLOFYYyHtnQhXqTol8ApStJkOD3l6ZtUqa07n1o\_8IgtoY=s0)

In the depiction which follows the state of the UpgradedDeployment instance proves:

* Post migrate-hostnames command invoke the hostname has been migrated to the upgraded deployment instance
* If desired and in an event in which the upgrade deployment was not servicing traffic correctly - the hostname could be migrated back to OriginalDeployment using the identical migrate-hostname command set but with the OriginalDeployment DSEQ specified

![](https://lh5.googleusercontent.com/hfSpUr7G2msOv-IseXC-thWYLtNNeRU46ZwmwPdMq94duq\_DzpVjQlN-tkBOyNvFau788DzsdS2HfDmWTBnjLFKdg8gudVv6aID9YOFjdMA4uyGp0iePaPYV4C0S0z80f\_G3Pz0F=s0)

## **Connectivity Test Validations**



As discussed prior - in a production environment it may be advantageous to leave the pre-existing deployment (I.e. OriginalDeployment in this guide’s scenario) in place post migration for possible fallback scenarios.  But to validate connectivity has migrated successfully - the legacy deployment will be removed in our example scenario to prove connectivity to the upgraded deployment post hostname migration.

* Prior to hostname migration a CuRL test was conducted to the pre-existing deployment (OriginalDeployment).  At the time of this test the upgraded deployment did not exist.  A CuRL header rewrite is utilized to successfully test connectivity to the hostname (supermariotest.akash.network).

```
curl --header 'Host: supermariotest.akash.network' 2gkpg7qhghetb7tu1ku9aspbl8.wwwp1.h18.akashian.io
```

![](https://lh5.googleusercontent.com/UNii0\_mjtEGvVNxuh-u3-h41kAKuCWJWtIMJtM3URMwxfsVcYHN8JhevX7XiZ3HqLnNMrIIviYiAUzbURD2uM71xwiJ6s6pkbZNNd54od\_xSps4cTRnRd1eh6We1F7XoWSVFpXRo=s0)

* Post deployment  of the upgraded instance and hostname migration - the pre-existing deployment is removed, connectivity to the hostname via CuRL is conducted anew, and the successful HTML response validates the hostname was migrated properly.



```
curl -v --header 'Host: supermariotest.akash.network' t3r1sn9c5991beqe90hfu6facg.wwwp1.h18.akashian.io
```

![](https://lh5.googleusercontent.com/WplSAKrIfP\_NK6sMP7XoJMKRdwtKyA0Q6g2rhdOl1SgMh02KV0l3w1aE0KGwNH\_uhW9\_x-9YFJRUwwTynGJ\_gJ31L3sDHtkYEoNYNXpwB5u72yko9stYE8n\_Es-PzK1wJDlRnkaN=s0)

## **Requirements and Limitations of Migrate Hostname**

#### **DNS CNAME Update**

* When planning a hostname migration ensure that proper public DNS record updates are planned and executed to limit interruption in services.
* In the example scenario utilized and to highlight necessary public DNS record adjustments:
  * The organization owning the akash.network DNS record would have a DNS canonical name (CNAME) record for supermariotest.akash.network pointing to the Akash deployment destination of 2gkpg7qhghetb7tu1ku9aspbl8.wwwp1.h18.akashian.io (OriginalDeployment)
  * The organization would need to update the CNAME record once the hostname migration was completed to the destination of t3r1sn9c5991beqe90hfu6facg.wwwp1.h18.akashian.io (UpgradedDeployment)
  * An interruption in service may be provoked as the public DNS records are published and distributed

#### **Requirements**

* A domain name migration may be migrated to any deployment associated with the same wallet.&#x20;
* The hostname must be declared in the SDL’s accept key-value pair of the deployment to allow use of the migrate-hostnames command.

#### **Limitations**

* A domain name used by another wallet may not be utilized.  This is a pre-existing limitation - there may not be conflicts in domain names across wallets -- and re-emphasizing to ensure clarity that this limitation remains.

## **SDL Example Utilized**

Full SDL code samples used throughout this guide

```
---
version: "2.0"
services:
 web:
   image: pengbai/docker-supermario
   expose:
     - port: 8080
       as: 80
       to:
         - global: true
       http_options:
         max_body_size: 3145728
         read_timeout: 50000
         send_timeout: 51000
         next_cases: ["error", "500"]
         next_tries: 2
       accept:
         - supermariotest.akash.network
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   westcoast:
     signedBy:
       anyOf:
         - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
     pricing:
       web:
         denom: uakt
         amount: 3000
deployment:
 web:
   westcoast:
     profile: web
     count: 1
```