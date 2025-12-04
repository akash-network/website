---
categories: ["Learn", "Core Concepts"]
tags: ["Shell Access", "Debugging", "Container Management"]
weight: 8
title: "Shell Access"
linkTitle: "Shell Access"
description: "Execute commands and access running containers on Akash Network"
---

**Learn how to access and manage your running deployments using shell commands.**

Akash provides powerful tools to interact with your running containers, including executing commands, accessing the shell, and copying files. These capabilities are essential for debugging, monitoring, and managing your deployments.

---

## Overview

Shell access on Akash gives you three key capabilities:

1. **Execute Commands** - Run commands inside containers (like `docker exec`)
2. **Interactive Shell** - Access the container's CLI/terminal
3. **File Transfer** - Copy files from containers to your local machine

**Use cases:**
- Debugging application issues
- Inspecting logs and configurations
- Running maintenance tasks
- Monitoring resource usage
- Extracting data or reports

---

## Prerequisites

Before using shell access, ensure you have:

- Active deployment with a lease
- Akash CLI installed (`provider-services`)
- Your wallet key accessible
- Deployment sequence number (DSEQ)
- Provider address

**Find your deployment info:**

Via Console:
- DSEQ shown in deployment details
- Provider address in lease information

Via CLI:
```bash
provider-services query market lease list --owner <your-address>
```

---

## Remote Command Execution

Execute single commands inside running containers without entering an interactive shell.

### Command Template

```bash
provider-services lease-shell \
  --from <key-name> \
  --dseq <deployment-sequence> \
  --provider <provider-address> \
  <service-name> \
  <command-to-execute>
```

### Required Parameters

- `--from` - Your wallet key name (required)
- `--dseq` - Deployment sequence number (required)
- `--provider` - Provider's Akash address (required)
- `<service-name>` - Service name from your SDL (e.g., "web", "api")
- `<command-to-execute>` - Command(s) to run in the container

### Optional Parameters

- `--node` - RPC node URL (default: `http://localhost:26657`)
- `--gseq` - Group sequence (default: `1`)
- `--oseq` - Order sequence (default: `1`)
- `--replica-index` - Replica index to connect to (default: `0`)
- `--auth-type` - Gateway auth type: `jwt` or `mtls` (default: `jwt`)
- `--keyring-backend` - Keyring backend: `os`, `file`, `kwallet`, `pass`, or `test`

### Example: View System Files

```bash
provider-services lease-shell \
  --from mykey \
  --dseq 226186 \
  --provider akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww \
  web \
  cat /etc/passwd
```

### Example: Using Environment Variables

```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq 226186 \
  --provider $AKASH_PROVIDER \
  --node $AKASH_NODE \
  web \
  cat /etc/passwd
```

**Set up environment variables:**
```bash
export AKASH_KEY_NAME=mykey
export AKASH_PROVIDER=akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww
export AKASH_NODE=https://rpc.akashnet.net:443
```

### Common Commands

**Check disk usage:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  df -h
```

**View running processes:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  ps aux
```

**Check environment variables:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  env
```

**Test network connectivity:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  ping -c 4 google.com
```

---

## Interactive Shell Access

Access the container's CLI for interactive debugging and exploration.

### Command Template

```bash
provider-services lease-shell \
  --from <key-name> \
  --dseq <deployment-sequence> \
  --tty \
  --stdin \
  --provider <provider-address> \
  --node <rpc-node-url> \
  <service-name> \
  /bin/sh
```

### Interactive Mode Parameters

- `--tty` - Enable interactive terminal (TTY) mode
- `--stdin` - Connect stdin for input (automatically enabled with `--tty`)
- `/bin/sh` - Shell binary to execute (varies by container)
- `--node` - Akash RPC node URL (e.g., `https://rpc.akashnet.net:443`)

**Note:** The `--tty` flag automatically enables `--stdin`, so you typically only need to specify `--tty`.

### Example: Access Shell

```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq 226186 \
  --tty \
  --provider $AKASH_PROVIDER \
  --node $AKASH_NODE \
  web \
  /bin/sh
```

**Once connected, you'll see a prompt:**
```bash
/ # pwd
/app
/ # ls -la
total 12
drwxr-xr-x 1 root root 4096 Jan 15 10:30 .
drwxr-xr-x 1 root root 4096 Jan 15 10:30 ..
-rw-r--r-- 1 root root  220 Jan 15 10:30 index.html
/ # exit
```

### Shell Selection by Container Type

Different base images use different shells:

**Ubuntu/Debian:**
```bash
/bin/bash
```

**Alpine Linux:**
```bash
/bin/ash
```

**Generic:**
```bash
/bin/sh
```

**How to determine:**
```bash
# Try sh first (most compatible)
provider-services lease-shell ... web /bin/sh

# If that fails, check what's available
provider-services lease-shell ... web ls /bin
```

---

## File Transfer

Copy files from running containers to your local machine for inspection.

### Command Template

```bash
provider-services lease-shell \
  --from <key-name> \
  --dseq <deployment-sequence> \
  --provider <provider-address> \
  <service-name> \
  <command-to-read-file> > <local-file-name>
```

### Example: Copy Configuration File

```bash
provider-services lease-shell \
  --from mykey \
  --dseq 226186 \
  --provider akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww \
  web \
  cat /etc/passwd > local_copy_of_passwd
```

