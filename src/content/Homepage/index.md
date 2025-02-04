---
advert: 
  title: NVIDIA Blackwell is coming to Akash. Join the waitlist.
  link: "/nvidia-blackwell-gpus"

# hero section content
heroSection:
  title: The World's<br class="md:hidden" /> Premier <br class="md:hidden"/> Decentralized<br/> Compute <br class="md:hidden"/> Marketplace
  description: "Akash is an open network that lets users buy and sell computing resources securely and efficiently.<br/>Purpose-built for public utility."
  cards: 
    - title: "Explore network resources and pricing"
      description: "Browse a wide range of cloud resources and live network pricing"
      buttons:
        - label: "Explore pricing"
          link: "/about/pricing/custom/"
          type: secondary
        - label: "View GPU availability"
          link: "/pricing/gpus"
          type: primary

    - title: "Provide compute and earn"
      description: "Become an Akash Provider by offering your hardware on the network and earn when users deploy"
      buttons:
        - label: "Become a Provider"
          link: "/providers"
          type: secondary

    - title: "Deploy with Akash Console"
      description: "Get started with the network's user-friendly deployment console"
      buttons:
        - label: "Deploy now"
          link: "/deploy"
          type: secondary

# infrastructure section content
infrastructureSection:
  title: "Akash - The Decentralized Infrastructure Supercloud"
  cards:
    - title: "Infrastructure as<br/> Code"
      image: "./assets/infrastructure/code.svg"
      description: "Akash's orchestration layer, fueled by SDL, enables intricate deployments across regions, providers, with resource control and pricing decisions."
    - title: "Kubernetes<br/> Powered"
      image: "./assets/infrastructure/kubernetes.svg"
      description: "Built on Kubernetes, Akash ensures a secure, tested, and reliable platform for hosting applications."
    - title: "Persistent<br/> Storage"
      image: "./assets/infrastructure/storage.svg"
      description: "Akash offers limitless storage, safeguarding data even post-restart, an ideal feature for data-intensive apps."
    - title: "Dedicated<br/> IP Leasing"
      image: "./assets/infrastructure/ip.svg"
      description: "By leasing a dedicated IP address, Akash permits port assignment, directing traffic – especially beneficial for DNS,<br class='hidden md:block'/> web servers, etc."
 
    - title: "Permissionless"
      image: "./assets/infrastructure/censorship.svg"
      description: "Akash democratizes secure, censorship-resistant app deployment, open to all innovators."

    - title: "Peer-to-Peer<br/> and Private"
      image: "./assets/infrastructure/peer.svg" 
      description: "Peer-to-peer communication guarantees data privacy, payment transparency, and immunity from central control, reinforcing dependability."

# feature section content
featureSection:
  cards:
    - id: 1
      title: "Powerful, flexible, and <br/> designed for what's next"
      description:  Create your own sovereign compute experience with the Akash Supercloud. Seamlessly scale and access a global array of services while controlling your budget with the Akash 'Reverse Auction' system. Access compute at prices up to 85% lower than hyperscale cloud providers, customized to your preferences.
      image: "./assets/feature/feature-1.webp"
    - id: 2
      title: "Pioneering Layer One Protocol <br/> built on Cosmos SDK"
      description: "Akash is secured by AKT, the network's utility token. It is also the first blockchain to achieve IBC communication with Cosmos Hub, enabling seamless connections to other IBC-compatible blockchains.
      <br/> <br/>
      By design, Akash prioritizes user privacy and security, allowing anonymous application deployment and safeguarding user identity."
      image: "./assets/feature/feature-2.webp"
   


getStartedSection:
  cards:
    - title: "Deploy an application"
      image:
        link: "./assets/getting-started/one.svg"
      darkImage:
        link: "./assets/getting-started/one-dark.svg"
      description: "Get started with Akash Console, the user-friendly tool for deploying applications effortlessly on the Akash network."
      link: "/deploy"
      linkIcon: false
      linkLabel: "Get Started"
    - title: "Become a Provider"
      image:
        link: "./assets/getting-started/two.svg"
      description: "Monetize your cloud resources on the open-source Akash marketplace."
      link: "/providers"
      linkIcon: false
      linkLabel: "Get Started"
      darkImage:
        link: "./assets/getting-started/two-dark.svg"
    - title: "Akash Documentation"
      image:
        link: "./assets/getting-started/three.svg"
      description: "For technical questions and network information, check out the Akash Docs."
      link: "/docs"
      linkIcon: true
      linkLabel: "View Docs"
      darkImage:
        link: "./assets/getting-started/three-dark.svg"

