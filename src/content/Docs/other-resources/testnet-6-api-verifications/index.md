---
categories: ["Other Resources"]
tags: []
weight: 2
title: "Testnet 6 API Verifications"
linkTitle: "Testnet 6 API Verifications"
---

# Akash Cosmos SDK 0.50.13 Upgrade Testnet


## Akash REST API Testing Overview

The testing procedure for the REST API is rather simple and should be conducted as follows:



* Retrieve the current API swagger file [here](https://raw.githubusercontent.com/akash-network/akash-api/refs/tags/go/v0.0.2-rc3/docs/swagger-ui/swagger.yaml)
* Dump the contents of the file into a swagger rendering engine such as this [web app](https://editor.swagger.io/)
* Thoroughly test both Akash and Cosmos exposed endpoints
* NOTE - all Akash queries must be updated to use `v1beta4` - see example below
* Current testnet-6 API node is available [here](https://github.com/akash-network/net/blob/main/testnet-6/api-nodes.txt )


## Akash REST API Test Example



* Specific endpoint used in test:

```
/akash/deployment/v1beta4/deployments/list
```


* Example test

```
curl "http://api.akashtestnet.xyz:1317/akash/deployment/v1beta4/deployments/list?filters.owner=akash1p6fulzhjcsghakuracwn20tjqmvf7zvsclf6yw"
```




## Cosmos REST API Test Example



* Specific endpoint used in test:

```
/cosmos/bank/v1beta1/balances/{address}
```


* Example test

```
curl "http://api.akashtestnet.xyz:1317/cosmos/bank/v1beta1/balances/akash1p6fulzhjcsghakuracwn20tjqmvf7zvsclf6yw"
```