---
title: "Architecture Series Part II: Data Centers"
description: Decades ago, your phone was at the end of a long copper wire. Your TV got its channels from another cable or perhaps a satellite, and your radio snatched AM or FM signals out of the air.

pubDate: "2022-01-11"
draft: false

categories:
  - Insights
tags:
  - Developers
  - Insights
contributors:
  - Kelsey Ruiz

bannerImage: ./banner-image.gif
---
Decades ago, your phone was at the end of a long copper wire. Your TV got its channels from another cable or perhaps a satellite, and your radio snatched AM or FM signals out of the air. Not anymore — all those things are digital now, and all of them use the internet to download or exchange the data they need — a show from a streaming service, a video call with friends, a new episode of your favorite podcast.

To make this all possible we had to build a whole new kind of 21st-century infrastructure: data centers. And they may themselves be on the verge of a revolution — here's why.

### All data, all the time

To understand what data centers are, first think about why they're needed. When you take a video on your phone, it's there on your phone. And when you work on a Word document on your laptop, it's there on your laptop. But when you click "next episode" on your binge-watch of choice, that data isn't sitting on your hard drive — Netflix's library of shows is far too big to live on any single computer. So how do they make it available to everyone?

This problem actually goes back to the very origin of computers, when the hardware was the size of a room, and couldn't be moved for more convenient access. The solution then was the same as it is now: plug in a nice, long cable so you can operate the computer remotely. The difference now is a matter of scale: instead of five people who need access to the data in the basement, it's five million people who need access to data all over the world.

When the internet started gaining steam, companies going online invested in servers, which are just computers that specialize in storing, processing, and communicating data. At first, these were run by the companies themselves, sometimes out of the very offices they worked in. The "server room" would have a few big stacks of compact computers that held all the data that made up their online services.

But as data-heavy digital services like YouTube, Facebook, and Amazon became commonplace, it became clear that you couldn't operate a global online company out of a hot room in an office building downtown. Not only were the demands for data and processing power increasing exponentially to the point where there wasn't enough space, but what if there was a power outage or a fire? The whole company might be taken down by a strong gust of wind.

The solution was to move the servers to a new dedicated location — one with plenty of space, cheap and reliable power, and a full-time staff to watch over it. Thus was the modern data center born.

### Cultivating a server farm

Inside a data center are rows and rows of servers stacked 10 or 20 high in tall racks. Each server is about the size of a laptop, usually equipped with the latest processors and lots of RAM and storage space. But no monitor, keyboard, or mouse — instead, they are accessed remotely through miles of cables that run through the whole place, connecting each server to others and to central administration machines. Each server is an independent unit, but they can be combined together by networking to act as one larger machine. Interestingly, this means that two competing companies might pay for space in the same data center, with confidential data from one resting just inches from that of the other.

A modern data center might have tens of thousands of servers running simultaneously on acres of space, and a single person can monitor hundreds or thousands each, zooming around on a golf cart to swap out a faulty drive or check the wiring. They run 24/7 and require constant tending and maintenance.

You might think that 50,000 computers in one place would be more than enough power to run something like Google, but it's not even close. What these data centers are doing is nothing less than running the entire "cloud" we all hear so much about. Every photo uploaded to Instagram, every file backed up on Dropbox, every presentation being collaborated on at work — they all live in a data center somewhere, often copied multiple times for easier access and backup purposes. And that's without reckoning for the millions of websites running on Amazon's AWS service, or the enormous collection of videos Netflix or Disney+ has available.

50,000 is a good start — for one service, from one company, in one country. In fact, there are estimated to be some 3 million data centers worldwide now, most smaller but many bigger than that. Cloud-hosted services are growing faster than ever in entertainment, enterprise applications, communication, and increasingly in AI and cryptocurrency. The volume of data being uploaded and processed every day almost beggars belief, predicted to approach 100 zettabytes — that's a hundred trillion gigabytes, enough that if you put it on Blu-Ray discs you could stack it to the moon... a dozen times. And the infrastructure being built is of a scale that's difficult to visualize. What does a million square feet of servers even look like? We'll find out when data centers that size are built this year.

But despite all this investment, all is not well in the world of data centers and cloud services. There are a few major challenges facing the industry.

