---
categories: ["For Developers"]
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

### [Syntax Reference](/docs/for-developers/akash-sdl/syntax-reference)
Complete SDL syntax reference with interactive examples.

### [Examples Library](/docs/for-developers/akash-sdl/examples-library)
Collection of SDL examples for common use cases.

### [Best Practices](/docs/for-developers/akash-sdl/best-practices)
Best practices for writing SDL files.

### [Advanced Features](/docs/for-developers/akash-sdl/advanced-features)
Advanced SDL features and techniques.

---

## Quick Start

**Minimum viable SDL:**

```yaml
version: "2.0"
services:
  web:
    image: nginx
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

- **[Syntax Reference](/docs/for-developers/akash-sdl/syntax-reference)** - Complete syntax documentation
- **[Examples Library](/docs/for-developers/akash-sdl/examples-library)** - Real-world examples
- **[Best Practices](/docs/for-developers/akash-sdl/best-practices)** - Learn best practices

