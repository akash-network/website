---
categories: ["Guides"]
tags: ["Database", "SQL"]
weight: 1
title: "PostgreSQL"
linkTitle: "PostgreSQL"
---
- **PostgreSQL**: PostgreSQL is a powerful, open-source, object-relational database system known for its robustness, feature set, and SQL compliance. It supports advanced data types, concurrency, and scalability, making it suitable for small to enterprise-level applications.
  
- **Akash Network**: Akash is a decentralized cloud platform that enables users to deploy applications in a cost-effective, secure, and censorship-resistant manner. Using Akash, developers can deploy containerized applications such as PostgreSQL without relying on traditional centralized cloud providers.

---

#### **Key Steps to Deploy PostgreSQL on Akash**

1. **Set Up Akash CLI**:
   - Install the Akash CLI by following the [official guide](https://docs.akash.network/).
   - Configure your wallet and fund it with AKT tokens to pay for deployments.

2. **Prepare the PostgreSQL Docker Image**:
   - Choose a PostgreSQL Docker image, such as the official `postgres` image from Docker Hub.
   - Ensure the image meets your configuration needs (version, extensions, etc.).

3. **Define an SDL File for the Deployment**:
   - The SDL (Service Definition Language) file defines the deployment's requirements, such as resource allocation, container configuration, and environment variables.

---

#### **Sample SDL File for PostgreSQL Deployment**

Below is an example SDL file to deploy PostgreSQL on Akash:

```yaml
---
version: "2.0"

services:
  postgres-db:
    image: postgres:latest
    env:
      POSTGRES_USER: "your_username"
      POSTGRES_PASSWORD: "your_password"
      POSTGRES_DB: "your_database"
    expose:
      - port: 5432
        as: 5432
        to:
          - global: true

profiles:
  compute:
    postgres-db:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 10Gi

  placement:
    akash:
      attributes:
        region: us-west
      pricing:
        postgres-db:
          denom: uakt
          amount: 100

deployment:
  postgres-db:
    postgres-db:
      profile: postgres-db
      count: 1
```

---

#### **Key Sections of the SDL File**

1. **`services`**:
   - Defines the container image to use (`postgres:latest`).
   - Configures environment variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) to initialize PostgreSQL.
   - Exposes PostgreSQL on port `5432` and makes it accessible globally.

2. **`profiles`**:
   - **`compute`**: Specifies resource allocation (CPU, memory, and storage).
   - **`placement`**: Determines the deployment's region and cost pricing for Akash.

3. **`deployment`**:
   - Maps the service (`postgres-db`) to the compute profile and specifies the number of container instances (`count: 1`).

---

#### **Steps to Deploy**

1. **Validate the SDL File**:
   - Run the following command to ensure your SDL file is valid:
     ```bash
     akash deploy validate <your-sdl-file>.yaml
     ```

2. **Create the Deployment**:
   - Deploy the PostgreSQL service using:
     ```bash
     akash tx deployment create <your-sdl-file>.yaml --from <your-wallet>
     ```

3. **Bid on the Deployment**:
   - After creating the deployment, Akash providers will bid on your job.
   - Accept a bid to finalize the deployment.

4. **Access the PostgreSQL Service**:
   - Use the lease details to retrieve the service’s public endpoint.
   - Connect to the PostgreSQL instance using a client or application:
     ```bash
     psql -h <service-ip> -U <your_username> -d <your_database>
     ```

---

#### **Tips and Best Practices**

- **Backup Your Data**: Use persistent storage or an external volume to ensure your PostgreSQL data is retained after container restarts.
- **Secure Connections**: Use tools like SSH tunnels or VPNs to secure database access.
- **Scaling**: Update the `count` value in the `deployment` section to increase the number of instances.

---

This guide provides a straightforward process to deploy PostgreSQL on Akash using a sample SDL file. Tailor the configurations to meet your application's specific needs, and enjoy the cost-effective and decentralized benefits of Akash!