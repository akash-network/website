---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "Helium Validator"
linkTitle: "Helium Validator"
---

**Repository:** [**tombeynon/helium-on-akash**](https://github.com/tombeynon/helium-on-akash)\*\*\*\*

This repository includes everything needed to run a Helium validator on Akash. The container will connect to an S3 bucket to upload/download the swarm_key on boot.

The main files to understand are:

- `Dockerfile` - Installs AWS CLI on top of the [Helium validator docker image](https://quay.io/team-helium/validator) and sets boot.sh to run whenever the container starts.
- `boot.sh` - Downloads the swarm_key from S3 (if it exists), starts the miner and prints the address. It then uploads the swarm_key if it didn't download it earlier (new miner).
- `deploy.yml` - Example/working Akash deployment configuration. This is setup to use my image which may or may not be up to date. See below to create and host your own image if needed.

## Requirements

- [S3 bucket and IAM user](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-walkthroughs-managing-access-example1.html#grant-permissions-to-user-in-your-account-step1), with access key and secret.
- [Dockerhub account](https://hub.docker.com/signup) to host your own container image, if required.
- [Testnet wallet](https://docs.helium.com/mine-hnt/validators/validator-deployment-guide#create-testnet-wallet) to stake to your validator and claim it.

## Run the container locally

```
docker run --publish 2154:2154/tcp -e AWS_ACCESS_KEY=mykey -e AWS_SECRET_KEY=mysecret -e S3_KEY_PATH=mybucket/miner1/swarm_key tombeynon/helium-on-akash
```

## Deployment

You can deploy the validator on Akash using the example deploy.yml. Note that to use your own image which you can keep up to date, check the next section.

Either clone this repository or create a `deploy.yml` file. Enter your S3 bucket and IAM credentials into the `env` section. If you have a swarm_key already, make sure this is uploaded to S3 in the same location as S3_KEY_PATH.

Deploy as [per the docs](https://akash.network/docs/guides/deploy) or using a [deploy UI](https://github.com/tombeynon/akash-deploy).

Once the container is deployed, check the logs to see your address once the server starts (can take a while). If your swarm_key didn't exist in S3 before, the new one should have been uploaded. Subsequent deploys using the same S3 details will now use the same swarm_key.

## Build your own image

There are a couple of reasons to run your own image:

- Akash requires a version-specific tag to update the container image. If you use e.g. `latest`, updating the deployment won't pull the latest version of the tag. Helium currently publishes their docker images using the `latest` format only, so to tag the image as required we need to publish our own.
- Testnet moves quickly and I might not keep my image up to date.

Create a dockerhub account first, then build the image as follows:

```
git clone git@github.com:tombeynon/helium-on-akash.git
cd helium-on-akash
docker build . -t mydockerhubuser/helium-on-akash:v0.0.1
docker push mydockerhubuser/helium-on-akash:v0.0.1
```

You can then change the `image` value in deploy.yml to your repository and version above.

To update the miner on Akash, run the above to build it with the latest Helium image, incrementing the version number. Then close and re-deploy on Akash using the new version number. This process could be scripted easily.

## Caveats

- Updating the container isn't ideal, this could be improved in the future.
- Currently, only the swarm_key is synced to S3, meaning the entire blockchain needs to be downloaded each time you run the miner. It takes about 30 minutes currently with the suggested deploy.yml.
- There is a delay between 'Starting miner...' and the logs for the miner showing. The miner is running during this time, just the logs don't show. They appear after 5-10 minutes.
- The miner currently shows as a relay on the Helium explorer, this might be possible to improve?

## References

- [https://docs.helium.com/mine-hnt/validators/validator-deployment-guide](https://docs.helium.com/mine-hnt/validators/validator-deployment-guide)
- [https://explorer.helium.wtf/validators](https://explorer.helium.wtf/validators)
- [https://testnet-api.helium.wtf/v1/validators/](https://testnet-api.helium.wtf/v1/validators/%7B%7BADDRESS%7D%7D)
