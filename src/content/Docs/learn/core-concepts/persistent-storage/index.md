---
categories: ["Learn", "Core Concepts"]
tags: ["Storage", "Persistent Storage", "Data"]
weight: 4
title: "Persistent Storage"
linkTitle: "Persistent Storage"
description: "Understanding persistent and ephemeral storage on Akash Network"
---

**Learn how to persist data across container restarts and deployments.**

By default, storage in Akash containers is **ephemeral** - data is lost when containers restart. Persistent storage allows you to retain data between restarts, updates, and even migrations.

---

## Storage Types

### Ephemeral Storage (Default)

**Characteristics:**
- Data stored in the container's writable layer
- **Lost on container restart**
- Lost on deployment updates
- Fast and included with base resources
- No additional configuration needed

**Use cases:**
- Temporary cache
- Build artifacts
- Session data
- Application logs

**Example:**
```yaml
profiles:
  compute:
    web:
      resources:
        storage:
          size: 512Mi  # Ephemeral by default
```

### Persistent Storage

**Characteristics:**
- Data **survives container restarts**
- Data survives deployment updates (same provider)
- Backed by provider's storage infrastructure
- Requires `persistent: true` attribute
- May cost more than ephemeral

**Use cases:**
- Databases
- User uploads
- Application state
- Any data that must survive restarts

**Example:**
```yaml
profiles:
  compute:
    database:
      resources:
        storage:
          - size: 10Gi
            attributes:
              persistent: true
```

---

## Configuring Persistent Storage

### Basic Persistent Storage

```yaml
version: "2.0"

services:
  postgres:
    image: postgres:15
    env:
      - POSTGRES_PASSWORD=mypassword
      - PGDATA=/var/lib/postgresql/data/pgdata
    expose:
      - port: 5432

profiles:
  compute:
    postgres:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 2Gi
        storage:
          - size: 20Gi
            attributes:
              persistent: true

  placement:
    akash:
      pricing:
        postgres:
          denom: uakt
          amount: 10000

deployment:
  postgres:
    akash:
      profile: postgres
      count: 1
```

---

## Storage Classes

### Beta1 (Default)

The standard persistent storage class.

```yaml
storage:
  - size: 10Gi
    attributes:
      persistent: true
      class: beta1  # Default, can be omitted
```

### Beta2

Higher performance storage (if available from provider).

```yaml
storage:
  - size: 10Gi
    attributes:
      persistent: true
      class: beta2
```

### Beta3

Premium performance storage (SSD/NVMe, if available).

```yaml
storage:
  - size: 10Gi
    attributes:
      persistent: true
      class: beta3
```

**Note:** Storage class availability varies by provider. Most providers support `beta1`, while `beta2` and `beta3` availability is limited.

---

## Multiple Storage Volumes

You can attach multiple storage volumes to a single service:

```yaml
profiles:
  compute:
    app:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          - size: 1Gi  # Ephemeral root filesystem
          - size: 10Gi  # Persistent data
            attributes:
              persistent: true
              class: beta1
          - size: 50Gi  # Persistent media
            attributes:
              persistent: true
              class: beta2
```

**Important:** The **first** storage entry is always the root filesystem. Additional entries are mounted as separate volumes.

---

## Mount Points

### Default Behavior

By default, persistent storage is mounted inside the container, but the exact mount point depends on the container's working directory and image configuration.

### Specify Mount Point (Docker Volumes)

To control where persistent storage is mounted, use Docker volume mounts in your image or configure through environment variables:

```yaml
services:
  database:
    image: mongo:7
    env:
      - MONGO_DATA_DIR=/data/db  # Application-specific config
```

**Note:** Akash persistent storage provides the volume, but mount point configuration is typically handled by your container image.

---

## Storage Persistence Guarantees

### ✅ Survives

- **Container restarts** - Data persists if container crashes or restarts
- **Deployment updates** - Data persists when you update image version, env vars, etc.
- **Provider restarts** - Data persists if provider's infrastructure restarts

### ❌ Does NOT Survive

- **Lease termination** - Data is lost when you close the deployment
- **Provider migration** - Data is lost if you move to a different provider
- **Provider failures** - Data may be lost if provider's storage fails

**Critical:** Akash persistent storage is **provider-local**. If you close your deployment or switch providers, you lose your data.

---

## Backup Strategies

Since persistent storage doesn't survive lease termination, implement backups for critical data:

### 1. External Backup Service

Use a sidecar container to backup data to external storage:

```yaml
services:
  app:
    image: myapp:latest
  
  backup:
    image: ghcr.io/myorg/backup-agent:latest
    env:
      - BACKUP_DESTINATION=s3://my-bucket/backups
      - AWS_ACCESS_KEY_ID=...
      - AWS_SECRET_ACCESS_KEY=...
      - BACKUP_SCHEDULE=0 */6 * * *  # Every 6 hours
```

