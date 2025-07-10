---
aep: 66
title: "Custom Domain Certificates"
author: Joao Luna (@cloud-j-luna)
status: Draft
type: Standard
category: Core
created: 2025-05-13
updated: 2025-07-07
estimated-completion: 2025-11-30
roadmap: major
---

 ## Abstract

 This proposal introduces a mechanism for Akash Network tenant workloads to obtain SSL/TLS certificates for their configured custom domains, enabling secure HTTPS access to deployments. 

 ## Motivation

 Currently, Akash Network deployments are accessible via the default ingress subdomain (e.g., *.ingress.akash.pub).
 To enhance the security and accessbility of deployments, tenants should have the ability to use custom domains with SSL/TLS certificates without relying on third party solutions such as Cloudflare.

 ## Technical Details

 ### Certificate Management (cert-manager)
 - `cert-manager` is a Kubernetes controller used to automate the management and issuance of TLS certificates.
 - It supports Let's Encrypt and other certificate authorities.
 - On Akash, `cert-manager` runs as part of the provider infrastructure and handles certificate issuance for ingress resources.
 - It uses HTTP-01 challenges to validate domain ownership.
 - Users do not directly interact with cert-manager, but it powers the automatic issuance of certs based on deployment configuration and DNS records.

 ### Ingress Controllers
 - Akash uses Kubernetes Ingress controllers (e.g., NGINX Ingress) to route external HTTP(S) traffic to tenant workloads.
 - Ingress resources define rules for routing and TLS termination.
 - The Akash provider manages ingress creation based on the deploy.yml service definitions (expose section).
 - HTTPS routing is enabled by specifying ports 443 and a custom domain in the manifest.

 ### Deployment Manifest
 - The manifest file allows defining services, ports and accepted domains.
 - To use a custom domain:
 ```
 expose:
   - port: 80
     to:
       - global: true
   - port: 443
     to:
       - global: true
     accept:
       - "www.example.com"
 ```
 - This instructs the provider to create an ingress rule and attempt TLS certificate issuance for the domain.

 ### DNS Configuration
 - DNS setup is critical for domain validation and traffic routing.
 - Tenants must create a CNAME record pointing to their deployment’s ingress endpoint.
   - Example:
   - `www.example.com` -> `deployment123.ingress.provider.akash.network`
 - DNS propagation must complete before certificate issuance via Let's Encrypt can succeed.

 ### Certificate Lifecycle
 - Certificates are automatically requested, issued, and renewed via `cert-manager`.
 - Tenants do not manually manage TLS certs.
 - Failure to configure DNS correctly will prevent certificate issuance and may fall back to untrusted/self-signed certs.



 ## Implementation

An implementation leveraging `cert-manager` would simplify the whole solution by simply configuring the ingress with specific annotations that would trigger certificate issuing. A TLS configuration would also need to be added to the Ingress instance created by the hostname operator pointing to the TLS secret with the accepted domains.

`cert-manager` watches Ingress resources across the Akash Provider cluster. If it observes an Ingress with annotations related to certificate issuing, it will ensure a Certificate resource with the name provided in the `tls.secretName` field and configured as described on the Ingress exists in the deployment namespace. An example Ingress:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: nameOfClusterIssuer
  name: myIngress
  namespace: myIngress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - pathType: Prefix
        path: /
        backend:
          service:
            name: myservice
            port:
              number: 80
  tls:
  - hosts:
    - custom.domain.my
    secretName: myingress-cert
```

With this, user workloads will be provided a valid and automatically managed certificate for their custom domains.
