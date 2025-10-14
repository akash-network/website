---
title: "Authorized Spend via Console"
linkTitle: "Authorized Spend via Console"
tags: []
weight: 2
categories: ["Network Features"]
---

The Akash Console provides an intuitive web interface for deploying and managing workloads on the Akash Network. For features like Authorized Spend, the Console offers a user-friendly way to create and manage spend authorizations.

> _**NOTE**_ - Authorized Spend is only accessible via wallet payments. Make sure you are using the wallet as your payment method and are connected to the console.

### How to Access Authorized Spend in Console

Navigate to the Akash Console web app homepage:

- [https://console.akash.network/](https://console.akash.network/)

1. Connect the Akash Console with wallet access
2. Hover over the wallet icon on the top right corner of the console
3. You will see the `Authorized Spend` option; click on it (Bank icon)
4. This will take you to the [Authorizations page](https://console.akash.network/authorizations) where you can manage your spend authorizations
   ![Akash Console Homepage](https://miro.medium.com/v2/1*YtJ0sMS23ijS8I4oBO9cUQ.png)

#### **Prerequisites**
- **Wallet Connection**: Your wallet must be connected to the Console
- **Funding Requirements**: The funding wallet must have sufficient AKT/USDC balance to cover:
  - The authorized spending amount

### Step-by-Step Console Walkthrough

#### **Initiating Authorization**
1. On the Authorizations page, click the "Authorize Spend" button (Bank icon)
   ![Authorizationpage](https://miro.medium.com/v2/1*WTxIGD6Q-2F9zXEcZCIj8Q.png)
2. The Grant Modal will appear with the following fields:

#### **Form Fields Explanation**
| Field | Description | Requirements |
|-------|-------------|--------------|
| **Token** | Select the token type for authorization | AKT or USDC |
| **Spending Limit** | Maximum amount the grantee can spend | Must be > 0 |
| **Grantee Address** | Wallet address to receive authorization | Valid 44-character Akash address |
| **Expiration** | Date/time when authorization expires | Default: 1 year from creation |

#### **Setting Spending Limits**
- Enter the desired spending limit in the designated field
- The system will validate that the amount does not exceed your wallet's available balance
- For security, consider setting conservative limits initially and increasing as needed

#### **Wallet Selection Process**
1. Enter the complete wallet address in the "Grantee Address" field
2. The Console will validate the address format automatically
3. Grant the authorization by clicking the `Grant` button
    ![Authorization Grant](https://miro.medium.com/v2/1*CUp9VVZ9Vj9U_rBD1_10qg.png)
### Managing Authorizations via Console

#### **Viewing Existing Authorizations**
The Authorizations page displays two sections:
- **Authorizations Given**: List of grants you've created for other wallets
- **Authorizations Received**: List of grants other wallets have given to you

Each authorization shows:
- Grantee/Granter address
- Token type and remaining balance
- Expiration date
- Status indicator (Active/Expired)

#### **Modifying Spending Limits**
To change an existing authorization's spending limit:
1. Find the existing authorization in the "Authorizations Given" list
2. Click the "Edit" Icon from the Actions column
3. You can update the spending limit and expiration date

#### **Revoking Authorizations**
To revoke access:
1. Find the existing authorization in the "Authorizations Given" list
2. Click the "delete" icon from the Actions column
3. Confirm the revocation in the confirmation dialog.

#### **Checking Remaining Authorized Balances**
- The Console automatically calculates remaining balances
- When creating a deployment with authorized funds, the system validates:
  - Grant existence and type
  - Expiration status
  - Sufficient spending limit for the deployment cost
- Remaining balance is displayed in the Authorizations table

## Deploying with Authorized Funds via Console

#### **Deployment Process**
When using authorized funds, the deployment process is as follows:
- From the grantee wallet, navigate to the [Authorizations page](https://console.akash.network/settings/authorizations) to view active authorizations
- The process is the same as a standard deployment
  1. While confirming the deployment, select the `Use another address to Funds` option
  2. Select the appropriate grant from the dropdown list
  3. Complete the deployment process as usual
  ![Deployment with Authorized Funds](https://miro.medium.com/v2/1*pyHQQCnonO2ywqe91GKeAw.png)  

> _**NOTE**_ - The grantee wallet still needs some minimal, additional AKT to cover gas costs. Alternatively, you can use the transaction fee authorization feature if the funding wallet has sufficient balance.


### Expected User Flow Documentation

#### **Organization Admin (Funding Wallet) Workflow**
1. Navigate to Settings → Authorizations
2. Click "Authorize Spend"
3. Enter team member's wallet address
4. Set appropriate spending limit based on deployment needs
5. Set expiration date (typically 3-12 months)
6. Monitor usage through the Authorizations dashboard
7. Adjust limits or revoke access as team needs change

#### **Team Member (Deploy Wallet) Workflow**
1. Log into Console with authorized wallet
2. Create new deployment
3. Select "Use Authorized Funds" option
4. Choose from available grants
5. Complete deployment process normally
6. Check remaining authorized balance in the Authorizations section
7. Request limit increases from admin if needed

## Troubleshooting

#### Cannot Access Authorized Spend

- Ensure you're on the correct Akash Console page.
- Ensure you have connected your wallet.
- Ensure you select payment method as **Wallet** - if not, hover over the credits/funds button on the top right Navigation bar and select `switch to wallet payments`.
- Try refreshing the browser.
- Clear browser cache if issues persist.

#### Authorization Not Working

- Verify the grantee address is correct and properly formatted (44-character akash1... format)
- Check that the authorization has not expired
- Ensure the spending limit is sufficient for the deployment cost
- Confirm the authorization type is correct (Deployment Authorization)

#### Deployment Failures with Authorized Funds

- Ensure the grantee wallet has sufficient AKT for gas fees
- Verify the deployment configuration is valid
- Check that the funding wallet has sufficient balance
- Ensure the authorization is active and not revoked

#### Not Seeing Expected Authorizations

- Refresh the Authorizations page
- Verify you are viewing the correct section (Given vs Received)
- Check that the wallet is properly connected
- Ensure you are on the correct network (mainnet vs testnet)
