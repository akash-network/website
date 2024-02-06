---
categories: ["Akash Provider Service and Associated Sub Services"]
tags: []
title: "Overview"
linkTitle: "Overview"
weight: 1
description: >-
---

## Visualization

![](../../assets/akashProviderBidProcess.png)

## Code Review

### 1). Provider Service Calls/Initiates the BidEngine Service

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/service.go#L101)

```
	bidengine, err := bidengine.NewService(ctx, session, cluster, bus, waiter, bidengine.Config{
		PricingStrategy: cfg.BidPricingStrategy,
		Deposit:         cfg.BidDeposit,
		BidTimeout:      cfg.BidTimeout,
		Attributes:      cfg.Attributes,
		MaxGroupVolumes: cfg.MaxGroupVolumes,
	})
```

### 2). BidEngine Calls/Initiates an Event Bus to Monitor New Orders

The `NewService` function called from `provider/bidengine/service.go` checks for existing orders and subscribes to a RPC node event bus for new order processing.

Eventually the `run` method in this package is called with a service type passed in.

> [Source code reference location](https://github.com/akash-network/provider/blob/main/bidengine/service.go)

```
func NewService(ctx context.Context, session session.Session, cluster cluster.Cluster, bus pubsub.Bus, waiter waiter.OperatorWaiter, cfg Config) (Service, error) {
	session = session.ForModule("bidengine-service")

	existingOrders, err := queryExistingOrders(ctx, session)
	if err != nil {
		session.Log().Error("finding existing orders", "err", err)
		return nil, err
	}

	sub, err := bus.Subscribe()
	if err != nil {
		return nil, err
	}

	...
	s := &service{
		session:  session,
		cluster:  cluster,
		bus:      bus,
		sub:      sub,
		statusch: make(chan chan<- *Status),
		orders:   make(map[string]*order),
		drainch:  make(chan *order),
		lc:       lifecycle.New(),
		cfg:      cfg,
		pass:     providerAttrService,
		waiter:   waiter,
	}

	go s.lc.WatchContext(ctx)
	go s.run(ctx, existingOrders)
```

### 3). BidEngine Loop is Created to React to New Order Receipt and Then Process Order

Within the `run` function of `provider/bidengine/service.go` an endless for loop monitors for events placed onto a channel.

When an event of type `EventOrderCreated` is seen a call to the `newOrder` function - which exists in `provider/bidengine/order.go` - is initiated. The `newOrder` function call creates a new manager for a specific order.

```
loop:
	for {
		select {
		case <-s.lc.ShutdownRequest():
			s.lc.ShutdownInitiated(nil)
			break loop

		case ev := <-s.sub.Events():
			switch ev := ev.(type) { // nolint: gocritic
			case mtypes.EventOrderCreated:
				// new order
				key := mquery.OrderPath(ev.ID)

				s.session.Log().Info("order detected", "order", key)

				if order := s.orders[key]; order != nil {
					s.session.Log().Debug("existing order", "order", key)
					break
				}

				// create an order object for managing the bid process and order lifecycle
				order, err := newOrder(s, ev.ID, s.cfg, s.pass, false)
				if err != nil {
					s.session.Log().Error("handling order", "order", key, "err", err)
					break
				}

				ordersCounter.WithLabelValues("start").Inc()
				s.orders[key] = order
```

### 4). Order/Bid Process Manager Uses Perpetual Loop for Event Processing and to Complete Each Step in Bid Process

When the `newOrder` function within `order.go` is called in the previous step, an `order` struct is populated and then passed to the `run` method.

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/bidengine/order.go#L477)

```
	order := &order{
		cfg:                        cfg,
		orderID:                    oid,
		session:                    session,
		cluster:                    svc.cluster,
		bus:                        svc.bus,
		sub:                        sub,
		log:                        log,
		lc:                         lifecycle.New(),
		reservationFulfilledNotify: reservationFulfilledNotify, // Normally nil in production
		pass:                       pass,
	}

	...

	// Run main loop in separate thread.
	go order.run(checkForExistingBid)
```

#### Run Function

Within the `run` function details of the order are fetched.

```
	// Begin fetching group details immediately.
	groupch = runner.Do(func() runner.Result {
		res, err := o.session.Client().Query().Group(ctx, &dtypes.QueryGroupRequest{ID: o.orderID.GroupID()})
		return runner.NewResult(res.GetGroup(), err)
	})
```

#### groupch Channel

Still within the `run` function, a perpetual for loop awaits order group details to be sent to a channel named `groupch`. When order/group details are placed onto that channel, the `shouldBid` method is called.

Eventually the result of calling `shouldBid` will be placed onto the `shouldBidCh` provoking further upstream order processing. But prior to review upstream steps we will detail the `shouldBid` function logic.

```
		case result := <-groupch:
			// Group details fetched.

			groupch = nil
			o.log.Info("group fetched")

			if result.Error() != nil {
				o.log.Error("fetching group", "err", result.Error())
				break loop
			}

			res := result.Value().(dtypes.Group)
			group = &res

			shouldBidCh = runner.Do(func() runner.Result {
				return runner.NewResult(o.shouldBid(group))
			})
```

#### shouldBidCh Channel

When a result from the prior step is placed onto the `shouldBinCh` channel, the `shouldBid` function - also located within `provider/bidengine/order.go` - processes several validations to determine if the provider should bid on the order.

```
		case result := <-shouldBidCh:
			shouldBidCh = nil
```

The validations include:

- _**MatchAttributes**_ - return `unable to fulfill` if provider does not possess necessary attributes
- _**MatchResourcesRequirements**_ - return `unable to fulfill` if provider does not possess required, available resources
- _**SignedBy**_ - return `attribute signature requirements not met` if provider does not possess required audited attributes&#x20;

```
	if !group.GroupSpec.MatchAttributes(o.session.Provider().Attributes) {
		o.log.Debug("unable to fulfill: incompatible provider attributes")
		return false, nil
	}

	...

	// does provider have required capabilities?
	if !group.GroupSpec.MatchResourcesRequirements(attr) {
		o.log.Debug("unable to fulfill: incompatible attributes for resources requirements", "wanted", group.GroupSpec, "have", attr)
		return false, nil
	}
	...
	signatureRequirements := group.GroupSpec.Requirements.SignedBy
	if signatureRequirements.Size() != 0 {
		// Check that the signature requirements are met for each attribute
		var provAttr []atypes.Provider
		ownAttrs := atypes.Provider{
			Owner:      o.session.Provider().Owner,
			Auditor:    "",
			Attributes: o.session.Provider().Attributes,
		...
		ok := group.GroupSpec.MatchRequirements(provAttr)
		if !ok {
			o.log.Debug("attribute signature requirements not met")
			return false, nil
		}
		}
	...


```

Should either `MatchAttributes`, `MatchResourcesRequirements`, or `SignedBy` evaluations fail to satisfy requirements, a boolean false is returned. If the result evaluates to `false` - meaning one of the validations does not satisfy requirements, `shouldBid` is set to `false`, the loop is exited, and a log message of `decline to bid` on the order is populated.

```
			shouldBid := result.Value().(bool)
			if !shouldBid {
				shouldBidCounter.WithLabelValues("decline").Inc()
				o.log.Debug("declined to bid")
				break loop
			}
```

The next step will begin the Kubernetes cluster reservation of requested resources.

While the bid process proceeds the reservation of resources in the Provider's Kubernetes cluster occurs via a call to the `cluster.Reserve` method. If the bid is not won the reservation will be cancelled.

If the provider is capable of satisfying all of the requirements of the order the result is placed onto the clusterch channel which provokes the next step of order processing.

```
			clusterch = runner.Do(metricsutils.ObserveRunner(func() runner.Result {
				v := runner.NewResult(o.cluster.Reserve(o.orderID, group))
				return v
			}, reservationDuration))
```

The `Reserve` function called - the result of which is placed onto the `clusterch` channel - is called from `provider.service.go`.

```
func (s *service) Reserve(order mtypes.OrderID, resources atypes.ResourceGroup) (ctypes.Reservation, error) {
	return s.inventory.reserve(order, resources)
}
```

#### clusterch Channel

When a result from the prior step is placed onto the `clusterch` channel, an analysis is made to ensure no errors were encountered during the Kubernetes cluster reservation. If not error is found a log entry of `Reservation fulfilled` is populated.

```
		case result := <-clusterch:
			clusterch = nil

			if result.Error() != nil {
				reservationCounter.WithLabelValues(metricsutils.OpenLabel, metricsutils.FailLabel)
				o.log.Error("reserving resources", "err", result.Error())
				break loop
			}

			reservationCounter.WithLabelValues(metricsutils.OpenLabel, metricsutils.SuccessLabel)

			o.log.Info("Reservation fulfilled")
```

If the Kubernetes cluster reservation for the order is successful, the result of calling the `CalculatePrice` method (using the order specs as input) is placed onto the `pricech` channel which provokes the next step of order processing.

Calling `CalculatePrice` provokes the logic to determine price extended thru bid response.

```
			pricech = runner.Do(metricsutils.ObserveRunner(func() runner.Result {
				// Calculate price & bid
				return runner.NewResult(o.cfg.PricingStrategy.CalculatePrice(ctx, group.GroupID.Owner, &group.GroupSpec))
			}, pricingDuration))
```

The `CalculatePrice` function is located in `/bidengine/pricing.go` and will determine the price used in bid response to the order. The price will be dictated by the order specs - I.e. CPU/memory/storage/replicas, etc - and the Provider's pricing script which defines per specification price.

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/bidengine/pricing.go#L127)

```
func (fp scalePricing) CalculatePrice(_ context.Context, _ string, gspec *dtypes.GroupSpec) (sdk.DecCoin, error) {
	// Use unlimited precision math here.
	// Otherwise a correctly crafted order could create a cost of '1' given
	// a possible configuration
	cpuTotal := decimal.NewFromInt(0)
	memoryTotal := decimal.NewFromInt(0)
	storageTotal := make(Storage)

	for k := range fp.storageScale {
		storageTotal[k] = decimal.NewFromInt(0)
	}

	endpointTotal := decimal.NewFromInt(0)
	ipTotal := decimal.NewFromInt(0).Add(fp.ipScale)
	ipTotal = ipTotal.Mul(decimal.NewFromInt(int64(util.GetEndpointQuantityOfResourceGroup(gspec, atypes.Endpoint_LEASED_IP))))
	...
```

#### pricech Channel

When a result from the prior step is placed onto the `pricech` channel, an analysis is made to ensure that the bid price is not larger than the max price defined in deployment manifest.

If the order gets past the maxPrice check the logs are populated with the `submitting fulfillment` with specified price message.

```
case result := <-pricech:
			pricech = nil
			if result.Error() != nil {
				o.log.Error("error calculating price", "err", result.Error())
				break loop
			}

			price := result.Value().(sdk.DecCoin)
			maxPrice := group.GroupSpec.Price()

			if maxPrice.IsLT(price) {
				o.log.Info("Price too high, not bidding", "price", price.String(), "max-price", maxPrice.String())
				break loop
			}

			o.log.Debug("submitting fulfillment", "price", price)

```

If the bid proceeds we eventually broadcast the bid to the blockchain and write the results of this transaction to the `bidch` channel which provokes additional upstream logic covered in the next section.

```
			bidch = runner.Do(func() runner.Result {
				return runner.NewResult(nil, o.session.Client().Tx().Broadcast(ctx, msg))
			})
```

#### bidch Channel

When a result from the prior step is placed onto the `bidch` channel, an error check is made to ensure the bid has not failed for any reason. And post this final bid validator a message is written to the provider logs of `bid complete`.

The Bid Engine Service logic for single bid processing is now complete. The Bid Engine perpetual loop will continue to monitor for new orders found on the blockchain and repeat reviewed order processing on each receipt.

```
		case result := <-bidch:
			bidch = nil
			if result.Error() != nil {
				bidCounter.WithLabelValues(metricsutils.OpenLabel, metricsutils.FailLabel).Inc()
				o.log.Error("bid failed", "err", result.Error())
				break loop
			}

			o.log.Info("bid complete")
			bidCounter.WithLabelValues(metricsutils.OpenLabel, metricsutils.SuccessLabel).Inc()

			// Fulfillment placed.
			bidPlaced = true

			bidTimeout = o.getBidTimeout(
```
