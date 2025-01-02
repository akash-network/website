---
categories: ["Guides"]
tags: ["Database", "SQL",]
weight: 1
title: "MariaDB"
linkTitle: "MariaDB"
---

MariaDB is a popular open-source relational database management system (RDBMS) that is a fork of MySQL. It is designed for scalability, high performance, and robust data security. MariaDB supports a wide range of storage engines and features SQL compliance, making it suitable for modern application development.

### **Key Features of MariaDB**
1. **High Performance:** Optimized for speed and scalability.
2. **Open Source:** Free to use and customize.
3. **Cross-Platform:** Compatible with various operating systems and cloud platforms.
4. **Compatibility:** Seamless migration from MySQL.
5. **Scalability:** Suitable for small projects to large-scale enterprise applications.

---

## **Steps to Deploy MariaDB on Akash**

### **1. Prepare Your Environment**
Ensure you have:
- **Akash CLI** installed and configured.
- A funded wallet with AKT tokens for deploying your workload.
- A domain or IP to access your MariaDB instance, if required.

### **2. Create the SDL (Service Definition Language) File**
The SDL defines your MariaDB deployment's resource requirements, container image, and other configurations.

Here’s a sample SDL file for deploying MariaDB on Akash:

```yaml
---
version: "2.0"

services:
  mariadb:
    image: mariadb:10.6
    env:
      - MYSQL_ROOT_PASSWORD=yourpassword
      - MYSQL_DATABASE=mydatabase
      - MYSQL_USER=myuser
      - MYSQL_PASSWORD=mypassword
    expose:
      - port: 3306
        as: 3306
        to:
          - global

profiles:
  compute:
    mariadb:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 5Gi

  placement:
    global:
      pricing:
        mariadb:
          denom: uakt
          amount: 100

deployment:
  mariadb:
    mariadb:
      profile: mariadb
      count: 1
```

### **3. Customize the SDL**
- Replace `yourpassword`, `mydatabase`, `myuser`, and `mypassword` with your desired credentials.
- Adjust the `resources` (CPU, memory, and storage) based on your workload requirements.
- Set `amount` in the `pricing` section according to your budget.

### **4. Deploy to Akash**
1. **Submit the SDL file to Akash**:
   ```bash
   akash tx deployment create deploy.yaml --from <your-wallet-name> --node <node-address> --chain-id <chain-id>
   ```
2. **Wait for deployment approval**. Once approved, note the lease ID.

3. **Access the logs** to verify MariaDB is running:
   ```bash
   akash provider lease-logs --node <node-address> --chain-id <chain-id> --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence>
   ```

4. **Retrieve the public IP/endpoint** of the deployment for connecting to the database:
   ```bash
   akash provider lease-status --node <node-address> --chain-id <chain-id> --dseq <deployment-sequence>
   ```

### **5. Connect to MariaDB**
Use a MariaDB client or your application to connect to the database instance. The connection string will look like:
```bash
mysql -u myuser -p -h <akash-ip-address> -P 3306
```

---

## **Best Practices**
1. **Security**: Use strong passwords and configure firewall rules to restrict database access.
2. **Backup**: Regularly back up your database to ensure data durability.
3. **Scaling**: Monitor resource usage and scale up resources in the SDL as needed.

This guide provides a streamlined process for deploying MariaDB on Akash. With the SDL template, you can easily adapt the configuration for your specific needs.