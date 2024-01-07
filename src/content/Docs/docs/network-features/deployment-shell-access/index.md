---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Deployment Shell Access"
linkTitle: "Deployment Shell Access"
---


Abilities to manage deployed Akash containers have been accentuated greatly within this release.  Introduced deployment capabilities include:

* Ability to execute commands within running Linux containers/Akash deployments.  Such an ability resembles “docker exec” command execution within a live container instance.
* Ability to gain access to the CLI/shell of a running Linux container/Akash deployment.
* Ability to remote copy files from running Linux containers/Akash deployments to a local file instance for inspection.

In the subsections which follow granular details of these introduced features will be explored with example executions and depictions.&#x20;

## **Remote Shell Command Execution**

_Execute command sets within a running Akash deployment_

* Command template with variable bracketing as such \<variable-name>
* Notes of interest pertaining to command execution:
  * The service-name variable must match the service value in the deployment’s SDL.  For example - in the depicted segment of an SDL file below - the service-name in remote shell execution would be “web”

![](https://lh3.googleusercontent.com/BgF4dAJD-W3HKaLJM4xvmLk-BWxN7-OjD5QknE7kWV9K938u3MTZj0slv5VgFd8eC41QF0JmUtzcc4pCcu5PbG-HhgtDp7QCfIokY5AI1vlewgDo1E4QMKo4AXsUMMQOw7USXjSa=s0)

```
provider-services lease-shell --from <key-name> --dseq <dseq-number> --provider=<provider-address> <service-name> <command-to-execute>
```

*   Example command fully populated

    ```
    provider-services lease-shell --from mykey --dseq 226186 --provider=akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww web cat /etc/passwd
    ```
* Example command fully populated using environment variables
* Prior establishment of the AKASH\_KEY\_NAME and AKASH\_PROVIDER environment variables would be necessary to allow this syntax

```
provider-services lease-shell --from $AKASH_KEY_NAME --dseq 226186 --provider=$AKASH_PROVIDER web cat /etc/passwd
```

* Expected output example

![](https://lh4.googleusercontent.com/ME0D00NtelEkGHbiFQYO66gBbrPGs3IvyeNADitplLF2AE6h4JK-iaNCGEQ2C5qd2636lYvdRJRAXTnfFwGdYcJSKOe5TVtF\_sb3jDvbtfaQOFeyod8m3d146FB9Ga6eTJ49Cvu4=s0)



## **Access the Deployment Shell (CLI)**

_Gain access to an active Akash deployment’s CLI/shell_

* Command template with variable bracketing as such \<variable-name>
* Command notes of interest:
  * The service-name variable must match the service value in the deployment’s SDL.  For example - in the depicted segment of an SDL file below - the service-name in remote shell execution would be “web”
  * Note the “tty” switch dictating desire for shell/CLI access

![](https://lh3.googleusercontent.com/BgF4dAJD-W3HKaLJM4xvmLk-BWxN7-OjD5QknE7kWV9K938u3MTZj0slv5VgFd8eC41QF0JmUtzcc4pCcu5PbG-HhgtDp7QCfIokY5AI1vlewgDo1E4QMKo4AXsUMMQOw7USXjSa=s0)

```
provider-services lease-shell --from <key-name> --dseq <dseq-number> --tty --provider=<provider-address> <service-name> /bin/sh --node $AKASH_NODE
```

* Example command fully populated
* Note - the container instance must have a /bin/sh shell for the command to work in this exact syntax.  If this were an Alpine container base image /bin/sh would need to become /bin/ash and this serves as an example of possible edit to the command syntax based on container type.
* Prior establishment of the AKASH\_KEY\_NAME and AKASH\_PROVIDER environment variables would be necessary to allow this syntax

```
provider-services lease-shell --from $AKASH_KEY_NAME --dseq 226186 --tty --provider=$AKASH_PROVIDER web /bin/sh --node $AKASH_NODE
```



* Expected output example
* Note - Linux commands “pwd” and “ls” are included and as executed within the deployment to validate Akash container shell access

![](https://lh6.googleusercontent.com/6Bd4MCrhU71vIM5OzREMlV8DdxaSEO2T80PNzFJVO91mVrkDYzdBIZ45V10Crcazvpi6afl3ojocnUu\_8bnPgxHflJ6WJuZFvZsZpfcf19wna1xs1akzCEnNzghJLJP\_xYsVOB2F=s0)

## **Copy File from Akash Container/Deployment**

_Copy a file from an active Akash deployment to a local file instance for inspection_

* Command template with variable bracketing as such \<variable-name>
* Command notes of interest:
  * The service-name variable must match the service value in the deployment’s SDL.  For example - in the depicted segment of an SDL file below - the service-name in remote shell execution would be “web”

![](https://lh3.googleusercontent.com/BgF4dAJD-W3HKaLJM4xvmLk-BWxN7-OjD5QknE7kWV9K938u3MTZj0slv5VgFd8eC41QF0JmUtzcc4pCcu5PbG-HhgtDp7QCfIokY5AI1vlewgDo1E4QMKo4AXsUMMQOw7USXjSa=s0)

```
provider-services lease-shell --from <key-name> --dseq <dseq-number> --provider=<provider-address> <service-name> <command-to-execute> > <local-file-name>
```

* Example command fully populated

```
provider-services lease-shell --from mykey --dseq 226186 --provider=akash1gx4aevud37w4d6kfd5szgp87lmkqvumaz57yww web cat /etc/passwd > local_copy_of_passwd
```

* Example command fully populated using environment variables
* Prior establishment of the AKASH\_KEY\_NAME and AKASH\_PROVIDER environment variables would be necessary to allow this syntax

```
provider-services lease-shell --from $AKASH_KEY_NAME --dseq 226186 --provider=$AKASH_PROVIDER web cat /etc/passwd > local_copy_of_passwd
```

* Expected output example
* Note - Linux command “ls” and “cat” are included in the depiction to validate successful file copy from remote Akash container/deployment to local file

![](https://lh4.googleusercontent.com/cJd-e86o-vYhhPNsfLsOjxEXDM7Sb8d-AMkpjj5W8VJ9E0ynO-6RN\_nzHQIinb00vPgm8xfj0njYBw5-\_CqBuajPqE-sKcxrqkaehfF5Gf9RXiVJf27khnNxbm3lmYWtqTLN2Rfy=s0)

## **SDL Example Utilized**

Full SDL code samples used throughout this guide

```
---
version: "2.0"
services:
 web:
   image: pengbai/docker-supermario
   expose:
     - port: 8080
       as: 80
       to:
         - global: true
       http_options:
         max_body_size: 3145728
         read_timeout: 50000
         send_timeout: 51000
         next_cases: ["error", "500"]
         next_tries: 2
       accept:
         - supermariotest.akash.network
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   westcoast:
     signedBy:
       anyOf:
         - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
     pricing:
       web:
         denom: uakt
         amount: 3000
deployment:
 web:
   westcoast:
     profile: web
     count: 1
```