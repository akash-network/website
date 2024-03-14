---
categories: ["Akash Console"]
tags: ["CLI"]
weight: 2
title: "Akash Console"
linkTitle: Akash Console
---

> _**PLEASE NOTE**_ - Now that Cloudmos and Overclock labs have joined forces, the Overclock core team is pausing active development and bug fixes for Console. Please use [Cloudmos Deploy](../cloudmos-deploy/) for your Akash Network deployments.

## Akash Console Overview

Akash Console is a web based application that makes it easy to deploy applications onto the Akash Network. Post deployment, Akash Console provides a dashboard to view the status and details of workloads. The dashboard also has the ability to perform administrative tasks including closing the deployment, updating the deployment, redeploying, and increasing the funding available to the deployment.

This guide will cover the following topics:

- [Akash Console Overview](#akash-console-overview)
- [Akash Wants to Spotlight Your Work](#akash-wants-to-spotlight-your-work)
- [Akash Console Access](#akash-console-access)
  - [Before Getting Started](#before-getting-started)
  - [ Akash Console Access](#-akash-console-access)
  - [Keplr Account Selection](#keplr-account-selection)
  - [Connect Wallet](#connect-wallet)
- [Deployment Management](#deployment-management)
  - [Deployment Dashboard Overview](#deployment-dashboard-overview)
- [Minesweeper Deployment Example](#minesweeper-deployment-example)
  - [STEP 1 - Create the Deployment](#step-1---create-the-deployment)
  - [STEP 2 - Select the Minesweeper Template](#step-2---select-the-minesweeper-template)
  - [STEP 3 - Assign Deployment Name/Edit SDL](#step-3---assign-deployment-nameedit-sdl)
  - [STEP 4 - Pre-Flight Verifications](#step-4---pre-flight-verifications)
  - [STEP 5 - Certificate Creation ](#step-5---certificate-creation-)
  - [STEP 6 - Accept Gas Fees for Deployment Creation](#step-6---accept-gas-fees-for-deployment-creation)
  - [STEP 7 - Select Provider](#step-7---select-provider)
  - [STEP 8 - Deployment Complete](#step-8---deployment-complete)
  - [STEP 9 - Access Deployment](#step-9---access-deployment)
- [Settings](#settings)
  - [Settings Access](#settings-access)
  - [Settings Overview](#settings-overview)
  - [Generate New Cert](#generate-new-cert)
  - [Certificate Management](#certificate-management)
  - [Analytics Opt In](#analytics-opt-in)

## Akash Wants to Spotlight Your Work

Have an idea for a project to deploy on Akash? Already working on a project? Maybe you’ve already deployed a project (or many projects!) to the network?

We love seeing what our community is building. Once your deployment is live, head over to our Discord and share the details of your app in our [Deployments channel](https://discord.com/channels/747885925232672829/771909909335506955) and tag @Admin.

Once you share your app, someone from the Akash team may reach out to spotlight your app across our newsletter, blog, and social media.

This is a great opportunity to connect with the team at Akash Network and to spotlight your work for our world-class community.

## Akash Console Access

### Before Getting Started

The Keplr browser extension must be installed and with sufficient funds (5AKT minimum for a single deployment plus a small amount for transaction fees).

Follow our [Keplr Wallet](/docs/getting-started/token-and-wallets/) guide to create your first wallet if necessary.

### &#x20;Akash Console Access

The Akash Console web app is available via the following URL:

- [https://console.akash.network](https://console.akash.network)

### Keplr Account Selection

Ensure that an Akash account with sufficient AKT balance is selected in Keplr prior to proceeding with subsequent steps.

![](../../assets/akashConsoleKeplr.png)

### Connect Wallet

Use the `Connect Wallet` button to connect the account selected in Keplr in the prior step to the Akash Console.

![](../../assets/akashConsoleConnectWallet.png)

```yaml
version: "2.0"

services:
  web:
    image: ovrclk/lunie-light
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      attributes:
        host: akash
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1
```

## Deployment Management

### Deployment Dashboard Overview

The `My Deployments` link may be selected from any page within the Akash Console. The arrived upon management pane lists all active Deployments associated with the account currently selected.

Select/click a Deployment of interest to drill into additional details.

![](../../assets/akashConsoleDeploymentManagement.png)

From the example `My Deployment` screen shown, we drill into the Minesweeper Deployment to expose Deployment details and the ability to navigate into EVENTS/LOGS/LEASES tabs.

## Minesweeper Deployment Example

In this section we will use the Akash Console to launch an example Minesweeper deployment on the Akash Network. You can follow the same process for any other workload so long as it is containerized and you have an appropriate SDL.

#### STEP 1 - Create the Deployment

From the `New Deployment` page click the `Deploy Now` button in the `Fun & Games` section.

![](../../assets/akashConsoleDeployNow.png)

#### STEP 2 - Select the Minesweeper Template

Select the `Minesweeper` template and the proceed with the deployment by clicking `Deploy Now`.

![](../../assets/akashConsoleMinecraft.png)

#### STEP 3 - Assign Deployment Name/Edit SDL

Proceed with the deployment by specifying a useful name to your application. This step is optional and without explicit naming the Akash Console will assign a randomly generated name.

Click `Create Deployment` to proceed when satisfied with application naming/settings..

> _**NOTE**_ - the Configuration section additionally allows the edit of the following application specifications. In our example - with the goal being the simple launch of an initial application via the Akash Console - these settings are left at defaults and are not changed.\
> \
> \- **Configure services** - allows edit of application specs including CPU, memory, storage, and exposed ports.\
> \
> \- **Review SDL** - allows direct edit of the applications SDL (Stack Description Language) YAML file. Further details on Akash SDL files can be found [here](../../readme/stack-definition-language.md).

![](../../assets/akashConsoleNameDeployment.png)

#### STEP 4 - Pre-Flight Verifications

A number of verifications are made prior to proceeding with application deployment.

Amongst the verifications made are assurances that the connected wallet has sufficient funds and a valid certificate exists which is used for Akash provider communications.

If all verifications are successful - as shown in the example below - proceed by clicking the `Next` button.

> _**NOTE**_ - if `Wallet Connected` check fails, ensure the `Connect Wallet` step from the [Akash Console Access](akash-console-access.md) section of this document is completed.

> _**NOTE**_ - if this is your first time using the Akash Console it is likely the `Valid Certificate` check will fail. Use the instructions in the subsequent step ([STEP 5 - Certificate Creation](minesweeper-deployment-example.md#step-5-certificate-creation)) should this be the case.

![](../../assets/akashConsolePreflight.png)

#### STEP 5 - Certificate Creation&#x20;

Use the guidance in this step if a valid certificate does not exist.

A valid certificate is necessary to proceed with deployments of apps onto the Akash network. If the `Checking Essentials` screen reports `Missing Certificate` there are two ways to proceed.

- Simply click the `Create Certificate` button presented in the `Checking Essentials` pane as highlighted in the display below. _**NOTE**_ - following the selection of this button it may take a couple of minutes before the `Missing Certificate` warning disappears.
- Manage the Akash Console certificates from the [Settings](#settings) page. Following the cert creation/activation - as covered in the [Settings](settings.md) documentation - return to the deployment creation process and `Checking Essentials` should no longer display a `Missing Certificate` warning.

![](../../assets/akashConsoleCertInPreflight.png)

#### STEP 6 - Accept Gas Fees for Deployment Creation

The Keplr wallet will prompt to `Approve` gas fees for the creation of the deployment. Click the `Approve` button to proceed.

Subsequent steps in the Deployment process may also prompt for Gas fee accept. Follow this same step to approve any subsequent such prompts.

![](../../assets/akashConsoleAcceptFees.png)

#### STEP 7 - Select Provider

Select a preferred Akash Provider for your deployment.

Click the `Submit Deploy Request` button following preferred Provider selection to continue with the deployment.

![](../../assets/akashConsoleProvider.png)

#### STEP 8 - Deployment Complete

Upon successful completion of the Akash Deployment the following screen is presented.

The Deployment management pane allows actions including:

- _**EVENTS**_ - view of the related application launch events
- _**LOGS**_ - view of the logs from the application's container instance
- _**LEASES**_ - review of the deployment's specifications including exposed ports and assigned resources
- _**Update/Delete Deployment**_ - ability to manage the active deployment by updating application image or closing the deployment.

![](../../assets/akashConsoleDeploymentComplete.png)

#### STEP 9 - Access Deployment

Access the Deployment's URL via the exposed link.

![](../../assets/akashConsoleURL.png)

Example display of the Minesweeper web app within the Akash Deployment.

![](<../../assets/akashConsoleAccess(1).png>)

## Settings

The Akash Console Settings page is used primarily for certificate management. This guide describes cert management and other activities available from the Settings page.

### Settings Access

The Akash Console Settings page can be accessed from the left-hand navigation bar and from any page within the app.

![](../../assets/akashConsoleSettingsAccess.png)

### Settings Overview

The Akash Console Settings page currently allows three types of actions. Drill into the link for each action type for additional detail.

- [Generate New Cert](#generate-new-cert)
- [Certificate Management](#certificate-management)
- [Analytics Opt In](#analytics-opt-in)

![](../../assets/akashConsoleSettingsOverivew.png)

### Generate New Cert

The primary activity in the Settings page involves certificate management. A valid, active certificate must exist to proceed with Akash deployment activities (create deployment, delete deployment, etc).

If no certificate currently exists the Akash Console displays the message - `You don't have any certificates. You must generate a new certificate to deploy.` - as per example below.

Follow the steps in the remainder of this section to create a new certificate when necessary.

![](../../assets/akashConsoleNoCert.png)

Click the `Generate New Cert` button to begin the process of new certificate creation.

![](../../assets/akashConsoleCreateNewCert.png)

Click the `Create` button to proceed with new certificate creation.

![](../../assets/akashConsoleNewCert.png)

Following successful certificate creation, click the `ACTIVATE` option.

![](../../assets/akashConsoleActivateCert.png)

Following certificate creation and activation a `Current` status should display.

If the `Settings` page now list the newly created certificate with a status of `Current` - you should be all set to proceed with Akash deployment creations and management within the Console.

![](../../assets/akashConsoleCertCurrent.png)

### Certificate Management

The Settings page can be used for certificate management purposes.&#x20;

When several certificates exist for the current account - as selected in Keplr - use the available management actions to activate a specific cert if needed.

We can additionally use the certificate management pane to determine what certificate is currently active and revoke certificates if desired.

![](../../assets/akashConsoleCertManagement.png)

### Analytics Opt In

The Akash Console development team utilizes analytics received from the application to improve usability and performance. By default Analytics are enabled (`Opted-In` is active) meaning statistics from your browser will be collected and sent to the Akash team. No private information is stored or sent as part of this analytics collection.

To change the status of Analytics Opt In use the toggle highlighted below.

![](../../assets/akashConsoleAnalytics.png)
