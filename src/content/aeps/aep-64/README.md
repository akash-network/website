---
aep: 64
title: "JWT Authentication for Provider API"
author: Artur Troian (@troian)
status: Last Call
type: Standard
category: Core
created: 2025-04-03
updated: 2025-04-04
estimated-completion: 2025-04-30
roadmap: major
---

## Abstract

This AEP proposes implementing JWT (JSON Web Token) authentication for the Akash Provider API. This enhancement aims to improve the reliability of client API communication with leases during blockchain maintenance periods and provide more granular access control capabilities.

## Motivation

The current mTLS authentication mechanism, while secure, presents several limitations:

1. **Blockchain Dependency**: When the blockchain acts as the root of trust, API clients cannot maintain communication with leases during blockchain maintenance windows.
2. **Limited Access Control**: The current certificate-based system grants access to all leases and features, making it challenging to implement granular access controls.
3. **Certificate Management Complexity**: Implementing and maintaining granular access via certificates is complex for clients.

JWT authentication offers several advantages:
- Widely adopted and well-understood authentication mechanism
- Enables granular access control
- Allows for more flexible token management
- Reduces dependency on blockchain availability

## Technical Details

### Key Concepts

1. **Asymmetric Key Usage**:
   - Akash uses ECDSA with secp256k1 curve for wallet operations
   - This AEP focuses on the signing capabilities for JWT generation

2. **Client-Issued JWT**:
   - Unlike conventional JWT implementations where servers issue tokens, clients will issue JWTs
   - This approach is necessary because:
     - A single wallet may have multiple simultaneous leases across different providers
     - Only the lease owner can create granular access JWTs
     - The wallet's public key is available on the blockchain for provider validation

3. **Certificate Management**:
   - Supports standalone CA certificates
   - Compatible with Let's Encrypt certificates
   - Eliminates the need for custom TLS handshake handlers on the client side

### Implementation Guidelines

1. **Token Lifetime**:
   - JWTs should be short-lived due to revocation challenges
   - Recommended maximum lifetime: 15 minutes
   - Implementation-specific lifetime configurations are allowed

2. **Provider Implementation**:
   - Providers must query and cache lease owner public keys from the blockchain
   - Cache must be persistent across service restarts and updates
   - Cache invalidation strategies should be implemented

