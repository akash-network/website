---
categories: ["Engineering Docs"]
tags: []
weight: 1
title: "JWT Client Migration Guide"
linkTitle: "JWT Client Migration Guide"
---

# JWT Migration Guide for Go Implementations

This guide helps you migrate your Go implementation from using certificate-based authentication to JWT authentication when interacting with Akash providers.

## Overview

Akash has introduced JWT-based authentication as an alternative to the traditional certificate-based authentication system. JWT authentication offers several advantages:

- **Simplified Setup**: No need to generate and manage certificates
- **Dynamic Tokens**: Tokens can be created on-demand with specific permissions
- **Granular Permissions**: Fine-grained access control through scopes
- **Reduced Complexity**: Eliminates certificate lifecycle management

## Authentication Methods Priority

The Akash provider client supports multiple authentication methods with the following priority:

1. **Certificate Authentication** (`WithAuthCerts`) - Highest priority
2. **JWT Authentication** (`WithAuthJWTSigner`) - Recommended for new implementations
3. **Token Authentication** (`WithAuthToken`) - For pre-generated tokens

## Migration Steps

### Step 1: Update Dependencies

Ensure your `go.mod` includes the required JWT dependencies:

```go
require (
    github.com/akash-network/akash-api v0.0.0-2024-01-01 // Use latest version
    github.com/golang-jwt/jwt/v5 v5.2.2
)
```

### Step 2: Import Required Packages

```go
import (
    "context"
    "time"
    
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/cosmos/cosmos-sdk/crypto/keyring"
    
    aclient "github.com/akash-network/akash-api/go/node/client/v1beta2"
    restclient "github.com/akash-network/akash-api/go/provider/client"
    ajwt "github.com/akash-network/akash-api/go/util/jwt"
)
```

### Step 3: Replace Certificate Authentication with JWT

#### Before (Certificate-based)

```go
func generateCertificate() error {
    ac = //... an akash client implementation

	info, _ := ac.Ctx.Keyring.Key(/* account name */)

	kpm, err := cutils.NewKeyPairManager(ac.Ctx, info.GetAddress())
	if err != nil {
		return fmt.Errorf("creating new key pair manager: %w", err)
	}

	exists, err := kpm.KeyExists()
	if err != nil {
		return err
	}
	if !allowOverwrite && exists {
		return errors.New("cannot overwrite certificate")
	}

	return kpm.Generate(startTime, startTime.Add(/* certificate duration*/), []string{})
}

func publish() error {
    // ... broadcast certificate publishing transaction...
}

```

Then we would call `LoadAndQueryCertificateForAccount` to load the certificate prior to connecting with the provider.

#### After (JWT-based)

```go
// New JWT-based approach
func createClientWithJWT(ctx context.Context, qclient aclient.QueryClient, providerAddr sdk.Address, keyring keyring.Keyring, ownerAddr sdk.Address) (restclient.Client, error) {
    // Create JWT signer
    signer := ajwt.NewSigner(keyring, ownerAddr)
    
    // Create client with JWT authentication
    client, err := restclient.NewClient(ctx, qclient, providerAddr, 
        restclient.WithAuthJWTSigner(signer))
    if err != nil {
        return nil, fmt.Errorf("failed to create provider client: %w", err)
    }
    
    return client, nil
}
```

### Step 4: Handle JWT Token Generation (Optional)

If you need to generate JWT tokens manually or with custom claims:

```go
func generateCustomJWT(keyring keyring.Keyring, ownerAddr sdk.Address, access ajwt.AccessType, scopes []ajwt.PermissionScope) (string, error) {
    signer := ajwt.NewSigner(keyring, ownerAddr)
    
    now := time.Now()
    claims := ajwt.Claims{
        RegisteredClaims: jwt.RegisteredClaims{
            Issuer:    ownerAddr.String(),
            IssuedAt:  jwt.NewNumericDate(now),
            NotBefore: jwt.NewNumericDate(now),
            ExpiresAt: jwt.NewNumericDate(now.Add(15 * time.Minute)),
        },
        Version: "v1",
        Leases: ajwt.Leases{
            Access: access,
            Scope:  scopes,
        },
    }
    
    token := jwt.NewWithClaims(ajwt.SigningMethodES256K, &claims)
    return token.SignedString(signer)
}
```

### Step 5: Update Client Usage

The client usage remains the same regardless of authentication method in the current implementation, although you no longer need to explicitly load certificates as these are now client options:

