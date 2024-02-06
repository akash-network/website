---
categories: ["Akash Provider Service and Associated Sub Services"]
tags: []
title: "Cluster Service"
linkTitle: "Cluster Service"
weight: 1
description: >-
---


When the Provider primary service initiates the Cluster Service - detailed in this section - current deployments, hostnames, and inventory are gathered.&#x20;

Perputually the Cluster Service then listens for new orders to place into inventory on bids the Provider acts on and invokes deployments for won bids.

\-link to cluster service initiation

\-link to cluster NewService section

\-etc

## 1).  Cluster Service Initiation

### Provider Service Calls/Initiates the Cluster Service

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/service.go#L101)

```
	cluster, err := cluster.NewService(ctx, session, bus, cclient, ipOperatorClient, waiter, clusterConfig)
	if err != nil {
		cancel()
		<-bc.lc.Done()
		return nil, err
	}
```

The parameters for `cluster.NewService` include the Provider's Kubernetes cluster settings.

```
	clusterConfig := cluster.NewDefaultConfig()
	clusterConfig.InventoryResourcePollPeriod = cfg.InventoryResourcePollPeriod
	clusterConfig.InventoryResourceDebugFrequency = cfg.InventoryResourceDebugFrequency
	clusterConfig.InventoryExternalPortQuantity = cfg.ClusterExternalPortQuantity
	clusterConfig.CPUCommitLevel = cfg.CPUCommitLevel
	clusterConfig.MemoryCommitLevel = cfg.MemoryCommitLevel
	clusterConfig.StorageCommitLevel = cfg.StorageCommitLevel
	clusterConfig.BlockedHostnames = cfg.BlockedHostnames
	clusterConfig.DeploymentIngressStaticHosts = cfg.DeploymentIngressStaticHosts
	clusterConfig.DeploymentIngressDomain = cfg.DeploymentIngressDomain
	clusterConfig.ClusterSettings = cfg.ClusterSettings
```

These settings are defined in the flags used when the `provider-services run` command is issued.

Example flag made available within the `provider/cmd/provider-services/cmd/run.go` file for Ingress Domain declaration.

```
const (
	...
	FlagDeploymentIngressDomain          = "deployment-ingress-domain"
	....
)
```

## 2). Cluster NewService Function

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/cluster/service.go)

The `NewService` function within `provider/cluster/service.go` invokes:

* Subscription to RPC Node pubsub bus via the `bus.Subscribe` method call
* The call of the `findDeployments` function to discover current deployments in the Kubernetes cluster.  This function is defined in the same file - `service.go` - as the cluster NewService function exists in.
* The call of the `newInventoryService` function which will track new/existing orders and create an inventory reservation when the provider bids on a deployment.

```
func NewService(ctx context.Context, session session.Session, bus pubsub.Bus, client Client, ipOperatorClient operatorclients.IPOperatorClient, waiter waiter.OperatorWaiter, cfg Config) (Service, error) {
	...

	sub, err := bus.Subscribe()
	if err != nil {
		return nil, err
	}

	deployments, err := findDeployments(ctx, log, client, session)
	if err != nil {
		sub.Close()
		return nil, err
	}

	inventory, err := newInventoryService(cfg, log, lc.ShuttingDown(), sub, client, ipOperatorClient, waiter, deployments)
	if err != nil {
		sub.Close()
		return nil, err
	}
```

## 3). Cluster Service Listening Bus

The `NewService` function eventually populates a `service` struct and passes the variable to the `run` method which invokes a perpetual listening bus for new deployments.  The `deployments` argument is additionally passed into the `run` method as an argument.

```
	
	s := &service{
		session:                        session,
		client:                         client,
		hostnames:                      hostnames,
		bus:                            bus,
		sub:                            sub,
		inventory:                      inventory,
		statusch:                       make(chan chan<- *ctypes.Status),
		managers:                       make(map[mtypes.LeaseID]*deploymentManager),
		managerch:                      make(chan *deploymentManager),
		checkDeploymentExistsRequestCh: make(chan checkDeploymentExistsRequest),

		log:    log,
		lc:     lc,
		config: cfg,
		waiter: waiter,
	}

	go s.lc.WatchContext(ctx)
	go s.run(ctx, deployments)
```

