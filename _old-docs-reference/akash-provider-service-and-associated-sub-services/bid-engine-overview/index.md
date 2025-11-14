---
categories: ["Akash Provider Service and Associated Sub Services"]
tags: []
title: "Bid Engine Overview"
linkTitle: "Bid Engine Overview"
weight: 1
description: >-
---

- [Provider Service Calls/Initiates the BidEngine Service](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#1-provider-service-callsinitiates-the-bidengine-service)
- [BidEngine Calls/Initiates an Event Bus to Monitor New Orders](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#2-bidengine-callsinitiates-an-event-bus-to-monitor-new-orders)
- [BidEngine Loop is Created to React to New Order Receipt and Then Process Order](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#3-bidengine-loop-is-created-to-react-to-new-order-receipt-and-then-process-order)
- [Order/Bid Process Manager Uses Perpetual Loop for Event Processing and to Complete Each Step in Bid Process](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#4-orderbid-process-manager-uses-perpetual-loop-for-event-processing-and-to-complete-each-step-in-bid-process)
- [Bid Engine Order Detail Fetch](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#run-function)
- [groupch Channel Processing](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#groupch-channel)
- [shouldBidCh Channel Processing](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#shouldbidch-channel)
- [clusterch Channel Prcoessing](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#clusterch-channel)
- [pricech Channel Processing](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#pricech-channel)
- [bidch Channel Processing](/docs/akash-provider-service-and-associated-sub-services/bid-engine-service#bidch-channel)
