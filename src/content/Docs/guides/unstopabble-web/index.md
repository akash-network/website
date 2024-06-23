---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "Unstoppable Web 2.0"
linkTitle: "Unstoppable Web 2.0"
---

Repository repository is located [here](#decentralized-infrastructure).

This repository serves as a general guide and proof of concept for deploying a full-stack web application onto blockchain-based decentralized infrastructure.

The repository is structured as a monorepo - with infrastructure configuration, application frontend code, and application backend code all in one repository. This is done so that anyone can clone or fork this one repository and begin to experiment with deploying a decentralized web application.

### Decentralized infrastructure

| DNS                                | Frontend                     | Backend                        | <p>Redundant</p><p>Database</p>     |
| ---------------------------------- | ---------------------------- | ------------------------------ | ----------------------------------- |
|                                    |                              |                                |                                     |
| [Handshake](https://handshake.org) | [Skynet](https://siasky.net) | [Akash](https://akash.network) | [Postgresql](http://postgresql.org) |

### Web application

The demo application deployed in this guide is a note app - with create, read, delete functionality. It serves as a minimal proof of concept for deploying a multi-tier web application to decentralized infrastructure.

| Frontend                     | Backend                                        | Database                                 |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------- |
| [React](https://reactjs.org) | [Python FastAPI](https://fastapi.tiangolo.com) | [PostgreSQL](https://www.postgresql.org) |

The application structure is bootstrapped using this [cookiecutter](https://github.com/Buuntu/fastapi-react) template. The **docker** image is based on this [image](https://github.com/tiangolo/uvicorn-gunicorn-fastapi-docker).

The application code, technology choices, and configuration used in this repository should provide a general enough base to fork and adapt, or just reference, for future decentralized web application development.

### Deployed Demo

A deployed [live demo](https://0000ac8v9uf92otn28omnuqfan0qd05f3gjrsfoonjpjl3m3ir7qds8.siasky.net/#) was deployed using the steps in this guide.

## Guide

### Step 1 - Buy Handshake domain

There are a few simple options for registering a **Handshake** domain name:

1.  Use a platform like [Namebase](https://www.namebase.io) or a tool like [Bob Wallet](https://github.com/kyokan/bob-wallet) to purchase a top-level Handshake domain.

    Domain purchases using Handshake are achieved through an [auction process](https://www.namebase.io/blog/tutorial-3-basics-of-handshake-auction-and-bidding). It will take **10 days** for your auction to finalize. and a winning bid, before you can make use of the domain.

2.  Use [**gateway.io**](https://gateway.io) to purchase a domain under one of gateway's existing top-level Handshake domains, like **.c** or **.api**. Domains purchased in this way are **usable immediately**.

### Step 2 - Push Docker image

1. Make sure [Docker](https://www.docker.com) is installed.
2. **CD** to the directory where your `Dockerfile` is. For this repository, it is in `application/backend/Dockerfile`.
3. **Build** and **tag** docker image `docker build -t/: .`
4. **Login** to dockerhub `docker login --username=`. You will be prompted for a password.
5. **Push** your docker image to dockerhub `docker push`. Paste this yaml into the tool.

### Step 3 - Deploy back-end to Akash

If you haven't already, take the time to read through the [Akash deployment documentation](https://akash.network/docs/guides/deploy) and familiarize yourself with the concepts and steps involved.

You can deploy to Akash using the [standard Akash CLI ](https://akash.network/docs/guides/cli)directly but for the purpose of this guide, I am using [Tom Beynon's Akash Deploy UI](https://github.com/tombeynon/akash-deploy) which is a great tool built on top of the standard CLI. Steps for deploying to Akash using this tool are below.

1.  Start the **Akash Deploy UI** tool by running the following:

    ```
    docker run -v ~/.akash-ui:/root/akash -p 3000:3000 --rm -it tombeynon/akash-deploy
    ```

2.  Visit [http://localhost:3000](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main) to access the tool
3.  Use the tool to **create a new wallet**. Make sure to record your mnemonic phrase so that you can restore the wallet if needed in the future.
4.  **Fund this new wallet with at least 0.5 AKT** (500,000 UAKT) by transferring 0.5 AKT or more to the displayed wallet address.
5.  **Create a new certificate**. This certificate only needs to be created once and will be used for all future deployments.
6.  **Create a new deployment** using `akash/deploy-sample.yml` as a template. The Akash Stack Definition Language (SDL)
7.  Once you have created your deployment, you will start to receive bids. You can view these in the tool.
8.  Chose a bid and **Create a lease**, then **Send manifest**.
9.  At this point, the tool will show you your **Web URIs** which you can use to access your application.
10. Update [application/frontend/.env.production](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/application/frontend/.env.production) with the **Web URIs**.

### Step 4 - Deploy front-end to Skynet

Deployment of the front-end to Skynet is **handled automatically** in this repository, using **GitHub Actions**. When any update to the `application/frontend/` directory is pushed to the _master_ branch, the Action workflow will be run automatically by GitHub. This [workflow](https://github.com/bcfus/unstoppable-stack/blob/master/.github/workflows/frontend.yml) tests, builds, and deploys the static files to **Skynet**.

This GitHub workflow is based on the excellent [write-up by Karol Wypchło ](https://blog.sia.tech/automated-deployments-on-skynet-28d2f32f6ca1)and uses his pre-built Skynet deploy Action.

The result of this GitHub Action is a **Skynet registry entry** that provides a constant point of reference for your DNS record. The **Skylink** itself changes with each deployment to Skynet and would require you to constantly update your DNS record if referencing it directly.

### Step 5 - Configure Handshake domain

**Once your GitHub action completes**, in the Action log in GitHub under the _Deploy to Skynet_ step, you will see a link to `https://siasky.net/skynet/registry` with parameters in the URL for `publickey` and `datakey`.

You now need to copy those param values and create your `skyns://` URL in the format `skyns:///`. The registry link will remain constant in the future, so this is a one-time manual step.

If using **Namebase**, you can now configure your Handshake domain to point to your Skynet hosted frontend by adding a TXT record under the _Blockchain DNS Records_ section on your domain manage page. The value of this record is the `skyns:///` URL that you just generated above.

This **initial DNS configuration can take up to \~6 hours to be synced**. For all future code changes pushed to the _master_ branch, the _Deploy to Skynet_ Action will automatically update your Skynet Registry data and you should see the changes reflected very quickly.

**Once the DNS change takes effect**, your site will be accessible at `https://.hns.siasky.net`. For example, the demo application for this guide is accessible [here](https://unstoppable-stack.hns.siasky.net).

### Step 6 - Setup HTTPS URL for API

Although you can now make requests directly to your Akash URL over HTTP successfully, if you attempt to make these requests from your frontend that is being served over HTTPS, your API call will be blocked due to **Mixed Content**.

It is likely possible to enabled an HTTPS connection just using Akash deployment configuration but I was unable to find any documentation on this functionality.

The approach used in this guide is to sign up a free [Cloudflare](https://cloudflare.com) account and set up their **flexible** SSL/TLS encryption mode on a secondary (non-Handshake) domain in order to provide an HTTPS entrypoint that proxies requests to the Akash API server.

Support for HTTPS with Akash is something that I expect to explore further.

### Step 7 - Setup Database Redundancy

### Backend Redundant Postgresql infrastructure

The backend runs on [Akash](https://akash.network). Take a moment to review the Akash [config](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/akash/deploy-sample.yml). The backend stores the database on Akash. Currently, Akash does not have a persistent storage solution. This solution provides the capability to perform regular backups and database restoration via [Skynet](https://siasky.net). This reference architecture provides the following capability:

- Provide a redundant Postgresql configuration. **pg-0** is replicated to **pg-1**
- `pg-0` - the postgres master starts up. When it first starts up, it will download an encrypted db backup from Skynet.
- `pg-0` - decrypts the backup and loads into the database.
- `pg-1` - the postgres standby starts up. and syncs with `pg-0`.
- `pgpool` container starts up and connects to both `pg-0` and `pg-1` and automatically determines which one is master.
- `web` container starts up and connects the the **db cluster** via pgpool.
- If `pg-1` or `pg-0` goes down, **pgpool** will automatically re-route to the one that is active.
- If the entire cluster goes down, the cluster can be re-deployed to Akash. It will then start up from the last backup.

#### Implementation Notes

- The postgres Docker image will execute any .sh, load and .sql, .sql.gz file in /docker-entrypoint-initdb.d
- Note that when testing this locally with Docker there are no volumes. This is by design. Everything persistent should be uploaded to the Skynet.
- The `pg-0` image initially loads [pg-0/dbout.sh](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/pg-0/dbout.sh) before the PG cluster is started. It reads in the following env vars: `BACKUP_SYKNET_URL` and `BACKUP_PASS`. The encrypted zip file is retrieved from Skynet and decrypts it with `BACKUP_PASS`. Finally, the DB backup is loaded into the PG cluster.
- `BACKUP_SKYNET_URL` is used to retrieve the latest backup.

#### Architecture

Based off the [Bitnami pgpool project](https://github.com/bitnami/bitnami-docker-pgpool/), this approach sets up three containers. **pg-0** as a postgresql master, **pg-1** as a postgresql secondary ( running as a hot standby), and **pg-pool** will determine which postgres container to connect to.

#### Testing Postgresql cluster in a test environment

```
# run the backend
$docker-compose up -d
# run the front end
$ cd application/frontend/ && npm install && npm start
# Connect to the browser at http://localhost:3000
```

#### Shut down **pg-0** container

```
$ docker-compose stop pg-0
## verify that things are working as planned
# Connect to the browser at http://localhost:3000
# Should see all data still there. Try adding values
```

### Step 8 - Setup database backups

#### Backup your data locally

To retrieve a live encrypted backup of the data, you can run the following command against the API:

```
# For testing locally with docker-compose
curl -v http://localhost/getsnapshot > dbout.zip
# For testing against AKASH deployment
# Obtain $AkashHost and $AkashPort from akash deployment (Consult Akash [documentation](https://akash.network/docs/guides/deploy) on how to obtain this)
curl -v http://$AkashHost/getsnapshot:$AkashPort > dbout.zip
#
# Backup against live demo
#
curl https://unstoppablestack.coffeeroaster.me/getsnapshot > dbout.zip
```

Make sure to update the **`$BACKUP_PASS`** env variable in docker-compose.yml, akash/deploy-sample.yml. You will use the password to decrypt the zip file. You can use **`$BACKUP_PASS`** env var in [akash/deploy-sample.yml](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/akash/deploy-sample.yml) to decrypt and examine the backup.

#### Upload local backup to Skynet

Upload the backup to Skynet with [skynet-cli](https://github.com/vbstreetz/skynet-cli) and store URL as **BACKUP_SKYNET_URL**

```
$ npm install -g skynet-cli
## send it to Skynet!
$ skynet-cli dbout.zip
## Take special note of the URL. This value will be used as **BACKUP_SKYNET_URL**
```

#### Tell Unstoppable Stack to load it up next time.

Update [docker-compose.yml](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/docker-compose.yml) (for testing locally) and [akash/deploy-sample.yml](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/akash/deploy-sample.yml) environment variables section and update **BACKUP_SKYNET_URL** with the value from the previous step.

**Shutdown and destroy your entire deployment**

```
# For test environment
$docker-compose down -v
# For Akash deployment
(Consult Akash [documentation](https://akash.network/docs/guides/deploy)
```

**Start it back up (development env)**

```
$docker-compose up -d
# run the front end
$ cd application/frontend/ && npm start
# Connect to the browser at http://localhost:3000
```

You should now see the values from the database that you backed up.

**Start it back up (production env)**

- Update [akash/deploy-sample.yml](https://github.com/coffeeroaster/unstoppable-web2.0/blob/main/akash/deploy-sample.yml) with updated ENV variables (namely the **BACKUP_SKYNET_URL** )
- Redeploy backend to Akash following `step 3` in this guide.
- If using Handshake (Step 5) Use the same Front END URL.

### Database replication next steps

- Investigate [NuCypher](https://nucypher.com) for better key management
- Look into the [SkyNet registry](https://siasky.net/docs/?javascript--node#setting-data-on-the-registry) for a simpler way to provide backup / restoration. Right now, each provision to Akash requires updating a new SkyLink URL. Using a Skylink Registry will allow the container to use a consistent `skyns URL` to retrieve the latest backup for ease of use.

### Run demo application locally

To run the application locally, you can follow the steps below.

1.  Stand up FastAPI and PostgreSQL **backend**

    ```
    cd backend
    docker-compose up --build
    ```

2.  In a separate terminal, stand up the React **frontend**

    ```
    cd frontend
    npm install
    npm run start
    ```

You can now **visit** [**http://localhost:3000**](http://localhost:3000) in the browser to **access the UI**. For testing the **API**, requests can be made to port 80, **Example**: `GET http://localhost:80/api/v1/notes`

### Sources and resources

**Akash**

- [Akash deployment documentation](https://akash.network/docs/guides/deploy)
- [SDL examples](https://github.com/akash-network/awesome-akash)
- [In-depth walkthrough guide](https://medium.com/coinmonks/guide-to-deploying-applications-to-akash-decloud-b35dc97e5ca4)
- [Akash Discord](https://discord.com/invite/DxftX67)

**Skynet**

- [Detailed Skynet deployment guide](https://blog.sia.tech/automated-deployments-on-skynet-28d2f32f6ca1)
