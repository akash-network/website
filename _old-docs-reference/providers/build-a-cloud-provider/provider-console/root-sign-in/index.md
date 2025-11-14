---
categories: ["Provider Console"]
tags: []
weight: 3
title: "How to Enable Root Sign-in to Provider Console"
linkTitle: "How to Enable Root Sign-in"
---

To successfully become a provider, root login need to have been enabled on your machine. Below is a guide on how to successfuly do that, if it has not yet been enabled.

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

7.  Ensure the file contains the following lines:

```
no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user "admin" rather than the user "root".';echo;sleep 10;exit 142" ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTBuQzRQor39mU++RthyjUheuWj1Ph+lyyQwwp5t5AgfvXjM2SuQNFyEedIAkOd8/fuv/ejKrtP85TurF1fdAiixj/N5N+nW+GgJO9s/W6......
```

8. Comment the first line, and then find `ssh-rsa`, and hit the `enter` (or `return`) key to take it to a new line. It should now look like this:

```
 #no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user "admin" rather than the user "root".';echo;sleep 10;exit 142"
 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTBuQzRQor39mU++RthyjUheuWj1Ph+lyyQwwp5t5AgfvXjM2SuQNFyEedIAkOd8/fuv/ejKrtP85TurF1fdAiixj/N5N+nW+GgJO9s/W6......
```

9. Restart the SSH service to apply the changes:

```
sudo systemctl restart ssh
```

NB: If you get an error message, try `sudo systemctl restart sshd`.

10. To ensure the changes have been applied, check the current SSHD configuration:

```
sudo sshd -T | grep -E 'permitrootlogin|pubkeyauthentication|passwordauthentication'
```

If you did everything correctly, the output should display:

```
permitrootlogin prohibit-password
 pubkeyauthentication yes
 passwordauthentication no
```

11. Finally, make sure you open the following ports:

`2379`-`2380`, `6443`, `30000`,`32676`, `22`, `8443`, `8444`, `80`, `443`.

You are now ready to create a provider.
