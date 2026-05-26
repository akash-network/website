export type LanguageKey =
  | "bash"
  | "javascript"
  | "python"
  | "go"
  | "ruby"
  | "php";

export type SectionGroup = "core" | "jwt" | "lease-ops";

export interface ParamRow {
  field: string;
  location: "header" | "body" | "query" | "path";
  type: string;
  required: boolean;
  description: string;
}

export interface ResponseFieldRow {
  field: string;
  type: string;
  description: string;
}

export interface CodeSnippet {
  language: LanguageKey;
  code: string;
}

export interface Section {
  id: string;
  kind: "preface" | "endpoint" | "group-header";
  group: SectionGroup;
  host: "console-api" | "provider";
  protocol?: "http" | "wss";
  title: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "WSS";
  path?: string;
  description: string;
  bodyMd?: string;
  requestParams?: ParamRow[];
  responseStatus?: string;
  responseFields?: ResponseFieldRow[];
  responseExample?: string;
  codeSnippets: CodeSnippet[];
  notes?: string[];
}

export const META = {
  baseUrl: "https://console-api.akash.network",
  version: "v1",
  auth: "x-api-key header",
};

export const LANGUAGE_GROUPS = [
  { label: "SHELL", languages: ["bash"] as LanguageKey[] },
  {
    label: "SERVER",
    languages: ["javascript", "python", "go", "ruby", "php"] as LanguageKey[],
  },
];

export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  bash: "cURL",
  javascript: "Node.js",
  python: "Python",
  go: "Go",
  ruby: "Ruby",
  php: "PHP",
};

export const AUTHORED_LANGUAGES: LanguageKey[] = ["bash", "javascript"];

