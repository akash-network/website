export type LanguageKey =
  | "bash"
  | "javascript"
  | "python"
  | "go"
  | "ruby"
  | "php";

export type SectionGroup = "core" | "teams" | "jwt" | "lease-ops";

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

const API_KEY_PARAM: ParamRow = { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" };

const EXAMPLE_IDS = {
  organization: "0b6c3f9e-8f1a-4d2b-9c7e-1a2b3c4d5e6f",
  project: "7d2e4a61-3b9c-4f0e-a5d8-6c1b2e3f4a5b",
  member: "5a8b1c2d-3e4f-4a5b-8c6d-7e8f9a0b1c2d",
  user: "9c1d2e3f-4a5b-4c6d-9e7f-8a9b0c1d2e3f",
  invitation: "2f3e4d5c-6b7a-4980-8f1e-2d3c4b5a6978",
  grant: "4e5f6a7b-8c9d-4e0f-a1b2-c3d4e5f6a7b8",
  budget: "8a9b0c1d-2e3f-4a5b-b6c7-d8e9f0a1b2c3",
  apiKey: "3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f",
};

/** cURL and Node.js samples for a JSON request authenticated with the API key. */
function apiKeyRequestSnippets(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: object,
): CodeSnippet[] {
  const url = `${META.baseUrl}${path}`;
  const json = body && JSON.stringify(body, null, 2);
  const curl = [
    `curl${method === "GET" ? "" : ` -X ${method}`} "${url}"`,
    `  -H "x-api-key: $AKASH_API_KEY"`,
    ...(json ? [`  -H "Content-Type: application/json"`, `  -d '${json.replace(/\n/g, "\n  ")}'`] : []),
  ].join(" \\\n");
  const options = [
    ...(method === "GET" ? [] : [`  method: "${method}",`]),
    json
      ? `  headers: {\n    "x-api-key": process.env.AKASH_API_KEY,\n    "Content-Type": "application/json",\n  },`
      : `  headers: { "x-api-key": process.env.AKASH_API_KEY },`,
    ...(json ? [`  body: JSON.stringify(${json.replace(/\n/g, "\n  ")}),`] : []),
  ].join("\n");
  const readResponse =
    method === "DELETE" ? "// 204 No Content on success" : "const { data } = await res.json();";

  return [
    { language: "bash", code: curl },
    { language: "javascript", code: `const res = await fetch("${url}", {\n${options}\n});\n${readResponse}` },
  ];
}

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
      "Authentication errors return `401 Unauthorized` with `{ \"error\": \"Unauthorized\", \"message\": \"Invalid API key\" }`.\n\nA key acts in the account it was created in, your personal account or a team, with your role there, and can be limited to one project. See [Organizations and projects](#group-teams).",
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
| 403  | Forbidden           | Your role, the key's project, or a project budget does not allow the request.   |
| 404  | NotFound            | The resource (\`dseq\`) does not exist or is out of the caller's reach.            |
| 429  | TooManyRequests     | Request rate exceeded. Wait before retrying.                                    |
| 500  | InternalServerError | Unexpected server error. Retry with exponential backoff.                        |

\`code\` names the precise reason, such as \`project_forbidden\` or \`project_budget_exceeded\`. The organization and project codes are listed under [Organizations and projects](#group-teams).`,
    codeSnippets: [
      {
        language: "bash",
        code: `# Error response schema:
{ "error": "string", "message": "string", "code": "string", "type": "string" }`,
      },
      {
        language: "javascript",
        code: `// Error response schema:
// { "error": "string", "message": "string", "code": "string", "type": "string" }`,
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
    bodyMd: `| Version | Status | Endpoints                           |
| ------- | ------ | ----------------------------------- |
| v1      | Stable | Deployments, bids, leases           |
| v2      | Stable | Deployment settings (runtime limit) |

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
    bodyMd: `| Parameter | Type    | Default | Minimum | Maximum | Description                        |
| --------- | ------- | ------- | ------- | ------- | ---------------------------------- |
| skip      | integer | 0       | 0       | none    | Number of records to skip (offset) |
| limit     | integer | 100     | 1       | 100     | Maximum records to return per page |`,
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
      "Create a new deployment from an SDL manifest. Console funds it automatically from your account credits, so the request takes no deposit.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.sdl", location: "body", type: "string", required: true, description: "Deployment manifest in SDL (YAML) format, as a JSON string. May include a `params.tee` field (`cpu`/`cpu-gpu`) to request Confidential Compute" },
      { field: "data.runtimeLimitHours", location: "body", type: "number", required: false, description: "Close the deployment after this many hours of runtime, counted from lease start. Omit for always-on funding" },
      { field: "data.projectId", location: "body", type: "string (uuid)", required: false, description: "Project of the organization to file the deployment in. Omit it to use the only project you can deploy into, otherwise the organization's default project" },
    ],
    responseStatus: "201 Created",
    responseFields: [
      { field: "data.dseq", type: "string", description: "Deployment sequence ID" },
      { field: "data.manifest", type: "string", description: "Rendered manifest. You don't need to keep it: `POST /v1/leases` sends the provider a manifest built from the SDL Console recorded" },
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
  -d '{ "data": { "sdl": "version: \\"2.0\\"\\n..." } }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ data: { sdl: sdlString } }),
});
const { data } = await res.json();`,
      },
    ],
    notes: [
      "Request **Confidential Compute (TEE)** by adding a `params.tee` field (`cpu` or `cpu-gpu`) to a service in the SDL — `cpu-gpu` requires GPU resources. See [Confidential Compute (TEE)](/docs/api-documentation/console-api/getting-started#confidential-compute-tee).",
      "`400` with code `project_required` means no project you can deploy into was found: pass `data.projectId` or `x-project-id`. `403` with code `project_budget_exceeded` means the deposit would take the project past its monthly budget, and nothing was created. `503` with code `deposit_price_unavailable` means the deposit could not be priced against the project's budget; it is transient, so retry. An unknown `projectId` answers `404`.",
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
      "Accept one or more provider bids. Console creates the leases, then sends each provider the manifest built from the SDL it recorded when the deployment was created, so the request carries only the bids.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "leases", location: "body", type: "array", required: true, description: "One entry per bid to accept" },
      { field: "leases[].dseq", location: "body", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "leases[].gseq", location: "body", type: "number", required: true, description: "Group sequence (from `bid.id.gseq`)" },
      { field: "leases[].oseq", location: "body", type: "number", required: true, description: "Order sequence (from `bid.id.oseq`)" },
      { field: "leases[].provider", location: "body", type: "string", required: true, description: "Provider address (from `bid.id.provider`)" },
      { field: "manifest", location: "body", type: "string", required: false, description: "**Deprecated.** Leave it out: Console builds the manifest from the SDL it recorded" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as GET /v1/deployments/{dseq}`,
    notes: [
      "Response is the full deployment object — same shape as `GET /v1/deployments/{dseq}`.",
      "A `502` with code `provider_unreachable` means no lease was created, so pick another bid. With code `manifest_not_delivered` the lease exists but the provider didn't take the manifest: send the same request again to retry, or close the deployment to stop paying for it.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X POST https://console-api.akash.network/v1/leases \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
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
      "**Deprecated.** Console funds every deployment automatically for as long as your account has credits, so there is nothing for this endpoint to do. It still accepts requests so existing integrations keep working, and will be removed in a future release.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.dseq", location: "body", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.deposit", location: "body", type: "number", required: true, description: "Deposit amount in USD. Minimum `0.5`. Accepted but no longer needed" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Full deployment object after the top-up; see GET /v1/deployments/{dseq}.`,
    notes: [
      "Replaced by automatic funding. Add credits to your account instead. See [How Funding Works](/docs/getting-started/how-funding-works).",
    ],
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
      { field: "limit", location: "query", type: "integer", required: false, description: "Records per page, from `1` to `100`. Default `100`" },
      { field: "state", location: "query", type: "string", required: false, description: "`active` (default) or `closed`" },
      { field: "search", location: "query", type: "string", required: false, description: "Case-insensitive match against each deployment's name and dseq" },
      { field: "reverse", location: "query", type: "string", required: false, description: "`true` lists the newest deployment first. Default `false` (oldest first)" },
      { field: "projectId", location: "query", type: "string (uuid)", required: false, description: "Only the deployments filed in this project. A project you cannot reach lists nothing" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.deployments[]", type: "array", description: "One entry per deployment, same shape as `GET /v1/deployments/{dseq}` minus per-lease `status`" },
      { field: "data.deployments[].projectId", type: "string | null", description: "Project the deployment is filed in" },
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
    id: "patch-v1deployments-dseq",
    kind: "endpoint",
    group: "core",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/deployments/{dseq}",
    title: "PATCH /v1/deployments/{dseq}",
    description:
      "Change a running deployment in place: a service's image, command, arguments, environment variables, registry credentials, exposed ports or volume mounts, or the deployment's name. Console applies the patch to the SDL it recorded at create, so the request never carries an SDL, and only the services you name change.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.services.<name>.image", location: "body", type: "string", required: false, description: "New image for the service, with an explicit tag" },
      { field: "data.services.<name>.env", location: "body", type: "object", required: false, description: "Merged into the service's env by variable name. `null` removes a variable" },
      { field: "data.services.<name>.command", location: "body", type: "array", required: false, description: "Replaces the container command" },
      { field: "data.services.<name>.args", location: "body", type: "array", required: false, description: "Replaces the command arguments" },
      { field: "data.services.<name>.credentials", location: "body", type: "object", required: false, description: "Private registry `host`, `username` and `password`. `null` clears them" },
      { field: "data.services.<name>.expose.<port>", location: "body", type: "object", required: false, description: "Keyed by the container port the SDL declares: `port`, `as`, `accept` (custom domains) and `httpOptions`" },
      { field: "data.services.<name>.storage.<volume>", location: "body", type: "object", required: false, description: "`mount` and `readOnly` only. Sizes are fixed at create" },
      { field: "data.name", location: "body", type: "string", required: false, description: "Renames the deployment" },
      { field: "data.sealedSecrets", location: "body", type: "string", required: false, description: "Compact JWE holding only the secret values this patch replaces, for env values written as `ac-secret://NAME`" },
      { field: "data.ifManifestVersion", location: "body", type: "string", required: false, description: "Base64 manifest version you expect to be current. Answers `409` if the deployment has moved on" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.deployment", type: "object", description: "The deployment, as in `GET /v1/deployments/{dseq}`" },
      { field: "data.leases", type: "array", description: "Its leases" },
      { field: "data.name", type: "string", description: "Deployment name" },
      { field: "data.manifestVersion", type: "string", description: "Base64 version of the manifest now current. Pass it as `ifManifestVersion` on the next patch" },
    ],
    responseExample: `// { "data": { "deployment": {...}, "leases": [...], "escrow_account": {...}, "name": "...", "manifestVersion": "..." } }`,
    notes: [
      "Compute resources, replica counts, groups and globally exposed ports are fixed at create. A patch that would change them answers `422` with code `deployment_resources_changed`; create a new deployment instead.",
      "`404` means Console holds no recorded SDL for this deployment, so there is nothing to patch.",
      "`409` with code `deployment_definition_changed` means another change landed between this patch reading the deployment and writing it. Reload it and retry.",
    ],
    codeSnippets: [
      {
        language: "bash",
        code: `curl -X PATCH "https://console-api.akash.network/v1/deployments/1234567" \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "services": {
        "web": {
          "image": "nginx:1.27.3",
          "env": { "LOG_LEVEL": "debug", "OLD_FLAG": null }
        }
      }
    }
  }'`,
      },
      {
        language: "javascript",
        code: `const res = await fetch(
  \`https://console-api.akash.network/v1/deployments/\${dseq}\`,
  {
    method: "PATCH",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        services: {
          web: { image: "nginx:1.27.3", env: { LOG_LEVEL: "debug", OLD_FLAG: null } },
        },
      },
    }),
  },
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
    description:
      "**Deprecated.** Resubmits the whole SDL. Use `PATCH /v1/deployments/{dseq}` instead; this endpoint will be removed in a future release.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.sdl", location: "body", type: "string", required: true, description: "Updated SDL in YAML format, passed as a JSON string" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Full deployment object — same shape as GET /v1/deployments/{dseq}.`,
    notes: [
      "Refused with `422` and code `deployment_resources_changed` when the SDL changes the groups, compute resources, replica counts or globally exposed ports the deployment was created with.",
    ],
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
      "Close a deployment. Whatever it has not yet spent returns to your Console account balance once the chain settles.",
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
      "Get the funding settings for a specific deployment, including its runtime limit. Settings are auto-created on first read.",
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
      { field: "data.autoTopUpEnabled", type: "boolean", description: "Always `true`. Automatic funding cannot be turned off" },
      { field: "data.estimatedTopUpAmount", type: "number", description: "Estimated top-up amount per cycle (USD)" },
      { field: "data.topUpFrequencyMs", type: "number", description: "Top-up cadence in milliseconds" },
      { field: "data.runtimeLimitHours", type: "number \\| null", description: "Runtime limit in hours chosen at creation, or `null` for always-on funding" },
      { field: "data.runtimeEndsAt", type: "string \\| null", description: "When the runtime limit is reached, anchored at lease start; `null` until the lease starts or when no limit is set" },
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
    "runtimeLimitHours": null,
    "runtimeEndsAt": null,
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
      "Create the settings row for a deployment when it does not yet exist. Automatic funding is on by default and cannot be turned off.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "data.dseq", location: "body", type: "string", required: true, description: "Deployment sequence number" },
      { field: "data.autoTopUpEnabled", location: "body", type: "boolean", required: false, description: "Defaults to `true` when omitted. An explicit `false` is rejected" },
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
    description: "Update an existing settings row. Use this to set, extend, or remove a deployment's runtime limit.",
    requestParams: [
      { field: "x-api-key", location: "header", type: "string", required: true, description: "Your API key" },
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence number" },
      { field: "userId", location: "query", type: "string (uuid)", required: false, description: "Defaults to authenticated user" },
      { field: "data.autoTopUpEnabled", location: "body", type: "boolean", required: false, description: "An explicit `false` is rejected" },
      { field: "data.runtimeLimitHours", location: "body", type: "number \\| null", required: false, description: "New total runtime limit in hours, counted from lease start. Send `null` to remove the limit and return the deployment to always-on funding. Lowering a limit is not supported" },
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
  -d '{ "data": { "runtimeLimitHours": 48 } }'`,
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
    body: JSON.stringify({ data: { runtimeLimitHours: 48 } }),
  },
);
const { data } = await res.json();`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TEAMS: organizations, members, invitations, projects, budgets, spend
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "teams-overview",
    kind: "preface",
    group: "teams",
    host: "console-api",
    title: "Organizations and projects",
    description:
      "Every request runs in one organization, your personal account or a team, and can be limited to one project of it. An API key acts in the organization it was created in, with your role there, and can be limited to one project. See [Organizations and Projects through the API](/docs/api-documentation/console-api/organizations-and-projects) for a walkthrough.",
    bodyMd: `| Header            | Description |
| ----------------- | ----------- |
| \`x-organization-id\` | Id or slug of the organization. Optional with an API key, which already decides it: naming another organization answers \`400\` \`organization_mismatch\`. |
| \`x-project-id\`      | Limits the request to one project of the organization. A project out of your reach answers \`403\` \`project_forbidden\`. |

Owners and admins reach every project. Members and viewers reach every project or only the ones granted to them, and billing members reach none. Each endpoint below says who may call it.

| HTTP | \`code\`                    | Meaning |
| ---- | ------------------------- | ------- |
| 400  | \`organization_mismatch\`   | \`x-organization-id\` names another organization than the API key's. |
| 403  | \`organization_forbidden\`  | The caller is not a member of the organization, for example after leaving it. |
| 403  | \`project_forbidden\`       | The project is out of reach, the key is limited to another project, or the deployment is filed in a project the caller cannot change. |
| 400  | \`project_required\`        | No project the caller can deploy into was named. |
| 403  | \`project_budget_exceeded\` | The deposit would take the project past its monthly budget. \`data.projectIds\` lists the projects. |
| 403  | \`session_required\`        | The action needs a signed-in Console session. |

Creating an organization (\`POST /v1/organizations\`), deleting it (\`DELETE /v1/organizations/{id}\`), leaving it (\`DELETE /v1/organizations/{id}/membership\`) and accepting an invitation (\`POST /v1/invitations/accept\`) need a signed-in Console session, so an API key gets \`403\` \`session_required\`. Do those in [Console](https://console.akash.network).`,
    codeSnippets: [
      {
        language: "bash",
        code: `# List the deployments of one project
curl "https://console-api.akash.network/v1/deployments" \\
  -H "x-api-key: $AKASH_API_KEY" \\
  -H "x-project-id: ${EXAMPLE_IDS.project}"`,
      },
      {
        language: "javascript",
        code: `// List the deployments of one project
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "x-project-id": "${EXAMPLE_IDS.project}",
  },
});
const { data } = await res.json();`,
      },
    ],
  },
  {
    id: "get-v1organizations",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/organizations",
    title: "GET /v1/organizations",
    description:
      "List the organizations of the caller and their role in each. With an API key, the list holds only the key's organization.",
    requestParams: [API_KEY_PARAM],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].id", type: "string (uuid)", description: "Organization id" },
      { field: "data[].name", type: "string", description: "Organization name" },
      { field: "data[].slug", type: "string", description: "Slug, accepted by `x-organization-id` like the id" },
      { field: "data[].type", type: "string", description: "`personal` or `team`" },
      { field: "data[].role", type: "string", description: "The caller's role: `owner`, `admin`, `member`, `billing` or `viewer`" },
      { field: "data[].isActive", type: "boolean", description: "Whether this request ran in this organization" },
      { field: "data[].hasPaymentMethod", type: "boolean | null", description: "Whether the organization has a card saved. Null for one the request did not run in" },
      { field: "data[].createdAt", type: "string", description: "ISO-8601 creation time" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.organization}",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "type": "team",
      "role": "admin",
      "isActive": true,
      "hasPaymentMethod": true,
      "createdAt": "2026-10-01T12:00:00.000Z"
    }
  ]
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/organizations"),
  },
  {
    id: "patch-v1organizations-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/organizations/{id}",
    title: "PATCH /v1/organizations/{id}",
    description: "Rename the active team organization. Owners and admins only.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Id of the active organization" },
      { field: "data.name", location: "body", type: "string", required: true, description: "New name, unique among the organizations the caller belongs to" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as one entry of GET /v1/organizations.`,
    notes: [
      "`403` with code `personal_organization` for a personal account. `409` with code `organization_name_taken` when the caller already belongs to an organization with this name.",
    ],
    codeSnippets: apiKeyRequestSnippets("PATCH", `/v1/organizations/${EXAMPLE_IDS.organization}`, { data: { name: "Acme Platform" } }),
  },
  {
    id: "get-v1organization-members",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/organization-members",
    title: "GET /v1/organization-members",
    description: "List the members of the active organization. Every member may call it.",
    requestParams: [API_KEY_PARAM],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].id", type: "string (uuid)", description: "Membership id, used by the member endpoints below" },
      { field: "data[].userId", type: "string (uuid)", description: "User id, used to grant project access" },
      { field: "data[].username", type: "string | null", description: "Username" },
      { field: "data[].email", type: "string | null", description: "Email address" },
      { field: "data[].role", type: "string", description: "`owner`, `admin`, `member`, `billing` or `viewer`" },
      { field: "data[].projectAccess", type: "string | null", description: "`all` or `selected` for members and viewers, `all` for owners and admins, null for billing members" },
      { field: "data[].projectCount", type: "number | null", description: "Projects granted to a member or viewer on `selected`" },
      { field: "data[].createdAt", type: "string", description: "When they joined" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.member}",
      "userId": "${EXAMPLE_IDS.user}",
      "username": "dev",
      "email": "dev@example.com",
      "role": "member",
      "projectAccess": "selected",
      "projectCount": 1,
      "createdAt": "2026-10-02T09:30:00.000Z"
    }
  ]
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/organization-members"),
  },
  {
    id: "patch-v1organization-members-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/organization-members/{id}",
    title: "PATCH /v1/organization-members/{id}",
    description:
      "Change a member's role, project access and project grants, all together or not at all. Owners and admins; only an owner can change anything about the owner role.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Membership id from `GET /v1/organization-members`" },
      { field: "data.role", location: "body", type: "string", required: false, description: "`owner`, `admin`, `member`, `billing` or `viewer`" },
      { field: "data.projectAccess", location: "body", type: "string", required: false, description: "`all` or `selected`. Required when someone becomes a member or viewer from another role" },
      { field: "data.projectGrants", location: "body", type: "array", required: false, description: "`[{ projectId, role }]` with role `viewer`, `member` or `admin`. Replaces every grant of a member or viewer on `selected`" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as one entry of GET /v1/organization-members.`,
    notes: [
      "Send at least one field. A member or viewer on `selected` needs at least one grant.",
      "`400` with code `project_access_required` when someone becomes a member or viewer without `projectAccess`. `403` with code `owner_role_restricted` when a non-owner touches the owner role. `409` with code `last_owner` when the organization would be left without an owner.",
    ],
    codeSnippets: apiKeyRequestSnippets("PATCH", `/v1/organization-members/${EXAMPLE_IDS.member}`, {
      data: {
        role: "member",
        projectAccess: "selected",
        projectGrants: [{ projectId: EXAMPLE_IDS.project, role: "admin" }],
      },
    }),
  },
  {
    id: "delete-v1organization-members-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/organization-members/{id}",
    title: "DELETE /v1/organization-members/{id}",
    description:
      "Remove a member from the active organization. Their access, and the API keys they created in it, stop working. Owners and admins; only an owner can remove an owner.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Membership id" },
    ],
    responseStatus: "204 No Content",
    responseFields: [],
    notes: ["`409` with code `last_owner` when the organization would be left without an owner."],
    codeSnippets: apiKeyRequestSnippets("DELETE", `/v1/organization-members/${EXAMPLE_IDS.member}`),
  },
  {
    id: "post-v1organization-members-id-ownership-transfer",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/organization-members/{id}/ownership-transfer",
    title: "POST /v1/organization-members/{id}/ownership-transfer",
    description:
      "Make a member an owner of the active organization and step the calling owner down to admin. Owners only.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Membership id of the new owner" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// The member who received ownership, same shape as one entry of GET /v1/organization-members.`,
    codeSnippets: apiKeyRequestSnippets("POST", `/v1/organization-members/${EXAMPLE_IDS.member}/ownership-transfer`),
  },
  {
    id: "get-v1organization-members-id-project-grants",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/organization-members/{id}/project-grants",
    title: "GET /v1/organization-members/{id}/project-grants",
    description: "List the projects a member is granted, with the role on each. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Membership id" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].projectId", type: "string (uuid)", description: "Granted project" },
      { field: "data[].role", type: "string", description: "`viewer`, `member` or `admin`" },
    ],
    responseExample: `{ "data": [{ "projectId": "${EXAMPLE_IDS.project}", "role": "member" }] }`,
    codeSnippets: apiKeyRequestSnippets("GET", `/v1/organization-members/${EXAMPLE_IDS.member}/project-grants`),
  },
  {
    id: "get-v1organization-invitations",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/organization-invitations",
    title: "GET /v1/organization-invitations",
    description: "List the pending invitations of the active organization. Owners and admins.",
    requestParams: [API_KEY_PARAM],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].id", type: "string (uuid)", description: "Invitation id" },
      { field: "data[].email", type: "string", description: "Invited address" },
      { field: "data[].role", type: "string", description: "Role the invitation grants" },
      { field: "data[].projectAccess", type: "string", description: "`all` or `selected`" },
      { field: "data[].projectGrants", type: "array", description: "`[{ projectId, role }]` granted on joining" },
      { field: "data[].invitedBy", type: "object | null", description: "`{ id, username }` of the inviter" },
      { field: "data[].expiresAt", type: "string", description: "When the link stops working, 7 days after it was sent" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.invitation}",
      "email": "dev@example.com",
      "role": "member",
      "projectAccess": "selected",
      "projectGrants": [{ "projectId": "${EXAMPLE_IDS.project}", "role": "member" }],
      "invitedBy": { "id": "${EXAMPLE_IDS.user}", "username": "jane" },
      "createdAt": "2026-10-02T09:00:00.000Z",
      "expiresAt": "2026-10-09T09:00:00.000Z"
    }
  ]
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/organization-invitations"),
  },
  {
    id: "post-v1organization-invitations",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/organization-invitations",
    title: "POST /v1/organization-invitations",
    description:
      "Invite people to the active team by email. Each address gets an email with a link, valid for 7 days, that they accept in Console. Owners and admins; only an owner can invite an owner.",
    requestParams: [
      API_KEY_PARAM,
      { field: "data.emails", location: "body", type: "array<string>", required: true, description: "1 to 20 addresses" },
      { field: "data.role", location: "body", type: "string", required: true, description: "`owner`, `admin`, `member`, `billing` or `viewer`" },
      { field: "data.projectAccess", location: "body", type: "string", required: false, description: "`all` or `selected`. For a member or viewer, required unless `projectGrants` is given" },
      { field: "data.projectGrants", location: "body", type: "array", required: false, description: "`[{ projectId, role }]` for a member or viewer on `selected`" },
    ],
    responseStatus: "201 Created",
    responseFields: [],
    responseExample: `// One pending invitation per address, same shape as GET /v1/organization-invitations.
// An address already invited keeps its existing invitation.`,
    notes: [
      "`400` with code `project_access_required` for a member or viewer with neither `projectAccess` nor grants. `409` with code `already_member` when an address belongs to a member. `403` with code `invitation_limit_reached` when the organization has too many pending invitations, and `429` with code `invitation_email_limit_reached` when too many invitation emails were sent recently.",
    ],
    codeSnippets: apiKeyRequestSnippets("POST", "/v1/organization-invitations", {
      data: {
        emails: ["dev@example.com"],
        role: "member",
        projectAccess: "selected",
        projectGrants: [{ projectId: EXAMPLE_IDS.project, role: "member" }],
      },
    }),
  },
  {
    id: "post-v1organization-invitations-id-resend",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/organization-invitations/{id}/resend",
    title: "POST /v1/organization-invitations/{id}/resend",
    description: "Email a pending invitation again, with a new link and a new expiry. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Invitation id" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// The renewed invitation, same shape as one entry of GET /v1/organization-invitations.`,
    codeSnippets: apiKeyRequestSnippets("POST", `/v1/organization-invitations/${EXAMPLE_IDS.invitation}/resend`),
  },
  {
    id: "post-v1organization-invitations-id-link",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/organization-invitations/{id}/link",
    title: "POST /v1/organization-invitations/{id}/link",
    description:
      "Issue a new link for a pending invitation, to share it yourself. Every earlier link of the invitation stops working. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Invitation id" },
    ],
    responseStatus: "200 OK",
    responseFields: [{ field: "data.url", type: "string", description: "The invitation link" }],
    responseExample: `{ "data": { "url": "https://console.akash.network/invitations#token=..." } }`,
    codeSnippets: apiKeyRequestSnippets("POST", `/v1/organization-invitations/${EXAMPLE_IDS.invitation}/link`),
  },
  {
    id: "delete-v1organization-invitations-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/organization-invitations/{id}",
    title: "DELETE /v1/organization-invitations/{id}",
    description: "Revoke a pending invitation. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Invitation id" },
    ],
    responseStatus: "204 No Content",
    responseFields: [],
    codeSnippets: apiKeyRequestSnippets("DELETE", `/v1/organization-invitations/${EXAMPLE_IDS.invitation}`),
  },
  {
    id: "get-v1projects",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/projects",
    title: "GET /v1/projects",
    description: "List the projects of the active organization the caller can reach, most recently active first.",
    requestParams: [API_KEY_PARAM],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].id", type: "string (uuid)", description: "Project id, for `projectId` and `x-project-id`" },
      { field: "data[].name", type: "string", description: "Name, unique within the organization" },
      { field: "data[].slug", type: "string", description: "Slug set from the name at creation" },
      { field: "data[].description", type: "string | null", description: "Description" },
      { field: "data[].isDefault", type: "boolean", description: "Whether it is the organization's default project" },
      { field: "data[].deployments", type: "object | null", description: "`activeCount` and a `preview` of the newest active deployments. Null when the caller cannot read them" },
      { field: "data[].access.canDeploy", type: "boolean", description: "Whether the caller may deploy into the project" },
      { field: "data[].access.canManage", type: "boolean", description: "Whether the caller may rename the project and manage its access" },
      { field: "data[].lastActivityAt", type: "string", description: "Newest activity the caller may read" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.project}",
      "name": "checkout-api",
      "slug": "checkout-api",
      "description": "Payments backend",
      "isDefault": false,
      "createdAt": "2026-10-01T12:05:00.000Z",
      "createdBy": { "id": "${EXAMPLE_IDS.user}", "username": "jane" },
      "lastActivityAt": "2026-10-12T08:40:00.000Z",
      "deployments": {
        "activeCount": 1,
        "preview": [{ "dseq": "1234567", "name": "api", "status": "running" }]
      },
      "access": { "canDeploy": true, "canManage": false }
    }
  ]
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/projects"),
  },
  {
    id: "post-v1projects",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/projects",
    title: "POST /v1/projects",
    description: "Create a project in the active organization. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "data.name", location: "body", type: "string", required: true, description: "Unique within the organization, whatever its case" },
      { field: "data.description", location: "body", type: "string", required: false, description: "Optional description" },
    ],
    responseStatus: "201 Created",
    responseFields: [],
    responseExample: `{
  "data": {
    "id": "${EXAMPLE_IDS.project}",
    "name": "checkout-api",
    "slug": "checkout-api",
    "description": "Payments backend",
    "isDefault": false,
    "createdAt": "2026-10-01T12:05:00.000Z",
    "createdBy": { "id": "${EXAMPLE_IDS.user}", "username": "jane" }
  }
}`,
    notes: [
      "`409` with code `project_name_taken` when another project has this name. `403` with code `project_limit_reached` when the organization has as many projects as it can hold.",
    ],
    codeSnippets: apiKeyRequestSnippets("POST", "/v1/projects", {
      data: { name: "checkout-api", description: "Payments backend" },
    }),
  },
  {
    id: "get-v1projects-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/projects/{id}",
    title: "GET /v1/projects/{id}",
    description: "Get a project of the active organization the caller can reach.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Project id" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as the POST /v1/projects response.`,
    codeSnippets: apiKeyRequestSnippets("GET", `/v1/projects/${EXAMPLE_IDS.project}`),
  },
  {
    id: "patch-v1projects-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/projects/{id}",
    title: "PATCH /v1/projects/{id}",
    description: "Rename a project or change its description. Owners, admins and the project's admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Project id" },
      { field: "data.name", location: "body", type: "string", required: false, description: "New name" },
      { field: "data.description", location: "body", type: "string | null", required: false, description: "New description, or `null` to clear it" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// Same shape as the POST /v1/projects response.`,
    codeSnippets: apiKeyRequestSnippets("PATCH", `/v1/projects/${EXAMPLE_IDS.project}`, {
      data: { name: "payments-api" },
    }),
  },
  {
    id: "delete-v1projects-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/projects/{id}",
    title: "DELETE /v1/projects/{id}",
    description: "Delete a project that holds no open deployment. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Project id" },
    ],
    responseStatus: "204 No Content",
    responseFields: [],
    notes: [
      "`409` with code `project_is_default` for the default project, or `project_not_empty` while it holds open deployments. Close them or move them first.",
    ],
    codeSnippets: apiKeyRequestSnippets("DELETE", `/v1/projects/${EXAMPLE_IDS.project}`),
  },
  {
    id: "get-v1projects-id-members",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/projects/{id}/members",
    title: "GET /v1/projects/{id}/members",
    description: "List who was granted access to a project, and the members and viewers who reach every project.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Project id" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[]", type: "array", description: "Grants on the project: `id` (grant id), `projectId`, `userId`, `username`, `email`, `role`, `createdAt`" },
      { field: "membersWithAllProjects[]", type: "array", description: "Members and viewers on `all` with no grant on this project. Owners and admins are not listed" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.grant}",
      "projectId": "${EXAMPLE_IDS.project}",
      "userId": "${EXAMPLE_IDS.user}",
      "username": "dev",
      "email": "dev@example.com",
      "role": "member",
      "createdAt": "2026-10-02T09:30:00.000Z"
    }
  ],
  "membersWithAllProjects": []
}`,
    codeSnippets: apiKeyRequestSnippets("GET", `/v1/projects/${EXAMPLE_IDS.project}/members`),
  },
  {
    id: "post-v1project-members",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/project-members",
    title: "POST /v1/project-members",
    description:
      "Grant a member or viewer of the organization a role on a project. Owners, admins and the project's admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "data.projectId", location: "body", type: "string (uuid)", required: true, description: "Project id" },
      { field: "data.userId", location: "body", type: "string (uuid)", required: true, description: "`userId` of a member or viewer, from `GET /v1/organization-members`" },
      { field: "data.role", location: "body", type: "string", required: true, description: "`viewer` reads, `member` also deploys, `admin` also renames the project and manages its access" },
    ],
    responseStatus: "201 Created",
    responseFields: [],
    responseExample: `// The grant, same shape as one entry of GET /v1/projects/{id}/members.`,
    notes: [
      "`409` with code `already_granted`, `implicit_project_access` (an owner or admin, who reaches every project) or `billing_role_not_grantable`.",
    ],
    codeSnippets: apiKeyRequestSnippets("POST", "/v1/project-members", {
      data: { projectId: EXAMPLE_IDS.project, userId: EXAMPLE_IDS.user, role: "member" },
    }),
  },
  {
    id: "patch-v1project-members-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/project-members/{id}",
    title: "PATCH /v1/project-members/{id}",
    description: "Change the project role a grant gives. Owners, admins and the project's admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Grant id" },
      { field: "data.role", location: "body", type: "string", required: true, description: "`viewer`, `member` or `admin`" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// The updated grant.`,
    codeSnippets: apiKeyRequestSnippets("PATCH", `/v1/project-members/${EXAMPLE_IDS.grant}`, { data: { role: "viewer" } }),
  },
  {
    id: "delete-v1project-members-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/project-members/{id}",
    title: "DELETE /v1/project-members/{id}",
    description: "Revoke a grant, effective from the member's next request. Owners, admins and the project's admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Grant id" },
    ],
    responseStatus: "204 No Content",
    responseFields: [],
    codeSnippets: apiKeyRequestSnippets("DELETE", `/v1/project-members/${EXAMPLE_IDS.grant}`),
  },
  {
    id: "get-v1project-budgets",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/project-budgets",
    title: "GET /v1/project-budgets",
    description:
      "List the project budgets the caller can read, with this month's committed spend. Owners, admins, billing members and the project's admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "projectId", location: "query", type: "string (uuid)", required: false, description: "Only the budget of this project" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].id", type: "string (uuid)", description: "Budget id" },
      { field: "data[].projectId", type: "string (uuid)", description: "Project id" },
      { field: "data[].monthlyAmountUsd", type: "number", description: "Deposits allowed per calendar month (UTC), in USD" },
      { field: "data[].alertThresholdPercent", type: "number", description: "Share of the budget at which owners and admins are emailed, once a month" },
      { field: "data[].stopTopUps", type: "boolean", description: "Whether top-ups of running deployments also stop at the budget" },
      { field: "data[].currentPeriod.committedUsd", type: "number", description: "Deposits recorded this month, the figure new deposits are judged against" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "${EXAMPLE_IDS.budget}",
      "projectId": "${EXAMPLE_IDS.project}",
      "monthlyAmountUsd": 500,
      "alertThresholdPercent": 80,
      "stopTopUps": false,
      "currentPeriod": { "startDate": "2026-10-01", "endDate": "2026-10-31", "committedUsd": 120.5 },
      "createdAt": "2026-10-01T12:10:00.000Z",
      "updatedAt": "2026-10-01T12:10:00.000Z"
    }
  ]
}`,
    codeSnippets: apiKeyRequestSnippets("GET", `/v1/project-budgets?projectId=${EXAMPLE_IDS.project}`),
  },
  {
    id: "post-v1project-budgets",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/project-budgets",
    title: "POST /v1/project-budgets",
    description:
      "Set a monthly budget for a project. New deployments that would pass it are refused with `project_budget_exceeded`; top-ups are refused too when `stopTopUps` is on. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "data.projectId", location: "body", type: "string (uuid)", required: true, description: "Project id" },
      { field: "data.monthlyAmountUsd", location: "body", type: "number", required: true, description: "From `1` to `10000000`, in whole cents" },
      { field: "data.alertThresholdPercent", location: "body", type: "integer", required: false, description: "From `1` to `100`. Default `80`" },
      { field: "data.stopTopUps", location: "body", type: "boolean", required: false, description: "Also refuse top-ups of the project's running deployments past the budget. Default `false`" },
    ],
    responseStatus: "201 Created",
    responseFields: [],
    responseExample: `// The budget, same shape as one entry of GET /v1/project-budgets.`,
    notes: ["`409` with code `project_budget_exists` when the project already has a budget. Change it with `PATCH` instead."],
    codeSnippets: apiKeyRequestSnippets("POST", "/v1/project-budgets", {
      data: { projectId: EXAMPLE_IDS.project, monthlyAmountUsd: 500, alertThresholdPercent: 80, stopTopUps: false },
    }),
  },
  {
    id: "patch-v1project-budgets-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/project-budgets/{id}",
    title: "PATCH /v1/project-budgets/{id}",
    description: "Change a project's monthly budget. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Budget id" },
      { field: "data.monthlyAmountUsd", location: "body", type: "number", required: false, description: "New monthly amount" },
      { field: "data.alertThresholdPercent", location: "body", type: "integer", required: false, description: "New alert threshold" },
      { field: "data.stopTopUps", location: "body", type: "boolean", required: false, description: "Whether top-ups also stop at the budget" },
    ],
    responseStatus: "200 OK",
    responseFields: [],
    responseExample: `// The updated budget.`,
    codeSnippets: apiKeyRequestSnippets("PATCH", `/v1/project-budgets/${EXAMPLE_IDS.budget}`, {
      data: { monthlyAmountUsd: 750 },
    }),
  },
  {
    id: "delete-v1project-budgets-id",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "DELETE",
    path: "/v1/project-budgets/{id}",
    title: "DELETE /v1/project-budgets/{id}",
    description: "Remove a project's monthly budget. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "id", location: "path", type: "string (uuid)", required: true, description: "Budget id" },
    ],
    responseStatus: "204 No Content",
    responseFields: [],
    codeSnippets: apiKeyRequestSnippets("DELETE", `/v1/project-budgets/${EXAMPLE_IDS.budget}`),
  },
  {
    id: "get-v1project-spend",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/project-spend",
    title: "GET /v1/project-spend",
    description:
      "Report the active organization's spend per project over a date range. Callers see the projects they can reach; the organization total is for owners, admins and billing members.",
    requestParams: [
      API_KEY_PARAM,
      { field: "startDate", location: "query", type: "string", required: false, description: "First UTC day (`YYYY-MM-DD`), inclusive. Defaults to the first day of `endDate`'s month" },
      { field: "endDate", location: "query", type: "string", required: false, description: "Last UTC day, inclusive. Defaults to today. The range spans at most 366 days" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.projects[]", type: "array", description: "`projectId`, `name`, `isDefault`, `isDeleted` and the amounts below, per project" },
      { field: "data.projects[].committedUsd", type: "number", description: "Deposits signed for the project's deployments in the range" },
      { field: "data.projects[].consumedUsd", type: "number", description: "What their leases cost over the range, including `estimatedConsumedUsd`" },
      { field: "data.projects[].estimatedConsumedUsd", type: "number", description: "Part of `consumedUsd` accrued since the last on-chain settlement" },
      { field: "data.unassigned", type: "object | null", description: "Spend of deployments filed in no project. Null for a caller limited to some projects" },
      { field: "data.total", type: "object | null", description: "The organization's whole spend. Null for a caller limited to some projects" },
      { field: "data.isEstimated", type: "boolean", description: "Whether any figure includes an estimate" },
    ],
    responseExample: `{
  "data": {
    "startDate": "2026-10-01",
    "endDate": "2026-10-31",
    "isEstimated": true,
    "projects": [
      {
        "projectId": "${EXAMPLE_IDS.project}",
        "name": "checkout-api",
        "isDefault": false,
        "isDeleted": false,
        "committedUsd": 120.5,
        "consumedUsd": 84.12,
        "estimatedConsumedUsd": 1.3
      }
    ],
    "unassigned": { "committedUsd": 0, "consumedUsd": 0, "estimatedConsumedUsd": 0 },
    "total": { "committedUsd": 120.5, "consumedUsd": 84.12, "estimatedConsumedUsd": 1.3 }
  }
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/project-spend?startDate=2026-10-01&endDate=2026-10-31"),
  },
  {
    id: "get-v1deployment-spend",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/deployment-spend",
    title: "GET /v1/deployment-spend",
    description:
      "Report what the active organization's deployments consumed over a date range, per deployment and per project and day. Takes the same `startDate` and `endDate` as `GET /v1/project-spend`.",
    requestParams: [
      API_KEY_PARAM,
      { field: "startDate", location: "query", type: "string", required: false, description: "First UTC day (`YYYY-MM-DD`), inclusive" },
      { field: "endDate", location: "query", type: "string", required: false, description: "Last UTC day, inclusive" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.projects[]", type: "array", description: "The projects the caller can see, and deleted ones with spend in the range" },
      { field: "data.days[]", type: "array", description: "`date`, `projectId` and `consumedUsd` per project and UTC day, leaving out days with no spend" },
      { field: "data.deployments[]", type: "array", description: "`dseq`, `name`, `projectId`, `consumedUsd`, `hours`, `gpuHours` and `gpuModels` per deployment, most spent first" },
    ],
    responseExample: `{
  "data": {
    "startDate": "2026-10-01",
    "endDate": "2026-10-31",
    "projects": [{ "projectId": "${EXAMPLE_IDS.project}", "name": "checkout-api", "isDefault": false, "isDeleted": false }],
    "days": [{ "date": "2026-10-01", "projectId": "${EXAMPLE_IDS.project}", "consumedUsd": 2.71 }],
    "deployments": [
      {
        "dseq": "1234567",
        "name": "api",
        "projectId": "${EXAMPLE_IDS.project}",
        "consumedUsd": 84.12,
        "hours": 744,
        "gpuHours": 0,
        "gpuModels": []
      }
    ]
  }
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/deployment-spend?startDate=2026-10-01&endDate=2026-10-31"),
  },
  {
    id: "get-v1organization-activities",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/organization-activities",
    title: "GET /v1/organization-activities",
    description:
      "List what happened in the active organization, newest first, within the projects the caller can reach. A key that is not bound to a project also sees organization-wide events, such as members joining.",
    requestParams: [
      API_KEY_PARAM,
      { field: "projectId", location: "query", type: "string (uuid)", required: false, description: "Only the activities of this project" },
      { field: "limit", location: "query", type: "integer", required: false, description: "Activities per page, at most `100`. Default `20`" },
      { field: "cursor", location: "query", type: "string", required: false, description: "`nextCursor` of the previous page" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data[].type", type: "string", description: "`organization_created`, `organization_renamed`, `project_created`, `member_invited`, `member_joined`, `member_updated`, `member_granted`, `member_revoked`, `deployment_created`, `deployment_closed` or `deployment_moved`" },
      { field: "data[].projectId", type: "string | null", description: "Project the activity happened in, null for an organization-wide one" },
      { field: "data[].actor", type: "object | null", description: "`{ id, username }` of who did it, null for the system or a deleted user" },
      { field: "data[].payload", type: "object", description: "Values for the activity text, per type, such as `dseq` and `name`" },
      { field: "nextCursor", type: "string | null", description: "Pass it as `cursor` for the next page. Null on the last page" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "6e7f8a9b-0c1d-4e2f-a3b4-c5d6e7f8a9b0",
      "projectId": "${EXAMPLE_IDS.project}",
      "actor": { "id": "${EXAMPLE_IDS.user}", "username": "dev" },
      "type": "deployment_created",
      "payload": { "dseq": "1234567", "name": "api" },
      "createdAt": "2026-10-12T08:40:00.000Z"
    }
  ],
  "nextCursor": null
}`,
    codeSnippets: apiKeyRequestSnippets("GET", `/v1/organization-activities?projectId=${EXAMPLE_IDS.project}&limit=20`),
  },
  {
    id: "patch-v1deployments-dseq-project",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "PATCH",
    path: "/v1/deployments/{dseq}/project",
    title: "PATCH /v1/deployments/{dseq}/project",
    description:
      "Move a deployment to another project of the active organization. It keeps running; only the project it is filed in changes. Owners and admins.",
    requestParams: [
      API_KEY_PARAM,
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
      { field: "data.projectId", location: "body", type: "string (uuid)", required: true, description: "Target project" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.dseq", type: "string", description: "Deployment sequence ID" },
      { field: "data.projectId", type: "string (uuid)", description: "Project the deployment is now filed in" },
    ],
    responseExample: `{ "data": { "dseq": "1234567", "projectId": "${EXAMPLE_IDS.project}" } }`,
    notes: ["Other roles get `403`. An unknown deployment or project answers `404`."],
    codeSnippets: apiKeyRequestSnippets("PATCH", "/v1/deployments/1234567/project", {
      data: { projectId: EXAMPLE_IDS.project },
    }),
  },
  {
    id: "get-v1deployment-locations-dseq",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "GET",
    path: "/v1/deployment-locations/{dseq}",
    title: "GET /v1/deployment-locations/{dseq}",
    description:
      "Find the organization and project a deployment is filed in. With an API key, it only looks within the key's organization and reach.",
    requestParams: [
      API_KEY_PARAM,
      { field: "dseq", location: "path", type: "string", required: true, description: "Deployment sequence ID" },
    ],
    responseStatus: "200 OK",
    responseFields: [
      { field: "data.organizationId", type: "string (uuid)", description: "Organization id" },
      { field: "data.organizationSlug", type: "string", description: "Organization slug" },
      { field: "data.projectId", type: "string | null", description: "Project id, null when the deployment is filed in no project" },
    ],
    responseExample: `{
  "data": {
    "organizationId": "${EXAMPLE_IDS.organization}",
    "organizationSlug": "acme-corp",
    "projectId": "${EXAMPLE_IDS.project}"
  }
}`,
    codeSnippets: apiKeyRequestSnippets("GET", "/v1/deployment-locations/1234567"),
  },
  {
    id: "post-v1api-keys",
    kind: "endpoint",
    group: "teams",
    host: "console-api",
    protocol: "http",
    method: "POST",
    path: "/v1/api-keys",
    title: "POST /v1/api-keys",
    description:
      "Create an API key in the active organization, optionally limited to one of its projects. A project-bound key cannot manage members, invitations, projects, billing or API keys.",
    requestParams: [
      API_KEY_PARAM,
      { field: "data.name", location: "body", type: "string", required: true, description: "Key name" },
      { field: "data.expiresAt", location: "body", type: "string", required: false, description: "ISO-8601 expiry, in the future" },
      { field: "data.projectId", location: "body", type: "string (uuid)", required: false, description: "Limits the key to this project of the organization. Unknown or out of reach: `404`" },
    ],
    responseStatus: "201 Created",
    responseFields: [
      { field: "data.apiKey", type: "string", description: "The secret, returned only here" },
      { field: "data.organizationId", type: "string (uuid)", description: "Organization the key acts in" },
      { field: "data.projectId", type: "string | null", description: "Only project the key reaches, or null for every project its owner can reach" },
    ],
    responseExample: `{
  "data": {
    "id": "${EXAMPLE_IDS.apiKey}",
    "name": "checkout-api CI",
    "apiKey": "ac.sk.mainnet.xxx...",
    "keyFormat": "ac.sk.mainnet.xxx...xxxx",
    "organizationId": "${EXAMPLE_IDS.organization}",
    "projectId": "${EXAMPLE_IDS.project}",
    "expiresAt": null,
    "lastUsedAt": null,
    "createdAt": "2026-10-03T10:00:00.000Z",
    "updatedAt": "2026-10-03T10:00:00.000Z"
  }
}`,
    notes: ["`GET /v1/api-keys` lists your keys with the same `organizationId` and `projectId` fields, without the secret."],
    codeSnippets: apiKeyRequestSnippets("POST", "/v1/api-keys", {
      data: { name: "checkout-api CI", projectId: EXAMPLE_IDS.project },
    }),
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
        code: `# -k skips TLS verification (provider certs are self-signed against the
# on-chain wallet). For production, validate the cert against the chain
# out-of-band — see the provider-endpoints preface.
curl -k "https://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/status" \\
  -H "Authorization: Bearer $JWT"`,
      },
      {
        language: "javascript",
        code: `// Node's global \`fetch\` is built on undici and ignores \`https.Agent\` —
// you have to pass an undici \`dispatcher\` to control TLS verification.
import { fetch, Agent } from "undici";

// \`connect.rejectUnauthorized: false\` lets the request complete past the
// self-signed provider cert. For production, validate the peer cert against
// the chain asynchronously — see the provider-endpoints preface.
const dispatcher = new Agent({ connect: { rejectUnauthorized: false } });

const res = await fetch(
  \`\${hostUri}/lease/\${dseq}/\${gseq}/\${oseq}/status\`,
  { headers: { Authorization: \`Bearer \${jwt}\` }, dispatcher },
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
        code: `# --insecure skips TLS verification (provider certs are self-signed).
# Requires websocat 1.13+. See provider-endpoints preface for production
# cert validation.
websocat --insecure "wss://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/logs?follow=true&tail=200" \\
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
        code: `# --insecure skips TLS verification (provider certs are self-signed).
websocat --insecure "wss://\${HOSTURI#https://}/lease/\${DSEQ}/\${GSEQ}/\${OSEQ}/kubeevents" \\
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
      { field: "tty", location: "query", type: "number", required: true, description: "`1` to allocate a TTY, `0` otherwise" },
      { field: "stdin", location: "query", type: "number", required: true, description: "`1` to attach stdin, `0` otherwise" },
      { field: "cmd0, cmd1, …", location: "query", type: "string", required: true, description: "Command and each argument as separate numbered params, e.g. `cmd0=/bin/sh&cmd1=-c&cmd2=ls`. There is no single (or base64) `cmd` param." },
    ],
    responseFields: [
      { field: "(stream)", type: "binary", description: "Multiplexed binary frames; the first byte is the stream code — 100=stdout, 101=stderr, 102=result (JSON, e.g. {\\\"exit_code\\\":0}), 103=failure. Client→server uses 104=stdin, 105=terminal-resize." },
    ],
    notes: [
      "JWT scope must include `shell`.",
      "Command and arguments are passed as separate numbered query params (`cmd0`, `cmd1`, …) — there is no single base64-encoded `cmd` param. `tty` and `stdin` are required.",
      "The example above is a one-shot command (`tty=0&stdin=0`). For an interactive session, set `tty=1&stdin=1`, stream keystrokes as `104`-prefixed binary frames, and send terminal resizes as `105` frames. Most users should use the Akash CLI (`provider-services lease-shell --tty`) or SDK helpers instead of driving this directly — see [Shell Access](/docs/learn/core-concepts/shell-access/).",
      "Console UI uses `xterm.js` on the client side to render the stream.",
      "For programmatic shells, use the provider's `kubectl exec`-style protocol via the SDK helpers rather than constructing this WebSocket by hand.",
    ],
    codeSnippets: [
      {
        language: "javascript",
        code: `import WebSocket from "ws";
import https from "https";

// \`rejectUnauthorized: false\` skips Node's CA check — the provider cert is
// pinned to the on-chain wallet address, not a public CA; see preface.
const agent = new https.Agent({ rejectUnauthorized: false });

// Command + args go in SEPARATE numbered params (cmd0, cmd1, …); there is no
// base64 \`cmd\` param. \`tty\` and \`stdin\` are required.
const params = new URLSearchParams();
["/bin/sh", "-c", "echo hello && hostname"].forEach((arg, i) =>
  params.append(\`cmd\${i}\`, arg)
);
params.append("tty", "0");
params.append("stdin", "0");
params.append("service", service);
params.append("podIndex", "0");

const url =
  \`wss://\${hostUri.replace(/^https?:\\/\\//, "")}/lease/\${dseq}/\${gseq}/\${oseq}/shell?\${params}\`;

const ws = new WebSocket(url, {
  headers: { Authorization: \`Bearer \${jwt}\` },
  agent,
});

// Frames are binary: the first byte is the stream code.
ws.on("message", (frame) => {
  const code = frame[0];
  const data = frame.subarray(1);
  if (code === 100) process.stdout.write(data); // stdout
  else if (code === 101) process.stderr.write(data); // stderr
  else if (code === 102) {
    // result frame, e.g. {"exit_code":0}
    console.log("result:", data.toString());
    ws.close();
  }
});`,
      },
    ],
  },
];

export function getSectionsByGroup(group: SectionGroup): Section[] {
  return sections.filter((s) => s.group === group);
}

export const GROUP_LABELS: Record<SectionGroup, string> = {
  core: "Core",
  teams: "Organizations and projects",
  jwt: "JWT for provider access",
  "lease-ops": "Lease operations (provider)",
};
