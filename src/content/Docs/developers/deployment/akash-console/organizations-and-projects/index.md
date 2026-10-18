---
categories: ["Developers", "Deployment", "Akash Console"]
tags: ["Akash Console", "Organizations", "Teams", "Projects", "Billing"]
weight: 2
title: "Organizations and Projects"
linkTitle: "Organizations and Projects"
description: "Share deployments, billing and access with your team in Akash Console: roles, projects, invitations, budgets, activity and team billing"
---

**Work alone in your personal account, or with your team in an organization.**

Every Console user has a personal account. An organization is a shared space for a team: its own balance and cards, its own deployments, and members with roles. Inside an organization, deployments are grouped into projects, and each member can be given access to all projects or only some of them.

---

## Personal account and organizations

Your **personal account** is yours alone. It holds your own balance, cards, free trial credits and deployments.

An **organization** belongs to a team. It has its own balance, payment methods and deployments, separate from every member's personal account. Deployments created in an organization run on its balance, so they keep running when the member who created them leaves.

Switch between them with the switcher in the top bar. It lists your personal account first, then every organization you belong to with your role in it. Whatever you open next (deployments, projects, billing, API keys) belongs to the account you picked.

### Create an organization

1. Open the switcher in the top bar and click **Create organization**.
2. Enter the organization name.
3. Optionally, enter your teammates' email addresses. They are invited as Members, and you can change their role later.
4. Choose how the organization pays: add a card now, or set it up later from **Billing**.
5. Click **Create organization**. You become its owner.

Creating an organization needs a signed-in Console session; it cannot be done with an API key. There is a limit on how many organizations one person can create.

An organization never gets free trial credits. It starts with an empty balance, so no one can deploy in it until an owner or billing member adds a card and buys credits. See [Team billing](#team-billing).

---

## Roles

Each member of an organization has one role.

| Role        | What they can do                                                                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**   | Everything: billing, members, projects, deployments, and deleting the organization. Only an owner can invite or promote another owner.                         |
| **Admin**   | Manages members (below owner), invitations and projects, sets project budgets, and deploys in every project. Sees billing and usage but cannot change billing. |
| **Member**  | Deploys and manages deployments in the projects they can access, as their project role allows. Cannot create projects.                                         |
| **Billing** | Manages payment methods, credits and automatic card charges, and sees usage. Cannot open projects or deployments.                                              |
| **Viewer**  | Looks at the projects they can access and their deployments, but cannot change anything.                                                                       |

An organization always has at least one owner. To hand it over, an owner opens **Settings → General → Transfer ownership**: the member becomes an owner and the previous owner becomes an admin.

In Console you invite people as **Member** or **Admin** and change roles from the **Members** page. The **Viewer** and **Billing** roles are assigned through the [Console API](/docs/api-documentation/console-api/organizations-and-projects).

---

## Projects

A project groups the deployments behind one app or service, together with their saved templates and alerts. Every organization has a **default project**, which cannot be deleted. In Console, projects appear in organizations; your personal account keeps everything in its default project.

Owners and admins create projects from the **Projects** page (**New project**), rename them, and delete them once they hold no open deployments. There is a limit on how many projects an organization can have.

### Project access

Owners and admins reach every project. Billing members reach none. Members and viewers get one of two kinds of access:

- **All projects**: every project of the organization, including ones created later.
- **Specific projects**: only the projects picked for them, each with its own project role.

The project roles are:

| Project role | What it allows                                             |
| ------------ | ---------------------------------------------------------- |
| **Viewer**   | Sees the project and its deployments.                      |
| **Member**   | Also deploys into the project and manages its deployments. |
| **Admin**    | Also renames the project and manages who can open it.      |

An organization viewer only reads, whatever their project role.

Change who reaches a project from the project page (**Manage access**), or change a person's access to every project at once from **Settings → Members**. Changes apply from the person's next request.

### Deploy into a project

When you deploy in an organization, Console shows where the deployment goes ("Deploying to _organization_ / _project_"). Click **Change project** to pick another project you can deploy into.

Owners and admins can move a deployment to another project with **Move to project** in its menu on the **Deployments** list. Moving changes which project's budget and members the deployment falls under; the deployment itself keeps running.

---

## Invitations

Owners and admins invite people from **Settings → Members → Invite members**:

1. Enter one or more email addresses, separated by commas or spaces.
2. Pick the role.
3. For a member, pick their project access: all projects, or specific projects with a role on each.
4. Click **Send invite**.

Each address receives an email with a link. Invitations expire after 7 days. From the pending invitations list you can resend an invitation (with a new link and expiry), copy a fresh invite link to share yourself, or revoke it.

The person who opens the link signs in or signs up, then accepts. If the invitation went to another address than their verified email, Console asks them to confirm before joining. Accepting needs a signed-in Console session.

To leave an organization, open **Settings → General → Leave organization**. An owner has to transfer ownership first. When someone leaves or is removed, they lose access right away, and the API keys they created in that organization stop working.

---

## Budgets and spend

Owners and admins can give each project a monthly budget from the project page (**Set budget**):

- **Monthly budget (USD)**: counted per calendar month in UTC.
- **Alert threshold (%)**: owners and admins get one email per month when the project's deposits reach this share of the budget. Defaults to 80%.
- **Stop top-ups when over budget**: off by default.

A budget counts deposits, meaning what the project's deployments put into escrow this month, not what they have consumed. A new deployment that would take the project past its budget is refused. Top-ups of running deployments are refused only when **Stop top-ups when over budget** is on, and those deployments can then run out of funds and close.

The **Usage** page breaks the organization's spend down by project and by deployment. Owners, admins and billing members see it.

---

## Activity

The **Recent activity** feed on the Projects page and on each project page shows what happened in the organization: the organization created or renamed, projects created, members invited, joined, changed, granted or revoked access, and deployments created, closed or moved between projects. Each member sees the activity of the projects they can reach, plus organization-wide events such as someone joining.

---

## Team billing

An organization pays for its own deployments. It has its own wallet, balance, cards and automatic card charges, all separate from its members' personal accounts. Deployments in the organization are funded from its balance the same way personal deployments are, as described in [How Funding Works](/docs/getting-started/how-funding-works).

| Role           | Billing access                                                   |
| -------------- | ---------------------------------------------------------------- |
| Owner, Billing | Add and remove cards, buy credits, set up automatic card charges |
| Admin          | Sees the billing and usage pages, cannot change them             |
| Member, Viewer | No billing or usage pages                                        |

Low-balance warnings and other billing emails go to the organization's owners and billing members.

An organization does not get the free trial. Credits bought for an organization stay in it: when an owner deletes the organization (**Settings → General → Delete organization**, possible only once none of its deployments is running), its remaining credits are forfeited.

---

## Related Resources

- [Organizations and Projects through the API](/docs/api-documentation/console-api/organizations-and-projects) - Choose the organization and project of a request, project-bound API keys, and the new error codes
- [How Funding Works](/docs/getting-started/how-funding-works) - Credits, escrow and automatic funding
- [Getting Started with Console](/docs/developers/deployment/akash-console/getting-started) - The basics of Akash Console
