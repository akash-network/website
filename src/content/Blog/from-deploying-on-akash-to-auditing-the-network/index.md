---
title: "From Deploying on Akash to Auditing the Network"
description: Introduction

pubDate: "2022-06-28"
draft: false

categories:
  - Insights
tags:
  - Insights
  - Developers
  - Partners
  - Product
contributors:
  - Alani Kuye

bannerImage: ./banner-image.png
---

### Introduction

The Moultrie Audits team is determined to continue adding value to the Akash ecosystem, and the greater Cosmos ecosystem. They have created a tiered auditing system, are the only active community auditors, and have developed one-click auditing. This means you can set up your provider via an onboarding tool like Praetor, and get your provider audited, all without ever having to come in contact with Moultrie. This reduces the barriers to entry for individuals and entities looking to increase their security in the Web3 ecosystem.

The Moultrie Audits team is an infrastructure auditing development group focused on decentralized Cosmos SDK protocols.

A blockchain-based decentralized web is shattering centralized monopolies that control information, access, money, and how networks work. Furthermore, Web3 has created new interconnected economies, new asset classes and products, including new decentralized services online. As Web3 re-democratizes the web, this will define the next era of the internet. Akash plays a key role in this process.

Akash Network is the world's first distributed peer-to-peer marketplace for cloud compute that provides a fast, efficient, and low-cost application deployment solution. Developers leveraging Akash Network can access cloud computing at a fraction of the cost compared to centralized cloud providers like Amazon Web Services (AWS), Google Cloud, and Microsoft Azure.

### The Moultrie Audits Team

Moultrie Audits is composed of former Department of Defense (DoD) software engineers, network architects, and penetration testers. Moultrie Audits team members have achieved government compliance for 17 applications and led 7 applications into production, including 3 artificial intelligence applications used in hostile environments. The project lead, Anthony Rosa, also received a DoD award for cooperative work with the NSA on cryptocurrency.

The Moultrie Audits team’s dive into Web3 work began in 2019 with content creation in the Tezos ecosystem,  leading to community awards from TezosCommons. Team members then built ERC20 and BEP20 tokens for pay before exploring the application possibilities of cryptocurrency in the DoD. Hedera Hashgraph was integrated into applications and the team saw potential in Akash as a way to make government infrastructure more resilient. Not only was Akash useful for short-term, anonymous test deployments, but it could also be used as a fast-flux defense tactic, utilizing the compute power of individuals to defend against attacks on prominent infrastructure.

The Moultrie team was responsible for multiple deployments within the first 100 active deployments on the Akash Network. At this time, Akashlytics had not launched and the CLI and Tom Beynon’s Docker deploy method were the only available options. Understanding the technical limitations of some users, and the developer-focused posture of Akash, Moultrie began making tutorials for deployment. They created poweredbyakash.com as a single place for users to view public projects on Akash, find tutorials, or download free simple code paired with guides. The tutorials are currently being updated to reflect the newer deployment methods and capabilities of the Akash ecosystem.

Naturally, some community members needed additional support for more complex deployments, so Moultrie helped members through Telegram. This caught the eye of the Akash team members who proposed Moultrie to support the onboarding of larger clients on Akash. Thus, Project Phoenix was born, which was a 3-month event resulting in 33 sites being built and 12 projects/apps/companies actively adopting Akash. Project Phoenix was also the original point of contact for Rango Exchange, a decentralized exchange utilizing Akash.

After Project Phoenix’s success, and given the Moultrie team’s background in infrastructure auditing, the Akash team reached back out and propositioned Moultrie to design an auditing system for providers. The Moultrie team agreed and recognized the importance of such an undertaking. Without an audited, verified system, gaining regulatory, governmental and institutional adoption would be a difficult undertaking. 6 months later, Moultrie Audits has operational three-tiered auditing and is capable of dozens of concurrent audits, scaling to meet the growing provider set thanks to ecosystem partner, Praetor.

### Tiered Audits

Moultrie Audits has designed and launched a three-tier auditing system (bronze, silver, gold) to allow for variance in provider capabilities, security, and financial resources. Onboarding begins through our website, email, or via Praetor. For intrusive audits which require sensitive Information, a Right-to-Audit contract is drafted and signed by the provider, data custodian, and company representative. Moultrie then tailors our audit to the provider’s configuration, creates a lightweight agent for the provider to deploy on their controller, and begins trial deployments. Depending on the level of audit, these deployments undergo testing.

Moultrie has custom task lists, Security Configuration Assessments, uptime metrics from global positions, and regulatory compliance frameworks including NIST 800-53 and PCI DSS. This also includes the ability to provide MITRE ATT&CK reports. The first phase of the audit lasts 2-4 weeks before a full report is generated for the provider with all issues discovered, explanations, and remediation steps. Moultrie provides support for implementing these controls throughout the audit.