export const sections: Section[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // CORE — prefaces
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "authentication",
    kind: "preface",
    group: "core",
    host: "console-api",
    title: "Authentication",
    description:
      "Every request must include the `x-api-key` header. Create and manage keys in [Console](https://console.akash.network) under Settings → API Keys.",
    bodyMd:
      "Authentication errors return `401 Unauthorized` with `{ \"error\": \"Unauthorized\", \"message\": \"Invalid API key\" }`.",
    codeSnippets: [
      {
        language: "bash",
        code: `GET /v1/deployments HTTP/1.1
Host: console-api.akash.network
x-api-key: YOUR_API_KEY

# 401 response when the key is missing or invalid:
{ "error": "Unauthorized", "message": "Invalid API key" }`,
      },
      {
        language: "javascript",
        code: `// Every request carries the x-api-key header.
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
// 401 body when the key is missing or invalid:
// { "error": "Unauthorized", "message": "Invalid API key" }`,
      },
    ],
  },
  {
    id: "response-envelope",
    kind: "preface",
    group: "core",
    host: "console-api",
    title: "Response envelope",
    description:
      "Every JSON response is wrapped in a top-level `data` field. For list endpoints, `data` carries both the array and a `pagination` object.",
    codeSnippets: [
      {
        language: "bash",
        code: `# Single resource:
{ "data": { "...": "..." } }

# List resource:
{ "data": { "deployments": [ ... ], "pagination": { ... } } }`,
      },
      {
        language: "javascript",
        code: `// Single resource:
// { "data": { "...": "..." } }

// List resource:
// { "data": { "deployments": [ ... ], "pagination": { ... } } }`,
      },
    ],
  },
  {
    id: "errors",
    kind: "preface",
    group: "core",
    host: "console-api",
    title: "Errors",
    description:
      "The API uses standard HTTP status codes. All error responses share the same JSON shape.",
    bodyMd: `| HTTP | Code string         | Description                                                                     |
| ---- | ------------------- | ------------------------------------------------------------------------------- |
| 400  | BadRequest          | The request body or query parameters are invalid. Check \`message\` for details.  |
| 401  | Unauthorized        | \`x-api-key\` is missing, expired, or invalid.                                    |
| 404  | NotFound            | The resource (\`dseq\`) does not exist or is not owned by the authenticated user. |
| 429  | TooManyRequests     | Request rate exceeded. Wait before retrying.                                    |
| 500  | InternalServerError | Unexpected server error. Retry with exponential backoff.                        |`,
    codeSnippets: [
      {
        language: "bash",
        code: `# Error response schema:
{ "error": "string", "message": "string" }`,
      },
      {
        language: "javascript",
        code: `// Error response schema:
// { "error": "string", "message": "string" }`,
      },
    ],
  },
  {
    id: "api-versioning",
    kind: "preface",
    group: "core",
    host: "console-api",
    title: "API Versioning",
    description:
      "Endpoints are prefixed with a version number (`/v1/` or `/v2/`). Versions are independent — upgrading one endpoint version does not affect others.",
    bodyMd: `| Version | Status | Endpoints                          |
| ------- | ------ | ---------------------------------- |
| v1      | Stable | Deployments, bids, leases, deposit |
| v2      | Stable | Deployment settings (auto top-up)  |

Future breaking changes are introduced as a new version prefix; prior versions remain available for a deprecation period announced in the [changelog](https://github.com/akash-network/console/releases).`,
    codeSnippets: [],
  },
  {
    id: "pagination",
    kind: "preface",
    group: "core",
    host: "console-api",
    title: "Pagination",
    description:
      "`GET /v1/deployments` uses offset-based pagination via `skip` and `limit`. The response includes a `pagination` object with `total`, `skip`, `limit`, and `hasMore` so you can drive a paging loop without guessing when to stop.",
    bodyMd: `| Parameter | Type    | Default | Minimum | Description                        |
| --------- | ------- | ------- | ------- | ---------------------------------- |
| skip      | integer | 0       | 0       | Number of records to skip (offset) |
| limit     | integer | 1000    | 1       | Maximum records to return per page |`,
    codeSnippets: [
      {
        language: "bash",
        code: `# Stream every page sequentially:
SKIP=0
LIMIT=100
while :; do
  curl -s "https://console-api.akash.network/v1/deployments?skip=$SKIP&limit=$LIMIT" \\
    -H "x-api-key: $AKASH_API_KEY" > page.json
  jq -e '.data.pagination.hasMore' page.json > /dev/null || break
  SKIP=$((SKIP + LIMIT))
done`,
      },
      {
        language: "javascript",
        code: `async function* getAllDeployments() {
  let skip = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      \`https://console-api.akash.network/v1/deployments?skip=\${skip}&limit=\${limit}\`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } },
    );
    const { data } = await res.json();
    yield* data.deployments;
    if (!data.pagination.hasMore) break;
    skip += limit;
  }
}`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CORE — endpoints
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "post-v1deployments",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/deployments",
    title: "POST /v1/deployments",
    description:
      "Create a new deployment from an SDL manifest and fund its escrow.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.sdl", location: "body", type: "string", required: true, description: "Deployment manifest in SDL (YAML) format, as a JSON string" },
      { field: "data.deposit", location: "body", type: "number", required: true, description: "Initial escrow deposit in USD. Minimum `0.5`" },
    ],
    responseStatus: "201 Created",
    responseFields: [
      { field: "data.dseq", type: "string", description: "Deployment sequence ID" },
      { field: "data.manifest", type: "string", description: "Rendered manifest blob to send with `POST /v1/leases`" },
      { field: "data.signTx.code", type: "number", description: "Cosmos tx code (0 = success)" },
      { field: "data.signTx.transactionHash", type: "string", description: "Broadcast transaction hash" },
      { field: "data.signTx.rawLog", type: "string", description: "Raw chain log" },
    ],
    responseExample: `{
  "data": {
    "dseq": "1234567",
    "manifest": "...",
    "signTx": { "code": 0, "transactionHash": "ABCDEF...", "rawLog": "[...]" }
  }
}`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X POST https://console-api.akash.network/v1/deployments \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "data": { "sdl": "version: \\"2.0\\"\\n...", "deposit": 0.5 } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ data: { sdl: sdlString, deposit: 0.5 } }),
});
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "get-v1bids",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/bids",
    title: "GET /v1/bids",
    description:
      "List provider bids for a deployment. Poll until bids arrive.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "query", type: "string", required: true, description: "Deployment sequence ID returned by create deployment" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].bid.id.owner", type: "string", description: "Owner address" },
      { field: "data[].bid.id.dseq", type: "string", description: "Deployment sequence ID" },
      { field: "data[].bid.id.gseq", type: "number", description: "Group sequence" },
      { field: "data[].bid.id.oseq", type: "number", description: "Order sequence" },
      { field: "data[].bid.id.provider", type: "string", description: "Provider address" },
      { field: "data[].bid.id.bseq", type: "number", description: "Bid sequence (chain height)" },
      { field: "data[].bid.state", type: "string", description: "Bid state (e.g. `open`)" },
      { field: "data[].bid.price.denom", type: "string", description: "Chain denom (e.g. `uact`)" },
      { field: "data[].bid.price.amount", type: "string", description: "Chain amount in micro-units, per block" },
      { field: "data[].bid.created_at", type: "string", description: "Chain height at creation" },
      { field: "data[].bid.resources_offer", type: "array", description: "Offered CPU / memory / storage / GPU / endpoints" },
      { field: "data[].escrow_account", type: "object", description: "Provider's bid escrow account" },
    ],
    responseExample: `{
  "data": [
    {
      "bid": {
        "id": {
          "owner": "akash1...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1...",
          "bseq": 92
        },
        "state": "open",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "resources_offer": [{ "resources": { "...": "..." }, "count": 1 }]
      },
      "escrow_account": { "...": "..." }
    }
  ]
}`,
    notes: [
      "There is no flat `bid.id` string — the bid is identified by the composite `{owner, dseq, gseq, oseq, provider, bseq}`. When creating a lease, copy `dseq`, `gseq`, `oseq`, and `provider` from this object.",
      "While bids are pending, the endpoint returns `{ \"data\": [] }`. Poll every few seconds.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `curl "https://console-api.akash.network/v1/bids?dseq=1234567" \\
  -H "x-api-key: $AKASH_API_KEY"`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v1/bids?dseq=\${dseq}\`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data: bids } = await res.json();`,
      },
    ],
  },
  {
    id: "post-v1leases",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/leases",
    title: "POST /v1/leases",
    description:
      "Accept one or more provider bids and ship the manifest in a single call.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "manifest", location: "body", type: "string", required: true, description: "Manifest blob returned by `POST /v1/deployments`" },
      { field: "leases", location: "body", type: "array", required: true, description: "One entry per bid to accept" },
      { field: "leases[].dseq", location: "body", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "leases[].gseq", location: "body", type: "number", required: true, description: "Group sequence (from `bid.id.gseq`)" },
      { field: "leases[].oseq", location: "body", type: "number", required: true, description: "Order sequence (from `bid.id.oseq`)" },
      { field: "leases[].provider", location: "body", type: "string", required: true, description: "Provider address (from `bid.id.provider`)" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as GET /v1/deployments/{dseq}`,
    notes: [
      "Response is the full deployment object — same shape as `GET /v1/deployments/{dseq}`.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X POST https://console-api.akash.network/v1/leases \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "manifest": "<MANIFEST>",
    "leases": [
      { "dseq": "1234567", "gseq": 1, "oseq": 1, "provider": "akash1provider..." }
    ]
  }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch("https://console-api.akash.network/v1/leases", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    manifest,
    leases: [
      {
        dseq: chosen.dseq,
        gseq: chosen.gseq,
        oseq: chosen.oseq,
        provider: chosen.provider,
      },
    ],
  }),
});
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "post-v1deposit-deployment",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/deposit-deployment",
    title: "POST /v1/deposit-deployment",
    description:
      "Add USD funds to a deployment's escrow to extend its runtime.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.dseq", location: "body", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.deposit", location: "body", type: "number", required: true, description: "Deposit amount in USD. Minimum `0.5`" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Full deployment object after the top-up; see GET /v1/deployments/{dseq}.
// New escrow balance: data.escrow_account.state.funds[].amount (raw chain micro-units).`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X POST https://console-api.akash.network/v1/deposit-deployment \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "data": { "dseq": "1234567", "deposit": 0.5 } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  "https://console-api.akash.network/v1/deposit-deployment",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { dseq, deposit: 0.5 } }),
  },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "get-v1deployments",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/deployments",
    title: "GET /v1/deployments",
    description:
      "List all deployments for the authenticated user, with pagination.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "skip", location: "query", type: "integer", required: false, description: "Offset. Default `0`" },
      { field: "limit", location: "query", type: "integer", required: false, description: "Max records. Default `1000`" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.deployments[]", type: "array", description: "One entry per deployment, same shape as `GET /v1/deployments/{dseq}` minus per-lease `status`" },
      { field: "data.pagination.total", type: "number", description: "Total deployments for the user" },
      { field: "data.pagination.skip", type: "number", description: "Skip value used" },
      { field: "data.pagination.limit", type: "number", description: "Limit value used" },
      { field: "data.pagination.hasMore", type: "boolean", description: "True when more pages are available" },
    ],
    responseExample: `{
  "data": {
    "deployments": [
      {
        "deployment": { "...": "..." },
        "leases": [],
        "escrow_account": { "...": "..." }
      }
    ],
    "pagination": { "total": 23, "skip": 0, "limit": 10, "hasMore": true }
  }
}`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl "https://console-api.akash.network/v1/deployments?skip=0&limit=10" \\
  -H "x-api-key: $AKASH_API_KEY"`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  "https://console-api.akash.network/v1/deployments?skip=0&limit=10",
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "get-v1deployments-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/deployments/{dseq}",
    title: "GET /v1/deployments/{dseq}",
    description:
      "Retrieve full details for a single deployment by its sequence ID.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.deployment.id.owner", type: "string", description: "Owner address" },
      { field: "data.deployment.id.dseq", type: "string", description: "Deployment sequence ID" },
      { field: "data.deployment.state", type: "string", description: "Deployment state (`active`, `closed`)" },
      { field: "data.deployment.hash", type: "string", description: "Manifest hash" },
      { field: "data.deployment.created_at", type: "string", description: "Chain height at creation" },
      { field: "data.leases[]", type: "array", description: "Active leases (composite id + `state`, `price`, `created_at`, `closed_on`, `status`)" },
      { field: "data.escrow_account", type: "object", description: "Deployment escrow account with `funds[]`, `deposits[]`, `transferred[]` (raw chain denoms)" },
    ],
    responseExample: `{
  "data": {
    "deployment": {
      "id": { "owner": "akash1ownerxxx...", "dseq": "1234567" },
      "state": "active",
      "hash": "...",
      "created_at": "92"
    },
    "leases": [
      {
        "id": {
          "owner": "akash1ownerxxx...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1providerxxx...",
          "bseq": 92
        },
        "state": "active",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "closed_on": "",
        "status": { "forwarded_ports": {}, "ips": {}, "services": {} }
      }
    ],
    "escrow_account": {
      "id": { "scope": "deployment", "xid": "..." },
      "state": {
        "owner": "akash1ownerxxx...",
        "state": "open",
        "transferred": [],
        "settled_at": "92",
        "funds": [{ "denom": "uact", "amount": "5500000" }],
        "deposits": []
      }
    }
  }
}`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl "https://console-api.akash.network/v1/deployments/1234567" \\
  -H "x-api-key: $AKASH_API_KEY"`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v1/deployments/\${dseq}\`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "put-v1deployments-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "PUT",
    path: "/v1/deployments/{dseq}",
    title: "PUT /v1/deployments/{dseq}",
    description: "Update an active deployment with a revised SDL.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.sdl", location: "body", type: "string", required: true, description: "Updated SDL in YAML format, passed as a JSON string" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Full deployment object — same shape as GET /v1/deployments/{dseq}.`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X PUT "https://console-api.akash.network/v1/deployments/1234567" \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "data": { "sdl": "version: \\"2.0\\"\\n..." } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v1/deployments/\${dseq}\`,
  {
    method: "PUT",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { sdl: updatedSdl } }),
  },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "delete-v1deployments-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/deployments/{dseq}",
    title: "DELETE /v1/deployments/{dseq}",
    description:
      "Close a deployment. Remaining escrow is returned asynchronously by the chain to your Console balance.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID to close" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `{ "data": { "success": true } }`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X DELETE "https://console-api.akash.network/v1/deployments/1234567" \\
  -H "x-api-key: $AKASH_API_KEY"`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v1/deployments/\${dseq}\`,
  {
    method: "DELETE",
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "get-v2deployment-settings-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v2/deployment-settings/{dseq}",
    title: "GET /v2/deployment-settings/{dseq}",
    description:
      "Get auto top-up settings for a specific deployment. Settings are auto-created on first read.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence number" },
      { field: "userId", location: "query", type: "string", required: false, description: "Defaults to authenticated user" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.id", type: "string (uuid)", description: "Setting record id" },
      { field: "data.userId", type: "string", description: "Owning user id" },
      { field: "data.dseq", type: "string", description: "Deployment sequence number" },
      { field: "data.autoTopUpEnabled", type: "boolean", description: "Whether auto top-up is enabled" },
      { field: "data.estimatedTopUpAmount", type: "number", description: "Estimated top-up amount per cycle (USD)" },
      { field: "data.topUpFrequencyMs", type: "number", description: "Top-up cadence in milliseconds" },
      { field: "data.createdAt", type: "string", description: "ISO-8601 creation time" },
      { field: "data.updatedAt", type: "string", description: "ISO-8601 last update time" },
    ],
    responseExample: `{
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "userId": "00000000-0000-0000-0000-000000000000",
    "dseq": "1234567",
    "autoTopUpEnabled": true,
    "estimatedTopUpAmount": 5,
    "topUpFrequencyMs": 86400000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl "https://console-api.akash.network/v2/deployment-settings/1234567" \\
  -H "x-api-key: $AKASH_API_KEY"`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v2/deployment-settings/\${dseq}\`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "post-v2deployment-settings",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v2/deployment-settings",
    title: "POST /v2/deployment-settings",
    description:
      "Create deployment settings (typically used to enable auto top-up when the settings row does not yet exist).",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.dseq", location: "body", type: "string", required: true, description: "Deployment sequence number" },
      { field: "data.autoTopUpEnabled", location: "body", type: "boolean", required: true, description: "Enable or disable automatic top-up" },
      { field: "data.userId", location: "body", type: "string (uuid)", required: false, description: "Defaults to authenticated user" },
    ],
    responseStatus: "201 Created",
    responseFields: [],
    responseExample: `// Same shape as GET /v2/deployment-settings/{dseq}.`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X POST https://console-api.akash.network/v2/deployment-settings \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "data": { "dseq": "1234567", "autoTopUpEnabled": true } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  "https://console-api.akash.network/v2/deployment-settings",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { dseq, autoTopUpEnabled: true } }),
  },
);
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "patch-v2deployment-settings-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v2/deployment-settings/{dseq}",
    title: "PATCH /v2/deployment-settings/{dseq}",
    description: "Update an existing settings row.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence number" },
      { field: "userId", location: "query", type: "string (uuid)", required: false, description: "Defaults to authenticated user" },
      { field: "data.autoTopUpEnabled", location: "body", type: "boolean", required: true, description: "Enable or disable automatic top-up" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as GET /v2/deployment-settings/{dseq}.`,
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X PATCH https://console-api.akash.network/v2/deployment-settings/1234567 \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "data": { "autoTopUpEnabled": false } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v2/deployment-settings/\${dseq}\`,
  {
    method: "PATCH",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { autoTopUpEnabled: false } }),
  },
);
const { data } = await res.json();`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // JWT — group header + preface + endpoint
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "jwt-overview",
    kind: "preface",
    group: "jwt",
    host: "console-api",
    title: "JWT for provider access",
    description:
      "The Console API and the provider share a JWT-based access model for lease-scoped operations (logs, events, status, shell). Mint a short-lived token from the Console API, then call the provider directly with it.",
    bodyMd: `**TTL**: tokens are short-lived (default 1800 s in the Console UI). There is no refresh endpoint — re-call \`POST /v1/create-jwt-token\` to extend lifetime.

**Scope**: grant the narrowest set you need. Missing scope → \`401\` from the provider. Valid values: \`send-manifest\`, \`get-manifest\`, \`logs\`, \`shell\`, \`events\`, \`status\`, \`restart\`, \`hostname-migrate\`, \`ip-migrate\`.

**Spec**: JWT payload follows [AEP-64](https://akash.network/roadmap/aep-64/). The provider validates it the same way regardless of who minted it.

> **Stability**: \`POST /v1/create-jwt-token\` is **Swagger-only / Tier 2** — observed in production but not in the official API reference. It may change without notice. Self-custody users sign locally with \`@akashnetwork/chain-sdk\` and bypass this endpoint entirely.`,
    codeSnippets: [],
  },
  {
    id: "post-v1create-jwt-token",
    kind: "endpoint",
    group: "jwt",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/create-jwt-token",
    title: "POST /v1/create-jwt-token",
    description:
      "Mint a short-lived, lease-scoped JWT for accessing provider endpoints.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.ttl", location: "body", type: "number", required: true, description: "Token TTL in seconds (Console UI default: `1800`)" },
      { field: "data.leases.access", location: "body", type: "enum", required: true, description: "One of `full`, `scoped`, or `granular`" },
      { field: "data.leases.scope", location: "body", type: "array<string>", required: false, description: "Required when `access` is `scoped`. Any of `send-manifest`, `get-manifest`, `logs`, `shell`, `events`, `status`, `restart`, `hostname-migrate`, `ip-migrate`" },
      { field: "data.leases.permissions", location: "body", type: "array<object>", required: false, description: "Required when `access` is `granular`. Per-provider, per-deployment rules" },
    ],
    responseStatus: "201 Created",
    responseFields: [
      { field: "data.token", type: "string (JWT)", description: "Bearer token to send to provider endpoints as `Authorization: Bearer <token>`" },
    ],
    responseExample: `{
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`,
    notes: [
      "Swagger-only / Tier 2 endpoint — may change without notice.",
      "No refresh endpoint exists. To extend a token's lifetime, re-call this endpoint and discard the old token.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `JWT=$(curl -sX POST https://console-api.akash.network/v1/create-jwt-token \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "ttl": 1800,
      "leases": {
        "access": "scoped",
        "scope": ["status", "logs", "events", "shell"]
      }
    }
  }' | jq -r .data.token)`,
      },
      {
        language: "javascript",
        code: `const jwtResp = await (
  await fetch("https://console-api.akash.network/v1/create-jwt-token", {
    method: "POST",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        ttl: 1800,
        leases: { access: "scoped", scope: ["logs", "events", "status"] },
      },
    }),
  })
).json();
const jwt = jwtResp.data.token;`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PROVIDER-SIDE LEASE OPS — preface + endpoints
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "provider-endpoints-overview",
    kind: "preface",
    group: "lease-ops",
    host: "provider",
    title: "Provider-side lease endpoints",
    description:
      "These endpoints are served by the **provider**, not by `console-api.akash.network`. Resolve the provider's `hostUri` via `GET /v1/providers/{address}` (network-data API), then call the provider directly with the JWT in `Authorization: Bearer <token>`.",
    bodyMd: `**TLS / cert pinning**: provider certificates are self-signed against the provider's on-chain wallet address — browsers will reject them. Server-side, you have to look the cert up on-chain: the CN must be the provider's bech32 wallet address, and the chain's \`MsgCreateCertificate\` record for that \`(address, serial number)\` must match the leaf cert's fingerprint. That lookup is a chain query, so it has to happen **after** the TLS handshake — Node's \`checkServerIdentity\` is synchronous and can't \`await\`. The canonical pattern (used by Console) is to disable Node's default verification, then validate the peer cert asynchronously against the chain. See the [provider-proxy \`CertificateValidator\`](https://github.com/akash-network/console/tree/main/apps/provider-proxy/src/services/CertificateValidator) for a reference implementation. In a browser, route through a provider-proxy service.

**\`events\` vs \`kubeevents\` gotcha**: Console UI accepts \`events\` as a path component and rewrites it to \`kubeevents\` client-side. The wire path on the provider is **always \`kubeevents\`** — use that directly to avoid surprises.

**Common errors**:

- \`401\` — JWT scope doesn't include the requested operation (e.g. calling \`/logs\` without \`logs\` in scope).
- Empty log stream — the deployment hasn't started yet, or the named service isn't running.
- TLS handshake failure — you're missing the cert-pinning agent, or the provider has rotated keys.`,
    codeSnippets: [],
  },
  {
    id: "get-lease-status",
    kind: "endpoint",
    group: "lease-ops",
    host: "provider",
    protocol: "http",
    method: "GET",
    path: "https://{hostUri}/lease/{dseq}/{gseq}/{oseq}/status",
    title: "GET /lease/{dseq}/{gseq}/{oseq}/status",
    description:
      "Polled status of each service in a lease: ready/total replicas, forwarded ports, IPs, restart counts.",
    requestParams: [
      { field: "Authorization", location: "header", type: "string", required: true, description: "`Bearer <jwt>`" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "gseq", location: "path", type: "number", required: true, description: "Group sequence" },
      { field: "oseq", location: "path", type: "number", required: true, description: "Order sequence" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "services.<name>.ready_replicas", type: "number", description: "Replicas currently passing readiness checks" },
      { field: "services.<name>.available_replicas", type: "number", description: "Replicas marked available by the Kubernetes controller" },
      { field: "services.<name>.replicas", type: "number", description: "Current replicas" },
      { field: "services.<name>.total", type: "number", description: "Desired replicas" },
      { field: "services.<name>.uris", type: "array<string>", description: "Accessible URIs for the service (when leasing endpoints)" },
      { field: "forwarded_ports.<name>", type: "array<object>", description: "Provider-side port forwards, keyed by service name (top-level — not nested under `services`)" },
      { field: "ips.<name>", type: "array<object>", description: "Public IPs assigned to the service, keyed by service name (top-level, when leasing IP endpoints)" },
    ],
    responseExample: `{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": ["example.com"],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {
    "web": [{ "host": "example.com", "port": 80, "externalPort": 30000, "available": 1 }]
  },
  "ips": {
    "web": [{ "IP": "1.2.3.4", "Port": 80, "ExternalPort": 30000, "Protocol": "tcp" }]
  }
}`,
    notes: [
      "Same shape as `deployment.leases[].status` in the Console API, but freshly polled from the provider.",
      "JWT scope must include `status`.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `# --cacert / -k handling omitted — see provider preface for cert pinning.
curl "https://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/status" \\
  -H "Authorization: Bearer $JWT"`,
      },
      {
        language: "javascript",
        code: `import https from "https";

// \`rejectUnauthorized: false\` skips Node's hostname check (provider certs
// are self-signed against the provider's on-chain wallet). For production,
// validate the peer cert against the chain asynchronously — see the
// provider-endpoints preface.
const agent = new https.Agent({ rejectUnauthorized: false });

const res = await fetch(
  \`\${hostUri}/lease/\${dseq}/\${gseq}/\${oseq}/status\`,
  { headers: { Authorization: \`Bearer \${jwt}\` }, agent },
);
const status = await res.json();`,
      },
    ],
  },
  {
    id: "wss-lease-logs",
    kind: "endpoint",
    group: "lease-ops",
    host: "provider",
    protocol: "wss",
    method: "WSS",
    path: "wss://{hostUri}/lease/{dseq}/{gseq}/{oseq}/logs",
    title: "WSS /lease/{dseq}/{gseq}/{oseq}/logs",
    description:
      "Stream container logs for a lease. Send `follow=true` to tail continuously.",
    requestParams: [
      { field: "Authorization", location: "header", type: "string", required: true, description: "`Bearer <jwt>` (scope must include `logs`)" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "gseq", location: "path", type: "number", required: true, description: "Group sequence" },
      { field: "oseq", location: "path", type: "number", required: true, description: "Order sequence" },
      { field: "tail", location: "query", type: "number", required: false, description: "Number of lines to tail from the end of the log" },
      { field: "follow", location: "query", type: "boolean", required: false, description: "Stream new logs continuously when `true`" },
      { field: "service", location: "query", type: "string", required: false, description: "Filter to a specific service name" },
    ],
    responseFields: [
      { field: "(stream)", type: "binary", description: "Stream of text chunks; one chunk ≈ one log line" },
    ],
    responseExample: `# Each message frame is a text chunk:
2026-05-22T16:12:01Z INFO ready to serve on :8080
2026-05-22T16:12:09Z INFO request id=abc completed in 12ms`,
    notes: [
      "JWT scope must include `logs`.",
      "In a browser, the self-signed provider cert will be rejected — route through a provider-proxy.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `# websocat 1.13+ supports --insecure for self-signed certs.
websocat "wss://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/logs?follow=true&tail=200" \\
  -H "Authorization: Bearer $JWT"`,
      },
      {
        language: "javascript",
        code: `import WebSocket from "ws";
import https from "https";

// \`rejectUnauthorized: false\` skips Node's hostname check; see preface.
const agent = new https.Agent({ rejectUnauthorized: false });

const ws = new WebSocket(
  \`wss://\${hostUri.replace(/^https?:\\/\\//, "")}/lease/\${dseq}/\${gseq}/\${oseq}/logs?follow=true\`,
  { headers: { Authorization: \`Bearer \${jwt}\` }, agent },
);
ws.on("message", (chunk) => process.stdout.write(chunk));`,
      },
    ],
  },
  {
    id: "wss-lease-kubeevents",
    kind: "endpoint",
    group: "lease-ops",
    host: "provider",
    protocol: "wss",
    method: "WSS",
    path: "wss://{hostUri}/lease/{dseq}/{gseq}/{oseq}/kubeevents",
    title: "WSS /lease/{dseq}/{gseq}/{oseq}/kubeevents",
    description:
      "Stream Kubernetes events for the lease (pod scheduling, container restarts, etc.).",
    requestParams: [
      { field: "Authorization", location: "header", type: "string", required: true, description: "`Bearer <jwt>` (scope must include `events`)" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "gseq", location: "path", type: "number", required: true, description: "Group sequence" },
      { field: "oseq", location: "path", type: "number", required: true, description: "Order sequence" },
    ],
    responseFields: [
      { field: "(stream)", type: "JSON objects", description: "One Kubernetes Event per message frame" },
    ],
    responseExample: `{
  "type": "Normal",
  "reason": "Scheduled",
  "message": "Successfully assigned default/web-78fd... to node-3",
  "involvedObject": { "kind": "Pod", "name": "web-78fd..." },
  "firstTimestamp": "2026-05-22T16:12:01Z"
}`,
    notes: [
      "**The wire path is `kubeevents`, not `events`.** Some client tools accept `events` and rewrite it client-side, but the provider only responds on `kubeevents`.",
      "JWT scope must include `events`.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `websocat "wss://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/kubeevents" \\
  -H "Authorization: Bearer $JWT"`,
      },
      {
        language: "javascript",
        code: `import WebSocket from "ws";
import https from "https";

// \`rejectUnauthorized: false\` skips Node's hostname check; see preface.
const agent = new https.Agent({ rejectUnauthorized: false });

const ws = new WebSocket(
  \`wss://\${hostUri.replace(/^https?:\\/\\//, "")}/lease/\${dseq}/\${gseq}/\${oseq}/kubeevents\`,
  { headers: { Authorization: \`Bearer \${jwt}\` }, agent },
);
ws.on("message", (chunk) => console.log(JSON.parse(chunk.toString())));`,
      },
    ],
  },
  {
    id: "wss-lease-shell",
    kind: "endpoint",
    group: "lease-ops",
    host: "provider",
    protocol: "wss",
    method: "WSS",
    path: "wss://{hostUri}/lease/{dseq}/{gseq}/{oseq}/shell",
    title: "WSS /lease/{dseq}/{gseq}/{oseq}/shell",
    description:
      "Interactive `kubectl exec`-style shell. Binary multiplexed stream of stdin/stdout/stderr/resize. Advanced — prefer the SDK helpers for most use cases.",
    requestParams: [
      { field: "Authorization", location: "header", type: "string", required: true, description: "`Bearer <jwt>` (scope must include `shell`)" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "gseq", location: "path", type: "number", required: true, description: "Group sequence" },
      { field: "oseq", location: "path", type: "number", required: true, description: "Order sequence" },
      { field: "service", location: "query", type: "string", required: true, description: "Service name to exec into" },
      { field: "podIndex", location: "query", type: "number", required: true, description: "Pod index (zero-based)" },
      { field: "cmd", location: "query", type: "string", required: false, description: "Base64-encoded command to run (omit for default shell)" },
    ],
    responseFields: [
      { field: "(stream)", type: "binary", description: "Multiplexed stdin/stdout/stderr/resize frames" },
    ],
    notes: [
      "JWT scope must include `shell`.",
      "Console UI uses `xterm.js` on the client side to render the stream.",
      "For programmatic shells, use the provider's `kubectl exec`-style protocol via the SDK helpers rather than constructing this WebSocket by hand.",
    ],
    codeSnippets: [
      {
        language: "javascript",
        code: `import WebSocket from "ws";
import https from "https";

// \`rejectUnauthorized: false\` skips Node's hostname check; see preface.
const agent = new https.Agent({ rejectUnauthorized: false });

const cmd = Buffer.from(JSON.stringify(["/bin/sh"])).toString("base64");
const url =
  \`wss://\${hostUri.replace(/^https?:\\/\\//, "")}/lease/\${dseq}/\${gseq}/\${oseq}/shell\` +
  \`?service=\${service}&podIndex=0&cmd=\${cmd}\`;

const ws = new WebSocket(url, {
  headers: { Authorization: \`Bearer \${jwt}\` },
  agent,
});
ws.on("message", (frame) => process.stdout.write(frame));`,
      },
    ],
  },
];

export function getSectionsByGroup(group: SectionGroup): Section[] {
  return sections.filter((s) => s.group === group);
}

export const GROUP_LABELS: Record<SectionGroup, string> = {
  core: "Core",
  jwt: "JWT for provider access",
  "lease-ops": "Lease operations (provider)",
};
