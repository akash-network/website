---
aep: 29
title: "Verifiable Hardware Provisioning"
author: Sriram Vishwanath (@sriramvish)
status: Final
type: Standard
category: Core
created: 2024-06-27
updated: 2024-12-01
estimated-completion: 2025-06-31
roadmap: major
discussions-to: https://github.com/orgs/akash-network/discussions/614
resolution: https://www.mintscan.io/akash/proposals/261
---

## Motivation

Verification of resources is critical for on-chain incentivization; hence, we propose a TEE-based verification mechanism detailed below.

## Summary

Verifiable computing is an entire class of algorithms or systems where a particular portion of the compute stack is verifiable/provable in a trustless manner to participants within a decentralized network. Verifiable computing can take many forms, including:

Verifiable provisioning of hardware: This corresponds to the case where we desire to verify the nature and extent to which a piece of hardware is provisioned for the Akash network.

Specifically, if a 4090 GPU were to be incorporated in the Akash network, verifiable provisioning ensures that it indeed matches its hardware specifications, and it is genuinely allocated for functions on the Akash network.

Verifiable execution of program/software: This corresponds to the case where a program (any AI program, ranging from inference to training) is correctly executed on a node/set of nodes in the Akash network. For example, that a particular piece of code was executed correctly in a cluster of 4090s on the Akash network. Verifiable execution of programs/software also comes in multiple flavors, including:
- Non-real-time: An offline verification mechanism that presents a proof in non-real-time, where the proof has no time or size constraints.
- Optimistic, real-time proofs: An optimistic proof mechanism that can be verified or contested in (near) real time.
- Zero knowledge, real-time proofs: A zero knowledge proof mechanism (that does not reveal anything about the inputs but can still be verified) in (near) real time.

