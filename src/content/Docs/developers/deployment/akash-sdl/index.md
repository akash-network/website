---
categories: ["Developers"]
tags: ["SDL", "Reference", "Configuration"]
weight: 5
title: "SDL (Stack Definition Language)"
linkTitle: "Akash SDL"
description: "Complete reference for the Stack Definition Language"
---

**Define and deploy applications on Akash Network using SDL (Stack Definition Language).**

SDL is a YAML-based configuration format that describes your application's services, resources, and deployment requirements.

---

## In This Section

### [Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference)
Complete SDL syntax reference with interactive examples.

### [Examples Library](/docs/developers/deployment/akash-sdl/examples-library)
Collection of SDL examples for common use cases.

### [Best Practices](/docs/developers/deployment/akash-sdl/best-practices)
Best practices for writing SDL files.

### [Advanced Features](/docs/developers/deployment/akash-sdl/advanced-features)
Advanced SDL features and techniques.

---

## Quick Start

**Minimum viable SDL:**

```yaml
version: "2.0"
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 100
deployment:
  web:
    akash:
      profile: web
      count: 1
```

---

## Next Steps

- **[Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference)** - Complete syntax documentation
- **[Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - Real-world examples
- **[Best Practices](/docs/developers/deployment/akash-sdl/best-practices)** - Learn best practices

