---
categories: ["Providers"]
tags: []
weight: 2
title: "Provider Feature Discovery - GPU Configuration Integration Guide"
linkTitle: "Provider Feature Discovery - GPU Configuration Integration Guide"
---

Welcome to the `provider-configs` repository!

This documentation is designed to guide you through the process of identifying and submitting your GPU details, particularly if your GPU models are not already listed in our configurations.

### Important Notice

Before updating your provider configuration, it's crucial to verify that your GPU models are recognized in our system. If your GPU models do not yet exist in the designated JSON file, please adhere to the following procedure to capture and submit your GPU vendor/model IDs. This will allow the Akash core team to accurately populate the JSON file with your hardware details, ensuring seamless integration and discovery within our network.

### Pre-requisites

Ensure you have SSH access to each node equipped with a GPU. The forthcoming steps will require you to execute commands on each node to gather the necessary GPU information for submission.

### Step 1: Verify GPU Models

Before proceeding with the installation and data collection, verify if your GPU models are already included in this repo - gpus.json file. If not, you will need to follow the outlined process to capture and submit your GPU details.

### Step 2: Install `provider-services`

Ensure that `provider-services` version 0.5.4 or higher is installed on every node. This software is essential for listing your GPU details and submitting them to our repository. Download links are available at [provider-services releases](https://github.com/akash-network/provider/releases).

### Step 3: List GPU Details

Once `provider-services` is installed, run the following command on each node to list detailed information about the GPUs:

```bash
provider-services tools psutil list gpu
```

This command will output JSON-formatted information about each GPU on the node.

### Step 4: Filter GPU Details (Optional)

For nodes with multiple GPUs or to simplify the output, you can filter the results using the `jq` command. This step is optional but recommended for long GPU lists:

```bash
provider-services tools psutil list gpu | jq '.cards[] | .pci | {vendor: .vendor, product: .product}'
```

This command filters the output to show only the vendor and product information for each GPU.

### Step 5: Submit GPU Information

After collecting the GPU details, please submit this information to our GitHub repository by creating an issue:

1. Navigate to [Submit GPU Details Issue](https://github.com/akash-network/provider-configs/issues/new).
2. Title your issue as `Request: Add GPUs`.
3. In the issue description, paste the GPU information you collected. For readability and formatting, please enclose the GPU details in a JSON code block as shown below:

```json
{
  "Your GPU Information Here": "Replace this line with your collected GPU details."
}
```

Replace `"Your GPU Information Here"` with the actual results from your nodes.

Example:

```
{
  "cards": [
    {
      "address": "0000:00:04.0",
      "index": 0,
      "pci": {
        "driver": "nvidia",
        "address": "0000:00:04.0",
        "vendor": {
          "id": "10de",
          "name": "NVIDIA Corporation"
        },
        "product": {
          "id": "1eb8",
          "name": "TU104GL [Tesla T4]"
        },
        "revision": "0xa1",
        "subsystem": {
          "id": "12a2",
          "name": "unknown"
        },
        "class": {
          "id": "03",
          "name": "Display controller"
        },
        "subclass": {
          "id": "02",
          "name": "3D controller"
        },
        "programming_interface": {
          "id": "00",
          "name": "unknown"
        }
      }
    }
  ]
}
```

### Conclusion

Thank you for contributing to the Provider Feature Discovery feature. Your participation is crucial for the success of our network. If you encounter any issues or have questions, feel free to reach out through our community channels or directly on GitHub.
