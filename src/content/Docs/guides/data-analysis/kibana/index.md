---
categories: ["Guides"]
tags: ["Data Analysis"]
weight: 1
title: "Kibana"
linkTitle: "Kibana"
---

Kibana requires Elasticsearch as its data source, so ideally, both should be deployed to Akash if they aren’t accessible elsewhere.

## 1. Define the Akash Deployment File

```
---
version: "2.0"

services:
  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.2 # Specify the desired version of Kibana
    env:
      - ELASTICSEARCH_HOSTS=http://your_elasticsearch_url:9200  # Replace with actual Elasticsearch endpoint
    expose:
      - port: 5601 # Kibana default port
        as: 80
        to:
          - global: true

profiles:
  compute:
    kibana:
      resources:
        cpu:
          units: 0.5  # Adjust according to expected workload
        memory:
          size: 2Gi
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        kibana:
          denom: uakt
          amount: 100000  # Adjust based on the cost you want to set

deployment:
  kibana:
    akash:
      profile: kibana
      count: 1
```

save the file as `deploy.yaml`.

## 2. Modify the Environment Variables (Optional)

Adjust the environment variables to configure Kibana according to your requirements. The `ELASTICSEARCH_HOSTS` variable should point to your Elasticsearch instance.

## 3. Deploying to Akash

1. **Install the Akash CLI if you haven’t already**:

```
curl https://raw.githubusercontent.com/ovrclk/akash/master/godownloader.sh | sh
```

2. **Authenticate with Akash using your wallet**:
```
provider-services tx authz grant <your_wallet_address> --from <your_wallet_name> --keyring-backend <keyring-backend>
```
3. **Submit the Deployment**:
```
provider-services tx deployment create --owner <your_wallet_address> --from <your_wallet_name> --dseq <unique_deployment_sequence> --keyring-backend <keyring-backend> --node https://rpc-akash.<network>.org --chain-id akashnet-2 --file kibana_deployment.yaml
```
4. **Approve the Bid and Lease**: Use Akash CLI or Akashlytics to view and accept bids for your deployment. Once you find a provider, you can finalize the lease.

5. **Access Kibana**: Once deployed, Kibana will be accessible at the provider's public IP.