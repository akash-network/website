---
categories: ["Guides"]
tags: ["Machine Learning","Search"]
weight: 1
title: "Deploying Haystack on Akash Network"
linkTitle: "Haystack"
---



This guide outlines how to deploy **Haystack**, a versatile NLP framework for building search systems, on **Akash**, the decentralized cloud computing platform. The deployment uses Akash's `SDL` template for efficient and cost-effective provisioning of compute resources.

---

## **What is Haystack?**

Haystack, developed by **deepset**, is a framework for building powerful, customizable, and production-ready search systems powered by natural language processing (NLP). It supports a variety of use cases, such as question answering, semantic search, and document indexing. Some of Haystack’s features include:

- **Search Pipelines**: Build pipelines to handle questions and retrieve documents.
- **Multiple Models**: Integrate models like BERT, RoBERTa, and others for document processing and Q&A.
- **Pluggable Components**: Mix and match retrievers, readers, and indexing tools.
- **Backend Integration**: Works seamlessly with Elasticsearch, OpenSearch, FAISS, and more.
- **APIs**: Offers REST API endpoints for interfacing with Haystack pipelines.

For this deployment, we will use the official **deepset/haystack** Docker image.

---

## **Prerequisites**

1. **Akash CLI**: Install and configure the Akash CLI.
2. **Akash Wallet**: Fund your Akash wallet with sufficient AKT tokens.
3. **Docker**: Ensure Docker is installed on your machine for testing.
4. **SDL Template**: Prepare the SDL file for your Haystack deployment.

---

## **Sample SDL for Haystack Deployment**

Here is an example of an SDL file to deploy Haystack on Akash:

```yaml
version: "2.0"

services:
  haystack:
    image: deepset/haystack:latest
    env:
      - WORKERS=1
      - DEBUG=true
    expose:
      - port: 8000
        as: 80
        accept:
          - http
        to:
          - global

profiles:
  compute:
    haystack:
      resources:
        cpu:
          units: 1
        memory:
          size: 2Gi
        storage:
          size: 5Gi
  placement:
    westcoast:
      attributes:
        region: us-west
      pricing:
        haystack:
          denom: uakt
          amount: 500

deployment:
  haystack:
    westcoast:
      profile: haystack
      count: 1
```

---



## **SDL Breakdown**

1. **`services.haystack`**:
   - Specifies the **Docker image** (`deepset/haystack:latest`) to deploy.
   - Sets environment variables:
     - `WORKERS`: Defines the number of workers handling requests.
     - `DEBUG`: Enables debugging mode for troubleshooting.
   - Exposes port `8000` (mapped to `80`) for external HTTP access.

2. **`profiles.compute.haystack`**:
   - Allocates **resources** for the container:
     - `CPU`: 1 unit.
     - `Memory`: 2GB RAM.
     - `Storage`: 5GB disk space.

3. **`profiles.placement`**:
   - Defines deployment attributes such as **region** and **pricing**.
   - This example deploys in the `us-west` region and sets a cost of `500 uakt`.

4. **`deployment`**:
   - Ties the compute profile and placement configuration together.
   - Deploys one replica (`count: 1`) of the Haystack service.

---

## **Deployment Steps**

1. **Validate the SDL**:
   Save the SDL as `deploy.yaml` and validate it using the Akash CLI:
   ```bash
   provider-services tx deployment create deploy.yaml --from <wallet-name>
   ```

2. **Bid and Lease**:
   Once your deployment is created, monitor and accept a bid for your deployment:
   ```bash
   provider-services query market lease list --state open
   ```

   After finding a suitable bid, create a lease:
   ```bash
   provider-services tx market lease create --dseq <deployment-sequence> --oseq <order-sequence> --gseq <group-sequence> --from <wallet-name>
   ```

3. **Access Haystack**:
   After successful deployment, retrieve the service’s IP and port:
   ```bash
   provider-services provider service-status <lease-id>
   ```

   Access the Haystack REST API at the provided IP/port, typically accessible via `http://<IP>:80`.

4. **Test the Deployment**:
   Verify that Haystack is running by querying the API:
   ```bash
   curl http://<IP>:80/health
   ```

---

## **Next Steps**

- **Custom Pipelines**:
   Configure Haystack pipelines to index documents or set up specific search functionalities.

- **Persistent Storage**:
   Modify the SDL to use persistent volumes if you need data to persist across restarts.

- **Scaling**:
   Adjust the `count` parameter or resource allocation in the SDL to scale Haystack as needed.

---

## **Conclusion**

Deploying **Haystack** on Akash offers a decentralized and cost-effective way to leverage the power of NLP-driven search systems. By combining Haystack's flexibility with Akash's decentralized infrastructure, you can deploy scalable and secure AI applications in a production-ready environment.