Once issues have been fixed, Moultrie conducts a second review period to give them a chance to prove the remediation of discovered issues. If the team passes this second review, a cryptographic signature is awarded corresponding to the level of audit conducted. Moultrie publishes all signed providers on their public tracker and offers continued support and periodical testing of signed providers. Providers with signatures can then be searched for by clients through manifests, and our signatures are included in the Akashlytics Deploy tool.

![](https://www.datocms-assets.com/45776/1656438660-code.png)

To see Moultrie’s signatures in Akashlytics, click [here](https://github.com/Akashlytics/akashlytics-deploy/blob/master/auditors.json).

To visit Moultrie’s public tracker, click [here](https://www.moultrieaudits.com/).

### One-Click Audits

People adopt cryptocurrency protocols for different reasons. From a technical perspective, blockchain is rarely, if ever, the most efficient solution for a computer problem. Crypto-evangelists are using blockchain for other reasons, namely for inherent privacy, decentralization, security, and resiliency. However, not everyone assigns these traits intrinsic value, and many place convenience and user experience at the top of their value hierarchy.

This is why Moultrie Audits is launching one-click bronze audits in conjunction with Praetor. Praetor provides a seamless onboarding experience for providers who simply need to input publicly accessible information before clicking “audit,” and Moultrie handles the rest. One-click audits are important for three reasons. First, if the auditing process is difficult, expensive, or cumbersome, providers will simply ignore optional audits. The easier the process, the more provider involvement, and the more security for tenants. Second, a major benefit of Akash is its potential to unlock the compute capacity of individuals.

These individuals don’t have the resources for institutional-grade security, so the bronze audit is a way to verify basic security for lower-level deployments. This will increase decentralization in the provider set through equitable auditing opportunities without ostracizing smaller providers. Lastly, when tenants deploy, the most important thing is that the product works, aka that the provider hosts the website properly and reliably. Additionally, less secure providers are cheaper to operate, and not all deployments require high security. Tenants should have the option to consciously purchase less security for a better rate. A one-click audit offers a good balance between convenience, accommodating tenant choice, and verifying basic security and high uptime.

### Government Grade Standards

Since the Moultrie Audits team comes from a US government background, they placed utmost importance on providers meeting US standards for hosting, even if some of the obligations appear arcane or irrelevant. To meet these high standards, Moultrie Audits developed custom task lists from experience in the DoD which run configuration checks for Security Configuration Assessments (Operating System dependent best practices) and regulatory compliance frameworks, such as PCI DSS (payment regulations), GDPR (European privacy rules), and HIPAA. They also use the open-source lightweight agent, Wazuh, to provide a redundant set of checks on controller configurations and for their SCA module which provides an engine to run tests in YAML format.

Moultrie’s penetration model is based upon the DoD’s Team Rocket, which conducts penetration testing on applications and infrastructure once the software passes static and end-to-end tests.

Questionnaires with verification are required for audits higher than bronze to test for aspects of the provider which are not possible to verify through software. These are focused on physical security and check for physical servers with locked access, a security monitoring system with alerts, redundant power, redundant cooling, redundant network connections, and physical firewalls.

Government and high-level clients also typically require uptime and failover service level agreements, which set standards for performance and resiliency from hosting infrastructure. Moultrie has never seen downtime higher than 30 minutes/year in a contract, and so for Moultrie’s Gold Audit, they require 99.999% uptime which equates to 5 minutes and 15 seconds of downtime/year. Historically, 70% of federal agencies have still failed to meet this requirement, so a Gold Audit from Moultrie will provide reassurance to agencies looking to minimize downtime and optimize costs. For the Silver Audit, Moultrie enforces 99.9% uptime, or sub 9 hours/year downtime, and Bronze Audits require 99% uptime for lower-level deployments or sub 4 days/year downtime. Uptime checks are sent from Moultrie-controlled systems throughout the US and utilize Site24x7 for global checks from Amsterdam, NL, Manila, PH, Manama, BH, Montreal, CA, and Hong Kong, HK. Since the Akash Network tenants are a global consumer base, providers must meet uptime requirements from all locations to pass an audit.

### Revenue Model

Funding from grants is the most desirable funding method for any organization as it provides immediate funds without equity loss and few, if any, legal obligations. However, it is incredibly important to have a sustainable and independent revenue model, especially during bear markets. Moultrie Audits is particularly well-positioned to capitalize on a revenue model as there is a clear transactional relationship between an auditor and an auditee. The auditee, which is the provider, desires the security improvements, long-term support, performance statistics, and elevated signatures that Moultrie provides. These extended benefits are worth the one-time auditing fee. Moultrie Audits has successfully implemented the pay-per-audit business model and received 5 payments for audits. The team uses these profits to cover operating expenses and proceeds to provide subsequent audits free of charge.

Moultrie Audits intends to submit requests for funds in the future. This will ensure audits are free for providers and will help fund experimental future auditing programs, such as validator auditing. If funding proves difficult, they plan to remain operational due to their proven business model. The Akash community should expect this from all projects: no one should be existentially reliant on funding. Furthermore, Moultrie has an active validator that can generate profits from delegators who value their work.

###  Moultrie Audits Validator

Moultrie Audits launched its provider in December 2021, and are currently ranked 53rd/100 in terms of voting power. They have a competitive 5% commission, and 100% uptime, and have voted on all 5 governance proposals put forward since joining the active validator set. One of Moultrie Audits’ validator sentries is also powered by Akash, allowing infrastructure on the network to secure the underlying chain. This takes value accrual from validator service payments and feeds them directly into the network, creating circular growth.

![](https://www.datocms-assets.com/45776/1656442124-unnamed-2.png)

Moultrie Audits originated Proposal #16 in February 2022 which passed with ~82% “yes” votes in March 2022. They also originated Proposal #20 in June 2022, and plan on originating Proposal #21 immediately after the voting period for Proposal #20. This makes Moultrie Audits one of the top 5 active validators in originating governance on the network. Moultrie also advertised a policy to not sell any validator rewards for all of 2022 and they have followed through on that promise.

In addition to originating governance, Moultrie Audits has written blogs analyzing the effects of the different governance proposals. For Proposal #14, which expanded the validator set from 85 to 100, Moultrie tested whether the voting power would actually decentralize from the preexisting prevote threshold distribution, and checked other arbitrary voting power distribution changes. Moultrie also published data on the effects of Proposal #9 and Proposal #16 which funded the Akash Community Awards Board and documented the tremendous impact that the Akash Accelerator-funded projects have had on the network.

![](https://www.datocms-assets.com/45776/1656442163-unnamed-3.png)

To read Moultrie Audits’ Blog, click [here](https://www.moultrieaudits.com/blog).

### Effects of Audits

The most important part of Moultrie Audits is whether an increase in security leads to tangible, and not just philosophical, benefits. On average, getting audited correlates to an increased average deployment count for providers. Providers with a Moultrie Audits signature (2124 EST 01JUNE2022) have an average of 43 active deployments, ~286% more than ones without a signature (~15). This benefits the provider financially and encourages more providers to enter the network, seeing a greater potential profit opportunity.

Beyond the individual provider, auditing from Moultrie is a risk-offloading vector for Akash. There is a conflict of interest between the managing organization attempting to grow its adoption while simultaneously acting as the regulator. Centralization is undesirable for cryptocurrencies and web3, as it undermines the security of the decentralized system. Additionally, audits of any sort will never guarantee 100% security; zero-day attacks may occur and breaches are inevitable. Adding the complexity of remote auditing to physical infrastructure only increases the risks of auditor error. It is beneficial to the Akash community that partners like Moultrie bring such expertise to the decentralized cloud, and are fully aligned with the greater web3 ecosystem.

### Other Moultrie Projects

Following the mnemonic self-exposure of HitBTC's DVPN wallet and subsequent loss of significant user funds, Moultrie developed a 24x7 block monitoring system to check for exposed mnemonics in real time. With the help of the Akash team, Moultrie also accessed the historical block data stored in a database and recovered all available funds associated with exposed accounts. The Moultrie team published articles on this process back in December 2021, but removed them due to the confusion that this was an Akash security vulnerability, when in fact it was a user error associated with a misunderstanding of the transaction parameters. Moultrie continues to monitor the Akash Network and recovers user funds when able, always free of charge. The Moultrie team has returned thousands of AKT back to vulnerable users, and released block data in collaboration with the Akash team during each instance of recovery. Recently, a community member was kind enough to publicly acknowledge Moultrie for recovering and returning his funds in full:

![](https://www.datocms-assets.com/45776/1656441512-unnamed-1.png)

Moultrie continues to help onboard projects to the Akash ecosystem, continuing efforts from Project Phoenix. If a team is interested in migrating to Akash, Moultrie sets up a front end of their website/application as a demonstration of how to deploy, and then helps the team transition the rest of their architecture. Demand for the Akash Network's resources is the most important metric to track for the sustainability of the ecosystem and Moultrie will always support this effort. One of these post-Project Phoenix clients is a blogger and creator of Nederlandse Spreker, Joel Benson, who publicly attested to Moultrie's support in his journey through Web3.

> “Anthony at Akash Audit helped me tremendously with figuring out how to get The Conceptualist and some of my personal websites onto Akash. Super happy to see my websites hosted on a decentralized platform!” –
>
> Joel Benson, Founder of The Conceptualist Journal and Nederlandse Spreker

Moultrie Audits also created and manages [poweredbyakash.com](http://poweredbyakash.com), a website dedicated to tracking projects who publicly utilize Akash. It currently contains 52 websites and applications. There is also a guides section with 7 guides involving the adoption and usage of Akash. Finally, we added a codepacks section to include free code of static websites that beginners can "plug and play" their information into for a quick, customizable blog or linktree website. Both codepacks come with a step-by-step deployment guide. The projects listed on [poweredbyakash.com](http://poweredbyakash.com) are not inclusive of all deployments, and this is to be expected.

Some deployments are redundant instances for resiliency. Another massive benefit of Akash is the ability to anonymously deploy, and while the network is still young, exposing hosting solutions can add additional risk. [poweredbyakash.com](http://poweredbyakash.com) continues to receive attention and engagement from the community with a combined 591 pulls on dockerhub, and 5,000+ requests in the past 30 days (May/June 2022).

Moultrie plans to expand [poweredbyakash.com](http://poweredbyakash.com) to other Cosmos SDK projects and has created cosmostutorials.com for this purpose. These are side projects for Moultrie's small team, but are updated frequently. Altogether, Moultrie's sites received 67,000 requests in the past 30 days (May/June 2022), driving significant attention toward the Akash ecosystem.

![](https://www.datocms-assets.com/45776/1656441699-unnamed.jpeg)

Moultrie Audits is now exploring a validator auditing program to complement their provider auditing program. With the implosion of the Terra ecosystem, and the cascading insolvencies of various crypto-related projects, the US Treasury has signaled intent to begin regulating certain projects by the end of 2022. Sooner or later, validators will fall within sight of regulators, and Cosmos projects need to be prepared. Moultrie is uniquely qualified to undertake this due to the team's familiarity with regulatory compliance, proven Web3 auditing experience, and relationship with government agencies. Further applications for validator auditing could include tracking sales and foundation delegations and displaying this information in a consumable manner for prospective stakers. This public accountability system incentivizes community-oriented behavior from validators and disincentivizes dumping or unethical behavior.

Moultrie Audits also has an active member on the Akash Community Awards Board (CAB), now the Akash Accelerator Program, a community effort to fund and incubate projects which add value to the Akash Network. The Akash Accelerator meets once a month for presentations and deliberation. In addition to submitting governance proposals, Moultrie has also contributed private funds, along with other CAB members, to support developers who want to use Akash, but don’t necessarily contribute to the growth of the overall ecosystem.

Finally, Moultrie intends to create a DAO to lead auditing innovation while simultaneously decentralizing the organization.

> “Since the overarching goal of Moultrie Audits is to increase the amount of scalable security solutions, we need to remain malleable and open to change. Implementing community governance from active/invested parties will give the community the chance to direct our future, the way crypto-governance intended.”
>
> – Moultrie Team

### Overall Impact

As of June 16th, 2022, Moultrie Audits has signed 5 providers and is actively auditing 24 others. With 11 currently predicted to pass, over 50% of providers with a signature will have one from Moultrie. This means Moultrie will be the most active auditor on the Akash Network, the only active auditor outside of the Akash team, and one of the most active governing validators on the network, all while delivering content that draws thousands of eyes to Akash-related content every month.

### Call-to-Action

To learn more about Moultrie Audits, click [here](https://www.moultrieaudits.com).

To join Moultrie Audits’ Discord Channel, click [here](https://discord.gg/hsMvYrd2).

To learn more about Akash, click [here](https://www.akash.network/).

Collection: Overclock Labs, Akash Case Studies on Validators and Web3 Adoption

Perspectives: Web3, Innovation & Design, Decentralization, Blockchain, Governance, Technology and Operations.

Contributors: Moultrie Audits

Citation: Yale University, COWLES FOUNDATION FOR RESEARCH IN ECONOMICS. Jacob Leshno and Philipp Strack October 2019 Revised November 2019: BITCOIN: AN IMPOSSIBILITY THEOREM FOR PROOF-OF-WORK BASED PROTOCOLS By

Citation: Harvard Business Review: Thomas Stackpole,  Reid Blackman,  Ramsey Khabbaz,  Jonathan Ruane,  Andrew McAfee,  Ana Andjelic,  Li Jing,  Katie Parrott: Welcome to Web3, May 24, 2022

Acknowledgement: This case study is the second in a series of case studies on Web3, Blockchain Validators, Governance Frameworks and User Adoption from Overclock Labs.