In this proposal, for the first year of this project, we focus on only the first type of verifiability: That of provisioning of hardware. After the completion of this first portion of the project, a further proposal will be submitted on non-real-time and subsequently, real-time verifiable computing within the Akash network. Please review the discussions on Github here (https://github.com/orgs/akash-network/discussions/614).

## Benefits to Akash Network

The need for verifiable provisioning of hardware is significant for a variety of reasons, including the elimination/reduction of Sybil attacks, and of other forms of misrepresentation and abuse in the network.

## Verifiable Hardware Provisioning

Verifiable hardware provisioning can be achieved in a variety of ways: by using schemes uniquely associated with particular types of hardware, by using access patterns and footprints associated with a particular make and model, and other ways. However, these schemes are dependent on hardware configurations and do not necessarily generalize well. In order to develop a scalable, universal solution, we take a trusted enclave (trusted execution environment) approach as follows:

Akash providers that intend to be "hardware verifiable" are equipped with a TEE, configured by Akash (such as Trusty [1], for more information on TEE, see tutorial [2]). Such a TEE contains a physically unclonable function (a PUF, see [3]) that can securely sign transactions. To ensure uniformity, this TEE will be designed to be a USB A/C dongle that can be attached to any hardware configuration.

We will verify that the USB A/C dongle can be attached to any hardware configuration and provide a detailed set of instructions to install and use this dongle to enable each provider to become "hardware verifiable" on Akash.

This TEE will periodically perform the following two tasks, based on an internal pseudo-random timer:

### Identification task

Following a pseudo-random clock, the TEE will query every GPU in the specific Akash provider on its status and device-level details.

### Provisioning task

Periodically and randomly, a random machine learning task will be assigned to the GPUs within this provider. These provisioning tasks are based on existing, well-known benchmarks on the performance of GPUs to certain deep learning tasks, including particular types of models [4], more general deep learning models [5] and other tasks that are well-known benchmarks on existing GPUs [6].

After the conclusion of each type of pseudorandomly repeated task, the TEE will securely sign the message, and will share the secure message with the Akash network.

The tasks are used to ensure the following properties:

### Identification task

The identification task sets up the base configuration for each GPU cluster, and assigns a unique signature associated with the TEE with that cluster. As the identification is performed at the operating system level, it can potentially be spoofed, and therefore, the provisioning/benchmarking tasks are required.

### Provisioning task

The provisioning/benchmarking tasks verify the identification while simultaneously ensuring that the associated GPUs are dedicated to the Akash network and are not prioritizing other tasks. In case they are not provisioned for the Akash network, they will fail the provisioning task.

A key point is that both the entire system (user, operating system) cannot differentiate between a provisioning/benchmarking task and a regular AI workload provided by the Akash network, and therefore cannot selectively serve a particular type of workload/task. This ensures that the GPUs are both correctly identified and are made available to Akash network-centric tasks at all times.

## Team

The team for this project is led by Prof. Sriram Vishwanath from The University of Texas, Austin. Sriram Vishwanath is a professor at The University of Texas, Austin and Shruti Raghavan is a PhD candidate in Computer Science at UT Austin. They are working together with the Harvard Medical School and MITRE on the design of new foundation/base models in healthcare, with causal learning incorporated into such a platform.

Sriram Vishwanath received the B. Tech. degree in Electrical Engineering from the Indian Institute of Technology (IIT), Madras, India in 1998, the M.S. degree in Electrical Engineering from California Institute of Technology (Caltech, Pasadena USA) in 1999, and the Ph.D. degree in Electrical Engineering from Stanford University, Stanford, CA USA in 2003. Currently, he is Professor in the Chandra Department of Electrical and Computer Engineering at The University of Texas at Austin, and recently, a Technical Fellow for Distributed Systems and Machine Learning at MITRE Labs.

## Timeline

Open Discussions: Starting end of June 2024
Governance Proposal: Through first half of July, 2024
Design Phase: Through Q3 and Q4 2024
Hacknet TEE Phase: Q1 2025
Devnet TEE Phase: Q2 2025
Conclusion of Hardware Provisioning testing and handover to Akash Team: End of Q2 2025
Note: This is subject to change based on feedback

## Deliverables

Q3 2024 - High Level Design
Q4 2024 - Design Specification
Q1 2025 - Initial Hacknet Prototype
Q2 2025 - Devnet and Conclusion of Testing

## Budget

The tentative budget for this project is presented in the spreadsheet attached here (https://docs.google.com/spreadsheets/d/1asmvyi5r7QgKRjsImZInAENXptr_cwoW/edit?usp=sharing&ouid=103645797398143147236&rtpof=true&sd=true).

The high-level breakdown for the budget is:
R\&D Costs (Student salaries + tuition + University Overhead): $146,547
Akash Computing/Hardware Costs: $75,000
Volatility and Liquidation Buffer (10%): $22,154.70

Total budget requested: $243,701.70 or 68,842.28 AKT
Wallet Address: akash1sa5quyrpmf3l2acfrwgsy9t34yxpkvwrnqdmm0

## Disbursement:

Disbursement will happen in two increments, coinciding with the few weeks before the beginning of each semester - Fall 2024 (on July 22nd 2024) and Spring 2025 (December 15 2024).

## References

[1] Trusty TEE: Android Open Source Project https://source.android.com/docs/security/features/trusty
[2] TEE 101 White Paper https://www.securetechalliance.org/wp-content/uploads/TEE-101-White-Paper-FINAL2-April-2018.pdf
[3] Shamsoshoara, Alireza, et al. "A survey on physical unclonable function (PUF)-based security solutions for Internet of Things." Computer Networks 183 (2020): 107593.
[4] Wang, Yu Emma, Gu-Yeon Wei, and David Brooks. "Benchmarking TPU, GPU, and CPU platforms for deep learning." arXiv preprint arXiv:1907.10701 (2019).
[5] Shi, Shaohuai, et al. "Benchmarking state-of-the-art deep learning software tools." 2016 7th International Conference on Cloud Computing and Big Data (CCBD). IEEE, 2016.
[6] Araujo, Gabriell, et al. "NAS Parallel Benchmarks with CUDA and beyond." Software: Practice and Experience 53.1 (2023): 53-80.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). 
