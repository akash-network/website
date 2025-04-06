---
aep: 56
title: "Unified Akash Integration API"
author: Anil Murty (@anilmurty) Artur Troian (@troian) Iaroslav Gryshaiev (@ygrishajev) Maxime Beauchamp (@baktun14)
status: Draft
type: Standard
category: Interface
created: 2025-01-10
updated: 2025-03-19
estimated-completion: 2025-04-30
roadmap: major
---


## Motivation

Integrations are a key part of Akash's growth strategy. In order for integrations to happen quicker Akash needs first class API support, coupled with easy to follow documentation and support for multiple programming languages.

## Summary

While Akash has a Javascript API (AKashJS), it really is more of an SDK. Further, based on going through integrations with over a dozen partners, it is clear that folks cannot use it without handholding from the core team. The issues that users of AkashJS run into include, challenges with using the documented examples as well as not having enough examples. Akash needs a better JS API that abstracts away a lot of the underlying complexity of the blockchain and Akash specific things and is accompanies by easy to follow documentation. The story is similar for the GoLang API. Further, most API driven products offer suport for a wide range of programming languages.

The goal is this AEP is to build a first class API that can be used by partners and customers in a self-serve manner. If done correctly, this would be comparable if not better that the API offered by API-first companies like stripe (https://docs.stripe.com/api).

Specificaly the scope of this AEP will include
- Designing and implementing new interfaces that abstract a lot of the blockchain and Akash specific things as far as possible
- Implementing better error handling and reporting (HTTP response codes)
- Implementing version management
- Evaulating options for documentation (JSDocs, type-doc, Swagger, Docusaurus, Slateor others) and choosing one.
- Deciding on how to publicly display the API reference (where to put it, link it from etc)
