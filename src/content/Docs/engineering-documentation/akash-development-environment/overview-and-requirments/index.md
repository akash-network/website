---
categories: ["Akash Development Environment"]
tags: []
title: "Overview and Requirments"
linkTitle: "Overview and Requirments"
weight: 1
description: >-
---


This page covers setting up development environment for both [node](https://github.com/akash-network/node) and [provider](https://github.com/akash-network/provider) repositories. The provider repo elected as placeholder for all the scripts as it depends on the `node` repo.   Should you already know what this guide is all about - feel free to explore examples.

## Requirements

### Golang

Go must be installed on the machine used to initiate the code used in this guide. Both projects - Akash Node and Provider - are keeping up-to-date with major version on development branches. Both repositories are using the latest version of the Go, however only minor that has to always match.

### **Docker Engine**

Ensure that Docker Desktop/Engine has been installed on machine that the development environment will be launched from.

### Direnv Use

#### Install Direnv if Necessary

Direnv is used for the install process.  Ensure that you have Direnv install these [instructions](https://direnv.net/).

#### Configure Environment for Direnv Use

* Edit the ZSH shell profile with visual editor.

```
vi .zshrc
```

* Add the following line to the profile.

```
eval "$(direnv hook zsh)"
```