---
categories: ["Other Resources"]
tags: []
weight: 2
title: "Security"
linkTitle: "Security"
---

### How does **Security** work on Akash?

With Akash, you decide **who** you want to trust.

### How does Akash authenticate users?

It is important for the tenant to send their manifest to the correct provider, and for the provider to ensure only valid owners can access their deployments. This authentication is implemented with [mTLS](#create-a-certificate) and involves each account creating a certificate prior to deploying a workload or starting a provider.

Default certificate lifespan is 365 days from the moment of issuance. This can be customized to be valid up to a certain date, or not valid until a certain date.

### **How do I limit my trust to Audited Providers?**

Follow the getting started guide, and you will see the [instructions for audited attributes](/docs/providers/audited-attributes) suggest using only servers **"signed by"** Akash Network. If you deploy today, you will see bids by Equinix servers that audited and signed by Akash Network. By doing this you are trusting [Equinix’s Security Standards and Compliance](https://www.equinix.com/data-centers/design/standards-compliance) and you are trusting Overclock Labs as the auditor to only sign servers that meet those standards.

### **What are Audited Attributes?**

Akash has a feature designed to allow you to _control_ your trust settings called **Audited Attributes**. Audited attributes allow users deploying applications to be more selective about which providers can run their apps. Anyone on the Akash Network can assign these attributes to Providers via an on-chain transaction.

Akash's Stack Definition Language (SDL) allows you to define attributes such as the type of provider, region, CPU, Memory, Storage, and which auditors you want to trust. When you deploy on Akash, you can configure any attribute that restricts bids to only providers that meet your criteria.

Auditors on the Akash Network review cloud providers and digitally sign the provider on-chain with their certificate. If you only accept bids from audited providers this means you are trusting the Auditor/Provider not just a Provider.

On the `akashnet-2` network, to ensure tenants have smooth and reliable service from their provider, it is recommended to use the following audited attributes in their deployment: \_\_

```bash
    attributes:
        host: akash
      signedBy:
       anyOf:
        - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
```

\--or--

```bash
       attributes:
        datacenter: equinix-metal-ewr1
      signedBy:
       anyOf:
        - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
```

Please note that all of the following can be substituted in the `datacenter` field above and should be chosen based on your needs:

| Datacenter           | Location                  |
| -------------------- | ------------------------- |
| `equinix-metal-ewr1` | New Jersey, United States |
| `equinix-metal-sjc1` | California, United States |

## Create a Certificate

Before you can create a deployment, a [certificate](/docs/other-resources/authentication/) must first be created. While an account may have several certificates associated, when using the Akash CLI a single cert may be used across many/all deployments. If using both the Akash Console and Akash CLI, a single account may be used across those platforms with a separate certificate create and used per platform. To do this, run:

```
akash tx cert create client --chain-id $AKASH_CHAIN_ID --keyring-backend $AKASH_KEYRING_BACKEND --from $AKASH_KEY_NAME --node $AKASH_NODE --fees 5000uakt
```

You should see a response similar to:

```javascript
{
  "body": {
    "messages": [
      {
        "@type": "/akash.cert.v1beta1.MsgCreateCertificate",
        "owner": "akash1vns5ka3x69ekm3ecp8my8d5zfu8j23p5qew0w3",
        "cert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJ3RENDQVdXZ0F3SUJBZ0lJRm1pcUJWcWZDVmt3Q2dZSUtvWkl6ajBFQXdJd1NqRTFNRE1HQTFVRUF4TXMKWVd0aGMyZ3hkbTV6Tld0aE0zZzJPV1ZyYlRObFkzQTRiWGs0WkRWNlpuVTRhakl6Y0RWeFpYY3dkek14RVRBUApCZ1ZuZ1FVQ0JoTUdkakF1TUM0eE1CNFhEVEl4TURNd01qSXpNak15TmxvWERUSXlNRE13TWpJek1qTXlObG93ClNqRTFNRE1HQTFVRUF4TXNZV3RoYzJneGRtNXpOV3RoTTNnMk9XVnJiVE5sWTNBNGJYazRaRFY2Wm5VNGFqSXoKY0RWeFpYY3dkek14RVRBUEJnVm5nUVVDQmhNR2RqQXVNQzR4TUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowRApBUWNEUWdBRUtaSTlmWGVPVzRCYXRwcU1mb1VTekx2b01lWGlpbEZTMnJhZlhKdUNObUlMVjJMaWhIZW5JdjJTCjV5Uzh1Zkh5QmNMSUI5aFE1VE81THRHSUpPdzIvYU0xTURNd0RnWURWUjBQQVFIL0JBUURBZ1F3TUJNR0ExVWQKSlFRTU1Bb0dDQ3NHQVFVRkJ3TUNNQXdHQTFVZEV3RUIvd1FDTUFBd0NnWUlLb1pJemowRUF3SURTUUF3UmdJaApBSjJzQ3ZodGNzWkRXUkQ2MU03ZkVCRUk5eEt5Z0UzRkd3K2tIYVhZYXl0TUFpRUE4cUZtb3FEc1Z0ZzhPSHc1Ck5iOEljd0hiNHVkc0RpTzRxaWhoL0owNWZKaz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
        "pubkey": "LS0tLS1CRUdJTiBFQyBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFS1pJOWZYZU9XNEJhdHBxTWZvVVN6THZvTWVYaQppbEZTMnJhZlhKdUNObUlMVjJMaWhIZW5JdjJTNXlTOHVmSHlCY0xJQjloUTVUTzVMdEdJSk93Mi9RPT0KLS0tLS1FTkQgRUMgUFVCTElDIEtFWS0tLS0tCg=="
      }
    ],
    "memo": "",
    "timeout_height": "0",
    "extension_options": [],
    "non_critical_extension_options": []
  },
  "auth_info": {
    "signer_infos": [],
    "fee": {
      "amount": [],
      "gas_limit": "200000",
      "payer": "",
      "granter": ""
    }
  },
  "signatures": []
}
```
