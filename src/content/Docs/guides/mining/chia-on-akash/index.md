---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "Chia on Akash"
linkTitle: "Chia on Akash"
---

## Why use Akash?

Welcome [Chia](https://www.chia.net/) community! We are excited to announce support for Chia on the [Akash](https://akash.network/) network! You can now run nodes, plotting, and farming on our marketplace of compute. Below you will find details on how to configure your deployment for different use cases. Akash is a part of the [Cosmos](https://cosmos.network/) ecosystem of blockchains.

## Summer Sale

![](../../../assets/SummerSaleforChiaPlots5.png)

### Providers

For the following providers who are participating in the sale, expect to see these prices in Akash Console! Each provider has been benchmarked and tested to create a $0.10/plot.

| On-Sale Providers      | BladeBit Price / Month  | MadMax Price / Month   |
| ---------------------- | ----------------------- | ---------------------- |
| bigtractorplotting.com | $556 \| 8 Minute Plots  | $59 \| 71 Minute Plots |
| xch.computer           | $363 \| 12 Minute Plots | $44 \| 95 Minute Plots |
| akash.world            | $174 \| 24 Minute Plots | $42 \| 99 Minute Plots |

### Required SDL

To make sure you get the sale price from the providers, please Copy and Paste the SDL into [Akash Console](https://console.akash.network/sdl-builder) :

[BladeBit Summer Sale SDL](#bladebit-ram-plotting)

[MadMax Summer Sale SDL](#madmax-disk-plotting)

Please wait up to 60 seconds to see bids from all the providers.

## Windows/Linux/Mac Users

1. Install [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en) wallet as a browser plugin
2. Go to [Akash Console](https://console.akash.network/) and import your AKT wallet address from Keplr.
3. [Fund your wallet](/token/#buying-akt)

For additional help we recommend you [follow our full deployment guide](/docs/deployments/overview/) in parallel with this guide.

## How does this work?

Akash uses its blockchain to manage your container deployment and accounting. To deploy on Akash you will need to fund your wallet with at least 10 AKT. Each time you create a deployment, 0.5 AKT will be used for escrow and to fund the deployment. If the deployment is canceled, the balance of the escrow is returned to you. You can spin up deployments without worrying about any long term contracts and you can cancel anytime.

## Plotting Demos

<iframe width="100%" height="315" src="https://www.youtube.com/embed/xCNoXI6_Tf8?si=JW0VHidgz8yJ6ccl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

@DigitalSpaceport


<iframe width="100%" height="315" src="https://www.youtube.com/embed/HLhrSeDemBI?si=yHsgLy-FbDlV2gly" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Jonmichael Hands - VP of Storage Business Development at Chia

<iframe width="100%" height="315" src="https://www.youtube.com/embed/RY2cjiizk5k?si=pm9T9Wfb4h6DchTv&amp;start=1434" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Andrew Mello - Head of Mining at Akash


## Default wallet

Akash uses [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en) as the desktop wallet. Advanced users can follow the [CLI instruction](/docs/deployments/akash-cli/installation/)s.

Once you have set up your Keplr wallet and imported the address to Akash Console you are ready to create your first deployment. Follow the instructions in Akash Console to create a certificate, then click on _Create Deployment_.

## Quickest way to get more AKT

To fund your deployment you will need AKT in your account. The fastest way to do that is in one of the following two ways.

### Buy on an Exchange

1. Install [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en)
2. Buy AKT on an [exchange](https://www.coingecko.com/en/coins/akash-network#markets)
3. Withdraw your AKT to your Keplr wallet

### Swap from ATOM to AKT

1. Install [Keplr](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en)
2. Send 10 ATOM to your new Cosmos wallet address inside Keplr (this address will start with cosmos)
3. Go to [Osmosis Assets](https://app.osmosis.zone/assets) > next to Cosmos Hub - ATOM click on Deposit. This step will deposit ATOM from your Keplr wallet onto the Osmosis platform. Press Connect Wallet to connect your Keplr wallet to Osmosis.
4. Now go back to [Osmosis Homepage](https://app.osmosis.zone/?from=ATOM&to=AKT) and ensure ATOM > AKT is selected to complete the swap. This step swaps your ATOM you deposited onto the Osmosis platform into any other supported coin.
5. Return to the [Osmosis Assets](https://app.osmosis.zone/assets) page to withdraw your AKT to your Keplr wallet. This step withdraws AKT from the Osmosis platform back into your Keplr wallet. You can now send AKT to Akash Console.

Have more questions? Find our team in [Discord](https://discord.gg/TQWWZYCb) and [Telegram](https://t.me/AkashNW).

## MadMax Disk Plotting

**Recommended MadMax CPU Settings for 1Gbps Connections:**\
\*\*\*\*\~75 minute plots = 8 cpu / 815Gi Storage

```yaml
---
version: "2.0"

services:
  chia:
    image: cryptoandcoffee/akash-chia:262
    expose:
      - port: 8080
        as: 80
        proto: tcp
        to:
          - global: true
    env:
      #############################REQUIRED##############################
      - VERSION=1.5.1
      #Always check https://github.com/Chia-Network/chia-blockchain/releases
      - CONTRACT=
      - FARMERKEY=
      - PLOTTER=madmax
      #Choose your plotter software - madmax, bladebit, bladebit-disk
      - FINAL_LOCATION=local
      #Set to "local" to access finished plots through web interface.
      #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
      - CPU_UNITS=8
      - MEMORY_UNITS=6Gi
      - STORAGE_UNITS=815Gi
      #Must match CPU/Memory/Storage units defined in resources.
    #############################OPTIONAL##############################
    #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
    #- REMOTE_HOST=changeme.com #SSH upload host
    #- REMOTE_LOCATION=changeme #SSH upload location like /root/plots
    #- REMOTE_PORT=22 #SSH upload port
    #- REMOTE_USER=changeme #SSH upload user
    #- REMOTE_PASS=changme #SSH upload password
    #- UPLOAD_BACKGROUND=true
    #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
    #- RAMCACHE=32G
    #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
    #- RCLONE=false
    #When true must also update JSON_RCLONE and add any destination in same format.
    #- TOTAL_UPLOADS=1000
    #Set the total number of parallel uploads allowed to an rclone destination
    #- ENDPOINT_LOCATION=
    #Only used for RCLONE=true
    #- ENDPOINT_DIR=
    #Only used for RCLONE=true
    #- JSON_RCLONE=
    #  [storj]\n
    #  type = storj\n
    #  api_key = x\n
    #  passphrase = x\n
    #  satellite_address = x@x:7777\n
    #  access_grant = replaceme
    #Example of STORJ config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
profiles:
  compute:
    chia:
      resources:
        cpu:
          units: 8
        memory:
          size: 6Gi
        storage:
          size: 815Gi
  placement:
    akash:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
          - "akash18qa2a2ltfyvkyj0ggj3hkvuj6twzyumuaru9s4"
      attributes:
        chia-plotting: "true"
      pricing:
        chia:
          denom: uakt
          amount: 100000
deployment:
  chia:
    akash:
      profile: chia
      count: 1
```

## Bladebit RAM Plotting

Plotting with Bladebit has never been easier! There are a few things to note before you start using Bladebit instead of Madmax. Bladebit is so fast it can create plots faster than most home/consumer internet connections (1Gbps) can download them. To compensate for this we can adjust the Bladebit plotting speed by changing the CPU count of the deployment.\
\
**Recommended Bladebit CPU Settings for 1Gbps Connections:**\
\*\*\*\*\~20 minute plots = 8 cpu / 915Gi Storage\
\~15 minute plots = 16 cpu / 915Gi Storage\
\~10 minute plots = 32 cpu / 2Ti Storage\
\
**Recommended Bladebit CPU Settings for Multi-Gigabit Connections:**\
\*\*\*\*\~7 minutes plots = 64 CPU / 2Ti Storage\
\~4 minutes plots = 100 cpu / 4Ti Storage\
\~3 minutes plots = 186 cpu / 6Ti Storage

\
For a standard 1Gbps connection use the settings below, otherwise adjust the CPU units to match the plot time you want to achieve.

```yaml
---
version: "2.0"

services:
  chia:
    image: cryptoandcoffee/akash-chia:262
    expose:
      - port: 8080
        as: 80
        proto: tcp
        to:
          - global: true
    env:
      #############################REQUIRED##############################
      - VERSION=1.5.1
      #Always check https://github.com/Chia-Network/chia-blockchain/releases
      - CONTRACT=
      - FARMERKEY=
      - PLOTTER=bladebit
      #Choose your plotter software - madmax, bladebit, bladebit-disk
      - FINAL_LOCATION=local
      #Set to "local" to access finished plots through web interface.
      #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
      - CPU_UNITS=32
      - MEMORY_UNITS=420Gi
      - STORAGE_UNITS=1200Gi
      #Must match CPU/Memory/Storage units defined in resources.
    #############################OPTIONAL##############################
    #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
    #- REMOTE_HOST=changeme.com #SSH upload host
    #- REMOTE_LOCATION=changeme #SSH upload location like /root/plots
    #- REMOTE_PORT=22 #SSH upload port
    #- REMOTE_USER=changeme #SSH upload user
    #- REMOTE_PASS=changme #SSH upload password
    #- UPLOAD_BACKGROUND=true
    #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
    #- RAMCACHE=32G
    #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
    #- RCLONE=false
    #When true must also update JSON_RCLONE and add any destination in same format.
    #- TOTAL_UPLOADS=1000
    #Set the total number of parallel uploads allowed to an rclone destination
    #- ENDPOINT_LOCATION=
    #Only used for RCLONE=true
    #- ENDPOINT_DIR=
    #Only used for RCLONE=true
    #- JSON_RCLONE=
    #  [storj]\n
    #  type = storj\n
    #  api_key = x\n
    #  passphrase = x\n
    #  satellite_address = x@x:7777\n
    #  access_grant = replaceme
    #Example of STORJ config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
profiles:
  compute:
    chia:
      resources:
        cpu:
          units: 32
        memory:
          size: 420Gi
        storage:
          size: 1200Gi
  placement:
    akash:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
          - "akash18qa2a2ltfyvkyj0ggj3hkvuj6twzyumuaru9s4"
      attributes:
        chia-plotting: "true"
      pricing:
        chia:
          denom: uakt
          amount: 100000
deployment:
  chia:
    akash:
      profile: chia
      count: 1
```

## Downloading plots

To access the Chia Plot Manager, click on the \`Uri\` link on the deployment detail page.\
To download plots, click an invididual plot in the Chia Plot Manager and click on Download/Open.

![Chia Plot Manager](<../../../assets/image (7).png>)

\*Once your download has finished - Delete the plot from the container - to make room for new plots! Plots will continue to be created as long as there is enough free space available in the container (Max 32Tb) and the deployment is fully funded.

## Uploading plots

If you want to upload plots created on Akash directly to a remote destination such as your farm or a storage provider, you have 2 main options.

### SSH

Upload your plots to any SSH destination by modifying the `env:`

```yaml
env:
  #############################REQUIRED##############################
  - VERSION=1.5.1
  #Always check https://github.com/Chia-Network/chia-blockchain/releases
  - CONTRACT=
  - FARMERKEY=
  - PLOTTER=bladebit
  #Choose your plotter software - madmax, bladebit, bladebit-disk
  - FINAL_LOCATION=local
  #Set to "local" to access finished plots through web interface.
  #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
  - CPU_UNITS=32
  - MEMORY_UNITS=420Gi
  - STORAGE_UNITS=1200Gi
  #Must match CPU/Memory/Storage units defined in resources.
  #############################OPTIONAL##############################
  #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
  - REMOTE_HOST=changeme.com #SSH upload host
  - REMOTE_LOCATION=changeme #SSH upload location like /root/plots
  - REMOTE_PORT=22 #SSH upload port
  - REMOTE_USER=changeme #SSH upload user
  - REMOTE_PASS=changme #SSH upload password
  - UPLOAD_BACKGROUND=true
  #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
  #- RAMCACHE=32G
  #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
  #- RCLONE=false
  #When true must also update JSON_RCLONE and add any destination in same format.
  #- TOTAL_UPLOADS=1000
  #Set the total number of parallel uploads allowed to an rclone destination
  #- ENDPOINT_LOCATION=
  #Only used for RCLONE=true
  #- ENDPOINT_DIR=
  #Only used for RCLONE=true
  #- JSON_RCLONE=
  #  [storj]\n
  #  type = storj\n
  #  api_key = x\n
  #  passphrase = x\n
  #  satellite_address = x@x:7777\n
  #  access_grant = replaceme
  #Example of STORJ config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
```

### Rclone

Upload your plots to any [Rclone](https://rclone.org/) endpoint! You need to first create a connection to your endpoint on a standard client so that you have a valid configuration in `~/.config/rclone/rclone.conf` You need to modify this block and add to the end of each line to make it valid for Akash. Below you can find examples of how the `env:` should look.

### Rclone to Dropbox

Change the `replaceme` values below to match your client settings

```yaml
env:
  #############################REQUIRED##############################
  - VERSION=1.5.1
  #Always check https://github.com/Chia-Network/chia-blockchain/releases
  - CONTRACT=
  - FARMERKEY=
  - PLOTTER=bladebit
  #Choose your plotter software - madmax, bladebit, bladebit-disk
  - FINAL_LOCATION=upload
  #Set to "local" to access finished plots through web interface.
  #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
  - CPU_UNITS=42
  - MEMORY_UNITS=430Gi
  - STORAGE_UNITS=1200Gi
  #Must match CPU/Memory/Storage units defined in resources.
  #############################OPTIONAL##############################
  #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
  #- REMOTE_HOST=changeme.com #SSH upload host
  #- REMOTE_LOCATION=changeme #SSH upload location like /root/plots
  #- REMOTE_PORT=22 #SSH upload port
  #- REMOTE_USER=changeme #SSH upload user
  #- REMOTE_PASS=changme #SSH upload password
  #- UPLOAD_BACKGROUND=true
  #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
  #- RAMCACHE=32G
  #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
  - RCLONE=true
  #When true must also update JSON_RCLONE and add any destination in same format.
  - TOTAL_UPLOADS=8
  #Set the total number of parallel uploads allowed to an Rclone destination
  - ENDPOINT_LOCATION=dropbox
  #Name of Rclone endpoint
  - ENDPOINT_DIR=replaceme
    #Upload directory on Dropbox
  - JSON_RCLONE=
    [dropbox]\n
    type = dropbox\n
    client_id = replaceme\n
    client_secret = replaceme\n
    token = {"access_token":"replaceme","expiry":"replaceme"}
  #Example of Dropbox config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
```

### Rclone to Google Drive

Change the `replaceme` values below to match your client settings

```yaml
env:
  #############################REQUIRED##############################
  - VERSION=1.5.1
  #Always check https://github.com/Chia-Network/chia-blockchain/releases
  - CONTRACT=
  - FARMERKEY=
  - PLOTTER=bladebit
  #Choose your plotter software - madmax, bladebit, bladebit-disk
  - FINAL_LOCATION=upload
  #Set to "local" to access finished plots through web interface.
  #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
  - CPU_UNITS=42
  - MEMORY_UNITS=430Gi
  - STORAGE_UNITS=1200Gi
  #Must match CPU/Memory/Storage units defined in resources.
  #############################OPTIONAL##############################
  #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
  #- REMOTE_HOST=changeme.com #SSH upload host
  #- REMOTE_LOCATION=changeme #SSH upload location like /root/plots
  #- REMOTE_PORT=22 #SSH upload port
  #- REMOTE_USER=changeme #SSH upload user
  #- REMOTE_PASS=changme #SSH upload password
  #- UPLOAD_BACKGROUND=true
  #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
  #- RAMCACHE=32G
  #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
  - RCLONE=true
  #When true must also update JSON_RCLONE and add any destination in same format.
  - TOTAL_UPLOADS=8
  #Set the total number of parallel uploads allowed to an Rclone destination
  - ENDPOINT_LOCATION=google
  #Name of Rclone endpoint
  - ENDPOINT_DIR=replaceme
  #Upload directory on Google
  - JSON_RCLONE=
    [google]\n
    type = drive\n
    scope = drive\n
    token = {"access_token":"replaceme","token_type":"Bearer","refresh_token":"replaceme","expiry":"replaceme"}\n
    root_folder_id = replaceme
  #Example of Google config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
```

### Rclone to Storj

Change the `replaceme` values below to match your client settings

```yaml
env:
  #############################REQUIRED##############################
  - VERSION=1.5.1
  #Always check https://github.com/Chia-Network/chia-blockchain/releases
  - CONTRACT=
  - FARMERKEY=
  - PLOTTER=bladebit
  #Choose your plotter software - madmax, bladebit, bladebit-disk
  - FINAL_LOCATION=upload
  #Set to "local" to access finished plots through web interface.
  #Set to "upload" and finished plots will be uploaded to a SSH destination like user@ip:/home/user/plots
  - CPU_UNITS=42
  - MEMORY_UNITS=430Gi
  - STORAGE_UNITS=1200Gi
  #Must match CPU/Memory/Storage units defined in resources.
  #############################OPTIONAL##############################
  #Uncomment the variables below when set FINAL_LOCATION=upload to enable remote uploading
  #- REMOTE_HOST=changeme.com #SSH upload host
  #- REMOTE_LOCATION=changeme #SSH upload location like /root/plots
  #- REMOTE_PORT=22 #SSH upload port
  #- REMOTE_USER=changeme #SSH upload user
  #- REMOTE_PASS=changme #SSH upload password
  #- UPLOAD_BACKGROUND=true
  #Change to true to enable multiple background uploading of plots, this is the best option to use use 100% of your bandwidth.
  #- RAMCACHE=32G
  #Used only for PLOTTER=bladebit-disk, you must increase the memory resources requested below with this additional cache size.
  - RCLONE=true
  #When true must also update JSON_RCLONE and add any destination in same format.
  - TOTAL_UPLOADS=8
  #Set the total number of parallel uploads allowed to an Rclone destination
  - ENDPOINT_LOCATION=storj
  #Name of Rclone endpoint
  - ENDPOINT_DIR=replaceme
  #Upload directory on Storj
  - JSON_RCLONE=
    [storj]\n
    type = storj\n
    api_key = replaceme\n
    passphrase = replaceme\n
    satellite_address = replaceme\n
    access_grant = replaceme
  #Example of Storj config for RCLONE=true.  If you want to use your own endpoint please escape each line with a backslash n, like in the example.
```

### Rclone to multiple endpoints

\* You must use cryptoandcoffee/akash-chia:246 or later!\
\
It's possible to configure multiple endpoints. Add the following to your variables and your endpoints will be shuffled and a random endpoint will be chosen for the upload destination.

```
      - SHUFFLE_RCLONE_ENDPOINT=true
      - JSON_RCLONE=
        [google]\n
        type = drive\n
        scope = drive\n
        token = {"access_token":"replaceme","token_type":"Bearer","refresh_token":"replaceme","expiry":"replaceme"}\n
        root_folder_id = replaceme\n
        [dropbox]\n
        type = dropbox\n
        client_id = replaceme\n
        client_secret = replaceme\n
        token = {"access_token":"replaceme","expiry":"replaceme"}\n
        [storj]\n
        type = storj\n
        api_key = replaceme\n
        passphrase = replaceme\n
        satellite_address = replaceme\n
        access_grant = replaceme
```

In this example the finished plots will be uploaded to Google/Dropbox/Storj at random. Please ensure your ENDPOINT_DIR (folder) exists on all the endpoints.

### Rclone to multiple folders

\* You must use cryptoandcoffee/akash-chia:246 or later!\
\
It's possible to configure multiple folders. Add the following to your variables and your folders will be shuffled and a random folder will be chosen for the upload destination.

```
      - SHUFFLE_RCLONE_DIR=true
      - ENDPOINT_DIR="plotz-1 plotz-2 plotz-3 plotz-4 plotz-5"
```

In this example the finished plots will be uploaded to a single ENDPOINT_LOCATION but the folder will be randomly chosen from your list. Use a single space to upload to multiple folders.

## Speed up downloads

Windows/Mac/Linux : Use a download manager like [DownThemAll](https://www.downthemall.net/) on Chrome/Firefox/Opera\
Linux/CLI: Use [aria2](https://aria2.github.io/) : `apt-get install aria2`

```
aria2c -c -s 16 -x 16 -k 64M -j 1 $plot_download_url
```

## Waiting for bids...

If Akash Console hangs on "Waiting for Bids" that could be an indication that all providers are full at the moment. The recommended fix is to reduce the requested storage amount from `1Ti` to something more reasonable like `768Gi`

```
profiles:
  compute:
    chia:
      resources:
        cpu:
          units: 8.0
        memory:
          size: 6Gi
#Chia blockchain is currently ~40gb as of November 2021 / if you are plotting please use at least 256Gi
        storage:
          size: 768Gi
```

## How to speed up plotting?

### Use only providers with the _chia-plotting_ attribute

To limit the selection of providers to those with fast storage that meets the requirements for plotting, we recommend you keep the _chia-plotting_ attribute to the placement section of deploy.yaml file.

```
placement:
  akash:
    attributes:
      chia-plotting: "true"
    pricing:
      chia:
        denom: uakt
        amount: 100000
```

### Create more deployments

Easily scale your total plotting output by creating a new deployment. Click the three dots next to the Add Funds button on the deployment details page and click Redeploy.
