---
categories: ["Guides"]
tags: ["Hosting"]
weight: 1
title: "Guide to Creating a Custom Website with Ghost and Deploying to Akash"
linkTitle: "Ghost"
---


**Ghost** is an open-source platform for professional content creators. It's widely used for blogging, newsletters, and websites that prioritize simplicity and performance. Ghost is built on **Node.js** and offers features such as:

1. **Modern Editing**: Markdown-based editor for creating visually rich content.
2. **Built-in SEO and Social Tools**: Simplifies optimization for search engines and social media.
3. **Custom Themes**: Flexibility to create unique designs with handlebars templates or buy premium themes.
4. **APIs for Custom Integration**: Ghost provides robust APIs for integrating with other tools.
5. **Self-hosting or Managed Hosting**: You can host Ghost on your own server or use Ghost Pro (managed hosting).

---

## Steps to Create and Deploy a Custom Ghost Website to Akash

### 1. **Set Up Ghost Locally**
#### Install Ghost CLI
Ghost CLI is a command-line tool for installing and managing Ghost.

```bash
npm install -g ghost-cli
```

#### Create a New Ghost Instance
1. Create a directory for your project and navigate to it:
   ```bash
   mkdir my-ghost-site && cd my-ghost-site
   ```
2. Install Ghost:
   ```bash
   ghost install local
   ```
3. Access the local site in your browser at `http://localhost:2368`.

#### Customize Your Ghost Website
1. **Choose or Create a Theme**: 
   - Download a theme from [Ghost Marketplace](https://ghost.org/marketplace/).
   - Or, create a custom theme following the [Ghost Theme Documentation](https://ghost.org/docs/themes/).
   
   Place the theme in the `content/themes` directory.
   
2. **Activate the Theme**:
   - Access the admin panel at `http://localhost:2368/ghost`.
   - Upload and activate your theme under "Settings > Design."

3. Add content, configure SEO settings, and preview your website.

---

### 2. **Prepare Ghost for Deployment**
1. **Export Data (Optional)**:
   If you already have content, export it from the admin panel (`Settings > Labs > Export`).

2. **Set Up Production Configuration**:
   Update the `config.production.json` file with your production settings:
   ```json
   {
       "url": "https://your-domain.com",
       "server": {
           "port": 2368,
           "host": "0.0.0.0"
       },
       "database": {
           "client": "sqlite3",
           "connection": {
               "filename": "/path/to/ghost/content/data/ghost.db"
           }
       },
       "mail": {
           "transport": "Direct"
       },
       "logging": {
           "level": "info"
       },
       "process": "systemd"
   }
   ```

---

### 3. **Package Ghost for Akash**
#### Create a Dockerfile
Build a Docker image to containerize Ghost for Akash.

```dockerfile
FROM ghost:latest

# Set the working directory
WORKDIR /var/lib/ghost

# Copy custom content
COPY ./content /var/lib/ghost/content

# Expose the Ghost port
EXPOSE 2368

# Start Ghost
CMD ["npm", "start"]
```

#### Build and Push the Docker Image
1. Build the Docker image:
   ```bash
   docker build -t your-dockerhub-username/ghost-custom .
   ```
2. Push the image to Docker Hub:
   ```bash
   docker push your-dockerhub-username/ghost-custom
   ```

---

### 4. **Deploy Ghost on Akash**
#### Install Akash CLI
Follow the installation instructions from the [Akash CLI Guide](deployments/akash-cli/overview/).

#### Create an SDL File
Define the deployment parameters in an SDL file (`deploy.yaml`):

```
version: "2.0"

services:
  ghost:
    image: your-dockerhub-username/ghost-custom:latest
    expose:
      - port: 2368
        as: 80
        to:
          - global: true

profiles:
  compute:
    ghost:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    default:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - "akash1abcd...xyz"
      pricing:
        ghost:
          denom: uakt
          amount: 100

deployment:
  ghost:
    profiles:
      - compute: ghost
        placement: default
    count: 1
```

#### Deploy to Akash
1. Deploy the application:
   ```bash
   provider-services tx deployment create deploy.yaml --from your-wallet
   ```
2. Check the status of your deployment:
   ```bash
   provider-services query deployment list --owner your-wallet-address
   ```

#### Point a Domain to Your Akash Deployment
1. Get the public IP of your deployment.
2. Configure your DNS settings to point your domain to this IP.

---

### 5. **Verify and Maintain**
1. Access your website using your domain.
2. Monitor logs to ensure smooth operation:
   ```bash
   docker logs -f <container_id>
   ```
3. Update Ghost or your custom theme when needed.

---

This guide gives you a flexible and cost-effective way to host your Ghost website on the Akash decentralized cloud.