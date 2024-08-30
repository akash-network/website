---
categories: ["Guides"]
tags: ["Machine Learning", "GPT", "API"]
weight: 1
title: "Akash Chat API JavaScript Examples"
linkTitle: "JavaScript Examples"
---

You would need to have Node.js installed on your computer. To verify if you have JavaScript installed on your computer, go to Terminal/CommandLine and run:

```
node --version

```

If you see a response similar to

```
v22.6.0

```

then you have Node.js installed. Otherwise, Go the [Node.js website](https://nodejs.org) download it, and install it.

You then need to install the OpenAI API library

```
npm install openai

```


## Basic Text Completion
This example demonstrates how to generate a text completion based on a prompt