### 2. Periodic Snapshots

Schedule regular backups to cloud storage:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Cloudflare R2
- Backblaze B2

### 3. Database Replication

For databases, use replication to external instances:
- PostgreSQL streaming replication
- MySQL replication
- MongoDB replica sets with external nodes

### 4. Application-Level Backup

Implement backup logic in your application code to regularly export data to external services.

---

## Performance Considerations

### Storage I/O

Persistent storage performance varies by:
- **Storage class** - beta3 (SSD) > beta2 > beta1 (HDD)
- **Provider infrastructure** - Different providers have different hardware
- **Provider load** - Performance may degrade under heavy load

### Best Practices

1. **Use appropriate storage class**
   - beta1 for general use
   - beta2/beta3 for databases and high-I/O workloads

2. **Size appropriately**
   - Request only what you need
   - Plan for growth (resizing requires redeployment)

3. **Monitor usage**
   - Track disk space
   - Set up alerts before running out

4. **Optimize application**
   - Use caching to reduce disk I/O
   - Implement connection pooling for databases
   - Batch writes when possible

---

## Common Patterns

### Database Deployment

```yaml
services:
  postgres:
    image: postgres:15
    env:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secure_password
      - PGDATA=/var/lib/postgresql/data/pgdata
    expose:
      - port: 5432

profiles:
  compute:
    postgres:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 4Gi
        storage:
          - size: 50Gi
            attributes:
              persistent: true
              class: beta2
```

### Application with Persistent Uploads

```yaml
services:
  web:
    image: myapp:latest
    env:
      - UPLOAD_DIR=/data/uploads
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          - size: 1Gi  # Ephemeral for app
          - size: 20Gi  # Persistent for uploads
            attributes:
              persistent: true
```

---

## Troubleshooting

### "Out of Disk Space" Error

**Cause:** Container filled up allocated storage.

**Solutions:**
1. Increase storage size in SDL (requires redeployment)
2. Clean up unnecessary files
3. Implement log rotation
4. Archive old data to external storage

### Data Loss After Update

**Cause:** Using ephemeral storage instead of persistent.

**Solution:** Add `persistent: true` attribute to storage configuration.

### Poor Database Performance

**Cause:** Using beta1 (HDD) storage for database.

**Solution:** Upgrade to beta2 or beta3 storage class.

### Provider Doesn't Support Beta3

**Cause:** Not all providers offer premium storage.

**Solution:** 
1. Use beta2 or beta1 instead
2. Choose a different provider that offers beta3

---

## Migration Strategy

To migrate data when switching providers:

### 1. Prepare New Deployment

Create a new deployment with the target provider.

### 2. Export Data

From old deployment:
```bash
# Example: PostgreSQL
pg_dump -h old-provider.com -U admin mydb > backup.sql

# Example: File-based
tar -czf data-backup.tar.gz /data
```

### 3. Import Data

To new deployment:
```bash
# Example: PostgreSQL
psql -h new-provider.com -U admin mydb < backup.sql

# Example: File-based
scp data-backup.tar.gz new-deployment:/data/
```

### 4. Update DNS/Configuration

Point your application to the new deployment.

### 5. Close Old Deployment

After verifying everything works, close the old deployment.

---

## Limitations

### Cannot Resize

Once deployed, you **cannot** change storage size. To resize:
1. Create a new deployment with desired size
2. Migrate your data
3. Close the old deployment

### Not Shared Between Services

Each service gets its own storage volume. Services cannot share persistent storage.

**Workaround:** Use a network file system (NFS) or object storage (S3) if you need shared storage.

### Provider-Specific

Storage is tied to the provider. Moving to a different provider requires data migration.

---

## Best Practices Summary

✅ **DO:**
- Use persistent storage for databases and user data
- Implement regular backups to external services
- Monitor disk usage and set up alerts
- Size storage appropriately for growth
- Use appropriate storage class for workload

❌ **DON'T:**
- Rely on persistent storage as your only backup
- Store critical data without external backups
- Use beta1 for high-performance databases
- Try to resize storage without redeployment

---

## Related Topics

- [SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference) - Storage configuration syntax
- [Deployments](/docs/learn/core-concepts/deployments) - Understanding the deployment lifecycle
- [Updates & Migrations](/docs/learn/core-concepts/updates-migrations) - Updating deployments
- [Resource Specifications](/docs/learn/core-concepts/resources) - Resource planning

---

**Need help?** Ask in [Discord](https://discord.akash.network) #deployments channel!

