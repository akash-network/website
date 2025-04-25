---
categories: ["Guides"]
tags: ["Machine Learning", "Deployment", "Data Science"]
weight: 1
title: "Deploying and Using Jupyter on Akash"
linkTitle: "Jupyter Notebook"
---

Jupyter Notebooks are an open-source web application that allows you to create and share documents containing live code, equations, visualizations, and narrative text. They are widely used for data analysis, machine learning, and academic research because they provide an interactive environment where you can write code, see results immediately, and document your process all in one place.

## Deploying Jupyter on Akash

### Access the Akash Console:

Open your web browser and navigate to the [Akash Console](https://console.akash.network/).

### Create a New Deployment:

Once logged in, go to the "Deployments" section and click on "Create New Deployment".

### Configure the Deployment:

1. Deployment Name: Enter a name for your deployment, e.g., "Jupyter Notebook".

2. Deployment YAML: Use the SDL  file template for [Jupyter](https://console.akash.network/templates/akash-network-awesome-akash-jupyter). You may also use  Modify as necessary

### SDL Configuration

The SDL configuration in the [Akash Console](https://console.akash.network) can be seen below:

```

---
version: "2.0"

services:
  # make sure to NOT name the service as "jupyter" to avoid conflicting K8s variable name "<SERVICE>_<KEY>" with the app's variable name (JUPYTER_PORT)
  jupyter-app:
    # There are many other Jupyter images you can choose from here: https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html
    image: jupyter/tensorflow-notebook
    expose:
      - port: 8888
        as: 80
        to:
          - global: true

profiles:
  compute:
    jupyter-app:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        jupyter-app:
          denom: uakt
          amount: 10000

deployment:
  jupyter-app:
    akash:
      profile: jupyter-app
      count: 1
```

This configuration specifies that the deployment uses the Jupyter Tensor-flow Docker image, maps port 8888, allocates 2 CPUs and 2Gi of memory, and provides 10Gi of storage for notebooks.

### Submit the Deployment:

- Click "Submit" to create and deploy your Jupyter Notebook.

### Access the Jupyter Notebook:

- Once deployed, go to the "Service Endpoints" section in the Akash Console.
- Find the endpoint corresponding to port 8888. This will be the URL you use to access your Jupyter Notebook.

### Using Jupyter:

- Open the URL provided for port 8888 in your web browser.
- - You will be prompted to enter a token. You can find this token in the logs of your deployment. Go to the "Logs" section in the Akash Console to retrieve it.
Enter the token to access the Jupyter Notebook interface.

### Start Working:

- You can now create new notebooks, upload existing ones, and start using Jupyter for your data analysis or research tasks.

### Additional Tips:

- Regularly save your notebooks and manage your storage usage.
- Make sure to monitor resource usage to ensure the deployment remains within your allocated limits.