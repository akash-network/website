---
categories: ["Guides"]
tags: ["Network"]
weight: 1
title: "Deploying SoftEther VPN on Akash Network"
linkTitle: "SoftEther VPN"
---



This guide provides step-by-step instructions on deploying a SoftEther VPN server on the Akash Network.

## Prerequisites

- **Akash CLI Installed**: Ensure you have the Akash CLI installed. Follow the [Akash CLI Installation Guide](https://akash.network/docs/deployments/akash-cli/installation/) if needed.
- **AKT Tokens**: Verify that your Akash wallet has sufficient AKT tokens to cover deployment costs.
- **SoftEther VPN Docker Image**: Use a SoftEther VPN Docker image compatible with Akash's infrastructure.

## Steps to Deploy SoftEther VPN

1. **Set Up Environment Variables**

   Configure your environment with the necessary Akash settings:

   ```bash
   export AKASH_FROM=your_wallet_name
   export AKASH_KEYRING_BACKEND=test
   export AKASH_GAS=auto
   export AKASH_GAS_PRICES=0.025uakt
   export AKASH_GAS_ADJUSTMENT=1.5
   export AKASH_BROADCAST_MODE=sync
   export AKASH_NODE=https://rpc.testnet-02.aksh.pw:443
   export AKASH_CHAIN_ID=$(curl -s -k $AKASH_NODE/status | jq -r '.result.node_info.network')
   ```

   Replace `your_wallet_name` with your actual wallet name. Adjust other variables as necessary. 

2. **Create or Recover Your Wallet Key**

   If you don't have a wallet key, create one:

   ```bash
   provider-services keys add $AKASH_FROM
   ```

   To recover an existing key:

   ```bash
   provider-services keys add $AKASH_FROM --recover
   ```

3. **Obtain AKT Tokens**

   Acquire AKT tokens from the faucet to fund your deployment:

   ```bash
   curl -s https://faucet.testnet-02.aksh.pw/request?address=$(provider-services keys show $AKASH_FROM -a) | jq
   ```

4. **Generate and Publish Your Client Certificate**

   Generate a client certificate:

   ```bash
   provider-services tx cert generate client
   ```

   Publish the certificate:

   ```bash
   provider-services tx cert publish client
   ```

5. **Create a Deployment Manifest**

   Develop a deployment manifest (`deploy.yml`) for your SoftEther VPN server. Here's an example:

   ```yaml
   version: "2.0"
   services:
     vpn:
       image: your_softether_image
       expose:
         - port: 443
           external: true
           protocol: tcp
   ```

   Replace `your_softether_image` with the Docker image you intend to use.

6. **Deploy the VPN Server**

   Submit the deployment request:

   ```bash
   provider-services tx deployment create deploy.yml
   ```

   Monitor the deployment status:

   ```bash
   provider-services query market order list --state open
   ```

   Accept a bid from a provider:

   ```bash
   provider-services tx market lease create --dseq your_dseq --provider your_provider_address
   ```

   Replace `your_dseq` and `your_provider_address` with the appropriate values obtained from the previous command.

7. **Send the Deployment Manifest to the Provider**

   ```bash
   provider-services send-manifest deploy.yml --dseq your_dseq
   ```

8. **Deposit Additional AKT for Lease Duration**

   Ensure your deployment has sufficient funds:

   ```bash
   provider-services tx deployment deposit 10000000uakt --dseq your_dseq
   ```

9. **Verify Deployment and Retrieve Connection Details**

   Check the lease status:

   ```bash
   provider-services lease-status --dseq your_dseq --provider your_provider_address
   ```

   Retrieve the assigned IP address and port mapping:

   ```bash
   provider-services lease-logs --dseq your_dseq --provider your_provider_address
   ```

   Note the external IP and port assigned to your VPN service.

10. **Configure VPN Clients**

    Use the provided connection details to configure your VPN client. For SoftEther VPN, you may need to adjust settings based on the assigned IP and port.

## Additional Notes

- **Port Mapping Limitations**: Akash does not currently support direct (1:1) port mapping. To determine the mapped ports, use:

  ```bash
  provider-services lease-status
  ```

  For VPN services, it's recommended to use OpenVPN over TCP port 443, as it works reliably within Akash's networking constraints. [Source](https://github.com/DeWiCats/akash-airclaw-vpn/blob/main/README.md)

- **Client Configuration**: After deployment, download the client certificate from the Akash dashboard. Modify the `remote` setting in the `.ovpn` file to reflect the assigned IP and port. This configuration enables your OpenVPN client to connect to the SoftEther VPN server deployed on Akash.

## Conclusion

By following these steps, you can successfully deploy a SoftEther VPN server on the Akash Network using the `provider-services` CLI tool. Ensure you monitor your deployment's status and maintain adequate AKT funds to keep your VPN service operational.

For more detailed guides and community discussions, consider exploring the following resources:

- [Deploying a VPN Server in Akash](https://medium.com/@dimokus/deploying-a-vpn-server-in-akash-9cdc586f913e)
- [SoftEther VPN Server on Akash with OpenVPN Client](https://www.youtube.com/watch?v=pHee7KczzY0)
- [SoftEther VPN on Akash Network Deployment Guide](https://github.com/Dimokus88/VPNAkash)

These resources offer additional insights and community experiences that can further assist you in deploying and managing your VPN service on Akash.
