---
aep: 20
title: "Praetor (Provider Client) Funding"
author: Deval Patel (@devalpatel67)
status: Final
type: Meta
created: 2023-03-22
completed: 2023-03-29
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/182

---

## Motivation

Providers are currently experiencing multiple issues that negatively impact the user experience. One major problem is the absence of content moderation, which can lead to inappropriate or harmful material being shared on their platforms. This lack of oversight can make users feel unsafe or uncomfortable while using the service.

Another significant challenge is the absence of lease and financial dashboards. Without these tools, providers struggle to effectively manage their properties and finances. This can result in inefficient operations, missed opportunities, and potential financial losses. Users may also find it difficult to access important information about their leases or financial obligations.

Lastly, providers lack an ideal upgrade path for their services. This means that users may not have clear options for improving their experience or accessing additional features. Without a well-defined upgrade process, providers may struggle to retain customers or attract new ones, ultimately limiting their growth potential and user satisfaction.

The Praetor team has been solving these issues for Akash and requires funding to sustain development.

## Summary

We are proposing a funding request of \~50k USD (AKT 165,000 as per AKT to USD price at submitting the proposal) from the community pool for our efforts to enhance user experience and increase Akash network adoption. Please follow the GitHub discussion here (https://github.com/akash-network/community/discussions/92).

## Introduction

We propose several solutions to address these challenges to enhance the Akash Network's functionality. We presented to the steering committee on Thursday, Feb 23, 2023.

Here is the attached presentation: Praetor Akash - Steering Committee Presentation - 23 Feb 2023.pdf (https://github.com/akash-network/community/files/10819309/Praetor.Akash.-.Steering.Committee.Presentation.-.23.Feb.2023.pdf)

## Proposed Solutions

1. Management API/ Moderation API for Content Moderation
   To address the issue of content moderation, we propose implementing a management API and Moderation API in the Akash provider service and Praetor. This will give providers better control over their leases and ensure that only moderated content can be hosted on their provider. This spec is coming from wg-content-moderation (https://github.com/akash-network/community/tree/main/wg-content-moderation).
2. Lease Dashboard
   Currently, there is no lease dashboard, making it difficult for providers to manage leases effectively. To address this issue, we propose implementing a lease dashboard that will show all the current and past leases, allowing providers to track their status and provide the best possible service to their leaseholders. Providers can also close leases and choose not to host leases from specific wallets.
3. Financial Dashboard
   We propose to show a financial dashboard to providers, giving them a comprehensive overview of their finances on the platform. The financial dashboard will also show current and upcoming projections based on leases, historic lease financial data, and more. To extract and process this data, we will use Airflow or integrate with indexers like Cloudmos, ensuring efficient data processing and storage.
4. Upgrade to Helm
   To provide providers with access to the latest features and upgrades, we propose upgrading the platform to Helm. This will enable existing non-Praetor providers to have Praetor functionalities such as network upgrades, leases, and financial dashboards. This will also enable Praetor providers to get insider and vanguard support from the community.
5. Miscellaneous Features
   We propose adding additional features such as banning image-based leases, adding persistent storage for existing providers using the dashboard, and continuing the EDU program, which will educate the community about the Akash platform.

## Funding Request

We request funding of USD 50K in $AKT to implement the proposed solutions. We have a timeline for each solution and will work efficiently to implement them. We aim to finish all of the roadmap in 5 months.

## Roadmap (Timeline)

1. Content Moderation & Lease Dashboard
   - Implement management API in the Akash provider service for content moderation
   - Implement management API in Praetor for content moderation
   - Implement a lease dashboard in Praetor
   - Help providers implement the moderation API in the Akash provider service
2. Helm Upgrade
   - Install a new provider with Helm
   - Upgrade existing providers to Helm
   - Provide Praetor functionalities to existing non-Praetor providers
3. Financial Dashboard
   - Create a financial dashboard for providers
   - Show current month and upcoming projections based on leases
   - Show historic lease financial data
   - Process financial data securely using Airflow or integrate with indexers like Cloudmos
4. Existing Provider Feature
   - Integrate moderation API to allow providers to ban image-based leases
   - Add persistent storage for existing providers using the dashboard
   - Support existing EDU program participants and create new curriculums

## Conclusion

Implementing these solutions will significantly enhance the Akash Network's functionality and provide a better user experience for our providers. We look forward to your support and cooperation in achieving our goals.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). 