#  AiModelsAndApps section content  
aiModelsAndAppsSection:
  title: "What’s possible with Akash?"
  description: "Akash isn't just a cloud computing platform; it's a catalyst for innovation and limitless possibilities. Here, you'll discover the latest AI models, groundbreaking apps, and much more, all powered by the scalable and cost-effective Akash resources."
  subtitle1: "AI & ML"
  subtitle2: "Deployed on Akash"
  cards1:
    - title: "Akash Chat"
      image:  "./assets/tools/1.svg"
      description: "Mistral-7B-v0.2 Large Language Model (LLM) is a pretrained generative text model with 7 billion parameters by Mistral AI. This application is running on NVIDIA GPUs leased from the Akash Supercloud."
      link: "https://chat.akash.network/"

    - title: "AkashGen"
      image: "./assets/tools/2.png"
      description: "AkashGen is a high quality text-to-image model from Stability AI. This application is running on NVIDIA A100s leased from the Akash Supercloud, to achieve high-performing and cost-effective inference of 1024×1024 images."
      link: "https://gen.akash.network/"


    - title: "Ray cluster on Akash"
      image: "./assets/tools/3.png"
      description: "This post explores the difficulties of parallelizing and scaling AI/ML workloads. We present Ray, a leading open-source framework (used by top ML teams) for large-scale parallel computing and distributed training."
      link: "/blog/distributed-machine-learning-on-akash-network-with-ray/"

  cards2:
      
    - title: "Venice AI"
      image: "./assets/tools/venice.png"
      description: "Venice is the easy app for private, uncensored AI conversations and image generation. Try for free with no log-in needed."
      link : "https://venice.ai/home"
      darkImage : "./assets/tools/venice.png"   

    - title: "Brev.dev (Acq. by NVIDIA)"
      image: "./assets/tools/brev.png"
      description: "Brev.dev, known for its seamless setup of Jupyter notebooks for AI development, has integrated with Akash Network, enabling scalable, permissionless access to NVIDIA GPUs."
      link : "https://brev.dev/"
      darkImage : "./assets/tools/brev.png" 
     

    - title: "Nous Research"
      image: "./assets/tools/nous.png"
      description: "Leveraging the power of Akash's decentralized cloud, Nous Research successfully trained 'Nous Hermes 2,' an advanced AI model built on over 1,000,000 entries of GPT-4 data."
      link : "https://nousresearch.com/"
      darkImage : "./assets/tools/nous.png" 
     
  cards3:
    - image:  "./assets/tools/awesomeakash.svg"
      darkImage : "./assets/tools/awesomeakash.svg"
      description: "Tailored for Web3 users, offering a powerful platform to deploy applications on the Akash network with enhanced capabilities."
      logoTitle: Akash Console

      launchAppLink: 
        label: Launch App
        link: "https://console.akash.network/"

      docsLink: 
        label: Console Docs
        link: "/docs/getting-started/quickstart-guides/akash-console/"

    - image:  "./assets/tools/praetor.svg"
      description: "Praetor App makes it simple to become an Akash Network cloud provider. Use a streamlined UI to become a provider. "
      logoTitle: Praetor App

      launchAppLink: 
        label: Launch App
        link: "https://praetorapp.com/"

      docsLink: 
        label: Praetor Docs
        link: "https://docs.praetorapp.com/"

    - image:  "./assets/tools/awesomeakash.svg"
      description: " View collection of SDL deployment templates based on the Awesome Akash GitHub repository "
      logoTitle: Awesome Akash templates

      githubLink: 
        label: View on Github
        link: "https://github.com/akash-network/awesome-akash"



# CTA section content
testimonialsSection:
  title: Join the Community
  description: Akash is supported by a radically open community.<br/> As a free public service, the network source code is open-source and available to everyone.



  discordButton:
    label: Discord
    link: "https://discord.com/invite/akash"
    enable: true

  githubButton:
    label: Github
    link: "https://github.com/akash-network"
    enable: true

  testimonials:
    - userName: "@Solve_Care"
      useAvatar: "/useravatars/1.png"
      accountLink: "https://twitter.com/Solve_Care/status/1755951636844007848"
      testimonial: "“Care.Wallet is now yours for life. Akash Network decentralized compute helped achieve our goal to make every Care.Wallet a permanent #Web3 container, that no #AWS admin can shut down.”"
      companyName: "Solve.Care"

    - userName: "@_PradeepGoel"
      useAvatar: "/useravatars/1.png"
      accountLink: "https://twitter.com/_PradeepGoel/status/1755951930067816607"
      testimonial: "“Solve.Care is migrating Care.Nodes to @akashnet_
