---
categories: [Akash Console API]
tags: ["API", "Workflows"]
weight: 2
title: "Deployment Lifecycle"
linkTitle: "Deployment Lifecycle"
---

# Deployment Workflows

This guide details the logical steps required to manage the full lifecycle of a deployment on Akash using the Console API.

## The Deployment Lifecycle

1.  **Certificate Creation**: Authenticate with providers.
2.  **Deployment Creation**: Submit SDL and deposit funds.
3.  **Bid Management**: Receive and select offers from providers.
4.  **Lease Creation**: Agree to terms and start the workload.
5.  **Management**: Monitor status and add funds.
6.  **Termination**: Close the deployment.

---

## 1. Create Certificate

Before interacting with providers, you need a valid certificate.

*   **Endpoint**: `POST /v1/certificates`
*   **Action**: Generates a new certificate pair (PEM and Encrypted Key).
*   **Storage**: You must store the returned `certPem` and `encryptedKey`. These are required for creating leases.

## 2. Create Deployment

Submit your application definition (SDL) to the network.

*   **Endpoint**: `POST /v1/deployments`
*   **Payload**:
    *   `sdl`: Your YAML Stack Definition Language file (stringified).
    *   `deposit`: Amount in USD (min $5).
*   **Result**: Returns a `dseq` (Deployment Sequence ID) and a `manifest`. Save both.

## 3. Manage Bids

Once a deployment is created, providers will send bids.

*   **Endpoint**: `GET /v1/bids/{dseq}`
*   **Logic**:
    *   Poll this endpoint every few seconds after deployment creation.
    *   Review `price`, `provider` attributes, and `audit` status.
    *   Select the bid that best fits your criteria (price, location, reputation).

## 4. Create Lease

Accept the bid and start your deployment.

*   **Endpoint**: `POST /v1/leases`
*   **Payload**: `manifest`, `certificate` (certPem + keyPem), `leases` array with bid details
*   **Result**: Provider starts your container.

## 5. Management

**Check Status**: `GET /v1/deployments/{dseq}` - Returns status and service URIs.

**Add Funds**: `POST /v1/deployments/deposit/{dseq}` with `{"amount": 5}` (USD) to prevent closure.

## 6. Termination

Stop the deployment and return unused funds.

*   **Endpoint**: `DELETE /v1/deployments/{dseq}`
*   **Result**: Leases close, deployment stops, unused funds return to your wallet.

## Troubleshooting

### No Bids Received
**Cause**: SDL requirements may be too high or pricing too low.
**Solution**:
*   Increase the price in your SDL.
*   Check if your requested resources (CPU/RAM) are available on the network.
*   Ensure your SDL syntax is valid.

### Lease Creation Fails
**Cause**: Certificate issues or provider timeout.
**Solution**:
*   Ensure you are sending the correct `certPem` and `encryptedKey` from the *same* certificate pair.
*   Retry the request; the provider might have been temporarily busy.
