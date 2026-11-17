---
title: "Introducing Akash Compute Forwards: A Forward Market for the GPU-Hour"
description: "A design, a white paper, and a simulation you can run. One node. One month. One price."
pubDate: "2026-11-17"

categories:
  - Updates
tags:
  - Compute Forwards
  - GPU
  - Solana
  - Decentralized Cloud
contributors:
  - Greg Osuri

bannerImage: ./banner.webp
---

What will a GPU-hour cost in June?

For most GPUs, there's no open price. You can find out what an hour costs today, and the answer depends on who you ask. (You can compare public list prices on [Signal](https://signal.akash.network/).) For June, you get on sales calls.

Today at Breakpoint in London, I showed how we'd fix that. It's called Akash Compute Forwards.

It's a design. Nothing trades yet.

Three things are public as of today:

- **A site**, [forwards.akash.network](https://forwards.akash.network/), that explains the design and says where it stands.
- **A simulated market**, [fsim.akash.network](https://fsim.akash.network/), that runs the design's rules in your browser.
- **A white paper**, [Version 0.3](https://forwards.akash.network/whitepaper), 32 pages.

This post is the short version. The site has the rest.

## The problem

Every token a model serves is a GPU-hour somebody paid for.

The world is paying for a lot of them. Four companies, Amazon, Microsoft, Alphabet and Meta, spent \$150 billion on capex in 2023 and \$410 billion in 2025. Their own guidance for 2026 adds up to between \$720 billion and \$740 billion. That is their total capex, not only AI.

An AI data center sells what it makes by the hour, and the hour is perishable. An hour that isn't used is gone. You can't store it, and you can't deliver it late.

Now ask what one of those hours will cost in a later month. That question hurts two people.

**Say you need GPUs in June.** You can't fix the cost today. So you sign a long contract, or you pay whatever June costs.

**Say you run GPUs.** You buy the machines today. You can't fix what an hour sells for in June. So you build, and you hope.

And if you're building agents that buy their own compute: an agent can pay by the hour. An agent can't get on a sales call.

Today in London I gave this a name, in a talk called "Superintelligence Has a Liquidity Problem." What's missing today is an open market for a future hour of compute where you can buy an hour, sell an hour, and anyone can see the price. For most of the compute being built today, that market doesn't exist yet.

## Other industries fixed this long ago

Farmers had this problem. In Chicago, in March 1851, 3,000 bushels of corn were sold for delivery in June.

That's a forward. A price you fix today, for delivery in a later month.

Metals, oil, gas, power, and freight learned to do the same. In 2024, natural gas at Henry Hub traded on paper 73 times what the United States used, and German power forwards traded about 21 times German demand.

Corn has them. Oil has them. Most compute doesn't.

People are working on it. You can reserve a few weeks ahead from a big cloud, at that cloud's price. One team runs an order book where you can buy GPU time and sell it again. The big futures exchanges have announced contracts on GPU rental prices, and publicly available prices help everyone.

But there’s a catch. Those contracts settle in cash and pay you as prices move. But in a tight market, cash doesn't run your model; you need GPUs. Somebody has to deliver the hour.

## One node. One month. One price.

Here's the contract.

- **One node.** Eight B300 GPUs, in one region.
- **One month.** Every hour of a calendar month. A 31-day month has 744 hours.
- **One price.** You fix it today, per GPU-hour, in US dollars.

Any attested provider can deliver it. Attested means an Akash Validator has verified the node's hardware.

It works in four steps.

1. **One auction a day.** Every order rests in an open book. Once a day, an auction sets one price for each contract. Every fill trades at that price.
2. **A program in the middle.** A program on Solana stands between every buyer and seller. Each day it values every position and moves the price change between accounts, in US dollars.
3. **Nodes assigned before the month.** Shortly before each month begins, the program pairs each buyer with a provider's attested nodes.
4. **Every hour checked.** Every hour, a random panel of Akash validators checks each lease. The provider is paid for every hour it serves. Miss an hour, and the provider isn't paid. It pays the buyer, making him whole.

If your plans change, you can sell any number of months you don’t want or need in a later auction, before it starts.

The venue has no token of its own: Dollars go in, and compute comes out.

Why Solana? Akash is moving there under Proposal 346, and it is efficient enough to record every hour of GPU delivery on-chain.

The [How it works](https://forwards.akash.network/how-it-works) page takes each step slowly, with pictures.

## See it run

[fsim.akash.network](https://fsim.akash.network/) is a simulation of the design's rules. The prices are illustrative, the dates are a year from now, and no order in it is real.

Open it and look for four things.

- **The board.** Each cell is one contract. Anyone can see every price.
- **The book.** You see the size at each price, and the one price the auction would set right now.
- **The call.** Once a simulated day, the auction runs. Watch the curve move and the board update.
- **The grid of squares.** A month in delivery, hour by hour.

New to trading screens? [Start with the tour](https://fsim.akash.network/?tour=1).

## What isn't ready

On Friday, I said a real fix has to pass three tests. It delivers the hour. You can see the book. And it says what isn't ready.

So here is what isn't ready.

- **The market isn't open.** There is nothing here to put money into.
- **It's an early design.** Expect it to change.
- **One disclosure.** This design would license outside price history. It starts the risk statistics, and it checks large moves. It isn't public. It never sets a price.
- **There is a gate.** Before any pilot, two audits must be clean; the pilot blockers found in our own risk review must be fixed and rechecked; our lawyers must have answered; the B300 grade must be ratified; and default protection must be in place and attested. The pilot is for certified businesses only.

We're planning for early 2027. The gate decides, not the date.

The [status page](https://forwards.akash.network/status) lists what is designed, what is decided and what is still proposed.

## Where to go next

- **To understand it:** [How it works](https://forwards.akash.network/how-it-works), and the [documentation](https://forwards.akash.network/docs), which explains each part of the design with worked examples.
- **To run it:** [fsim.akash.network](https://fsim.akash.network/).
- **To read all of it:** the [white paper](https://forwards.akash.network/whitepaper), Version 0.3, 32 pages.
- **To ask about it:** the [FAQ](https://forwards.akash.network/faq) has short answers, starting with the token question.

## Three asks

- If you run B300s, [tell us your nodes and months](https://forwards.akash.network/join/provider).
- If you need B300s, [tell us what you run and when](https://forwards.akash.network/join/buyer).
- If you make markets, in power, gas, freight or perpetuals, [tell us what you'd need to quote](https://forwards.akash.network/join/market-maker).

The forms are for businesses. Not one of these? Read the white paper and follow [@akashnet](https://x.com/akashnet).

An onchain compute orderbook. One node. One month. One price.

This is how we'd fix it.

---

_Akash Compute Forwards is a design. Nothing in this post is an offer or a solicitation to buy or sell any financial product, and nothing here is financial advice. No market is open, and no one can trade. Any pilot will be open only to certified businesses in jurisdictions where counsel has cleared it. The venue has no token of its own._

_Sources. Capex: filings and results calls of Amazon, Microsoft, Alphabet and Meta, by calendar year, on each company's own capex measure; 2026 is company guidance as of 29 October 2026. Corn: Joseph Santos, "A History of Futures Trading in the United States", EH.Net Encyclopedia, 16 March 2008. Gas: Patrick Heather, OIES Paper NG 198, June 2025, Table 10, which counts options as well as futures. Power: ACER, 2025 Monitoring Report, 5 November 2025, Figure 2, which counts exchanges and broker platforms._

_About Akash. Akash Network is an open marketplace for cloud compute, where providers rent out GPUs and other computing resources. Overclock Labs is the core team that builds it. Press: [press@akash.network](mailto:press@akash.network)_
