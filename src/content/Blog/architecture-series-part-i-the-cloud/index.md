---
title: "Architecture Series Part I: The Cloud"
description: Everything we do today on the Internet leverages “the cloud.” The term has become so ubiquitous it can be hard to understand exactly what the cloud is, how it works, and how we interact with it.

pubDate: "2021-11-17"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Kelsey Ruiz

bannerImage: ./banner-image.gif
---
Everything we do today on the Internet leverages “the cloud.” The term has become so ubiquitous it can be hard to understand exactly what the cloud is, how it works, and how we interact with it.

It's a remarkably simple concept, actually, and a powerful one as well, but it's easy to have that simplicity and power obscured by specs and stats and technical terms. Let's start from the foundations and take a look at what the cloud really is and why it's important for everyone online.

While the term "the cloud" is fairly new, the concept goes back a long way, to the earliest days of computing, in fact, when computers were room-sized machines that you had to access via specialized terminals elsewhere in the building. However, it wasn't until about 20 years ago that the modern concept of working and communicating online came about.

### Who needs servers?

At that time broadband was becoming more common and people were learning just how powerful the web could be (turns out AOL wasn't all that great). But to offer services online, companies needed to invest in _servers_: specialized computers dedicated to handling Internet traffic. This expensive step was easy to get wrong, and a spotty or frustratingly slow web-based business might be worse than none at all.

The solution appeared in the form of _datacenters_, buildings full of servers all being operated by the same company as one giant machine, and instead of buying your own, you'd just rent time and space on theirs. The operators used software to quickly and efficiently delegate computing power to their customers, letting companies use just two servers one day and a hundred on the next if business took off.

This newfound reliability and flexibility led to the creation of some early cloud providers — though they didn't call themselves that quite yet — like what would later become the biggest of them all, Amazon Web Services (AWS). These companies made money by hosting and delivering data for their customers — from small businesses to equally large ones like Netflix.

There's an important distinction here between the cloud services that would soon be offered by AWS, Google, and Microsoft Azure and the other things those companies did. Just because AWS or Azure hosts your data doesn't mean you have to list your product on Amazon's store or run Windows. The cloud services they offer were more like a utility, for the most part detached from their other products and competing with each other on price for processing power, storage, and traffic. This infrastructure is provided as a layer that's transparent for users — the only time anyone these days knows what cloud provider a website or service runs on is when one of them goes down and takes a quarter of the Internet with it.

### From local apps to web apps

At first, these hosted services simply acted as more convenient places to quickly store and access bulky data. But before long it became clear that there was more to the opportunity than not having to run your own servers. In fact, the servers could do much of the work that home computers and phones were doing, with incredible benefits.

The poster child for this revelation, though it is far from alone, is certainly Gmail. For decades emails were something that went between computers, showing up in an application like Outlook that you opened on your computer, which had to be configured with a lot of technical details. Google showed the world that not only could email be done entirely in a browser, but that it was arguably superior to its desktop rivals.

Why? Think about it. Your inbox is now available at any computer you sit down at — all you do is go to gmail.com. Not only that, Gmail kept adding new features and expanding the already eye-popping gigabyte of storage each user was allowed — and no matter how big your attachments got, they never filled up _your_ hard drive.

What do all these features have in common? They only became possible because the entire application lived full-time on Google's servers. Nothing depended on the user whatsoever: desktop or laptop, Mac or Windows, Chrome or Firefox... well, at the time it was probably Netscape or Internet Explorer, but you get the idea.

Gmail is just one example of the thousands of new markets and business opportunities that were created by the capability of letting someone else's computer do all the hard work, while the user just gets the results. This model was so promising that practically the entire digital economy would soon be built on it.

### Digital transformation hits the gas

That's good, because as time went on people started storing a _lot_ more data online. [By one estimate](https://www.forbes.com/sites/gilpress/2013/05/09/a-very-short-history-of-big-data/), the world produced about 1.5 exabytes of data in total in 1999. (Your phone might have 100 gigabytes of space, your laptop perhaps ten times that, a terabyte — a petabyte is a thousand of those, and an exabyte is a thousand of _those_). By 2006 this had increased by an order of magnitude to 160 exabytes yearly. Over the next decade it would increase even faster, and these days we are producing [hundreds of exabytes](https://blog.iotechnologies.com/data-utilization-research/) _every single day_.

As for the money involved, in 2008 the cloud computing market was worth perhaps $6 billion or so, not pocket change by any means but only a tiny fraction of what was to come: cloud services in 2021 are a market worth well over $300 billion and growing faster than ever, [according to Allied Market Research](https://www.alliedmarketresearch.com/cloud-services-market).

What happened? The world moved online, and everything online is part of "the cloud" in some way or another. From business services to social media to TV and movies, everything began to live in datacenters, and because no one wants to think about which server exactly or at what datacenter — even network engineers may not know for sure where their company's data is physically — everyone started just calling it "the cloud." Something vague yet omnipresent.

### The cloud and Big Tech 

As the market grew, leaders emerged — and they're exactly who you'd expect. Microsoft's Azure, Amazon's AWS, and Google Cloud were among the first to invest in the space and offer cloud-native services, and with that first-mover advantage, they have steadily advanced until they completely dominated the cloud landscape.

On one hand, this is a good thing: large, well-known companies are likely to provide a variety of useful and reliable services easily accessible to businesses looking to host their own platforms. If you want to start an on-demand video service, you don't have to spend hundreds of millions on a datacenter, you just call up Amazon and tell them how much bandwidth you need. In fact, that's pretty much what Netflix did! (There's more to it than that, obviously, but that's a story for another time.)

But it also comes with risks. Having the cloud infrastructure owned by a handful of big tech companies means innovation can suffer while the market stagnates and becomes more siloed. Like any industry, if there are only a handful of players, and they're printing money, there's little incentive to truly change the product on offer, and instead, they compete on things like customer retention and upselling. Meanwhile, prices won't decline as fast as they would with more competition: Amazon, as pointed out by Cloudflare recently, seems to be marking up its own bandwidth costs [by almost 8,000 percent](https://blog.cloudflare.com/aws-egregious-egress/) — at a time when bandwidth is cheaper than ever.

It's a trade-off we often see in growing industries: it's not quite a monopoly, and it's not quite price-fixing, but it's certainly not the robust competition that produces the best results for consumers and businesses. When you spend half of your 8 or 9 figures of revenue on cloud services, you tend to start wondering [whether it's worth it to build that datacenter after all](https://a16z.com/2021/05/27/cost-of-cloud-paradox-market-cap-cloud-lifecycle-scale-growth-repatriation-optimization/).

### Cloudy present, cloudy future

Whether you're shopping, consuming media like shows or music, or doing a video call with friends (something that of course became far more common during the pandemic), you are using cloud services every step of the way: when you browse, when you stream, when you pay, when you ask for help.

Practically every service that needs to happen online has migrated to the cloud in one sense or another. This has produced enormous increases in productivity in some ways, but also creates new risks as personal and financial data flows between those services — and opportunities to protect that data. And of course, the challenge that started it all — getting enough servers to do the job right — is a constant challenge even for the mega-corporations vying with each other for the market.