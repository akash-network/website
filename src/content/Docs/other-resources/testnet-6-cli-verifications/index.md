---
categories: ["Other Resources"]
tags: []
weight: 2
title: "Testnet 6 CLI Verifications"
linkTitle: "Testnet 6 CLI Verifications"
---

# Akash Cosmos SDK 0.50.13 Upgrade Testnet


## Akash Command Line Interface (CLI) Testing


### Overview and Methodology

The Akash CLI’s commands and flags are defined predominantly within modules.  Example modules within the Akash code base include deployment, market, and provider.

The CLI validations within this test plan rely on:



* Assignment of a specific module to an individual/small group of individuals
* The assigned module and it’s associated CLI implementation will be tested thoroughly by that individual and/or small group
* Instead of explicitly outlining all possible subcommands and flags within this test plan
* We will instead provide guidance to isolate command sets directly from the code base for efficiency
* The ability to isolate commands to test assumes no Go language knowledge but instead anyone should be able to extract the full command sets of a module based on guidance provided


### Module Command Set Discovery/Isolation - Akash Deployment Example


#### Initial Code Base Exploration and Guidance

For the purpose of Akash module and related command identification, use the following Akash code base: \
 \
[https://github.com/akash-network/node/tree/main](https://github.com/akash-network/node/tree/main)

And more specifically our focus in the code base would be Akash modules defined in this sub-directory: \
 \
[https://github.com/akash-network/node/tree/main/x](https://github.com/akash-network/node/tree/main/x)

And again more specifically - when focusing on Akash deployment commands - the module is defines in this sub-directory:

[https://github.com/akash-network/node/tree/main/x/deployment](https://github.com/akash-network/node/tree/main/x/deployment)

With our current focus being the Akash CLI and related testing, we can drill yet deeper into the subdirectories of `client` > `cli`:

[https://github.com/akash-network/node/tree/main/x/deployment/client/cli](https://github.com/akash-network/node/tree/main/x/deployment/client/cli)


#### Queries and Transactions - Files of Interest

Within the `client` > `cli` directory of the Akash deployment module our primary focus would be on the files:
 
-  query.go

-  tx.go


#### Queries and Transactions - Command Isolation Example

Let’s use the `query.go` file as an example of how we would isolate command sets to test.

The Cosmos SDK and thus the Akash code base uses a package named Cobras for command definitions.  We can see an example of a query definition in this section of code for Akash Deployment list queries: 
 
[https://github.com/akash-network/node/blob/d16d266357d278d61cf7697466c6e3b346347efe/x/deployment/client/cli/query.go#L33](https://github.com/akash-network/node/blob/d16d266357d278d61cf7697466c6e3b346347efe/x/deployment/client/cli/query.go#L33)

In the related function (`cmdDeployments`) we find a command of `list`.  With this command isolated we know a valid, necessary test of the following CLI command is necessary: \
 



```
akash query deployment list
```


Breaking down this command further we have:



* `akash` - command prefix for all CLI commands in the Akash code base
* `query` - as we are in a `query.go` file we can discern all commands would use this keyword.  If it were a transaction command this would be `tx` instead
* `deployment` - name of the module we are currently investigating and testing
* `list` - name of the command we isolated in the Cobras/Go function definition in code


#### Exhaustive Testing of All Commands for Module

Using the methodology we outlined above - we can isolate all the commands we need to test for a specific Akash module.

Continuing with the `akash query deployment` module example we would test in total the following commands.  Each command listed can be isolated using the same procedure we used to isolate the `akash query deployment list` command in the granular example. 
 
- `list` - list all deployments associated with a specific account

- `get` - query details of a specific deployment

- `group` - list details of a specific deployment group


#### Flags

While we could get available flags from the code base, we suggest getting and using flags from CLI help such as:


```
akash query deployment list -h
```


When testing commands please attempt a variety of flags along with environment variable use.  Example variable use is detailed in the Akash CLI deployment example in this [document](https://akash.network/docs/deployments/akash-cli/installation/),


#### Mainnet CLI Comparison and Exhaustive Verifications

For exhaustive test coverage, utilize current Mainet network and CLI version and cross compare against Testnet network and CLI version.

Using the deployment module example, run through an exhaustive battery of deployment query and transaction operations to ensure that all functionality, command output, and results are identical on current Mainnet and tested Testnet versions/network.


## Submission of Work

For AKT payout incentives the following are strictly required for credit:



* OCL will provide a shared spreadsheet that will include a tab for your assigned module
* With predefined columns of:
    * Each command variation tested must be collected in a separate row
    * Pass/Fail status
    * Associated GitHub issue (see below) for any Fail scenarios
* Any Fail scenarios must also have a GitHub issue created.  Please consult with core team members if there are any questions if the issue has already been captured.  Link to required repository for issue creation is listed below.  Please use the associated `Testnet 6 Issue Discovery` template for submissions.

https://github.com/akash-network/support