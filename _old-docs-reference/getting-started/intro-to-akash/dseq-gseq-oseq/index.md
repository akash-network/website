---
categories: ["Getting Started"]
tags: []
title: "DSEQ, GSEQ and OSEQ"
linkTitle: DSEQ, GSEQ and OSEQ
weight: 3

---

## GSEQ - Group Sequence

- Akash GSEQ distinguishes “groups” of containers in a deployment, allowing each group to be leased independently. Orders, bids, and leases all act on a single group.
- Typically, Akash deployments use GSEQ=1, with all pods associated with the deployment using a single provider.
- An example SDL section that specifies a GSEQ other than 1 is provided below. It requests bids from multiple providers via the declaration of multiple placement sections (`westcoast` and `eastcoast`).
- In this example, the westcoast placement section has an attribute of `region: us-west`, and the eastcoast placement has `region: us-east`, ensuring the pods land in the desired regions.

```yaml
placement:
  westcoast:
    attributes:
      region: us-west
    pricing:
      grafana-profile:
        denom: uakt
        amount: 10000
  eastcoast:
    attributes:
      region: us-east
    pricing:
      postgres-profile:
        denom: uakt
        amount: 10000
```

- When the deployment uses multiple placement sections, GSEQ defines individual, unique orders. The GSEQ values distinguish orders, as shown in the deployment creation output below. Note the value of GSEQ=1 in the first order and GSEQ=2 in the second order.

```json
{"order-created"},{"key":"owner","value":"akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu"},{"key":"dseq","value":"9507298"},{"key":"gseq","value":"1"},{"key":"oseq","value":"1"}

{"order-created"},{"key":"owner","value":"akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu"},{"key":"dseq","value":"9507298"},{"key":"gseq","value":"2"},{"key":"oseq","value":"1"}
```

## DSEQ - Deployment Sequence

In the Akash Network, the Deployment Sequence (DSEQ) plays a crucial role in the deployment process, allowing users to manage and track their deployments effectively. Understanding the significance of DSEQ is essential for successful interactions within the network. 

**Importance of DSEQ:**
- Unique Identifier: DSEQ is a unique identifier assigned to each deployment on the Akash Network, enabling precise tracking and management of deployments
- Order Sequence Number (OSEQ): DSEQ is associated with an Order Sequence Number (OSEQ), which indicates the order in which deployments are created and managed within the network
- Deployment Management: DSEQ facilitates the management of deployments by providing a specific reference point for each deployment instance, ensuring clarity and organization in the deployment process
- Lease Creation: When creating a lease with a provider on the Akash Network, DSEQ is a key parameter used to establish the terms of the lease and finalize the deployment process
- Deployment Status: DSEQ allows users to check the status of their deployments, access application endpoints, and monitor the progress of container image pulling and container startup

By leveraging the DSEQ in the Akash Network, users can streamline their deployment activities, maintain control over their applications, and ensure efficient and secure utilization of computing resources.

## OSEQ - Order Sequence

- Akash OSEQ distinguishes multiple orders associated with a single deployment.
- Typically, Akash deployments use OSEQ=1 with only a single order associated with the deployment.
- OSEQ is incremented when a lease associated with an existing deployment is closed, and a new order is generated.
- _**NOTE**_: OSEQ increments only when the deployment is left open, and the lease is closed (via `lease close`). It does not increment when the deployment is closed and created anew.
- To illustrate OSEQ usage, consider the following example:
  - Initially, we create a typical deployment:

```bash
provider-services tx deployment create deploy.yml --from $AKASH_KEY_NAME
```

  - After creating the deployment, we receive standard DSEQ, GSEQ, and OSEQ values:

```json
{"order-created"},{"key":"owner","value":"akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu"},{"key":"dseq","value":"9507524"},{"key":"gseq","value":"1"},{"key":"oseq","value":"1"}]
```

  - We proceed through lease creation with the desired provider.
  - Later, if we decide to move the deployment to a new provider and prefer to leave the deployment itself open, only closing the current lease, we use:

```bash
provider-services tx market lease close --node $AKASH_NODE --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```

  - With the lease of the former provider now closed, a new order is generated, and the OSEQ is incremented to 2. The bid list from the new order displays this increment, as shown in the output below.
  - _**NOTE**_: To display this bid list, use the following command syntax, where env variables oseq and gseq are set to `0`. This syntax displays all bids for a deployment regardless of the OSEQ/GSEQ current sequence number.

### Command Used:

```bash
provider-services query market bid list --owner=$AKASH_ACCOUNT_ADDRESS --node $AKASH_NODE --dseq $AKASH_DSEQ  --gseq 0 --oseq 0
```

### Output:

```yaml
bid:
    bid_id:
      dseq: "9507524"
      gseq: 1
      oseq: 2
      owner: akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu
      provider: akash1lmaulqyvlj0wwcjm5dgqn5wv5j957g672g20ht
    created_at: "9507559"
```