### Asymmetry and inefficiency

First is that these server farms use up a truly enormous amount of electricity. In fact, it's estimated that data centers now account for some two percent of all power usage worldwide. Interestingly, only a fraction of this power goes to the servers themselves — most of it is used to keep the facilities cool, since tens of thousands of computers working hard day and night produce a lot of heat. For this reason not only are data centers increasingly located in places with cheap renewable power but also where the air is naturally cold, lowering the A/C bill. New approaches to software and administration are affecting this too but with thousands of servers coming online every week, it's hard to say whether it will be enough.

The second and more fundamental issue is that all this power is not being efficiently used. Even though servers are efficient individually and data centers are the best way to provide billions of people with trillions of bytes of data, it turns out most of these facilities are rarely using more than a fraction of their capacity.

To understand why that is, think about what these data centers are doing. One located in, say, Michigan will be providing services primarily to people in that region — since it's faster and cheaper to access data that's nearby — but also mainly people in that time zone. The servers are going to be loaded with English-language content from U.S.-based services and companies.

During the day and into the evening, when everyone is taking meetings, streaming shows, and playing games, that data center may be using half its total capacity. And if there's a big surge, like a new episode of a popular show or a live event on YouTube, maybe it's higher. But what happens when everyone in Detroit, Atlanta, and for that matter Havana and Lima go to bed? That Michigan data center goes quiet too, only a few percent of its resources active — but the whole facility idling, consuming power, and producing heat. By some estimates, only 15 percent of data centers' capabilities are actually being used.

### Distributing and decentralizing data centers

Seems like a waste, doesn't it? All around the world data centers are being built, only to sit inactive 85 percent of the time. What can be done to improve this?

The best single way to improve efficiency is to find out what servers are not being used and when, and put them to work instead of spinning up a new one. For every data center that's being underutilized, on the other side of the planet, there is likely one that's full up.

For instance, if you're an AI company based in Mumbai, you _could_ pay to train up your machine learning model on a local data center, but you'd be paying for time when those resources are most in-demand in the area. Just like with any other commodity, that means the price is high for what you get. So why not make a deal with the folks in Michigan, whose data center is currently idling at 5-10 percent usage?

Of course, it's not as convenient to have to transfer all that data over thousands of miles of cables, and there are other compromises, but if there's no rush on getting the data where it needs to be — unlike those for video calls, these packets can wait a few seconds — this is a good solution for both parties. The Indian AI company gets cheap data center access, and the Michigan provider gets paid during slack hours.

The question is, how do we do this globally and reliably? What's emerged is something called a reverse auction system, another concept that actually goes back many decades. In it, multiple companies pitch similar services — in this case, handling a customer's online data — and compete with each other for a single customer, who chooses between their bids. It's simple enough that a company can just set the price they're willing to pay and see if the market will accommodate them.

### Innovation makes it possible

Doing this equitably and predictably is important, though, as any market is open to manipulation. Akash provides a system for oversight and provision of marketplaces for spare data center capacity. By joining together several providers and stakeholders with access to a large amount of the asset in question — servers, basically — they can form a sort of self-monitoring consortium that agrees to sell those assets under a set of reasonable rules while still allowing for competition on price.

This only works if you can be sure of two things: that there's enough supply, and that everyone involved is being honest. In the first place, Akash has partnered with Equinix, one of the largest providers of cloud services in the world at the "bare metal" level, meaning maximum configurability and flexibility. Having huge suppliers like this means the marketplace is large enough for big customers to take part.

As for the question of honesty, the primary innovation of blockchain technology is removing the possibility of dishonesty from the table. A special cryptocurrency token is used to record the supply and deals undertaken on the network, all on an immutable community ledger accessible to all stakeholders.

With these taken care of, companies around the world can be sure that they always have the option of securely and fairly purchasing data center resources from major providers at rock-bottom prices they can effectively set themselves. As this model gains steam the utilization levels of existing data centers will increase, bolstering their income and solving the efficiency problem at the same time.

Of course, it doesn't mean we won't ever have to build new ones — but with chip shortages and economic woes plaguing the globe, maybe now's a good time to take a break and focus on using what we already have.