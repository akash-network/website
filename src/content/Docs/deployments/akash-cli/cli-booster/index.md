---
categories: ["Akash Cli"]
tags: ["CLI"]
weight: 5
title: "Akash CLI Booster"
linkTitle: "Akash CLI Booster"
---

## Overview

- [Close a Deployment](#close-a-deployment) - [Expected/Sample Output](#expectedsample-output)
- [List All Active Deployments](#list-all-active-deployments) - [Expected/Sample Output](#expectedsample-output-1)
- [Access a Deployment’s Shell](#access-a-deployments-shell) - [Example/Expected Output](#exampleexpected-output-2)
- [Obtain a Deployment’s Logs](#obtain-a-deployments-logs) - [Example/Expected Output](#exampleexpected-output-3)

## Getting Started with the CLI Booster

Our use of the Akash CLI Booster begins by downloading the application.

Ensure the following steps have been completed prior:

- Install Akash CLI which is covered[ here](/docs/deployments/akash-cli/overview/).
- Create a new wallet or import a pre-existing wallet. New wallet creation steps are covered [here](/docs/getting-started/token-and-wallets/#keplr-wallet).

## Clone Repo

<br/>

```
git clone https://github.com/andy108369/akash-tools.git
```

## Initialize

Start the tool with these quick steps.

```
cd akash-tools/cli-booster

. akash.source
```

- Select account that should be used for deployments and/or other activities from list
- Example prompt shown below. In this case only one account is available in the keyring and we could press accept the default list number of “0” by pressing enter with no change.

```
Available keys:
	"name"           "address"
0>	"deploymentone"  "akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7"
Choose your key from the list [0]:
```

#### Example/expected prompt following successful CLI Booster initialization

<br/>
```
root@ip-10-0-10-163:~/akash-tools/cli-booster[https://rpc.akash.smartnodes.one:443][deploymentone][]$
```

### **Create Certificate**

If this is your first time using the selected key, create a client certificate.

```
akash_mkcert
```

## Creating a Deployment with the CLI Booster

In the series of steps in this section we will create the deployment, request bids from available providers, and select the most attractive bid.

### Create Deployment

```
akash_deploy <path-to-Akash-SDL-file>
```

#### Example/Expected Output

```
root@ip-10-0-10-163:~/akashApps/helloWorld[https://rpc.akash.smartnodes.one:443][deploymentone][]$ akash_deploy /root/akashApps/helloWorld/deploy.yml

INFO: Broadcasting 'akash deployment create -y deploy.yml' transaction...
Enter keyring passphrase:
gas estimate: 110705
INFO: Waiting for the TX EB8CB0EC7A09339D8004DD6FF1CE9054189315656687B5B3D5AF70565896A22F to get processed by the Akash network
INFO: Success
```

## Select and Accept Bid

<br/>
```
akash_accept
```

#### Expected/Example Output (Pre-Bid Accept)

- Select a provider of your preference by entering the number of the associated row

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4815510-1-1]$ akash_accept

AKASH_PROVIDER was not set so let's try to pick from what's available for your deployment.
	rate	monthly	usd	dseq/oseq/gseq	provider					host
0>	5.00	2.03	$2.44	4815510/1/1	akash10fl5f6ukr8kc03mtmf8vckm6kqqwqpc04eruqa	provider.akash.world:8443
1>	3.00	1.21	$1.45	4815510/1/1	akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0	provider.provider-0.prod.ams1.akash.pub:8443
2>	4.00	1.62	$1.94	4815510/1/1	akash19yhu3jgw8h0320av98h8n5qczje3pj3u9u2amp	provider.bdl.computer:8443
3>	6.00	2.43	$2.92	4815510/1/1	akash1g8m36ge6yekgkfktl08x8vrp0nq9v0l73jzy32	provider.xch.computer:8443
4>	3.00	1.21	$1.45	4815510/1/1	akash1m7tex89ddnwp3cm63ehfzfe2kj2uxmsugtx2qc	provider.provider-0.prod.sjc1.akash.pub:8443
5>	3.00	1.21	$1.45	4815510/1/1	akash1r7y2msa9drwjss5umza854he5vwr2czunye9de	us-east01-akash.qloudit.com:8443
6>	2.00	0.81	$0.97	4815510/1/1	akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e	d3akash.cloud:8443
7>	3.00	1.21	$1.45	4815510/1/1	akash1vky0uh4wayh9npd74uqesglpaxwymynnspf6a4	provider.provider-2.prod.ewr1.akash.pub:8443
8>	3.00	1.21	$1.45	4815510/1/1	akash1x32axkrtkv2et7etdwh77hj9a6vnc8un9th4e9	supernaut.ddns.net:8443
```

#### Expected/Example Out (Post Bid Selection)

```
INFO: Accepting the bid offered by akash1x32axkrtkv2et7etdwh77hj9a6vnc8un9th4e9 provider for 4748311 deployment
INFO: Broadcasting 'akash market lease create -y' transaction...
Enter keyring passphrase:
gas estimate: 442786
INFO: Waiting for the TX 5E33B27E631B0FD94BD9FB23D705B8D40F4BDC741829B0F669EC44C31ACA8A9C to get processed by the Akash network
INFO: Success
5E33B27E631B0FD94BD9FB23D705B8D40F4BDC741829B0F669EC44C31ACA8A9C
```

## Send Manifest to Provider

<br/>
```
akash_send_manifest <path-to-Akash-SDL-file>
```

#### Expected/Example Output

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[https://rpc.akash.forbole.com:443][deploymentone][4748311-1-1]$ akash_send_manifest /root/akashApps/helloWorld/deploy.yml

Enter keyring passphrase:
[{"provider":"akash1x32axkrtkv2et7etdwh77hj9a6vnc8un9th4e9","status":"PASS"}]
```

## Status of Deployment

<br/>
```
akash_status
```

#### Example/Expected Output

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4751918-1-1]$ akash_status

Enter keyring passphrase:
{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "scottsdgsrepprrtt.com",
        "toegk7990pcnb7jefh423r2gdk.ingress.provider-2.prod.ewr1.akash.pub"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {}
}
```

## Close a Deployment

<br/>
```
akash_close
```

#### Expected/Sample Output

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4751918-1-1]$ akash_close

INFO: Broadcasting 'akash deployment close -y' transaction...
Enter keyring passphrase:
gas estimate: 237627
INFO: Waiting for the TX 7AF03163EC3347712DCD2BBC648D82F70BCE0F681683AFAC537EA5520F8F2785 to get processed by the Akash network
INFO: Success
4751918 deployment has been successfully closed.
INFO: Total spent for 4751918: 129 uakt or $0.0001767
```

## List All Active Deployments

<br/>
```
akash_deployments
```

#### Expected/Sample Output

- Select the associated number of a deployment to reveal greater details. At this time those details include listing the deployment’s current provider.
- Select an instance to perform actions such as closing a deployment or accessing a deployment’s shell. The specific deployment must be selected prior to such actions and the selected deployment will be indicated in the CLI’s prompt.

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4815131-1-1]$ akash_deployments

Deployments you have accepted the bids for (i.e. have ran lease create).
Found the following active deployments:
	"dseq"     "gseq"  "oseq"
0>	"4815090"  1       1
1>	"4815131"  1       1
Choose your deployment from the list [1]:
Selected 1: 4815131-1-1
AKASH_DSEQ=4815131
Looking for a matching provider for this order...
AKASH_PROVIDER=akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0
```

## Access a Deployment’s Shell

<br/>
```
akash_shell sh
```

#### Example/Expected Output

- In this example the contents of the current directory are listed - via “ls” - to prove we are inside the deployment’s container

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4815131-1-1-web]$ akash_shell sh

Enter keyring passphrase:
Enter keyring passphrase:
#
# ls
bin  boot  dev	docker-entrypoint.d  docker-entrypoint.sh  etc	home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

## Obtain a Deployment’s Logs

<br/>
```
akash_logs -f
```

#### Example/Expected Output

```
root@ip-10-0-10-163:~/akash-tools/cli-booster[http://akash-sentry01.skynetvalidators.com:26657][deploymentone][4815131-1-1-web]$ akash_logs -f

Enter keyring passphrase:
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] 10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
[akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7/4815131/1/1/akash14c4ng96vdle6tae8r4hc2w4ujwrsh3x9tuudk0][web-7d44bb6d6f-n9cbk] /docker-entrypoint.sh: Configuration complete; ready for start up
```
