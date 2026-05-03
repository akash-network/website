---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "Quickstart"]
weight: 4
title: "Quickstart"
linkTitle: "Quickstart"
description: "Deploy an nginx container to Akash in five API calls"
---

Deploy an nginx container to Akash in five API calls.

Prerequisites: an API key from [Console](https://console.akash.network) via your profile menu -> API Keys.

```bash
# 1. Create a deployment
DSEQ=$(curl -s -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d @deployment.json | jq -r .dseq)

# 2. Wait 30 seconds for bids, then pick the first
sleep 30
BID_ID=$(curl -s "https://console-api.akash.network/v1/bids?dseq=$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY" | jq -r '.[0].id')

# 3. Create lease
curl -s -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"dseq\": \"$DSEQ\", \"bidId\": \"$BID_ID\"}"

# 4. Check status
curl -s "https://console-api.akash.network/v1/deployments/$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY"

# 5. Close when done
curl -s -X DELETE "https://console-api.akash.network/v1/deployments/$DSEQ" \
  -H "x-api-key: $AKASH_API_KEY"
```
