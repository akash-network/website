---
categories: ["Providers"]
tags: ["Akash Provider", "TLS", "Certificates"]
weight: 7
title: "TLS Certificates"
linkTitle: "TLS Certificates"
---

Follow the instructions in this guide to replace the `Kubernetes Ingress Controller Fake Certificate` default cert which `ingress-nginx` serves over 443/tcp (HTTPS) by default.

After following this doc, all deployments receiving Akash Provider hostnames within `*.ingress.<yourdomain>` or `*.<yourdomain>` will automatically have the wildcard Let's Encrypt certificate. This will ensure that users interacting with such deployments will not receive self signed certificate warnings.

- [Install Let's Encrypt Cert Manager](#install-lets-encrypt-cert-manager)
- [Configure the Issuer](#configure-the-issuer)
- [Google Cloud OR Cloudflare Configuration](#google-cloud-or-cloudflare-configuration)
- [Wildcard Certificate Request](#wildcard-certificate-request)
- [Ingress Controller Wildcard Cert Use](#ingress-controller-wildcard-cert-use)
- [Optional Step - Certs for Custom Domains](#optional-step---certs-for-custom-domains)

## Install Let's Encrypt Cert Manager

### Steps to Install the Let's Encrypt Cert Manager

> _**NOTE**_ - perform the steps in this guide on an Akash control plane node with Helm installed

#### Add the Let's Encrypt Helm Repo

```
helm repo add jetstack https://charts.jetstack.io
helm repo update
```

#### Install the Let's Encrypt Helm Chart

```
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.17.1 \
  --set crds.enabled=true
```

#### Expected/Example Output

```
NAME: cert-manager
LAST DEPLOYED: Tue Mar  5 11:31:07 2024
NAMESPACE: cert-manager
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
cert-manager v1.17.1 has been deployed successfully!
In order to begin issuing certificates, you will need to set up a ClusterIssuer
or Issuer resource (for example, by creating a 'letsencrypt-staging' issuer).

More information on the different types of issuers and how to configure them
can be found in our documentation:

https://cert-manager.io/docs/configuration/

For information on how to configure cert-manager to automatically provision
Certificates for Ingress resources, take a look at the `ingress-shim`
documentation:

https://cert-manager.io/docs/usage/ingress/
```

## Configure the Issuer

### Initial Cert Manager Configuration

> _**NOTE**_ - If you want to use the namespaces then configure Issuer instead of the ClusterIssuer.

```
cat > cert-manager-values.yaml << EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: youremail@xyz.com
    #server: https://acme-staging-v02.api.letsencrypt.org/directory
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-prod-issuer-account-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Update Solvers Section of the Cert Manager Configuration

For wildcard certs you have to use the DNS-01 type of the challenge.

Additional details from Let's Encrypt:

- [Let's Encrypt Wildcard Cert Usage Guidance](https://letsencrypt.org/docs/faq/#does-let-s-encrypt-issue-wildcard-certificates)
- [CertManager IO Wildcard Cert Usage Guidance](https://cert-manager.io/docs/release-notes/release-notes-0.3/#acmev2-and-lets-encrypt-wildcard-certificates)

We can use either Google Cloud or Cloudflare as the DNS solver. Subsequent sections of this guide will use Google Cloud DNS for this purpose but we provide both examples below for reference.

#### Google Cloud DNS Additions

> Additional details from Google Cloud on DNS usage are found [here](https://cert-manager.io/docs/configuration/acme/dns01/google/).

- Add the following section in the `solvers` section of your `cert-manager-values.yaml` file.


> _**NOTE**_ - see this [section](/docs/providers/build-a-cloud-provider/akash-cli/tls-certs-for-akash-provider/#complete-cert-manager-valuesyaml-yaml-file-example) for a full `cert-manager-values.yaml` YAML file example

```
    - dns01:
        cloudDNS:
          # The ID of the GCP project
          project: "<your-gcp-project-id-number>"
          # This is the secret used to access the GCP service account JSON key
          serviceAccountSecretRef:
            name: clouddns-gcp-dns01-solver-sa
            key: key.json
```

#### CloudFlare DNS Additions

> Additional details from CloudFlare on DNS usage are found [here](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/).

- Add the following section in the `solvers` section of your `cert-manager-values.yaml` file.

> _**NOTE**_ - see these [section](#cloudflare-dns-example) for a full cert-manager-values.yaml YAML file example

```
    - dns01:
        cloudDNS:
          # The ID of the GCP project
          project: "<your-gcp-project-id-number>"
          # This is the secret used to access the GCP service account JSON key
          serviceAccountSecretRef:
            name: clouddns-gcp-dns01-solver-sa
            key: key.json
```

### Complete cert-manager-values.yaml YAML File Example

#### Google DNS Example

- Fully populated `cert-manager-values.yaml` manifest using the Google Cloud DNS example

```
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: REDACTED
    #server: https://acme-staging-v02.api.letsencrypt.org/directory
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-prod-issuer-account-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        cloudDNS:
          # The ID of the GCP project
          project: "REDACTED"
          # This is the secret used to access the GCP service account JSON key
          serviceAccountSecretRef:
            name: clouddns-gcp-dns01-solver-sa
            key: key.json
```

#### CloudFlare DNS Example

- Fully populated `cert-manager-values.yaml` manifest using the CloudFlare DNS example

```
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: REDACTED
    ##server: https://acme-staging-v02.api.letsencrypt.org/directory
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-prod-issuer-account-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        cloudflare:
          apiTokenSecretRef:
            key: api-token
            name: cloudflare-api-token-secret
          email: REDACTED
      selector:
        dnsZones:
          - 'akash.pro'
          - 'ingress.akash.pro'
```

## Apply Manifest

Once your `cert-manager-values.yaml` is configured properly and based on the guidance above, apply the manifest to your Kubernetes cluster.

```
kubectl apply -f cert-manager-values.yaml
```

## Google Cloud OR Cloudflare Configuration

> _**NOTE**_ - both the use of Google Cloud and Cloudflare DNS configurations are presented in this section. Only complete one of these paths based on DNS prefered platform.

### Create the Google DNS Cloud Service Account for DNS-01 Challenge

> _**NOTE**_ - the actions in this section should be performed in your Google Cloud console instance

#### STEP 1 - Create Role

> _**NOTE**_ - additional information on the configuration of the settings covered in this section can be found [here](https://console.cloud.google.com/iam-admin/roles)

```
Role name: DNS Administrator Limited
ID: dns.admin.light
Description:
Created on: 2023-04-26
To use for DNS-01 ACME challenges.
https://cert-manager.io/docs/configuration/acme/dns01/google/

Permissions:
dns.resourceRecordSets.*
dns.changes.*
dns.managedZones.list
```

#### STEP 2 - Create Service Account

> _**NOTE**_ - additional information on the configuration of the settings covered in this section can be found [here](https://console.cloud.google.com/iam-admin/serviceaccounts)

```
SA Name: dns01-solver
SA ID: dns01-solver
```

#### STEP 3 - Create Service Account (SA) Key for dns01-solver SA

> NOTE - additional information on the configuration of the settings covered in this section can be found [here](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts)

##### Download the Service Account Key from Google Cloud

- First download the service account key in JSON
- Then encode the service account key in base64

```
cat your-gcp-service-account-key.json | base64 | tr -d '\n'
```

##### Apply the Secret on your Provider Cluster

> _**NOTE**_ - this step should be performed on one of the Kubernetes control plane nodes of your Akash Provider

##### Create the Service Account Secret Config File

- Replace the service account key field with your own key

```
cat > service-account-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: clouddns-gcp-dns01-solver-sa
  namespace: cert-manager
type: Opaque
data:
  key.json: "<your-gcp-service-account-key-json-base64>"
EOF
```

##### Apply the Service Account Secret Config

```
kubectl apply -f service-account-secret.yaml
```

### Create the Cloudflare DNS Cloud Service Account for DNS-01 Challenge

- If using Cloudflare for DNS then request your API token and then create the following secret:

> API Tokens are recommended for higher security, since they have more restrictive permissions and are more easily revocable. Tokens can be created at User Profile > API Tokens > API Tokens. The following settings are recommended:

```
Permissions:
- Zone - DNS - Edit
- Zone - Zone - Read

Zone Resources:
- Include - All Zones
```

> _**NOTE**_ - this step should be performed on one of the Kubernetes control plane nodes of your Akash Provider

#### Create the DNS Challenge Config

```
cat > dns-challenge-config.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: cloudflare-api-token-secret
  namespace: cert-manager
type: Opaque
stringData:
  api-token: <API token>
EOF
```

#### Apply the DNS Challenge Config

```
kubectl apply -f dns-challenge-config.yaml
```

## Wildcard Certificate Request

### Request the Wildcard Certificate for your Domain

> _**NOTE**_ - replace the domain bits with yours accordingly. Leave the \*.ingress. bit (or adjust to the one you are using for the ingress address deployments receive) since wildcards aren't working for sub-sub domain (RFC 2818).

> _**NOTE**_ - this step should be performed on one of the Kubernetes control plane nodes of your Akash Provider

#### Create the Wildcard Cert Config

```
cat > wildcard-cert-request.yaml << EOF
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-yourdomain-com
  namespace: ingress-nginx
spec:
  secretName: wildcard-yourdomain-com-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  commonName: '*.yourdomain.com'
  dnsNames:
  - '*.yourdomain.com'
  - '*.ingress.yourdomain.com'
EOF
```

#### Apply the Wildcard Cert Config

```
kubectl apply -f wildcard-cert-request.yaml
```

### Additional Detail

Additional notes on the wildcard certifcate request from Let's Encrypt can be found [here](https://letsencrypt.org/docs/faq/#does-let-s-encrypt-issue-wildcard-certificates).

## Ingress Controller Wildcard Cert Use

### Overview

The steps in section replace the Kubernetes Ingress Controller Fake Certificate default cert `ingress-nginx` serves over 443/tcp (HTTPS) by default to all clients who do not have the certs explicitly set.

### Update the ingress-nginx-custom.yaml Config File


Update the `ingress-nginx-custom.yaml` file - originally created when installing your Akash Provider ingress controller in this [guide/step](/docs/providers/build-a-cloud-provider/akash-cli/tls-certs-for-akash-provider/#ingress-controller-wildcard-cert-use) - with this extra argument:


```
  extraArgs:
    default-ssl-certificate: "$(POD_NAMESPACE)/wildcard-yourdomain-com-tls"
```

### Update the Ingress Controller

Use the `helm upgrade` command - same syntax which was used in the original install of the `ingress-nginx` chart and detailed [here](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/#step-10---ingress-controller-install) - to apply the changes.


### Verification

After following this doc, all deployments receiving their hostnames within `*.ingress.<yourdomain>` or `*.<yourdomain>` will automatically have the wildcard LE (Let's Encrypt) cert!

Verify by issuing (replace `yourdomain` with the actual domain):

```
echo "" | openssl s_client -connect rmkpiskhbhfpr3901cqok3dhrk.ingress.yourdoamin.com:443 -showcerts |& openssl x509 -issuer -subject -dates -noout -text | grep -E '(Issuer:|Subject:|Not Before:|Not After :|DNS:)'
```

#### Expected/Example Output

> _**NOTE**_ - If you still get Kubernetes Ingress Controller Fake Certificate at this point, it is likely the `ingress-nginx` did not pick-up the cert or the cert hasn't been issued by the cert-manager.

```
        Issuer: C = US, O = Let's Encrypt, CN = R3
            Not Before: Apr 26 10:40:06 2023 GMT
            Not After : Jul 25 10:40:05 2023 GMT
        Subject: CN = *.yourdoamin.com
                DNS:*.ingress.yourdoamin.com, DNS:*.yourdoamin.com
```

## Troubleshooting

### Verify Certificates by Issuer

> _**NOTE**_ - following install this command will likely output No resources found which is expected and can be ignored. Revisit this command later and when certs have been generated by the issuer to view output.

```
kubectl get Issuers,ClusterIssuers,Certificates,CertificateRequests,Orders,Challenges -A
```

## Optional Step - Certs for Custom Domains

In this section we detail the use of Let's Encrypt for custom domains served by your provider. The prior steps in this guide enabled use of Let's Encrypt for Akash provider generated domains. This section details the optional step of enabling Let's Encrypt for domains specified in the `accept` field of an Akash deployment's SDL.

### Pros/Cons of Custom Domain Let's Encrypt Configuration

#### Pros of Using Let's Encrypt for Custom Domains

- No API key/token is required since no `DNS-01` ACME challenge is used
- Users will be able to have their custom domains signed by the Let's Encrypt
- The certs will automatically renew every 45-60 days by the cert-manager
- Users do not have to send/share their domain API key/token with the provider at all (based on the HTTP-01 ACME challenge)

#### Cons of Using Let's Encrypt for Custom Domains

- No wildcard support since it's done via HTTP-01 ACME challenge; (the wildcard certs require DNS-01 ACME challenge and so the domain's API key/token)

### Configuration of Custom Domains

> _**NOTE**_ - the steps in this section must be followed for each individual custom domain desired to support

#### STEP 1 - Ensure the CNAME of the Deployment Points to Provider Worker Node

- The CNAME of the deployment must be point to one of the provider worker nodes
- Verify by conducting these actions:

##### Gather the Custom Domain for the Deployment

The CNAME is `tetris.decloud.pro` in this example:

```
services:
  app:
    image: bsord/tetris
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        accept:
          - "tetris.decloud.pro"
```

##### Conduct DNS Dig to Confirm CNAME is Pointing to Provider Worker Node

Example dig verification:

```
dig tetris.decloud.pro

tetris.decloud.pro.  92  IN  CNAME provider.akash.pro.
provider.akash.pro. 92  IN  A 65.108.6.185
```

#### STEP 2 - Ingress Controller Annotation and Patch

> _**NOTE**_ - this is something Akash does not do out-of-the-box currently.

> _**NOTE**_ - this step should be performed on one of the Kubernetes control plane nodes of your Akash Provider

```
kubectl -n l71u6bbb5mqdu592el2mics5ltqvp49uojd8fn0ien3kg annotate ingress tetris.decloud.pro cert-manager.io/cluster-issuer="letsencrypt-prod"
kubectl -n l71u6bbb5mqdu592el2mics5ltqvp49uojd8fn0ien3kg patch ingress tetris.decloud.pro -p '{"spec":{"tls":[{"hosts":["tetris.decloud.pro"],"secretName":"tetris-decloud-pro-tls"}]}}'
```

#### STEP 3 - Verification

- Verify that Let's Encrypt issued the x509 cert for `tetris.decloud.pro` based on the example custom domain
- Replace the domain name with your own custom domains added

```
echo "" | openssl s_client -connect tetris.decloud.pro:443 -showcerts |& openssl x509 -issuer -subject -dates -noout -text | grep -E '(Issuer:|Subject:|Not Before:|Not After :|DNS:)'
```

#### Example/Expected Output

```
        Issuer: C = US, O = Let's Encrypt, CN = R3
            Not Before: Apr 28 19:19:44 2023 GMT
            Not After : Jul 27 19:19:43 2023 GMT
        Subject: CN = tetris.decloud.pro
                DNS:tetris.decloud.pro
```