## 4). Creating Deployment Managers for Existing Deployments

Within in the `run` method a for loop creates a deployment manager for pre-existing deployments on the provider.

Further explanation of the deployment manager can be found in a later section of this documentation section.

```
func (s *service) run(ctx context.Context, deployments []ctypes.Deployment) {
	...

	for _, deployment := range deployments {
		key := deployment.LeaseID()
		mgroup := deployment.ManifestGroup()
		s.managers[key] = newDeploymentManager(s, deployment.LeaseID(), &mgroup, false)
		s.updateDeploymentManagerGauge()
	}
```

## 5). Cluster Service Perpetual Listening Loop

A perpetual for loop is spawned for the Cluster Service which - amongst other cases - monitor for an event type of `ManifestReceived`.

Following a series of validations - for example ensuring that the deployment pre-exists in which would indicate a deployment update event and assurance that the deployment exist in inventory - when passed thru eventually reaches a call of the `newDeploymentManager` function.

```
loop:
	for {
		select {
		....
		case ev := <-s.sub.Events():
			switch ev := ev.(type) {
			case event.ManifestReceived:
				s.log.Info("manifest received", "lease", ev.LeaseID)

				mgroup := ev.ManifestGroup()
				if mgroup == nil {
					s.log.Error("indeterminate manifest group", "lease", ev.LeaseID, "group-name", ev.Group.GroupSpec.Name)
					break
				}

				if _, err := s.inventory.lookup(ev.LeaseID.OrderID(), mgroup); err != nil {
					s.log.Error("error looking up manifest", "err", err, "lease", ev.LeaseID, "group-name", mgroup.Name)
					break
				}

				key := ev.LeaseID
				if manager := s.managers[key]; manager != nil {
					if err := manager.update(mgroup); err != nil {
						s.log.Error("updating deployment", "err", err, "lease", ev.LeaseID, "group-name", mgroup.Name)
					}
					break
				}

				s.managers[key] = newDeploymentManager(s, ev.LeaseID, mgroup, true)
```

## 6). Deployment Managers

The call of the `newDeploymentManager` function - located in `provider/cluster/manager.go` - provokes a deployment specific lifecycle manager.

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/cluster/manager.go#L81)

```
func newDeploymentManager(s *service, lease mtypes.LeaseID, mgroup *manifest.Group, isNewLease bool) *deploymentManager {
	....

	dm := &deploymentManager{
		bus:                 s.bus,
		client:              s.client,
		session:             s.session,
		state:               dsDeployActive,
		lease:               lease,
		mgroup:              mgroup,
		wg:                  sync.WaitGroup{},
		updatech:            make(chan *manifest.Group),
		teardownch:          make(chan struct{}),
		log:                 logger,
		lc:                  lifecycle.New(),
		hostnameService:     s.HostnameService(),
		config:              s.config,
		serviceShuttingDown: s.lc.ShuttingDown(),
		currentHostnames:    make(map[string]struct{}),
	}

	...

	go func() {
		<-dm.lc.Done()
		dm.log.Debug("sending manager into channel")
		s.managerch <- dm
	}()

	err := s.bus.Publish(event.LeaseAddFundsMonitor{LeaseID: lease, IsNewLease: isNewLease})
	if err != nil {
		s.log.Error("unable to publish LeaseAddFundsMonitor event", "error", err, "lease", lease)
	}

	return dm
}
```

## 7). Additional Inventory Service Notes

As described in the previous section the invoke of the NewService function spawns a call of the `newInventoryService` function.

The `newInventoryService` function is defined in `provider/cluster/inventory.go`.

When the Provider's bid engine determines that it should bid on a new deployment the `Reserve` method is called.  Downstream logic places this reservation into inventory.

In summation this Bid Engine logic is the mechanism in which the Provider reserves Kubernetes resources and places the reservation into inventory while the bid is pending.

> [Source code reference location](https://github.com/akash-network/provider/blob/95458f90c22c3be343efa7402ba4ac72100e251c/bidengine/order.go)

```
		case result := <-shouldBidCh:
			....
			clusterch = runner.Do(metricsutils.ObserveRunner(func() runner.Result {
				v := runner.NewResult(o.cluster.Reserve(o.orderID, group))
					return v
			}, reservationDuration))
```
