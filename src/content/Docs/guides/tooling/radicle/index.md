---
categories: ["Guides"]
tags: ["CI/CD", "DevOps"]
weight: 1
title: "Radicle"
linkTitle: "Radicle"
---

Radicle is an open-source, peer-to-peer code collaboration stack built on Git. It operates in a decentralized manner, allowing users to maintain control over their data and workflow without a central authority. This guide provides instructions for deploying a Radicle Seed node on the Akash Network.

## Components

- **Radicle Seed Node**: Hosts repositories and is essential for the Radicle network.
- **Container Image**: Based on [radicle-docker](https://app.radicle.xyz/nodes/seed.radicle.garden/rad:zNd4qti1Jc69mCBQAdBeK3Avzy4R/tree/Dockerfile) and hosted on [Quay.io](https://quay.io/repository/vpavlin0/radicle-seed?tab=tags).
- **Radicle HTTP API**: Optionally enabled for additional functionalities.

## Prerequisites
- **Akash Network Account**: Ensure you have an active Akash Network account and have set up the necessary [CLI](http://localhost:4321/docs/deployments/akash-cli/installation/) or [web console](http://localhost:4321/docs/deployments/akash-console/) tools.

- **Radicle Repository IDs**: Obtain the repository IDs you wish to seed (if applicable).

## Deployment

### Prepare Your Deployment Manifest

Prepare a deployment manifest that includes the following parameters:

- `RAD_SEEDS`: (Optional) Set this environment variable to a semicolon-separated list of Radicle repository IDs you wish to seed.
- `RAD_HTTP_ENABLE`: Set to true to enable the Radicle HTTP API server.
- `RAD_PINNED_REPOS`: (Optional) List repository IDs you wish to pin and automatically seed, separated by semicolons.
- `RAD_EXTERNAL_ADDR`: Update this with the public address and port assigned by Akash Network.

### Deploy the Radicle Seed Node

1. Create the Deployment: Use the Akash Network CLI to create the deployment. Ensure the deployment manifest is correctly configured with the parameters above.

```

provider-services tx deployment create --file deployment.yaml

```

2. Find the Random Port: Akash Network assigns a random port to your service. Retrieve this port by running:

```
provider-services query deployment info --id <deployment_id>
```

3. Update External Address: After finding the random port, update the `RAD_EXTERNAL_ADDR` environment variable with the format provider.url:<random_port>.

```
export RAD_EXTERNAL_ADDR=provider.url:<random_port>
```
4. Deploy the Container: Deploy the container using the updated configuration.

```
provider-services tx deployment deploy --file deployment.yaml


```

###  Enable HTTP API Server (Optional)

If you have set `RAD_HTTP_ENABLE` to true, the Radicle HTTP API server will be available. You can pin repositories by setting the `RAD_PINNED_REPOS` environment variable with a list of repository IDs.

### Retrieve Node Information

To connect to your node and discover its Node ID, run the following command in the deployment console:

```
rad self --nid
```

This command will provide you with the Node ID and other necessary details.


## Post-Deployment

- Access Node: Use the external address and port to interact with your Radicle node.
- Monitor Logs: Check the logs for any issues or to verify the status of your deployment.

### Troubleshooting

- Node Not Discoverable: Ensure that `RAD_EXTERNAL_ADDR` is correctly set and matches the assigned port.
- API Not Responding: Verify that `RAD_HTTP_ENABLE` is set to `true` and check the deployment logs for errors.