## JWT Specification

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/akash-jwt-schema.json",
  "title": "Akash JWT Schema",
  "description": "JSON Schema for JWT used in the Akash Provider API.",
  "type": "object",
  "additionalProperties": false,
  "required": ["iss", "version", "alg", "created", "nva", "access"],
  "properties": {
    "iss": {
      "type": "string",
      "pattern": "^akash1[a-z0-9]{38}$",
      "description": "Akash address of the lease(s) owner, e.g., akash1abcd... (44 characters)"
    },
    "version": {
      "type": "string",
      "enum": ["v1"],
      "description": "Version of the JWT specification (currently fixed at v1)"
    },
    "alg": {
      "type": "string",
      "const": "ES256K",
      "description": "Algorithm used for signing (fixed to ES256K)"
    },
    "created": {
      "type": "string",
      "format": "date-time",
      "description": "Token creation timestamp in RFC3339 format (e.g., 2025-04-04T12:00:00Z)"
    },
    "nva": {
      "type": "string",
      "format": "date-time",
      "description": "Not valid after timestamp in RFC3339 format (e.g., 2025-04-05T12:00:00Z)"
    },
    "access": {
      "type": "string",
      "enum": ["full", "granular"],
      "description": "Access level of the token: 'full' for unrestricted, 'granular' for specific permissions"
    },
    "permissions": {
      "type": "array",
      "description": "Required if access is 'granular'; defines specific permissions",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["provider", "scope"],
        "properties": {
          "provider": {
            "type": "string",
            "pattern": "^akash1[a-z0-9]{38}$",
            "description": "Provider address, e.g., akash1xyz... (44 characters)"
          },
          "scope": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "type": "string",
              "enum": ["send-manifest", "shell", "logs", "restart"]
            },
            "description": "List of permitted actions (no duplicates)"
          },
          "dseq": {
            "type": "integer",
            "minimum": 1,
            "description": "Optional deployment sequence number"
          },
          "gseq": {
            "type": "integer",
            "minimum": 1,
            "description": "Optional group sequence number (requires dseq)"
          },
          "oseq": {
            "type": "integer",
            "minimum": 1,
            "description": "Optional order sequence number (requires dseq)"
          },
          "services": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "string",
              "minLength": 1
            },
            "description": "Optional list of service names (requires dseq)"
          }
        },
        "dependencies": {
          "gseq": ["dseq"],
          "oseq": ["dseq"],
          "services": ["dseq"]
        }
      }
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "access": { "const": "granular" }
        },
        "required": ["access"]
      },
      "then": {
        "required": ["permissions"]
      }
    },
    {
      "if": {
        "properties": {
          "permissions": { "type": "array", "minItems": 1 }
        },
        "required": ["permissions"]
      },
      "then": {
        "properties": {
          "access": { "const": "granular" }
        },
        "required": ["access"]
      }
    }
  ]
}
```

### Field Descriptions

1. **Required Fields**:
   - `iss`: Akash address of the lease owner
   - `version`: JWT specification version (must be "v1")
   - `alg`: Signing algorithm (must be "ES256K")
   - `created`: Token creation timestamp (RFC3339)
   - `nva`: Token expiration timestamp (RFC3339)
   - `access`: Access level ("full" or "granular")

2. **Optional Fields**:
   - `permissions`: Array of granular access permissions
     - `provider`: Provider address (required)
     - `scope`: List of permitted actions (required)
     - `dseq`: Deployment sequence number (optional)
     - `gseq`: Group sequence number (requires dseq)
     - `oseq`: Order sequence number (requires dseq)
     - `services`: List of service names (requires dseq)

### Example JWT Payload

```json
{
    "iss": "akash1...",
    "version": "v1",
    "alg": "ES256K",
    "created": "2025-04-03T12:00:00Z",
    "nva": "2025-04-03T12:15:00Z",
    "access": "granular",
    "permissions": [
        {
            "provider": "akash1...",
            "scope": ["logs", "shell"],
            "dseq": 123456,
            "gseq": 1,
            "oseq": 1,
            "services": ["web", "api"]
        }
    ]
}
```

## Implementation Resources

### Recommended Libraries

1. **Golang**:
   - [did-jwt](https://www.npmjs.com/package/did-jwt)
   - Features: ES256K support, JWT validation

2. **TypeScript**:
   - [jose](https://www.npmjs.com/package/jose)
   - Features: Comprehensive JWT implementation, ES256K support

### Security Considerations

1. **Token Lifetime**:
   - Keep tokens short-lived (max 15 minutes)
   - Implement proper token validation
   - Consider implementing token blacklisting for critical operations

2. **Key Management**:
   - Secure storage of private keys
   - Regular key rotation
   - Proper key backup procedures

3. **Provider Implementation**:
   - Implement proper public key caching
   - Regular cache invalidation
   - Secure storage of cached keys

## Migration Guide

1. **For Providers**:
   - Implement JWT validation
   - Set up public key caching
   - Update API endpoints to support JWT authentication
   - Maintain backward compatibility with mTLS

2. **For Clients**:
   - Implement JWT generation
   - Update authentication logic
   - Implement proper key management
   - Update API client libraries

## Future Considerations

1. **Token Revocation**:
   - Implement a token revocation mechanism
   - Consider using a distributed revocation list
   - Explore blockchain-based revocation

2. **Enhanced Security**:
   - Add support for additional signing algorithms
   - Implement token encryption
   - Add support for refresh tokens

3. **Performance Optimization**:
   - Optimize public key caching
   - Implement efficient token validation
   - Add support for token batching

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
