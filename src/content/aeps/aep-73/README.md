---
aep: 73
title: "Console - New Product Announcement feature"
description: "A way to inform customers and users about what's new in Akash"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2025-07-31
updated: 2025-07-31
estimated-completion: 2025-08-31
roadmap: major
---

## Motivation

Informing Akash users and customers about what new products & features have been introduced will go a long way in driving retention. This is particularly important now as the Akash Core team and community have been rapidly adding new functionality to the products and platform this year.

## Summary

Keeping customers informed about new features being introduced in Akash Console and also generally on the Akash platform as whole (for both tenants/ users as well as providers) is a challenge. This is hard enough for traditional products to do where every users is known, only harder for Akash where many users are anonymous. At the same time, the risk of users not choosing Akash or worse, deciding to abandon it becuase they think a certain feature is missing while it actually is there, is significant. As such, a way to communicate these updates within the product and optionally push them to users where there is an option to do so, reduces the probability of that happening.

## Proposed Solution

### UI/ UX

1. A side bar within Console on the right side that provides a running list of everything that is new in Akash. Each element in the list has a heading, a brief description and an optional hyperlink to a longer post (likely on the blog site) that provides details.
2. A "notification" icon ("New Updates") on the top bar that lights up if there are new features added to the list
3. An option to sign up to be notified when a new update drops. Doing so, will fire off an email to the user at the email address that they are registeted in Console with. 
4. (Ideally) the ability for the user to provide feedback about each new feature

### Implementation

There are a coupld options for how the content can be managed.

1. Use a product that specializes in this type of thing. A few examples include AnnounceKit, Appcues, Amplitude and some open source alternatives.
2. Use markdown files (like we do for for the website at https://github.com/akash-network/website/tree/main/src/content/Blog)

Github Milestone: https://github.com/akash-network/console/milestone/25