```go
func interactWithProvider(client restclient.Client, leaseID mtypes.LeaseID) error {
    ctx := context.Background()
    
    // Get lease status
    status, err := client.LeaseStatus(ctx, leaseID)
    if err != nil {
        return fmt.Errorf("failed to get lease status: %w", err)
    }
    
    // Get logs
    logs, err := client.LeaseLogs(ctx, leaseID, "", false, 100)
    if err != nil {
        return fmt.Errorf("failed to get logs: %w", err)
    }
    
    // Submit manifest
    manifest := createManifest()
    err = client.SubmitManifest(ctx, leaseID.DSeq, manifest)
    if err != nil {
        return fmt.Errorf("failed to submit manifest: %w", err)
    }
    
    return nil
}
```

## JWT Access Types and Scopes

### Access Types

- **`AccessTypeFull`**: Full access to all operations
- **`AccessTypeScoped`**: Access limited to specific scopes
- **`AccessTypeGranular`**: Fine-grained access control
- **`AccessTypeNone`**: No access

### Permission Scopes

Available scopes for granular access control:

- `PermissionScopeSendManifest`: Submit manifests
- `PermissionScopeGetManifest`: Retrieve manifests
- `PermissionScopeLogs`: Access logs
- `PermissionScopeShell`: Execute shell commands
- `PermissionScopeEvents`: Access events
- `PermissionScopeStatus`: Get status information
- `PermissionScopeRestart`: Restart services
- `PermissionScopeHostnameMigrate`: Migrate hostnames
- `PermissionScopeIPMigrate`: Migrate IP addresses

### Example: Scoped Access

```go
func createScopedJWTClient(ctx context.Context, qclient aclient.QueryClient, providerAddr sdk.Address, keyring keyring.Keyring, ownerAddr sdk.Address) (restclient.Client, error) {
    signer := ajwt.NewSigner(keyring, ownerAddr)
    
    // Create JWT with limited scope (logs and status only)
    now := time.Now()
    claims := ajwt.Claims{
        RegisteredClaims: jwt.RegisteredClaims{
            Issuer:    ownerAddr.String(),
            IssuedAt:  jwt.NewNumericDate(now),
            NotBefore: jwt.NewNumericDate(now),
            ExpiresAt: jwt.NewNumericDate(now.Add(15 * time.Minute)),
        },
        Version: "v1",
        Leases: ajwt.Leases{
            Access: ajwt.AccessTypeScoped,
            Scope: []ajwt.PermissionScope{
                ajwt.PermissionScopeLogs,
                ajwt.PermissionScopeStatus,
            },
        },
    }
    
    token := jwt.NewWithClaims(ajwt.SigningMethodES256K, &claims)
    tokenString, err := token.SignedString(signer)
    if err != nil {
        return nil, fmt.Errorf("failed to sign JWT: %w", err)
    }
    
    // Create client with token authentication
    client, err := restclient.NewClient(ctx, qclient, providerAddr, 
        restclient.WithAuthToken(tokenString))
    if err != nil {
        return nil, fmt.Errorf("failed to create provider client: %w", err)
    }
    
    return client, nil
}
```

## CLI Integration

If you're building a CLI tool, you can use the Akash CLI's JWT generation capabilities:

```bash
# Generate a JWT token with full access
akash auth jwt --exp 15m --access full

# Generate a JWT token with scoped access
akash auth jwt --exp 1h --access scoped --scope logs,status
```

## Troubleshooting

### Common Issues

1. **`jwt.ErrInvalidKeyType` error**: This occurs when the wrong key type is used for signing. Ensure you're using the correct keyring and address with the ES256K signing method.

2. **`jwt.ErrTokenSignatureInvalid` error**: This indicates the JWT signature verification failed. Check that the token was signed with the correct private key and hasn't been tampered with.

3. **`ErrJWTValidation` error**: This is the main JWT validation error from the Akash implementation. Common causes include:
   - Invalid issuer address format (must be valid Akash bech32 address)
   - Missing required fields (iat, nbf, exp, version)
   - Invalid version (must be "v1")
   - Invalid access type or scope configuration
   - Duplicate scopes or providers in permissions

4. **"token expired" error**: Check token expiration time and implement refresh logic for long-running applications.

5. **"permission denied" error**: Verify the JWT has the required scopes for the operation you're trying to perform.

### Debug JWT Tokens

You can decode and inspect JWT tokens using online tools or the `jwt.io` website to verify claims and permissions. The JWT schema is defined in `specs/jwt-schema.json` and can be used for validation.
