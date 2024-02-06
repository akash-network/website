---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Deployment HTTP Options"
linkTitle: "Deployment HTTP Options"
---


Akash deployment SDL services stanza definitions have been augmented to include “http\_options” allowing granular specification of HTTP endpoint parameters.  Inclusion of the parameters in this section are optional but will afford detailed definitions of attributes such as body/payload max size where necessary.


The following “http\_options” have been introduced in this version.  In subsequent sections of this guide the placement of “http\_options” within the SDL services stanza will be detailed.\


> NOTE - the default HTTP option settings can be found [here](https://github.com/akash-network/node/blob/main/sdl/v2.go#L18..L37)

* _**max\_body\_size**_ - sets the maximum size of an individual HTTP request body
* _**read\_timeout**_ - duration the proxy will wait for a response from the service&#x20;
* _**send\_timeout**_ - duration the proxy will wait for the service to accept a request
* _**next\_cases**_ - defines the cases where the proxy will try another replica in the service.  Reference the upcoming “Next Cases Attribute Usage” section for details pertaining to allowed values.
* _**next\_tries**_ - number of attempts the proxy will attempt another replica
* _**next\_timeout**_ - amount of time the proxy will wait before considering a timeout has occurred

## **Example HTTP Options Usage**

* Depiction displays the placement and structure of the http\_options key within the greater services section and within a specific service’s expose key.
* Service section of the greater SDL isolated for focus.

![](https://lh4.googleusercontent.com/oXXBUSlWyFomOTKfA0z38maeEkdc-Y264KAukd0bnLByiQRDB6l3Qwa43jYmfk-Q4N6CXC7p5PPwqSobCOuVBKlaQUko9HTAJU1SJq\_Yyv6AOgv2Z3dKOlQxkoHwJ-yyMv0eRy\_e=s0)



* Depiction displays the placement of http\_options within the entire, greater SDL definition

![](https://lh3.googleusercontent.com/cOrxEtOvXzyhPHbEpA\_DI06km8v627RJZEmGlPFqE41k8N5I53DBGsEi3lXbxYewvjCUiN9fP9qItPC5E0zNOV8jkQYrl2sIREPnafu\_k9zleNN1HKSYboFQR40U01o\_P22limIC=s0)

## **Next Cases Attribute Usage**

The “http\_options” key of “next\_cases” accepts an array of values which may contain one or more of the following values.  When included in the “next\_cases” array value - the specified HTTP response code/message will provoke an attempt to service the request by one of the other container members/replicas of the deployment.  The “next\_cases” attempt to service via an additional container will only provoke if the SDL defines a count of greater than one (1).  A deployment with a count of one (1) would have no other replicas to facilitate the additional service attempt.&#x20;

* error”
* “timeout”
* “403”
* “404”
* “429”
* “500”
* “502”
* “503”
* “504”
* “off”

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