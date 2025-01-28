---
categories: ["Providers"]
tags: []
weight: 2
title: "Creating an Akash Provider Using the Akash Console"
linkTitle: "Provider Console"
---

The Akash Provider Console is an easy way to become an Akash Provider. Being a provider allows individuals and organizations to rent out their unused computing resources. 


This guide will walk you through the process of setting up an **Akash Provider** using the Akash Provider Console.

---

## Prerequisites:
1. **Akash Wallet with Sufficient Funds:** Ensure you have an account on Keplr Wallet with at least 30 AKT in it. 
2. **Provider Node:** To be a provider on Akash, you must have a node set up to offer resources. This could be a cloud server, a bare metal machine, or any server capable of hosting containers.
3. **Configure your server** Make sure your server is properly configured. 

---
## Prerequisite Step: Configure your Server:
This assumes you are using Linux. 

### Edit Your SSHD Configuration
First of all, you should edit your sshd configuration `/etc/ssh/sshd_config` to update specific perimeters for enhanced security. 
1. Switch to the root user to ensure you have you have the necessary permissions:

`sudo -i`

2. Open the configuration file with a text editor: 

`sudo nano /etc/ssh/sshd_config`

3. Locate the following lines in the file. If they are commented out (prefixed with `#`), remove the `#` to uncomment them:

```plaintext
PermitRootLogin prohibit-password
PubkeyAuthentication yes
```

4. Update the `PasswordAuthentication` parameter. Uncomment it, and change its value to `no` if it is currently set to `yes`:
```plaintext
   PasswordAuthentication no
```

5. Save and close the file:
   - If using `nano`, press `CTRL+O` to save and `CTRL+X` to exit.

6. Edit the `~/.ssh/authorized_keys` file:

`nano ~/.ssh/authorized_keys`

 7. Ensure the file contains the following lines:

 ``` no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user "admin" rather than the user "root".';echo;sleep 10;exit 142" ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTBuQzRQor39mU++RthyjUheuWj1Ph+lyyQwwp5t5AgfvXjM2SuQNFyEedIAkOd8/fuv/ejKrtP85TurF1fdAiixj/N5N+nW+GgJO9s/W6......
``` 

8. Comment the first line, and then find `ssh-rsa`, and hit the `enter` (or `return`) key to take it to a new line. It should now look like this:

```
     #no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user "admin" rather than the user "root".';echo;sleep 10;exit 142" 
     ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTBuQzRQor39mU++RthyjUheuWj1Ph+lyyQwwp5t5AgfvXjM2SuQNFyEedIAkOd8/fuv/ejKrtP85TurF1fdAiixj/N5N+nW+GgJO9s/W6......
```

9.  Restart the SSH service to apply the changes:

```
sudo systemctl restart ssh
```

NB: If you get and error message, try `sudo systemctl restart sshd`.

10. To ensure the changes have been applied, check the current SSHD configuration:

```
sudo sshd -T | grep -E 'permitrootlogin|pubkeyauthentication|passwordauthentication'
```

If you did everything correctly, you should see the following message







## Step 1: Log in to the Akash Console
- Go to the [Akash Provider Console]() in your browser.

![](../../assets/provider_lp.png)

- Click on `connect wallet`.

![](../../assets/connect_wallet.png)

- Select `Keplr`, sign into your wallet, and approve the network collection request.

![](../../assets/select_keplr.png)

- If everything went well, you will now have an option to `Create Provider`

![](../../assets/provider_landing.png)


---

## Step 2: Set Up Your Provider Node
   You may now go ahead and create a provider to lease out to users. 

   1. Click on the `Create Provider` button. You will be redirected to the`Import Wallet` page. 
   
   ![](../../assets/import_wallet.png)


   2. In `Server Access`, enter the number of servers you want to provide. If you intend to have both `control plane` and `worker` nodes, you should provide at least 2 servers.

   ![](../../assets/server_access.png)


   ![](../../assets/server_count.png)

   3. Fill in the requested information for your `Control Plane Node`. Make sure you choose how you would like to provide your credentials: select either one of `ssh` or `password`. Repeat the process for all of your nodes. 


   ![](../../assets/control_plane.png)

   4. Fill in your provider attributes

   ![](../../assets/provider_info.png)

   5. If you selected created 2 or more servers, you would have at least one worker node. For every node Pairing, the `Control Nodes` use the public IP addresses, while the `Worker Nodes` use the private IP addresses. 

   ![](../../assets/worker_nodes.png)

   5. Review the attributes you provided:

   ![](../../assets/review_pov.png)

   6. 

   6. Adjust the pricing of the various services you would be providing. The prices you set here determine the price your provider bids with and total revenue it earns for you.

   ![](../../assets/pricing.png)

   7. Import your wallet. This would be the wallet you ould be paid by leasées for using your machine. You'll have the option of either importing it automatically or  manually doing so. 

   a. **Importing Automatically**
   
   - If you decide to automatically do so, select `Auto Import` and click `Next`.
   
   - You would then be asked to enter your seed phrase. Ideally, you should use a different wallet from the one you connected to the Provider Console with. Enter your seed phrase and click next.

   [incomplete]


   b. 


