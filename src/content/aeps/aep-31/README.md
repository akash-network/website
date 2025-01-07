---
aep: 31
title: "Credit Card Payments In Console"
author: Anil Murty (@anilmurty) Cheng Wang (@lechenghiskhan)
status: Final
type: Standard
category: Interface
created: 2024-08-29
updated: 2024-12-01
completed: 2024-11-04
roadmap: major
discussions-to: https://github.com/orgs/akash-network/discussions/688, https://github.com/akash-network/console/pull/251
resolution: https://www.mintscan.io/akash/proposals/270
---

## Motivation

Akash Network has been live for almost 4 years and we have made incredible strides in decentralizing development, coordination, and funding. 

As proposed in [AKT 2.0](https://github.com/orgs/akash-network/discussions/32), which received overwhelming support from the community, we proposed formally funding technical Research, Development, and Support done by the Akash Core Team and administered by Overclock Labs. As bolstered by proposals [211](https://www.mintscan.io/akash/proposals/211), [240](https://www.mintscan.io/akash/proposals/240), and [241](https://www.mintscan.io/akash/proposals/241), the Community Pool will continue to be well-funded as Akash Network accelerates its development.  

As with all previous funding proposals, unused funds will be returned to the community.

## Introduction

Akash Network launched in 2020 and has experienced explosive growth over the last few years, partly due to being open-sourced fully in late 2023. Today, [Akash Network organization](https://github.com/akash-network/community) has over 350 contributors building across 49 repositories coordinated and led by the Overclock Labs team through 11 special interest groups, working groups, and user groups. This achievement is monumental and should be celebrated, especially as we focus on the actual output: 2 major acquisitions, multiple web2 and web3 AI platform partnerships, university research collaborations, 11 network upgrades, and nearly 100 completed issues and over 200 discussions spanning more than four years.

## Challenge

With a growing codebase driven by an ever-larger feature set, Akash Network is more complex than ever and this complexity will only increase over time. As the community of contributors continues to grow, coordination becomes more challenging, costs rise, and development velocity slows. These challenges are further heightened for user-facing clients like the Akash Console as it is the Akash Supercloud’s direct user interface. Adoption starts and ends with user experience and the Akash Console is the tip of that spear.

## Proposal

Since 2016, Overclock Labs has fully borne the cost of development and support of Akash Network. Overclock Labs continues to fund most of these costs today and will continue to bear significant portions of the administrative, development, and marketing costs. Today, Overclock Labs is asking the community to help fund the design, development and testing efforts associated with the Payment features (“Frictionless Free Trial” and “Fiat Payment”) of the Akash Console 2.0 roadmap.  

#### Responsibilities & Requirements

* Commit time and resources towards development, integration, and ongoing maintenance of Akash Console and its customizations for Akash Network 
* Provide support and code management to the community 
* Provide responsible and open reporting on the conversion of AKT to USD
* Builds tools necessary for the maintenance and support of Akash Console for Akash Network 
* Possess deep, proven knowledge of the Akash Network codebase, which covers development work under these primary repositories 
    * Akash Console: [https://github.com/akash-network/console](https://github.com/akash-network/console) 
    * AkashJS: [https://github.com/akash-network/akashjs](https://github.com/akash-network/akashjs)
    * Node: [http://github.com/akash-network/node](http://github.com/akash-network/node) 
    * Provider: [http://github.com/akash-network/provider](http://github.com/akash-network/provider) 
    * Akash-Api: [http://github.com/akash-network/akash-api](http://github.com/akash-network/akash-api) 
* Be an experienced full stack development team with years of experience with React based applications
* Possess extensive open-source development experience on the Akash Network code base
* Should have extensive experience managing the community.
* Should be publicly known and respected within the Akash Community.
* Should have contributed to the Akash open-source repositories.

Supplementing Overclock Labs’ treasury expenditures and Akash Network’s development efforts will help support more open-source contributors like zJ, Shimpa, HoomanDigital, and others and accelerate Akash Networks’ efforts to achieve cloud parity.

## Budget

For 2024, Overclock Labs will request $313,126.55. This represents approximately 29% of this project's total cost of $1,066,442.13. This proposal covers work started June 24, 2024, through the MVP’s launch, estimated to be, October 25, 2024. This percentage breakout is an aggregation of personnel multiplied by the amount of time spent on this effort vs other efforts. For example, the core engineering team may work on this project 75% of the time and other efforts 25% of the time. 

This request is broken down as follows:

<table>
  <tr>
   <td><strong>AEP 2 - Payments [Console2.0]</strong>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>Total Cost
   </td>
   <td>Request from CP
   </td>
  </tr>
  <tr>
   <td>Estimated engineering hours
   </td>
   <td><p style="text-align: right">
4,920.00</p>

   </td>
   <td><p style="text-align: right">
1,651.71</p>

   </td>
  </tr>
  <tr>
   <td>Engineering rate per hour
   </td>
   <td><p style="text-align: right">
$100.02</p>

   </td>
   <td><p style="text-align: right">
$93.38</p>

   </td>
  </tr>
  <tr>
   <td>Engineering total cost
   </td>
   <td><p style="text-align: right">
$492,079.65</p>

   </td>
   <td><p style="text-align: right">
$154,235.51</p>

   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Estimated support hours
   </td>
   <td><p style="text-align: right">
1,405.71</p>

   </td>
   <td><p style="text-align: right">
365.49</p>

   </td>
  </tr>
  <tr>
   <td>Support rate per hour
   </td>
   <td><p style="text-align: right">
$75.96</p>

   </td>
   <td><p style="text-align: right">
$59.10</p>

   </td>
  </tr>
  <tr>
   <td>Support total cost
   </td>
   <td><p style="text-align: right">
$106,775.99</p>

   </td>
   <td><p style="text-align: right">
$21,599.26</p>

   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Labor Subtotal
   </td>
   <td><p style="text-align: right">
$598,855.64</p>

   </td>
   <td><p style="text-align: right">
$175,834.76</p>

   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Operational Overage
   </td>
   <td><p style="text-align: right">
$89,828.35</p>

   </td>
   <td><p style="text-align: right">
$26,375.21</p>

   </td>
  </tr>
  <tr>
   <td>AKT Volatility Buffer (33.08%)*
   </td>
   <td><p style="text-align: right">
$198,101.45</p>

   </td>
   <td><p style="text-align: right">
$58,166.14</p>

   </td>
  </tr>
  <tr>
   <td>CA state tax (USA)
   </td>
   <td><p style="text-align: right">
$53,897.01</p>

   </td>
   <td><p style="text-align: right">
$15,825.13</p>

   </td>
  </tr>
  <tr>
   <td>Federal tax (USA)
   </td>
   <td><p style="text-align: right">
$125,759.68</p>

   </td>
   <td><p style="text-align: right">
$36,925.30</p>

   </td>
  </tr>
  <tr>
   <td>Tax, Vol & Overage Subtotal
   </td>
   <td><p style="text-align: right">
$467,586.49</p>

   </td>
   <td><p style="text-align: right">
$137,291.78</p>

   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td><strong>Grand Total</strong>
   </td>
   <td><p style="text-align: right">
<strong>$1,066,442.13</strong></p>

   </td>
   <td><p style="text-align: right">
<strong>$313,126.55</strong></p>

   </td>
  </tr>
</table>

**AKT volatility buffer* 
*This buffer accounts for the historical daily volatility of AKT measured over the last 30 days leading up to September 30, 2024. By providing a more substantial buffer against potential downswings in AKT, we mitigate the need to request any budget shortfalls through subsequent proposals. In the event of excess funds above the US dollar amount of labor, taxes, and overage, all remaining AKT will be returned to the community promptly after completing the proposal.*

## Limited Market Impact & Transparent Reporting

### Limited Market Impact

Overclock Labs will custody the requested funds in a new, distinct wallet so that funds from any other source are not commingled.

All funds will be liquidated and managed in a manner that ensures minimal impact on the market. These funds will be managed with the same care and attention as all previous Community Funding Proposals with liquidations done in a fashion that will not adversely affect the market. In practice, the effort of this liquidation will add depth to the AKT market for buyers looking to enter.

### Transparent Reporting

All costs and records will be made publicly available through reports to ensure maximum transparency and accountability.