---
title: "Mainnet 5: Upgrade instructions, release notes, and more"
description: Akash Network has successfully upgraded to Mainnet 5. The upgrade took place this morning and was completed in ~22 minutes.

pubDate: "2022-12-21"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Zach Horn

bannerImage: ./banner-image.png
---

Akash Network has successfully upgraded to Mainnet 5. The upgrade took place this morning and was completed in ~22 minutes. Mainnet 5 includes several bug fixes and modifications of previously released network features.

The upgrade occurred at block height `8998907`: [https://www.mintscan.io/akash/blocks/8998907](https://www.mintscan.io/akash/blocks/8998907)

## Mainnet 5 Resources and Guides

For more on the network changes and bug fixes associated with Mainnet 5, see our documentation. Upgrade guides for providers and validators can be found at the links below:

**_Validators:_**

[https://akash.network/docs/upgrades/v0.20.0-upgrade-docs](https://akash.network/docs/upgrades/v0.20.0-upgrade-docs)

**_Providers:_**

[https://akash.network/docs/mainnet5-upgrade-docs/provider-upgrade](https://akash.network/docs/mainnet5-upgrade-docs/provider-upgrade)

---

## Release Notes

Upgrade notes for Mainnet 5 with links to corresponding GitHub issues:

`**Bug Fixes**`

- `**RPC:**` `enable websocket via TLS (`[`#1725`](https://github.com/ovrclk/akash/issues/1725)`)`
- `**build:**` `remove --privileged flag from release target (`[`#1724`](https://github.com/ovrclk/akash/issues/1724)`)`
- `**config:**` `return error if env bind to flag fails (`[`#1723`](https://github.com/ovrclk/akash/issues/1723)`)`
- `**configs:**` `fork cosmos-sdk intercept configs (`[`#1729`](https://github.com/ovrclk/akash/issues/1729)`)`
- `**ica:**` `rollback ica support (`[`#1730`](https://github.com/ovrclk/akash/issues/1730)`)`
- `**scripts:**` `remove redundant exit (`[`#1731`](https://github.com/ovrclk/akash/issues/1731)`)`

`**Build**`

- `ensure go version match (`[`#1720`](https://github.com/ovrclk/akash/issues/1720)`)`
- `**goreleaser:**` `remove homebrew from goreleaser (`[`#1721`](https://github.com/ovrclk/akash/issues/1721)`)`

**For the full release notes with associated assets, refer to Akash Network's Github:**

[https://github.com/ovrclk/akash/releases/tag/v0.20.0](https://github.com/ovrclk/akash/releases/tag/v0.20.0)

---

## Upgrade to Mainnet 5

If you are an Akash Provider or Validator, please upgrade to Mainnet 5 as soon as possible.

If you have questions or concerns about upgrading — please reach out to our community via [Akash Network's Discord](https://discord.com/invite/akash).
