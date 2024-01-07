---
categories: ["Akash Provider Service and Associated Sub Services"]
tags: []
title: "Manifest Service"
linkTitle: "Manifest Service"
weight: 1
description: >-
---


<!-- ## Visualization -->

## Code Review

### 1). Provider Service Calls/Initiates the Manifest Service



> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/service.go#L101)

```
	manifest, err := manifest.NewService(ctx, session, bus, cluster.HostnameService(), manifestConfig)
	if err != nil {
		session.Log().Error("creating manifest handler", "err", err)
		cancel()
		<-cluster.Done()
		<-bidengine.Done()
		<-bc.lc.Done()
		return nil, err
	}
```

### 2). Manifest Calls/Initiates an Event Bus to Monitor Lease Won Events

The `NewService` function called from `provider/manifest/service.go` subscribes to a RPC node event bus for new lease won processing.

Eventually the `run` method in this package is called with a service type passed in.

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/manifest/service.go)

```
func NewService(ctx context.Context, session session.Session, bus pubsub.Bus, hostnameService clustertypes.HostnameServiceClient, cfg ServiceConfig) (Service, error) {
	session = session.ForModule("provider-manifest")

	sub, err := bus.Subscribe()
	if err != nil {
		return nil, err
	}

	s := &service{
		session:         session,
		bus:             bus,
		sub:             sub,
		statusch:        make(chan chan<- *Status),
		mreqch:          make(chan manifestRequest),
		activeCheckCh:   make(chan isActiveCheck),
		managers:        make(map[string]*manager),
		managerch:       make(chan *manager),
		lc:              lifecycle.New(),
		hostnameService: hostnameService,
		config:          cfg,

		watchdogch: make(chan dtypes.DeploymentID),
		watchdogs:  make(map[dtypes.DeploymentID]*watchdog),
	}

	go s.lc.WatchContext(ctx)
	go s.run()

	return s, nil
}
```

### 3). Monitor Service Loop is Created to React to New Lease Won Events

Within the run function of `provider/manifest/service.go` an endless for loop monitors for events placed onto a channel.  When a event is received for the RPC node event bus of type LeaseWon the `handleLease` method is called.

```
	for {
		select {

		case err := <-s.lc.ShutdownRequest():
			s.lc.ShutdownInitiated(err)
			break loop

		case ev := <-s.sub.Events():
			switch ev := ev.(type) {

			case event.LeaseWon:
				if ev.LeaseID.GetProvider() != s.session.Provider().Address().String() {
					continue
				}
				s.session.Log().Info("lease won", "lease", ev.LeaseID)
				s.handleLease(ev, true)
```

The `handleLease` method determines if a manager is active for the deployment via the `ensureManager` method.  The manifest manager logic exists in `provider/manifest/manager.go` and handles the validation/application of the manifest when received from the tenant send manifest operation.

```
func (s *service) handleLease(ev event.LeaseWon, isNew bool) {
	// Only run this if configured to do so
	if isNew && s.config.ManifestTimeout > time.Duration(0) {
		// Create watchdog if it does not exist AND a manifest has not been received yet
		if watchdog := s.watchdogs[ev.LeaseID.DeploymentID()]; watchdog == nil {
			watchdog = newWatchdog(s.session, s.lc.ShuttingDown(), s.watchdogch, ev.LeaseID, s.config.ManifestTimeout)
			s.watchdogs[ev.LeaseID.DeploymentID()] = watchdog
		}
	}

	manager := s.ensureManager(ev.LeaseID.DeploymentID())
	....
}
```

New Manifest Manager instance is initiated by calling the `newManager` function in `provider/manifest/manager.go` with the service type and deployment ID (DSEQ) passed in as arguments.

```
func (s *service) ensureManager(did dtypes.DeploymentID) (manager *manager) {
	manager = s.managers[dquery.DeploymentPath(did)]
	if manager == nil {
		manager = newManager(s, did)
		s.managers[dquery.DeploymentPath(did)] = manager
	}
	return manager
}
```

