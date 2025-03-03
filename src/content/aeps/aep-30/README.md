---
aep: 30
title: "Cosmos SDK v0.47 Migration"
author: Cheng Wang (@lechenghiskhan) Artur Troian (@atroian) Scott Carrutthers (@chainzero)
status: Final
type: Standard
category: Core
created: 2024-08-29
updated: 2024-02-18
estimated-completion: 2025-03-15
roadmap: major
requires: 61
discussions-to: https://github.com/orgs/akash-network/discussions/673
resolution: https://www.mintscan.io/akash/proposals/268
---

## Motivation

Akash Network has been live for almost 4 years, and we have made incredible strides in decentralizing development, coordination, and funding.

As proposed in [AKT 2.0](https://github.com/orgs/akash-network/discussions/32), which received overwhelming support from the community, we proposed formally funding technical Research, Development, and Support done by the Akash Core Team and administered by Overclock Labs. As bolstered by proposals [211](https://www.mintscan.io/akash/proposals/211), [240](https://www.mintscan.io/akash/proposals/240), and [241](https://www.mintscan.io/akash/proposals/241), the Community Pool will continue to be well-funded as Akash Network accelerates its development.

Any unused funds will be returned to the community as with all previous funding proposals.

## Introduction

Akash Network launched in 2020 and has experienced explosive growth over the last few years, partly due to being open-sourced fully in late 2023. Today, [Akash Network organization](https://github.com/akash-network/community) has over 350 contributors building across 49 repositories coordinated and led by the Overclock Labs team through 11 special interest groups, working groups, and user groups. This achievement is monumental and should be celebrated, especially as we focus on the actual output: 2 major acquisitions, multiple web2 and web3 AI platform partnerships, university research collaborations, 11 network upgrades, and nearly 100 completed issues and over 200 discussions spanning more than four years.

## Challenge

With a growing codebase driven by an ever-larger feature set, Akash Network is more complex than ever and this complexity will only increase over time. As the community of contributors continues to grow, coordination becomes more challenging, costs rise, and development velocity slows.

## Proposal

Since 2016, Overclock Labs has fully borne the cost of development and support of Akash Network. Overclock Labs continues to fund most of these costs today and will continue to bear significant portions of the administrative, development, and marketing costs. Today, Overclock Labs is asking the community to help fund the development and testing efforts associated with the migration of Akash Network to [COSMOS SDK v0.47](https://github.com/orgs/akash-network/projects/5?pane=issue&itemId=59184208).

### Responsibilities & Requirements

* Commit time and resources towards development, integration, and ongoing maintenance of COSMOS SDK v0.47 and its customizations for Akash Network
* Provide support and code management to the community
* Provide responsible and open reporting on the conversion of AKT to USD
* Builds tools necessary for the maintenance and support of COSMOS SDK v0.47 for Akash Network
* Possess deep, proven knowledge of the Akash Network codebase, which covers development work under these primary repositories
    * Node: [http://github.com/akash-network/node](http://github.com/akash-network/node)
    * Provider: [http://github.com/akash-network/provider](http://github.com/akash-network/provider)
    * Akash-Api: [http://github.com/akash-network/akash-api](http://github.com/akash-network/akash-api)
* Possess extensive open-source development experience on the Akash Network code base
* Should have extensive experience managing the community.
* Should be publicly known and respected within the Akash Community.
* Should have contributed to the Akash open-source repositories.

Supplementing Overclock Labs’ treasury expenditures and Akash Network’s development efforts will help support more open-source contributors like zJ, Shimpa, HoomanDigital, and others and accelerate Akash Networks’ efforts to achieve cloud parity.

### Budget

For Q4 2024, Overclock Labs will request $377,196.13. This represents approximately 52% of this project's total cost of $726,814.22. This proposal covers work started on April 9, 2024 through the end of the testnet, estimated to be, September 27, 2024. Overclock Labs pays the remaining 48%. This percentage breakout is an aggregation of personnel multiplied by the amount of time spent on this effort vs other efforts. For example, the core engineering team may work on this project 75% of the time and other efforts 25% of the time.

This request is broken down as follows:

<table>
  <tr>
   <td><strong>Upgrade to SDK v0.47</strong>
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
2,485.71</p>

   </td>
   <td><p style="text-align: right">
1,382.29</p>

   </td>
  </tr>
  <tr>
   <td>Engineering rate per hour
   </td>
   <td><p style="text-align: right">
$99.91</p>

   </td>
   <td><p style="text-align: right">
$111.15</p>

   </td>
  </tr>
  <tr>
   <td>Engineering total cost
   </td>
   <td><p style="text-align: right">
$248,341.22</p>

   </td>
   <td><p style="text-align: right">
$153,646.62</p>

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
977.14</p>

   </td>
   <td><p style="text-align: right">
244.29</p>

   </td>
  </tr>
  <tr>
   <td>Support rate per hour
   </td>
   <td><p style="text-align: right">
$94.22</p>

   </td>
   <td><p style="text-align: right">
$94.22</p>

   </td>
  </tr>
  <tr>
   <td>Support total cost
   </td>
   <td><p style="text-align: right">
$92,071.04</p>

   </td>
   <td><p style="text-align: right">
$23,017.76</p>

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
$340,412.26</p>

   </td>
   <td><p style="text-align: right">
$176,664.38</p>

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
$51,061.84</p>

   </td>
   <td><p style="text-align: right">
$26,499.66</p>

   </td>
  </tr>
  <tr>
   <td>AKT Volatility Buffer (68.51%)*
   </td>
   <td><p style="text-align: right">
$233,216.44</p>

   </td>
   <td><p style="text-align: right">
$121,032.77</p>

   </td>
  </tr>
  <tr>
   <td>CA state tax (USA)
   </td>
   <td><p style="text-align: right">
$30,637.10</p>

   </td>
   <td><p style="text-align: right">
$15,899.79</p>

   </td>
  </tr>
  <tr>
   <td>Federal tax (USA)
   </td>
   <td><p style="text-align: right">
$71,486.57</p>

   </td>
   <td><p style="text-align: right">
$37,099.52</p>

   </td>
  </tr>
  <tr>
   <td>Tax, Vol & Overage Subtotal
   </td>
   <td><p style="text-align: right">
$386,401.96</p>

   </td>
   <td><p style="text-align: right">
$200,531.74</p>

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
<strong>$726,814.22</strong></p>

   </td>
   <td><p style="text-align: right">
<strong>$377,196.13</strong></p>

   </td>
  </tr>
</table>

_*AKT volatility buffer_

_This buffer accounts for the historical daily volatility of AKT measured over the last 30 days leading up to August 28, 2024. By providing a more substantial buffer against potential downswings in AKT, we mitigate the need to request any budget shortfalls through subsequent proposals. In the event of excess funds above the US dollar amount of labor, taxes, and overage, all remaining AKT will be returned to the community promptly after completing the proposal._

## Limited Market Impact & Transparent Reporting

### Limited Market Impact

Overclock Labs will custody the requested funds in a new, distinct wallet so that funds from any other source are not commingled.

All funds will be liquidated and managed in a manner that ensures minimal impact on the market. These funds will be managed with the same care and attention as all previous Community Funding Proposals with liquidations done in a fashion that will not adversely affect the market. In practice, the effort of this liquidation will add depth to the AKT market for buyers looking to enter.


## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).