to reduce cost, scale faster, and get rid of #AWS.”"
      companyName: "Solve.Care"

    - userName: "@jesseeckel"
      useAvatar: "/useravatars/1.png"
      accountLink: "https://twitter.com/Jesseeckel/status/1741999730110959657"
      testimonial: “Pretty insane to see the progress @akashnet_ has been making. Mixtral 8x7B is supposed to be on par with GPT 3.5. Would be interesting to see how crypto could bootstrap and incentivize some of this development. Also open source AI + DePIN is something to keep an eye on.”
      companyName: "Youtube Creator"

    - userName: "@milesdeutscher"
      useAvatar: "/useravatars/1.png"
      testimonial: “You can deploy dapps, games or websites on the Akash network. The token $AKT is needed for deploying dapps, participating in governance voting, and for staking to secure the network.”
      companyName: "Crypto analyst"
      accountLink: "https://twitter.com/milesdeutscher/status/1592969864343265281"

    - userName: "@Daniel Halford"
      useAvatar: "/useravatars/2.png"
      testimonial: “Mind blowing experience with Akash so far, waking up every day and can’t stop digging this infrastructure.”
      companyName: "Akash Discord member"
      accountLink: "https://twitter.com/boz_menzalji/status/1334561062851551234"

    - userName: "@old_samster"
      useAvatar: "/useravatars/1.png"
      testimonial: “Akash offers developers the ability to build full-stack decentralized applications through key partnerships with other Web3 infrastructure projects, making it the premier Web3-native cloud platform.”
      companyName: "Research @Messaricrypto"
      accountLink: "https://twitter.com/Old_Samster/status/1534572016090591232"

    - userName: "@jerallaire"
      useAvatar: "/useravatars/1.png"
      testimonial: “Decentralized cloud infra as a service with a globally available, programmable settlement currency $USDC. @akashnet_ (open source supercloud).”
      companyName: "Co-founder @Circle"
      accountLink: "https://twitter.com/jerallaire/status/1689842660142678016"

    - userName: "@aeyakovenko"
      useAvatar: "/useravatars/1.png"
      testimonial: “Friendship ended with @Hetzner_Online now @akashnet_ is my best friend.”
      accountLink: "https://twitter.com/aeyakovenko/status/1588027576714510338"
      companyName: "Co-founder @Solana Labs"

    - userName: "@zJu_u"
      useAvatar: "/useravatars/1.png"
      testimonial: “Want to run your own Bittensor $TAO Node? Follow this simple step-by-step guide to get started on @akashnet_ in just 5 minutes for around $10 per month in $AKT.”
      accountLink: "https://twitter.com/zJu_u/status/1732444914971984354"
      companyName: "NoDumpNode"

    - userName: "@0xBobloblaw"
      useAvatar: "/useravatars/1.png"
      testimonial: “Just became an @akashnet_ provider and got a lease within the first hour of deploying! Super easy experience using @praetor_app to set it all up. Thanks @Deval_Vora for the help!”
      accountLink: "https://twitter.com/0xBobloblaw/status/1544465890313285632"
      companyName: "Dev @White WhaleDefi"

    - userName: "@presearchnews"
      useAvatar: "/useravatars/1.png"
      testimonial: “A Presearch node running on @akashnet_!. The first Presearch searches ever to be processed on the Akash network.One click deployment coming soon”
      accountLink: "https://twitter.com/presearchnews/status/1537450380979757056"
      companyName: "Decentralized Search Engine"

    - userName: "@luna_4_go"
      useAvatar: "/useravatars/1.png"
      testimonial: “Deploying on @akashnet_ is getting faster and easier by the day! Using the Akash Terraform Provider I can have my infrastructure on Akash in just 22s.”
      accountLink: "https://twitter.com/luna_4_go/status/1588978684203237376"
      companyName: "Founder Quasarch"


# CTA section content
CTASection:
  title: Experience the Supercloud - Deploy Now

  button:
    label: Deploy Now
    link: "/"
    enable: true
---
