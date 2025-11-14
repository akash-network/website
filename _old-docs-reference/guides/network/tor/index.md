---
categories: ["Guides"]
tags: ["Network"]
weight: 1
title: "Tor"
linkTitle: "Tor"
---

To deploy a Tor proxy on Akash follow the steps below. These steps will guide you through setting up Tor as a proxy server on Akash with the new tools.

### Prerequisites:
1. **Akash CLI**: Ensure you have the latest Akash CLI installed and configured.
2. **Tor Image**: Use an official Tor image or a custom Docker image for the Tor service.
3. **Akash Account**: You need an Akash account with available tokens for deployment.


### Step 1: Create a Tor Docker Image (Optional)
You can either pull an official Tor image from Docker Hub or build your own.

- **Using the Official Tor Image**:
  ```bash
  docker pull torproject/tor
  ```

- **Creating a Custom Docker Image (Optional)**:
  Create a `Dockerfile` with the following content:
  ```dockerfile
  FROM torproject/tor
  RUN apt-get update && apt-get install -y tor
  COPY torrc /etc/tor/torrc
  EXPOSE 9050
  ```

  Create the `torrc` configuration file and customize it as needed.

### Step 2: Prepare Your Deployment YAML File
Create a `deploy.yaml` file for your Akash deployment. This file defines the resources (CPU, RAM, and storage) and the services you will deploy (Tor proxy in this case).

```yaml
version: "2.0"
services:
  tor-proxy:
    image: torproject/tor:latest
    expose:
      - port: 9050
    environment:
      - TOR_PASSWORD=your_password_here
    resources:
      cpu: "500m"
      memory: "1Gi"
      storage: "2Gi"
    entrypoint:
      - tor
      - "--SocksPort"
      - "0.0.0.0:9050"
      - "--Log"
      - "notice file /var/log/tor/notices.log"
    restart: always
```

### Step 3: Deploy the Tor Proxy on Akash
- **Submit the deployment** using the `deploy` command:
  ```bash
  provider-services deploy --file tor-deployment.yaml
  ```

- The command will submit your deployment to Akash, where it will be processed and provisioned by an Akash provider.

### Step 4: Accessing Your Tor Proxy
Once your deployment is active, you can access your Tor proxy by connecting to the exposed port (default `9050`) on your Akash service. 

You can check the status of your deployment using:
```bash
provider-services status --deployment-id <deployment-id>
```

### Step 5: Test the Tor Proxy
Test the proxy by configuring your application or system to route traffic through `localhost:9050` (or the respective external IP and port). You can use curl to test the connection:

```bash
curl --proxy socks5h://<Your_Akash_IP>:9050 https://check.torproject.org/
```

If everything is set up correctly, you should see confirmation that you're using Tor.

### Step 6: Monitor the Deployment
Monitor your deployment to check for logs, service status, and performance metrics. You can also scale your deployment or modify it by updating the YAML file and redeploying.

```bash
provider-services logs --deployment-id <deployment-id>
```

### Step 7: Clean Up
To clean up the deployed Tor proxy service, you can remove the deployment using:

```bash
provider-services remove --deployment-id <deployment-id>
```

### Conclusion:
You have successfully deployed a Tor proxy on Akash. You can now route traffic securely through your Akash-deployed Tor proxy. Be sure to regularly monitor and maintain your deployment for performance and security updates.