# Akash Network Website Guide

- [Akash Network Website Guide](#akash-network-website-guide)
  - [Akash Network Website](#akash-network-website)
  - [Getting Started Locally](#getting-started-locally)
  - [Contribution Guidelines](#contribution-guidelines)
    - [File Naming Convention](#file-naming-convention)
    - [Commit Message Structure](#commit-message-structure)
    - [Commit Message Best Practices](#commit-message-best-practices)
    - [How to Contribute to the Akash Website](#how-to-contribute-to-the-akash-website)
  - [How to write a blog](#how-to-write-a-blog)
  - [Community](#community)
    - [How to add to the Events](#how-to-add-to-the-events)
    - [How to contribute to the Akash Edu](#how-to-contribute-to-the-akash-edu)
    - [How to contribute to the Community Contributions](#how-to-contribute-to-the-community-contributions)
  - [Ecosystem](#ecosystem)
    - [How to contribute a project to the Ecosystem](#how-to-contribute-a-project-to-the-ecosystem)
  - [Docs](#docs)
    - [How to change sequence of docs](#how-to-change-sequence-of-docs)
    - [How to add new file in docs](#how-to-add-new-file-in-docs)
  - [Contact](#contact)

## Akash Network Website

Explore the repository for the Akash Network website, skillfully developed by [Hooman Digital](https://twitter.com/hooman_digital). The website serves as a dynamic showcase, illustrating the prowess and capabilities of Akash Network—a decentralized cloud computing marketplace revolutionizing the digital landscape.

## Getting Started Locally

To run the repository locally and explore the website on your machine, follow these simple steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/akash-network/website
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd website
   ```

3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Run the Development Server:**

   ```bash
   npm run dev
   ```

5. **Open Your Browser:**
   Visit [http://localhost:4321](http://localhost:4321) to view the Akash Network website locally.

## Contribution Guidelines

Before contributing to the project, please adhere to the following guidelines to ensure the project's integrity and maintainability.

### File Naming Convention

When creating files for components, pages, etc., follow this straightforward file naming convention:

- **Component Name:** Utilize kebab-case, featuring lowercase words separated by hyphens.

  Example: `my-component-name.js`

### Commit Message Structure

Each commit message should carry a meaningful structure, commencing with a type and followed by a concise description. Utilize the following types for commit messages:

- **feat:** Introduce a new feature or functionality to the codebase.

  Example: `feat: implement user authentication`

- **fix:** Rectify a bug or address an issue within the code.

  Example: `fix: resolve issue with login page`

- **docs:** Focus on documentation-related changes, such as updating comments, README files, or documentation pages.

  Example: `docs: enhance installation instructions`

- **style:** Implement code style changes, such as formatting, indentation, or variable renaming.

  Example: `style: refactor CSS styles`

- **chore:** Undertake routine tasks, maintenance, or housekeeping activities, often not directly related to code changes.

  Example: `chore: update dependencies`

- **test:** Contribute to or modify tests, including unit tests, integration tests, or end-to-end tests.

  Example: `test: add test cases for login feature`

- **perf:** Optimize the code for better performance.

  Example: `perf: enhance database query efficiency`

- **ci:** Implement changes to the continuous integration (CI) pipeline.

- **refactor:** Enhance code structure without introducing new features or fixing bugs.

  Example: `refactor: extract reusable function`

- **build:** Make changes related to the build process, such as build scripts or tools.

  Example: `build: update webpack configuration`

- **revert:** Revert a previous commit.

  Example: `revert: undo changes from commit abc123`

- **deps:** Update or modify project dependencies, such as npm packages or libraries.

  Example: `deps: upgrade lodash to version 4.0.0`

### Commit Message Best Practices

- Keep commit messages concise and to the point.
- Utilize the imperative mood (e.g., "add," "fix," "update") in the description.
- Provide context in the description when necessary..

### How to Contribute to the Akash Website

## How to write a blog

1. Create a new folder under `src/content/Blog/` with the name of the blog. For example, `src/content/Blog/how-to-use-akash-web/`
2. Create a new file called `index.md` under the new folder. For example, `src/content/Blog/how-to-use-akash-web/index.md`
3. Copy the following template into the new file and fill in the details.

```md
---
title: "Example Blog Title" # <--- This is the title of the blog
description: "Example Blog Description" # <--- This is the description of the blog
pubDate: "2019-11-25" # <--- This is the date of the blog in the format of "YYYY-MM-DD"
draft: false # <--- If the blog is not ready to publish, set it to true
archive: true # <--- If the blog is not ready to publish, set it to true it will not show in the archive page but will show in the blog page
categories: # <--- This is the category of the blog
  - Category1
  - Category2
tags: # <--- This is the tags of the blog
  - Tag1
  - Tag2
contributors: # <--- This is the contributors of the blog
  - Greg Osuri
bannerImage: ./banner-image.jpg # <--- This is the banner image of the blog or the featured image of the blog
---
```

1. Add the banner image to the same folder as the markdown file. For example, `src/content/Blog/how-to-use-akash-web/banner-image.jpg`
2. Write the blog content in markdown format in the same file. For example, `src/content/Blog/how-to-use-akash-web/index.md`
3. Commit and push the changes to the repository. The blog will be published automatically.

## Community

### How to add to the [Events](https://akash.network/community/events/)

1. Create a new folder under `src/content/Community_Akash_Events_Page/` with the name of the event. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/`
2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/index.md`
3. Copy the following template into the new file and fill in the details.

```md
---
title: AI World Congress # <--- This is the title of the event
image: "./project-banner.png" # <--- This is the banner image of the event
eventDate: "2024" # <--- This is the date of the event in the format of "YYYY"
tbd: true # <--- If the date is not confirmed yet, set it to true
location: Singapore # <--- This is the location of the event
link: "https://www.asia.token2049.com/" # <--- This is the link of the event
description: ​TOKEN2049 brings together the global Web3 industry, uniting entrepreneurs, investors, developers, industry insiders and global media - and creates unparalleled networking opportunities.
---
```

4. TBD means the date is not confirmed yet. If the date is confirmed, remove the `tbd: true` line.

5. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Akash_Events_Page/ai-world-congress/project-banner.png`

6. Commit and push the changes to the repository. The event will be published automatically.

### How to contribute to the [Akash Edu](https://akash.network/community/community-akash-edu/)

1. Create a new folder under `src/content/Community_Akash_Edu_Page/` with the name of the contribution. . For example, `src/content/Community_Akash_Edu_Page/console-101/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Akash_Edu_Page/console-101/index.md`

3. Copy the following template into the new file and fill in the details.

```md
---
title: Akash EDU - Console 101 # <--- This is the title of the contribution
image: "./project-banner.png" # <--- This is the banner image of the contribution
pubDate: "2020-01-19" # <--- This is the date of the contribution in the format of "YYYY-MM-DD"
tags: # <--- This is the tags of the contribution
  - Upcoming
description: In this course, you will learn how to deploy your project onto the Akash Network using Console — a simple, point and click deployment tool.
link: "https://akash-edu.ctlabs.in/" # <--- This is the link of the contribution
---
```

4. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Akash_Edu_Page/console-101/project-banner.png`

5. Commit and push the changes to the repository. The event will be published automatically.
<!-- add Community Contributions Card -->

### How to contribute to the [Community Contributions](https://akash.network/community/community-contributions/)

1. Create a new folder under `src/content/Community_Contributions_Page/` with name of the contribution . For example, `src/content/Community_Contributions_Page/akash-101/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Community_Contributions_Page/akash-101/index.md`

3. Copy the following template into the new file and fill in the details.

```md
---
title: "Akash Network Live with Greg Osuri: Akash’s progress in 2023, open community development, and more" # <--- This is the title of the contribution
image: "./project-banner.png" # <--- This is the banner image of the contribution
pubDate: "2023-02-24" # <--- This is the date of the contribution in the format of "YYYY-MM-DD"
readTime: "5 min" # <--- This is the read time of the contribution
author: "Robert Del Rey" # <--- This is the author of the contribution
link: https://www.youtube.com/watch?v=aVRqwXOxoe8 # <--- This is the link of the contribution
tags: # <--- This is the tags of the contribution
  - Video
description: Greg Osuri, CEO of Overclock Labs and Founder of Akash Network, will cover the progress Akash has already made in 2023, our new open community group structure, and what to look out for in the coming months.
---
```

1. Add the banner image to the same folder as the markdown file. For example, `src/content/Community_Contributions_Page/akash-101/project-banner.png`

2. Commit and push the changes to the repository. The event will be published automatically.

## Ecosystem

### How to contribute a project to the [Ecosystem](https://akash.network/ecosystem/showcase/latest)

1. Create a new folder under `src/content/Ecosystem_Page/` with the name of the project. For example, `src/content/Ecosystem_Page/akash-chat/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/Ecosystem_Page/akash-chat/index.md`

3. Copy the following template into the new file and fill in the details.

4. There are four categories `deployed_on_akash`, `akash-tools`

```md
---
projectTitle: Akash Chat # <--- This is the title of the project
projectImage: "./project-banner.png" # <--- This is the banner image of the project
pubDate: "2021-01-19" # <--- This is the date of the project in the format of "YYYY-MM-DD"

tags: # <--- This is the tags of the project
  - AI & ML

category: deployed_on_akash # <--- This is the category of the project which can be "deployed_on_akash", "tools"

description: Mistral-7B-v0.2 Large Language Model (LLM) is a pretrained generative text model with 7 billion parameters by Mistral AI. This application is running on NVIDIA GPUs leased from the Akash Supercloud.

showcase: true # <--- This is the showcase of the project in the ecosystem page/showcase

websiteLink: "https://chat.akash.network/" # <--- This is the website link of the project
githubLink: "https://chat.akash.network/" # <--- This is the github link of the project
twitterLink: "https://chat.akash.network" # <--- This is the twitter link of the project

featured: true # <--- This is the featured of the project in the ecosystem page/showcase
---
```

5. Showcase is used to show the card in [showcase](https://akash.network/ecosystem/showcase/latest) in ecosystem tag

6. Featured is used to show the card on the top of the page

7. Add the banner image to the same folder as the markdown file. For example, `src/content/Ecosystem_Page/akash-chat/project-banner.png`

8. Commit and push the changes to the repository. The event will be published automatically.

## Docs

### How to change sequence of docs

1. Go to the `src/content/Docs/sequence.ts`
2. Change the sequence of the docs

```ts
export const docsSequence = [
  {
    label: "Docs",
    subItems: [
      {
        label: "Getting Started", // <--- Change the sequence here
        subItems: [ // <--- Change the sequence here
          { label: "Intro To Akash" }, // <--- Change the sequence here
          { label: "Akash Overview" }
          { label: "Stack Definition Language (SDL)" },
          { label: "Tokens and Wallets" },
        ],
      },
  }
]
```

3. Name of the label should same as rendered name of the doc in the website

4. Commit and push the changes to the repository. The event will be published automatically.

### How to add new file in docs

1. Create a new folder under `src/content/docs` with the name of the file. For example, `src/content/docs/akash-101/`

2. Create a new file called `index.md` under the new folder. For example, `src/content/docs/akash-101/index.md`

3. Copy the following template into the new file and fill in the details.

```md
---
categories: ["Akash Nodes"] # <--- Change the category here
tags: ["Blockchain"] # <--- Change the tag here
weight: 1 # <--- Change the weight here
title: "Akash Node CLI Build" # <--- Change the title here
linkTitle: "Akash Node CLI Build" # <--- Change the link title here
---
```

4. If you want to add sub items, add the folder under the folder of the doc. For example, `src/content/docs/akash-101/akash-node-cli-build/`

5. Create a new file called `index.md` under the new folder. For example, `src/content/docs/akash-101/akash-node-cli-build/index.md`

## Contact

- Discord: [Akash Network](https://discord.com/invite/akash)

- X/Twitter: [Akash Network](https://x.com/akashnet_)

- Website: [Akash Network](https://akash.network/)

- Telegram: [Akash Network](https://t.me/AkashNW)

- YouTube: [Akash Network](https://www.youtube.com/c/AkashNetwork)


