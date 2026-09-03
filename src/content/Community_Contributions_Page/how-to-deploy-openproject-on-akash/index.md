---
title: How to Deploy OpenProject on Akash Network
description: A beginner friendly guide to deploying OpenProject, a free project management tool, on Akash Network using Akash Console or Console Air.
pubDate: 2026-08-10
draft: false
categories:
  - Guides
tags:
  - Guides
  - Deployment
  - SDL
contributors:
  - Rodri
bannerImage: ./project-banner.png
---
This guide walks you through deploying [OpenProject](https://www.openproject.org), a free project management tool, on Akash Network. Everything is done through [Akash Console](https://console.akash.network) or [Console Air](https://github.com/akash-network/console-air) in your browser.

By the end you will have a fully working project management platform with your own login, email notifications and automatic backups.

## Which console should I use

Both Akash Console and Console Air let you paste an SDL file and deploy from it, so either one works for this guide.

- **Akash Console** is the managed option. It supports card payments and email or social login, which makes it the simplest starting point if you are new to Akash.
- **Console Air** is the self custody option. You connect your own wallet, such as Keplr and sign your own transactions.

Both point at the same network, so pick whichever fits how you want to pay and sign transactions.

## What you will need before starting

Gather these three things first. It will make the whole process much smoother.

### 1. A storage bucket for your files

Your project attachments (images, documents, files people upload) need somewhere to live. We recommend Cloudflare R2 because it is free for most small teams.

Steps:

1. Create a free Cloudflare account if you do not have one
2. Go to R2 in your Cloudflare dashboard
3. Create a new bucket and give it any name
4. Go to **R2 → Manage API Tokens → Create API Token** and create a new token with read and write permissions
5. Save these three values somewhere safe: your Account ID, your Access Key and your Secret Key

### 2. An email sending account

For your team to receive password reset emails, invitations and notifications, you need an email service. We recommend SendGrid because it has a generous free plan.

Steps:

1. Create a free SendGrid account
2. Verify a sender email address (this is the email your notifications will come from)
3. Create an API key with Mail Send permission
4. Save the API key somewhere safe

### 3. Three secret passwords

These are random secure codes that protect your deployment. If you have access to any computer terminal, even briefly, run this command three times and save each result:

```bash
openssl rand -hex 64
```

If you do not have terminal access, come up with your own secure passwords or use any password generator online to create three long random strings of at least 60 characters each.

## Step 1: Get the deployment template

Go to the [OpenProject folder](https://github.com/akash-network/awesome-akash) in the Akash awesome-akash GitHub repository. Download the file called `deploy.yaml`. This is your deployment template.

Open the file in any plain text editor. Notepad, TextEdit or any code editor works fine.

## Step 2: Fill in your placeholders

The template has placeholder text in capital letters that you need to replace with your real information. Use Find and Replace in your text editor to make this fast and avoid typos.

Here is what each placeholder means.

**Your three secret passwords from earlier**

Replace every instance of `REPLACE_WITH_64_BYTE_HEX_SECRET` with your first secret. This appears in several places, replacing them all with the same value.

Replace `REPLACE_WITH_64_BYTE_HEX_SECRET_2` with your second secret.

Replace `REPLACE_WITH_STRONG_DB_PASSWORD` with your third secret. This also appears in several places, replacing them all with the same value.

**Your storage bucket details from Cloudflare R2**

Replace `REPLACE_WITH_R2_ACCOUNT_ID` with your Account ID.

Replace `REPLACE_WITH_R2_BUCKET_NAME` with the name you gave your bucket.

Replace `REPLACE_WITH_R2_ACCESS_KEY` with your Access Key.

Replace `REPLACE_WITH_R2_SECRET_KEY` with your Secret Key.

**Your email details from SendGrid**

Replace `REPLACE_WITH_SENDGRID_API_KEY` with your SendGrid API key.

Replace `REPLACE_WITH_YOUR_DOMAIN` with your company domain, for example yourcompany.com.

Replace `REPLACE_WITH_VERIFIED_SENDER_EMAIL` with the email address you verified in SendGrid.

**Two placeholders you cannot fill in yet**

You will see `REPLACE_AFTER_DEPLOY_WITH_INGRESS_HOSTNAME` and `REPLACE_AFTER_DEPLOY_WITH_HOCUSPOCUS_INGRESS_HOSTNAME`. Leave these exactly as they are for now. You will come back to them after your first deployment. Do not delete or guess at these values.

## Step 3: Deploy to Akash

1. Open [Akash Console](https://console.akash.network) or [Console Air](https://air.akash.network/) in your browser
2. Start a new deployment and choose the option to paste your own SDL file
3. Paste in your completed template
4. Review the list of provider bids. You should see many bids appear quickly
5. Choose a provider and accept the bid

Your deployment will now start. This can take a few minutes while everything sets up in the background. You may see some services restart once or twice while the database finishes preparing. This is completely normal.

## Step 4: Get your web addresses

Once your deployment shows as running, look for a section called Forwarded Ports or URI in your provider dashboard. You will see two web addresses. They will look something like this:

```
abc123xyz.ingress.providername.com
```

One of these addresses belongs to your main OpenProject app. The other belongs to a service called Hocuspocus, which powers real time collaborative editing.

Write down both addresses. You will need them in the next step.

## Step 5: Update your deployment with the correct addresses

Go back to your saved SDL file and find the two placeholders you left earlier. You can also edit the SDL directly through the Update tab in the console UI.

Replace every instance of `REPLACE_AFTER_DEPLOY_WITH_INGRESS_HOSTNAME` with your main app address. Just the address itself, nothing else. Do not add https at the front and do not add a slash at the end.

Replace `REPLACE_AFTER_DEPLOY_WITH_HOCUSPOCUS_INGRESS_HOSTNAME` with your Hocuspocus address. Keep the wss:// part in front of it exactly as it appears in the template. Do not add a slash at the end.

Go back to your console, open your running deployment and choose Update Deployment. Paste in your updated file.

Important: always choose Update Deployment, never close the deployment and start a new one. Updating keeps all your data safe. Starting a new deployment deletes everything and you start from zero.

## Step 6: Log in for the first time

Open your main app address in your browser. Log in using:

```
Username: admin
Password: admin
```

You will be asked to set a new password immediately. Choose something secure and save it somewhere safe.

## Step 7: Add people to your project

Once you are logged in you will want your team to join you. OpenProject calls this adding members.

Steps:

1. Open the project you want to add people to, or create one first if you have not already (see the next step for how to create a project)
2. In the left side project menu, click Members
3. Click the green + Member button
4. Type the name or email of the person you want to add
5. Choose a role for them, for example Member or Admin, then click Add

If the person does not have an account yet, OpenProject will invite them by email. This is why setting up SendGrid earlier matters, without it your invites will not arrive. You can always skip SendGrid or mail sending and add members manually, while sending or sharing login info with them. 

## Step 8: Your first project with planning and tasks

Now that you are logged in and know how to add people, here is how to set up your first real project.

**Create a project**

1. Click the + button in the top header, or use the + Project button on your start page
2. Give your project a name
3. Choose a template if you want a head start, or leave it blank for an empty project
4. Click Save

**Create your first tasks**

In OpenProject, tasks, bugs, features, milestones and similar items are all called work packages.

1. Open your project and click Work packages in the left side menu
2. Click the green + Create button
3. Choose a type, for example Task or Milestone
4. Fill in a subject, description, assignee and due date
5. Click Save

Repeat this for every task in your project. You can assign each one to a team member you added in the previous step.

**See your plan visually**

Once you have a few work packages with dates, open the Gantt chart view from the left side menu to see your whole project plan laid out on a timeline. You can drag tasks to reschedule them directly from this view.

## Step 9: Test that email works

Go to Administration, then Settings, then Email Notifications. Send a test email to yourself. If it arrives, everything is working correctly.

If it does not arrive, double check your SendGrid API key and make sure your sender email address is verified in SendGrid.

## Understanding your backups

Your deployment automatically backs up your database every time something changes. This happens in the background with no action needed from you. These backups are saved directly to your Cloudflare R2 bucket.

For a complete backup that includes your files and attachments as well, go to Administration, then Backup, inside OpenProject. Generate a backup token, tick Include Attachments and click Backup OpenProject. You will receive an email with a download link once it is ready.

We recommend doing this full backup regularly, especially before making any major changes to your deployment.

### Restoring from a backup

If something goes wrong and you need to bring back a previous backup, here is how to do it using the shell inside your deployment.

Warning: restoring a backup replaces all the data currently in your database. Only do this if you want to go back to an earlier point in time, or if your deployment went down and you need to deploy a new instance and recover from your backup.

#### Step 1: Get your backup file into your R2 bucket

If your backup file is not already in your R2 bucket, upload it there first.

- If you are restoring the automatic database backup, it is likely already sitting in your R2 bucket, since that is where it is saved automatically
- If you are restoring a full backup you downloaded by email, unzip it on your computer first. Inside you will find a file ending in .pgdump, this is your database backup. Upload this file to your R2 bucket using the Cloudflare dashboard

#### Step 2: Get a link to your file

In your Cloudflare R2 dashboard, open your bucket, click on the backup file and generate a link to it. Copy this link, you will need it in the next step.

#### Step 3: Open the database shell

In your console, open your deployment and find the shell option for the db service. This gives you a terminal directly inside your database container.

#### Step 4: Download the backup into the container

Curl is not installed by default on this image, so install it first:

```bash
apt-get update && apt-get install -y curl
```

Then download your backup file using the link from step 2:

```bash
curl -o backup.dump "YOUR_LINK_HERE"
```

#### Step 5: Restore the database

If your file ends in .sql.gz, unzip it first:

```bash
gunzip backup.dump
```

Then restore it using these commands:

```bash
dropdb -U postgres openproject
createdb -U postgres openproject -O postgres
psql -U postgres openproject < backup.dump
```

If your file ends in .pgdump instead, use pg_restore for the last command instead:

```bash
dropdb -U postgres openproject
createdb -U postgres openproject -O postgres
pg_restore -U postgres -d openproject backup.dump
```

#### Step 6: Confirm it worked

Log in to your app in the browser. You should see your previous projects and work packages back exactly as they were at the time of the backup.

You should not need to update or redeploy anything. Since this data was loaded directly into your live running database, the app already sees it immediately.

#### About restoring attachments

The automatic database backup only covers your database, so there is nothing to restore for attachments there, since they already live safely in your R2 bucket at all times.

The full backup from OpenProject also includes a separate copy of your attachments. Restoring these requires copying files back into your R2 bucket matching the exact folder structure OpenProject expects, which is a more advanced process. In most cases your attachments already live safely in R2 and only your database needs restoring.

## A note about updating your deployment

This template uses fast, low cost storage that resets each time you update your deployment. This is why the automatic backups and the full backup feature above are so important. Always make sure your backups are working before you rely on this deployment for real project data.

## Learn more about OpenProject

This guide covers deployment and the basics of getting started. OpenProject itself has many more features including boards, wikis, time tracking and reporting.

For a full walkthrough of every feature, visit the [official OpenProject documentation](https://www.openproject.org/docs/).

## Need help?

If this is something you'd like a hand with, join the [Akash Discord server](https://discord.akash.network) or send your questions through the [Akash support form](https://akash.network/support/).