### 4). Manifest Manager Logic

> [Source code reference location](https://github.com/akash-network/provider/blob/e7aa0b5b81957a130f1dc584f335c6f9e41db6b1/manifest/manager.go)

The  `newManager` function calls the `run` method - passing in the `manager` struct that includes the  `leasech` channel - which invokes a perpetual for loop to await events on various channels.

The manifest manager instance is returned to the `handleLease` method in `service.go`.

```
func newManager(h *service, daddr dtypes.DeploymentID) *manager {
	session := h.session.ForModule("manifest-manager")

	...

	go m.lc.WatchChannel(h.lc.ShuttingDown())
	go m.run(h.managerch)

	return m
}
```

The `handleLease` method in `service.go` continues and calls another `handleLease` method in `manager.go` passing in lease events received on the bus.

```
func (s *service) handleLease(ev event.LeaseWon, isNew bool) {
	....

	manager := s.ensureManager(ev.LeaseID.DeploymentID())

	manager.handleLease(ev)
}
```

The handleLease method in `manager.go` puts the event onto the `leasech` channel.

```
func (m *manager) handleLease(ev event.LeaseWon) {
	select {
	case m.leasech <- ev:
	case <-m.lc.ShuttingDown():
		m.log.Error("not running: handle manifest", "lease", ev.LeaseID)
	}
}
```

When the manifest manager `run` method receives an event on the `leasech` channel the `maybeFetchData` method is called and results is placed onto the `runch` channel.

```
func (m *manager) run(donech chan<- *manager) {
	..

loop:
	for {
		....
		select {
		....
		case ev := <-m.leasech:
			m.log.Info("new lease", "lease", ev.LeaseID)
			m.clearFetched()
			m.maybeScheduleStop()
			runch = m.maybeFetchData(ctx, runch)
```

The `maybeFetchData` method attempts to fetch deployment and lease data with associated downstream logic.

```
func (m *manager) maybeFetchData(ctx context.Context, runch <-chan runner.Result) <-chan runner.Result {
	if runch != nil {
		return runch
	}

	if !m.fetched || time.Since(m.fetchedAt) > m.config.CachedResultMaxAge {
		m.clearFetched()
		return m.fetchData(ctx)
	}
	return runch
}
```

### 5). Receipt of Manifest from Tenant Send to Provider

A method of name `Submit` is included in `provider/manifest/service.go` which accepts incoming manifest sends from the deployer/tenant to the provider.  The function is initiated via an incoming HTTP post detailed subsequently.

```
func (s *service) Submit(ctx context.Context, did dtypes.DeploymentID, mani manifest.Manifest) error {
	....
	select {
	case <-ctx.Done():
		return ctx.Err()
	case s.mreqch <- req:
	case <-s.lc.ShuttingDown():
		return ErrNotRunning
	case <-s.lc.Done():
		return ErrNotRunning
	}

	...
}
```

The `Submit` method is called when a HTTP post - which contains the Akash manifest in the body - is received on an endpoint and handler written/registered in `provider/gateway/rest/router.go`.

_**HTTP Endpoint**_

```
	drouter.HandleFunc("/manifest",
		createManifestHandler(log, pclient.Manifest())).
		Methods(http.MethodPut)

	lrouter := router.PathPrefix(leasePathPrefix).Subrouter()
	lrouter.Use(
		requireOwner(),
		requireLeaseID(),
	)
```

_**Request Handler**_

Note the call of the `Submit` method which is the provider/manifest/service.go function shown prior.  The Deployment ID and manifest are sent to `Submit` as received in the HTTP post from the tenant's send manifest action following lease creation with a provider.

```
func createManifestHandler(log log.Logger, mclient pmanifest.Client) http.HandlerFunc {
	....
		if err := mclient.Submit(subctx, requestDeploymentID(req), mani); err != nil {
			if errors.Is(err, manifestValidation.ErrInvalidManifest) {
				http.Error(w, err.Error(), http.StatusUnprocessableEntity)
				return
	....
	}
}
```