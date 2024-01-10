---
title: "How to use Akash Web"

description: "How to use Akash Web"

# publish date
pubDate: "2024-10-25"

# if you want to hide a post, set draft: true
draft: false

archive: true

# page category - can be multiple
categories:
  - Usage

# tags for the page - can be multiple

tags:
  - Usage

# contributors - multiple
contributors:
  - Hooman hq

# banner image should in the same folder as the markdown file

bannerImage: ./banner-image.png
---

- [How to write a blog](#how-to-write-a-blog)
- [Community](#community)
  - [How to add community Event Card](#how-to-add-community-event-card)
  - [How to add Community Edu](#how-to-add-community-edu)
  - [How to add Community Contributions Card](#how-to-add-community-contributions-card)
- [Ecosystem](#ecosystem)
- [How to add card to ecosystem](#how-to-add-card-to-ecosystem)

## How to write a blog

1. Create a new folder under `src/content/Blog/` with the name of the blog. For example, `src/content/Blog/how-to-use-akash-web/`
2. Create a new file called `index.md` under the new folder. For example, `src/content/Blog/how-to-use-akash-web/index.md`
3. Copy the following template into the new file and fill in the details.

```md
---
title: "Example Blog Title"
description: "Example Blog Description"
pubDate: "2019-11-25"
draft: false
archive: true
categories:
  - Category1
  - Category2
tags:
  - Tag1
  - Tag2
contributors:
  - Maly Ly
  - Greg Osuri
bannerImage: ./banner-image.jpg
---
```

4. Add the banner image to the same folder as the markdown file. For example, `src/content/Blog/how-to-use-akash-web/banner-image.jpg`
5. Write the blog content in markdown format in the same file. For example, `src/content/Blog/how-to-use-akash-web/index.md`
6. Commit and push the changes to the repository. The blog will be published automatically.

## Community

### How to add community Event Card

1. Create a new folder under `src/content/Community_Akash_Events_Page/` with the name of the event. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/`
2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/index.md`
3. Copy the following template into the new file and fill in the details.

```md
---
title: AI World Congress
image: "./project-banner.png"
eventDate: "2024"
tbd: true
location: Singapore
link: "https://www.asia.token2049.com/"
description: ​TOKEN2049 brings together the global Web3 industry, uniting entrepreneurs, investors, developers, industry insiders and global media - and creates unparalleled networking opportunities.
---
```

4. TBD means the date is not confirmed yet. If the date is confirmed, remove the `tbd: true` line.

5. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/project-banner.png`

6. Commit and push the changes to the repository. The event will be published automatically.

### How to add Community Edu

1. Create a new folder under `src/content/Community_Akash_Edu_Page/` with the name of the event. For example, `src/content/Community_Akash_Edu_Page/cloudmos-101/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Akash_Edu_Page/cloudmos-101/index.md`

3. Copy the following template into the new file and fill in the details.

```md
---
title: Akash EDU - Cloudmos 101
image: "./project-banner.png"
pubDate: "2020-01-19"
tags:
  - Upcoming
description: In this course, you will learn how to deploy your project onto the Akash Network using Cloudmos — a simple, point and click deployment tool.
link: "https://akash-edu.ctlabs.in/"
---
```

4. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Akash_Edu_Page/cloudmos-101/project-banner.png`

5. Commit and push the changes to the repository. The event will be published automatically.

### How to add Community Contributions Card

1. Create a new folder under `src/content/Community_Contributions_Page/` with the name of the event. For example, `src/content/Community_Contributions_Page/akash-101/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Contributions_Page/akash-101/index.md`

3. Copy the following template into the new file and fill in the details.

```md
---
title: "Akash Network Live with Greg Osuri: Akash’s progress in 2023, open community development, and more"
image: "./project-banner.png"
pubDate: "2023-02-24"
readTime: "5 min"
author: "Robert Del Rey"
link: https://www.youtube.com/watch?v=aVRqwXOxoe8
tags:
  - Video
description: Greg Osuri, CEO of Overclock Labs and Founder of Akash Network, will cover the progress Akash has already made in 2023, our new open community group structure, and what to look out for in the coming months.
---
```

1. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Contributions_Page/akash-101/project-banner.png`

2. Commit and push the changes to the repository. The event will be published automatically.

## Ecosystem

## How to add card to ecosystem

1. Create a new folder under `src/content/Ecosystem_Page/` with the name of the event. For example, `src/content/Ecosystem_Page/akash-chat/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Ecosystem_Page/akash-chat/index.md`

3. Copy the following template into the new file and fill in the details.

4. There are four categories `deployed_on_akash`, `akash-tools`

```md
---
projectTitle: Akash Chat
projectImage: "./project-banner.png"
pubDate: "2021-01-19"

tags:
  - AI & ML

category: deployed_on_akash

description: Mistral-7B-v0.2 Large Language Model (LLM) is a pretrained generative text model with 7 billion parameters by Mistral AI. This application is running on NVIDIA GPUs leased from the Akash Supercloud.

showcase: true

websiteLink: "https://chat.akash.network/"
githubLink: "https://chat.akash.network/"
twitterLink: "https://chat.akash.network"

featured: true
---
```

5. Showcase is used to show the card in [showcase](/ecosystem/showcase/latest)

6. Featured is used to show the card on the top of the page

7. Add the banner image to the same folder as the markdown file. For example, `src/content/Ecosystem_Page/akash-chat/project-banner.png`

8. Commit and push the changes to the repository. The event will be published automatically.
