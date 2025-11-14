---
categories: ["Providers"]
tags: [] 
weight: 2 
title: "Infrastructure, Upkeep, and Advanced Operations" 
linkTitle: "Infrastructure, Upkeep, and Advanced Operations"
--- 

- [Maintaining and Rotating Kubernetes/etcd Certificates: A How-To Guide](#maintaining-and-rotating-kubernetes-etcd-certificates-a-how-to-guide)
- [Force New ReplicaSet Workaround](#force-new-replicaset-workaround)
- [Kill Zombie Processes](#kill-zombie-processes)


## Maintaining and Rotating Kubernetes/etcd Certificates: A How-To Guide

> The following doc is based on [Certificate Management with kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/) & [https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes](https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes)

When K8s certs expire, you won't be able to use your cluster. Make sure to rotate your certs proactively.

The following procedure explains how to rotate them manually.

Evidence that the certs have expired:

```
root@node1:~# kubectl get nodes -o wide
error: You must be logged in to the server (Unauthorized)
```

You can always view the certs expiration using the `kubeadm certs check-expiration` command:

```
root@node1:~# kubeadm certs check-expiration
...
```

### Rotate K8s Certs

#### Backup etcd DB

It is crucial to back up your `etcd` DB as it contains your K8s cluster state! So make sure to backup your etcd DB first before rotating the certs!

##### Take the etcd DB Backup

```
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl snapshot save node1.etcd.backup
```

You can additionally backup the current certs:

```
tar czf etc_kubernetes_ssl_etcd_bkp.tar.gz /etc/kubernetes /etc/ssl/etcd
```

#### Renew the Certs

> IMPORTANT: For an HA Kubernetes cluster with multiple control plane nodes, the `kubeadm certs renew` command (followed by the `kube-apiserver`, `kube-scheduler`, `kube-controller-manager` pods and `etcd.service` restart) needs to be executed on all the control-plane nodes, one at a time.

##### Rotate the k8s Certs

```
kubeadm certs renew all
```

##### Update your kubeconfig

```
mv -vi /root/.kube/config /root/.kube/config.old
cp -pi /etc/kubernetes/admin.conf /root/.kube/config
```

##### Bounce the following services in this order

```
kubectl -n kube-system delete pods -l component=kube-apiserver
kubectl -n kube-system delete pods -l component=kube-scheduler
kubectl -n kube-system delete pods -l component=kube-controller-manager
systemctl restart etcd.service
```

##### Verify the Certs Status

```
kubeadm certs check-expiration
```

Repeat the process for all control plane nodes, one at a time, if you have a HA Kubernetes cluster.


## Force New ReplicaSet Workaround

The steps outlined in this guide provide a workaround for known issue which occurs when a deployment update is attempted and fails due to the provider being out of resources. This is happens because K8s won't destroy an old pod instance until it ensures the new one has been created.

GitHub issue description can be found [here](https://github.com/akash-network/support/issues/82).

### Requirements

##### Install JQ

```
apt -y install jq
```

### Steps to Implement

#### 1). Create \`/usr/local/bin/akash-force-new-replicasets.sh\` file

```
cat > /usr/local/bin/akash-force-new-replicasets.sh <<'EOF'
#!/bin/bash
#
# Version: 0.2 - 25 March 2023
# Files:
# - /usr/local/bin/akash-force-new-replicasets.sh
# - /etc/cron.d/akash-force-new-replicasets
#
# Description:
# This workaround goes through the newest deployments/replicasets, pods of which can't get deployed due to "insufficient resources" errors and it then removes the older replicasets leaving the newest (latest) one.
# This is only a workaround until a better solution to https://github.com/akash-network/support/issues/82 is found.
#

kubectl get deployment -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    kubectl -n $ns rollout status --timeout=10s deployment/${app} >/dev/null 2>&1
    rc=$?
    if [[ $rc -ne 0 ]]; then
      if kubectl -n $ns describe pods | grep -q "Insufficient"; then
        OLD="$(kubectl -n $ns get replicaset -o json -l akash.network/manifest-service --sort-by='{.metadata.creationTimestamp}' | jq -r '(.items | reverse)[1:][] | .metadata.name')"
        for i in $OLD; do kubectl -n $ns delete replicaset $i; done
      fi
    fi
  done
EOF
```

#### 2). Mark As Executable File

```
chmod +x /usr/local/bin/akash-force-new-replicasets.sh
```

#### 3). Create Cronjob

Create the crontab job `/etc/cron.d/akash-force-new-replicasets` to run the workaround every 5 minutes.

```
cat > /etc/cron.d/akash-force-new-replicasets << 'EOF'
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/akash-force-new-replicasets.sh
EOF
```

## Kill Zombie Processes

### Issue

In certain Kubernetes deployments, subprocesses may not properly implement the `wait()` function, leading to the creation of `<defunct>` processes, commonly known as "zombie" processes. These occur when a subprocess completes its task but remains in the system's process table because the parent process has not retrieved its exit status. Over time, if these zombie processes are not managed, they can accumulate and consume all available process slots in the system, leading to PID exhaustion and resource starvation.

While zombie processes do not consume CPU or memory resources directly, they occupy slots in the system's process table. If the process table becomes full, no new processes can be spawned, potentially causing severe disruptions. The limit for the number of process IDs (PIDs) available on a system can be checked using:

```
$ cat /proc/sys/kernel/pid_max
4194304
```

To prevent this issue, it is crucial to manage and terminate child processes correctly to avoid the formation of zombie processes.

### Recommended Approaches

1. **Proper Process Management in Scripts**: Ensure that any scripts initiating subprocesses correctly manage their lifecycle. For example:

   ```bash
   #!/bin/bash

   # Start the first process
   ./my_first_process &

   # Start the second process
   ./my_second_process &

   # Wait for any process to exit
   wait -n

   # Exit with the status of the process that exited first
   exit $?
   ```

2. **Using a Container Init System**: Deploying a proper container init system ensures that zombie processes are automatically reaped, and signals are forwarded correctly, reducing the likelihood of zombie process accumulation. Here are some tools and examples that you can use:

   - [**Tini**](https://github.com/krallin/tini): A lightweight init system designed for containers. It is commonly used to ensure zombie process reaping and signal handling within Docker containers. You can easily add Tini to your Docker container by using the `--init` flag or adding it as an entrypoint in your Dockerfile.
   - [**Dumb-init**](https://github.com/Yelp/dumb-init): Another lightweight init system designed to handle signal forwarding and process reaping. It is simple and efficient, making it a good alternative for minimal containers that require proper PID 1 behavior.
   - [**Runit Example**](https://git.nixaid.com/arno/postfix/src/branch/master/Dockerfile#L21): Runit is a fast and reliable init system and service manager. This [Dockerfile example](https://git.nixaid.com/arno/postfix/src/branch/master/Dockerfile#L21) demonstrates how to use Runit as the init system in a Docker container.
   - [**Supervisord Example by Docker.com**](https://docs.docker.com/config/containers/multi-service_container/#use-a-process-manager): Supervisord is a popular process manager that allows for managing multiple services within a container. The official Docker documentation provides a [supervisord example](https://docs.docker.com/config/containers/multi-service_container/#use-a-process-manager) that illustrates how to manage multiple processes effectively.
   - [**S6 Example**](https://github.com/just-containers/s6-overlay): S6 is a powerful init system and process supervisor. The [S6 overlay repository](https://github.com/just-containers/s6-overlay) offers examples and guidelines on how to integrate S6 into your Docker containers, providing process management and reaping.


For more details on this approach, refer to the following resources:
- [Container Init Process](https://devopsdirective.com/posts/2023/06/container-init-process/)
- [zombie reproducer and in-depth explanation](https://github.com/akash-network/awesome-akash/issues/565#issuecomment-2304206825)
- [Docker Multi-Service Containers](https://docs.docker.com/config/containers/multi-service_container/#use-a-wrapper-script)
- [Docker and the PID 1 Zombie Reaping Problem](https://blog.phusion.nl/2015/01/20/docker-and-the-pid-1-zombie-reaping-problem/)
- [Terminating a Zombie Process in Linux Environments](https://www.dell.com/support/kbdoc/en-us/000019108/terminating-a-zombie-process-in-linux-environments)
- [Zombie Processes and their Prevention](https://www.geeksforgeeks.org/zombie-processes-prevention/)

### Example of Zombie Processes on the Provider

In some cases, misconfigured container images can lead to a rapid accumulation of zombie processes. For instance, a container that repeatedly fails to start an `sshd` service might spawn zombie processes every 20 seconds:

```bash
root      712532  696516  0 14:28 ?        00:00:00      \_ [bash] <defunct>
syslog    713640  696516  0 14:28 ?        00:00:00      \_ [sshd] <defunct>
root      807481  696516  0 14:46 ?        00:00:00      \_ [bash] <defunct>
root      828096  696516  0 14:50 ?        00:00:00      \_ [bash] <defunct>
root      835000  696516  0 14:51 pts/0    00:00:00      \_ [haproxy] <defunct>
root      836102  696516  0 14:51 ?        00:00:00      \_ SCREEN -S webserver
root      836103  836102  0 14:51 ?        00:00:00      |   \_ /bin/bash
root      856974  836103  0 14:55 ?        00:00:00      |       \_ caddy run
root      849813  696516  0 14:54 pts/0    00:00:00      \_ [haproxy] <defunct>
pollina+  850297  696516  1 14:54 ?        00:00:40      \_ haproxy -f /etc/haproxy/haproxy.cfg
root      870519  696516  0 14:58 ?        00:00:00      \_ SCREEN -S wallpaper
root      870520  870519  0 14:58 ?        00:00:00      |   \_ /bin/bash
root      871826  870520  0 14:58 ?        00:00:00      |       \_ bash change_wallpaper.sh
root     1069387  871826  0 15:35 ?        00:00:00      |           \_ sleep 20
syslog    893600  696516  0 15:02 ?        00:00:00      \_ [sshd] <defunct>
syslog    906839  696516  0 15:05 ?        00:00:00      \_ [sshd] <defunct>
syslog    907637  696516  0 15:05 ?        00:00:00      \_ [sshd] <defunct>
syslog    913724  696516  0 15:06 ?        00:00:00      \_ [sshd] <defunct>
syslog    914913  696516  0 15:06 ?        00:00:00      \_ [sshd] <defunct>
syslog    922492  696516  0 15:08 ?        00:00:00      \_ [sshd] <defunct>
```

### Steps to Implement a Workaround for Providers

Since providers cannot control the internal configuration of tenant containers, it is advisable to implement a system-wide workaround to handle zombie processes.

1. **Create a Script to Kill Zombie Processes**

   Create the script `/usr/local/bin/kill_zombie_parents.sh`:
   ```bash
   cat > /usr/local/bin/kill_zombie_parents.sh <<'EOF'
   #!/bin/bash
   # This script detects zombie processes that are descendants of containerd-shim processes
   # and first attempts to prompt the parent process to reap them by sending a SIGCHLD signal.

   find_zombie_and_parents() {
     for pid in /proc/[0-9]*; do
       if [[ -r $pid/stat ]]; then
         read -r proc_pid comm state ppid < <(cut -d' ' -f1,2,3,4 "$pid/stat")
         if [[ $state == "Z" ]]; then
           echo "$proc_pid $ppid"
           return 0
         fi
       fi
     done
     return 1
   }

   get_parent_chain() {
     local pid=$1
     local chain=""
     while [[ $pid -ne 1 ]]; do
       if [[ ! -r /proc/$pid/stat ]]; then
         break
       fi
       read -r ppid cmd < <(awk '{print $4, $2}' /proc/$pid/stat)
       chain="$pid:$cmd $chain"
       pid=$ppid
     done
     echo "$chain"
   }

   is_process_zombie() {
     local pid=$1
     if [[ -r /proc/$pid/stat ]]; then
       read -r state < <(cut -d' ' -f3 /proc/$pid/stat)
       [[ $state == "Z" ]]
     else
       return 1
     fi
   }

   attempt_kill() {
     local pid=$1
     local signal=$2
     local wait_time=$3
     local signal_name=${4:-$signal}

     echo "Attempting to send $signal_name to parent process $pid"
     kill $signal $pid
     sleep $wait_time

     if is_process_zombie $zombie_pid; then
       echo "Zombie process $zombie_pid still exists after $signal_name"
       return 1
     else
       echo "Zombie process $zombie_pid no longer exists after $signal_name"
       return 0
     fi
   }

   if zombie_info=$(find_zombie_and_parents); then
     zombie_pid=$(echo "$zombie_info" | awk '{print $1}')
     parent_pid=$(echo "$zombie_info" | awk '{print $2}')

     echo "Found zombie process $zombie_pid with immediate parent $parent_pid"

     parent_chain=$(get_parent_chain "$parent_pid")
     echo "Parent chain: $parent_chain"

     if [[ $parent_chain == *"containerd-shim"* ]]; then
       echo "Top-level parent is containerd-shim"
       immediate_parent=$(echo "$parent_chain" | awk -F' ' '{print $1}' | cut -d':' -f1)
       if [[ $immediate_parent != $parent_pid ]]; then
         if attempt_kill $parent_pid -SIGCHLD 15 "SIGCHLD"; then
           echo "Zombie process cleaned up after SIGCHLD"
         elif attempt_kill $parent_pid -SIGTERM 15 "SIGTERM"; then
           echo "Zombie process cleaned up after SIGTERM"
         elif attempt_kill $parent_pid -SIGKILL 5 "SIGKILL"; then
           echo "Zombie process cleaned up after SIGKILL"
         else
           echo "Failed to clean up zombie process after all attempts"
         fi
       else
         echo "Immediate parent is containerd-shim. Not killing."
       fi
     else
       echo "Top-level parent is not containerd-shim. No action taken."
     fi
   fi
   EOF
   ```

2. **Mark the Script as Executable**

   ```bash
   chmod +x /usr/local/bin/kill_zombie_parents.sh
   ```

3. **Create a Cron Job**

   Set up a cron job to run the script every 5 minutes:

   ```bash
   cat > /etc/cron.d/kill_zombie_parents << 'EOF'
   PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
   SHELL=/bin/bash

   */5 * * * * root /usr/local/bin/kill_zombie_parents.sh | logger -t kill_zombie_parents
   EOF
   ```

This workaround will help mitigate the impact of zombie processes on the system by periodically terminating their parent processes, thus preventing the system's PID table from being overwhelmed.