### Example: Using Environment Variables

```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq 226186 \
  --provider $AKASH_PROVIDER \
  web \
  cat /etc/passwd > local_copy_of_passwd
```

**Verify the copy:**
```bash
ls -lh local_copy_of_passwd
cat local_copy_of_passwd
```

### Common File Operations

**Copy application logs:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  cat /var/log/app.log > app.log
```

**Extract configuration:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  cat /app/config.json > config.json
```

**Get database dump:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  db \
  pg_dump database_name > backup.sql
```

---

## Service Names in SDL

The `<service-name>` parameter must match your SDL definition.

### SDL Example

```yaml
version: "2.0"

services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
  
  api:
    image: node:18
    expose:
      - port: 3000
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
    api:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 1Gi

  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000
        api:
          denom: uakt
          amount: 2000

deployment:
  web:
    akash:
      profile: web
      count: 1
  api:
    akash:
      profile: api
      count: 1
```

**Access web service:**
```bash
provider-services lease-shell ... web <command>
```

**Access api service:**
```bash
provider-services lease-shell ... api <command>
```

---

## Debugging Scenarios

### Application Not Starting

**Check if process is running:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  ps aux
```

**View startup logs:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  cat /var/log/startup.log
```

**Check environment variables:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  env | grep -i app
```

### Performance Issues

**Check resource usage:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  top -bn1
```

**Check disk space:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  df -h
```

**Check memory usage:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  free -m
```

### Network Issues

**Test connectivity:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  ping -c 4 8.8.8.8
```

**Check DNS resolution:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  nslookup google.com
```

**List network connections:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  web \
  netstat -tuln
```

### Database Issues

**Check database connection:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  db \
  psql -U user -d database -c "SELECT version();"
```

**View database logs:**
```bash
provider-services lease-shell \
  --from $AKASH_KEY_NAME \
  --dseq <dseq> \
  --provider $AKASH_PROVIDER \
  db \
  tail -100 /var/log/postgresql/postgresql.log
```

---

## Best Practices

### Security

✅ **DO:**
- Use environment variables for sensitive values
- Limit shell access to authorized users
- Audit shell access commands
- Rotate wallet keys regularly

❌ **DON'T:**
- Expose private keys in commands
- Share shell access credentials
- Leave interactive sessions open
- Store sensitive data in containers

### Usage

✅ **DO:**
- Exit interactive sessions when done
- Document debugging steps
- Use specific commands over interactive shells
- Test commands on development first

❌ **DON'T:**
- Make permanent changes via shell (redeploy instead)
- Run resource-intensive commands
- Modify critical system files
- Install packages (use SDL instead)

### Troubleshooting

✅ **DO:**
- Check service name matches SDL
- Verify provider address is correct
- Ensure wallet has proper permissions
- Try different shell paths if one fails

❌ **DON'T:**
- Assume all containers have same tools
- Expect GUI applications to work
- Run commands without understanding impact
- Modify container state permanently

---

## Common Issues

### "Service not found"

**Problem:** Service name doesn't match SDL

**Solution:**
```bash
# Check your SDL for exact service name
# If SDL has "web:", use "web" not "Web" or "website"
provider-services lease-shell ... web <command>
```

### "Shell not found"

**Problem:** Container doesn't have specified shell

**Solution:**
```bash
# Try different shells
/bin/sh    # Most compatible
/bin/bash  # Ubuntu/Debian
/bin/ash   # Alpine

# Or check what's available
provider-services lease-shell ... web ls /bin
```

### "Permission denied"

**Problem:** Command requires elevated privileges

**Solution:**
```bash
# Most containers run as root, but some don't
# Check current user
provider-services lease-shell ... web whoami

# If not root, modify command or update SDL
```

### "Connection timeout"

**Problem:** Provider not responding

**Solution:**
```bash
# Verify provider address
provider-services query market lease get \
  --dseq <dseq> \
  --owner <your-address>

# Try different provider if persistent
```

---

## Limitations

**What shell access CAN'T do:**

- **No persistent changes** - Container changes lost on restart
- **No package installation** - Install via SDL instead
- **No privileged operations** - Can't modify kernel, load modules, etc.
- **No GUI applications** - Terminal only
- **Limited networking** - Can't expose new ports

**For persistent changes:**
1. Update your SDL
2. Build custom Docker image
3. Redeploy with new configuration

---

## Alternative Tools

### Akash Console

Web-based shell access:
- No CLI required
- Built-in terminal
- Point-and-click interface

**Access:** Console → Deployment → Shell tab

### Logs

For read-only debugging:
```bash
provider-services query logs \
  --dseq <dseq> \
  --provider <provider-address> \
  --service <service-name>
```

**Or via Console:** Deployment → Logs tab

### Events

Check deployment events:
```bash
provider-services query market lease status \
  --dseq <dseq> \
  --provider <provider-address>
```

**Or via Console:** Deployment → Events tab

---

## Related Topics

- [Deployments & Lifecycle](/docs/learn/core-concepts/deployments) - Understanding deployments
- [CLI Commands Reference](/docs/developers/deployment/cli/commands-reference) - Complete CLI documentation
- [Akash Console](/docs/developers/deployment/akash-console) - Web-based management

---

**Need help with shell access?** Ask in [Discord](https://discord.akash.network) #deployments channel!

