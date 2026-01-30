---
aep: 56
title: "Chain SDK"
author: Anil Murty (@anilmurty) Artur Troian (@troian) Serhii Stotsky (@baktun14) Maxime Beauchamp (@baktun14)
status: Final
type: Standard
category: Interface
created: 2025-01-10
updated: 2025-07-30
completed: 2025-10-30
roadmap: major
---

## Motivation

Integrations are a key part of Akash's ecosystem growth strategy. In order for integrations to happen quicker Akash needs a feature rich and easy to use library for both blockchain nodes and provider nodes.

## Background

Right now interacting with the blockchain and the provider is arduous for someone who is not deeply involved with the core team. The reasons for this are primarily because there are a mix of different implementations for various things as noted here:

- Blockchain nodes are built using CosmosSDK.
- Queries are done via a pure grpc service on top of protobuf.
- Transactions are done via RPC servers but the wire encoding also uses protobuf
- Provider nodes currently have a mix of GRPC server + protobuf and REST handlers for some of the mutations which are going to be rewritten to GRPC methods as well (see akash-network/support#191)

## Scope of Work

Investigate and implement chain SDK which supports:
* blockchain nodes API
* provider nodes API
* cosmosSDK built-in function (e.g., getting last block)

Additionally, this SDK should have:
* certificates manager and corresponding utils (https://github.com/akash-network/akashjs/blob/main/src/certificates/certificate-manager/CertificateManager.ts)
* certificate validation logic for provider nodes https://github.com/akash-network/console/blob/main/apps/provider-proxy/src/services/CertificateValidator.ts
* SDL related logic
  - move from https://github.com/akash-network/akashjs/blob/main/src/sdl/SDL/SDL.ts
  - move from https://github.com/akash-network/console/tree/main/apps/deploy-web/src/utils/sdl
  - we implemented SDL import from yaml and generator from object to yaml. The generator will have to be re-designed because it currently received an object of the type of the SDL builder form, which is not technically 1:1 with the SDL spec.

All changes needs to be done in https://github.com/akash-network/akash-api/tree/sdk-47 (sdk-47 branch). Library should have the best possible typescript support in order to make it super-easy to use with IDE. Also it should be possible to use in browser, so it needs to be bundle size wise.

### Additional notes

#### api/grpc
```ts
import { ChainSDK } from "@akashnetwork/chain-sdk/chain-sdk"

// Using the sdk instance
const chainSdk = new ChainSDK({
  rest: "https://api.akashnet.net",
  rpc: "https://rpc.akashnet.net"
});

// Querying data from api or grpc with typed parameters
// https://api.akashnet.net/akash/deployment/v1beta3/deployments/info?id.owner=akash1234&id.dseq=1234;
const response = await axios.get(chainSdk.rest.deployments.info({ owner: "akash1234", dseq: "1234" }));
const deployment = response.data.deployment; // Typed response

// Potential grpc usage
const response = await chainSdk.grpc.deployments.info({ owner: "akash1234", dseq: "1234" });
```

#### protobuf

```ts
// Importing the protobuf types
import { MsgCreateBid } from "@akashnetwork/chain-sdk/akash/market/v1beta4";
```

#### certificates

```ts
// Certificate utils
import { certificateManager } from "@akashnetwork/chain-sdk/certificate";

const { cert: crtpem, publicKey: pubpem, privateKey: encryptedKey } = certificateManager.generatePEM(address);
```

#### sdl

```ts
import { SDL, v2Sdl, NetworkId } from "@akashnetwork/chain-sdk/sdl";

export function getSdl(yamlJson: string | v2Sdl, networkType: NetworkType, networkId: NetworkId) {
  return isValidString(yamlJson) ? SDL.fromString(yamlJson, networkType, networkId) : new SDL(yamlJson, networkType, networkId);
}
```
