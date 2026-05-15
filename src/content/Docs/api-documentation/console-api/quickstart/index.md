---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "Quickstart"]
weight: 4
title: "Quickstart"
linkTitle: "Quickstart"
description: "Deploy an nginx container to Akash in five API calls"
---

Deploy an nginx container to Akash in five API calls.

Prerequisites:

- An API key from [Console](https://console.akash.network) (Settings → API Keys), exported as `AKASH_API_KEY`.
- A `deployment.json` file shaped like `{ "data": { "sdl": "<YOUR_SDL_YAML_AS_STRING>", "deposit": 0.5 } }` (`deposit` is in USD; `0.5` is the minimum).
- `jq` for JSON parsing.

```bash
# 1. Create a deployment
CREATE=$(curl -s -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d @deployment.json)
DSEQ=$(echo "$CREATE" | jq -r '.data.dseq')
MANIFEST=$(echo "$CREATE" | jq -r '.data.manifest')

# 2. Wait 30 seconds for bids, then read the first bid's composite id
sleep 30
BID=$(curl -s "https://console-api.akash.network/v1/bids?dseq=$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY" | jq -c '.data[0].bid.id')
GSEQ=$(echo "$BID" | jq -r '.gseq')
OSEQ=$(echo "$BID" | jq -r '.oseq')
PROVIDER=$(echo "$BID" | jq -r '.provider')

# 3. Create lease — accepts the bid and ships the manifest
curl -s -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
        --arg manifest "$MANIFEST" \
        --arg dseq "$DSEQ" \
        --argjson gseq "$GSEQ" \
        --argjson oseq "$OSEQ" \
        --arg provider "$PROVIDER" \
        '{manifest: $manifest, leases: [{dseq: $dseq, gseq: $gseq, oseq: $oseq, provider: $provider}]}')"

# 4. Check status
curl -s "https://console-api.akash.network/v1/deployments/$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY" | jq

# 5. Close when done
curl -s -X DELETE "https://console-api.akash.network/v1/deployments/$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY"
```
