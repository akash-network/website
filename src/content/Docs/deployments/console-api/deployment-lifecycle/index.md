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

1.  **Deployment Creation**: Submit SDL and deposit funds.
2.  **Bid Management**: Receive and select bids from providers.
3.  **Lease Creation**: Agree to terms and start the workload.
4.  **Management**: Monitor status and add funds.
5.  **Termination**: Close the deployment.

---

## 1. Create Deployment

Submit your application definition (SDL) to the network.

*   **Endpoint**: `POST /v1/deployments`
*   **Payload**:
    *   `sdl`: Your YAML Stack Definition Language file (stringified). Use [SDL Builder](https://console.akash.network/sdl-builder) to validate.
    *   `deposit`: Amount in USD (min $5).
*   **Result**: Returns a `dseq` (Deployment Sequence ID) and a `manifest`. Save both.
    ```json
    {
      "data": {
        "dseq": "12345678",
        "manifest": "..."
      }
    }
    ```

## 2. Manage Bids

Once a deployment is created, providers will send bids.

*   **Endpoint**: `GET /v1/bids/{dseq}`
*   **Logic**:
    *   Poll this endpoint every few seconds after deployment creation.
    *   Review `price`, `provider` attributes, and `audit` status.
    *   Select the bid that best fits your criteria (price, location, reputation).
    ```json
    {
      "data": [
        {
          "bid": {
            "id": { "provider": "akash1...", "dseq": "12345678", ... },
            "price": { "amount": "100", "denom": "uakt" }
          }
        }
      ]
    }
    ```

## 3. Create Lease

Accept the bid and start your deployment.

*   **Endpoint**: `POST /v1/leases`
*   **Payload**: `manifest`, `leases` array with bid details
*   **Result**: Provider starts your container.
    ```json
    {
      "data": {
        "success": true,
        "message": "Lease created"
      }
    }
    ```

## 4. Management

**Check Status**: `GET /v1/deployments/{dseq}` - Returns status and service URIs.

**Add Funds**: `POST /v1/deployments/deposit/{dseq}` with `{"amount": 5}` (USD) to prevent closure.

## 5. Termination

Stop the deployment and return unused funds.

*   **Endpoint**: `DELETE /v1/deployments/{dseq}`
*   **Result**: Leases close, deployment stops, unused funds return to your account.

## Troubleshooting

### No Bids Received
**Cause**: SDL requirements may be too high or pricing too low.
**Solution**:
*   Increase the price in your SDL.
*   Check if your requested resources (CPU/RAM) are available on the network.
*   Ensure your SDL syntax is valid.

### Lease Creation Fails
**Cause**: Provider timeout or resource unavailability.
**Solution**:
*   Retry the request; the provider might have been temporarily busy.
