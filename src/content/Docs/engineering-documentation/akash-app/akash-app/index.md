---
categories: ["Akash App"]
tags: []
title: "Akash App (app.go Initiation and Blockchain Definitions)"
linkTitle: "Akash App (app.go Initiation and Blockchain Definitions)"
weight: 1
description: >-
---

## Initiation of App via Main.go Function

> [Source code reference location](https://github.com/akash-network/node/blob/master/cmd/akash/main.go)

The `main.go` file and associated main function fires the method call of `NewRootCmd`.  This method - as detailed in the subsequent section is located in `node/cmd/akash/cmd/root.go`

```
func main() {
	rootCmd, _ := cmd.NewRootCmd()

	if err := cmd.Execute(rootCmd, "AKASH"); err != nil {
		switch e := err.(type) {
		case server.ErrorCode:
			os.Exit(e.Code)
		default:
			os.Exit(1)
		}
	}
}
```

## Root Command Registration

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/cmd/akash/cmd/root.go#L46)

When the root command for the Akash CLI - which is the `akash` command prefix registration via Cobra - the `initRootCmd` function is called.

As detailed in the subsequent section, `initRootCmd` is located in `node/md/akash/cmd/root.go`.

```
func NewRootCmd() (*cobra.Command, params.EncodingConfig) {
	encodingConfig := app.MakeEncodingConfig()

	rootCmd := &cobra.Command{
		Use:               "akash",
		Short:             "Akash Blockchain Application",
		Long:              "Akash CLI Utility.\n\nAkash is a peer-to-peer marketplace for computing resources and \na deployment platform for heavily distributed applications. \nFind out more at https://akash.network",
		SilenceUsage:      true,
		PersistentPreRunE: GetPersistentPreRunE(encodingConfig, []string{"AKASH"}),
	}

	initRootCmd(rootCmd, encodingConfig)

	return rootCmd, encodingConfig
}
```

## Root Command Initiation

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/cmd/akash/cmd/root.go#L103)

The `initRootCmd` function calls method `AddCommands` within the Cosmos SDK `server` package.  Per Cosmos documentation:

> The server package is responsible for providing the mechanisms necessary to start an ABCI CometBFT application and provides the CLI framework (based on cobra) necessary to fully bootstrap an application. The package exposes two core functions: StartCmd and ExportCmd which creates commands to start the application and export state respectively.

```
func initRootCmd(rootCmd *cobra.Command, encodingConfig params.EncodingConfig) {
	....
	server.AddCommands(rootCmd, app.DefaultHome, newApp, createAppAndExport, addModuleInitFlags)
	....
}
```

## Cosmos SDK AddCommands Function Detail

> [Source code reference location](https://github.com/cosmos/cosmos-sdk/blob/main/server/util.go)

Amongst other command registrations via the Cosmos SDK server package, note that the `startCmd` is registered via function `StartCmd`.

```
// add server commands
func AddCommands(rootCmd *cobra.Command, defaultNodeHome string, appCreator types.AppCreator, appExport types.AppExporter, addStartFlags types.ModuleInitFlags) {
	....

	startCmd := StartCmd(appCreator, defaultNodeHome)
	addStartFlags(startCmd)

	rootCmd.AddCommand(
		startCmd,
		cometCmd,
		ExportCmd(appExport, defaultNodeHome),
		version.NewVersionCommand(),
		NewRollbackCmd(appCreator, defaultNodeHome),
	)
}
```

> [Source code reference location](https://github.com/cosmos/cosmos-sdk/blob/main/server/start.go)

The `SmartCmd` function registers and allows Akash CLI use of command `akash start`.  This command provokes the initiation of an Akash RPC Node and Akash Validator instances.

```
func StartCmd(appCreator types.AppCreator, defaultNodeHome string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "Run the full node",
		Long: `Run the full node application with CometBFT in or out of process. By
default, the application will run with CometBFT in process.
```

## New App Initiation

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/cmd/akash/cmd/root.go#L103)

When the Cosmos SDK `AddCommands` method was called with the Akash `initRootCmd` function - included anew below for ease of reference - the `newApp` function is passed in as an argument.

```
func initRootCmd(rootCmd *cobra.Command, encodingConfig params.EncodingConfig) {
	....

	server.AddCommands(rootCmd, app.DefaultHome, newApp, createAppAndExport, addModuleInitFlags)

	....
}
```

The `newApp` function calls the `NewApp` method located in `node/app/app.go`.  The `NewApp` method initiates and defines the base parameters of the blockchain.

```
func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer, appOpts servertypes.AppOptions) servertypes.Application {
	...

	return app.NewApp(
		logger, db, traceStore, true, cast.ToUint(appOpts.Get(server.FlagInvCheckPeriod)), skipUpgradeHeights,
		cast.ToString(appOpts.Get(flags.FlagHome)),
		appOpts,
		baseapp.SetPruning(pruningOpts),
		baseapp.SetMinGasPrices(cast.ToString(appOpts.Get(server.FlagMinGasPrices))),
		baseapp.SetHaltHeight(cast.ToUint64(appOpts.Get(server.FlagHaltHeight))),
		baseapp.SetHaltTime(cast.ToUint64(appOpts.Get(server.FlagHaltTime))),
		baseapp.SetMinRetainBlocks(cast.ToUint64(appOpts.Get(server.FlagMinRetainBlocks))),
		baseapp.SetInterBlockCache(cache),
		baseapp.SetTrace(cast.ToBool(appOpts.Get(server.FlagTrace))),
		baseapp.SetIndexEvents(cast.ToStringSlice(appOpts.Get(server.FlagIndexEvents))),
		baseapp.SetSnapshotStore(snapshotStore),
		baseapp.SetSnapshotInterval(cast.ToUint64(appOpts.Get(server.FlagStateSyncSnapshotInterval))),
		baseapp.SetSnapshotKeepRecent(cast.ToUint32(appOpts.Get(server.FlagStateSyncSnapshotKeepRecent))),
	)
}
```

## Blockchain Definitions Via NewApp

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/app/app.go#L179)

When called the `NewApp` function creates many definitions for the blockchain including:

* Keepers for blockchain store definitions for all modules
* Blockchain store key values

The `NewApp` function returns an instance of the `AkashApp` struct.

```
func NewApp(
	logger log.Logger, db dbm.DB, tio io.Writer, loadLatest bool, invCheckPeriod uint, skipUpgradeHeights map[int64]bool,
	homePath string, appOpts servertypes.AppOptions, options ...func(*bam.BaseApp),
) *AkashApp {
...
}
```

The `AkashApp` struct is defined as:

```
type AkashApp struct {
	*bam.BaseApp
	cdc               *codec.LegacyAmino
	appCodec          codec.Codec
	interfaceRegistry codectypes.InterfaceRegistry

	invCheckPeriod uint

	keys    map[string]*sdk.KVStoreKey
	tkeys   map[string]*sdk.TransientStoreKey
	memkeys map[string]*sdk.MemoryStoreKey

	keeper struct {
		acct     authkeeper.AccountKeeper
		authz    authzkeeper.Keeper
		bank     bankkeeper.Keeper
		cap      *capabilitykeeper.Keeper
		staking  stakingkeeper.Keeper
		slashing slashingkeeper.Keeper
		mint     mintkeeper.Keeper
		distr    distrkeeper.Keeper
		gov      govkeeper.Keeper
		crisis   crisiskeeper.Keeper
		upgrade  upgradekeeper.Keeper
		params   paramskeeper.Keeper
		ibc      *ibckeeper.Keeper
		evidence evidencekeeper.Keeper
		transfer ibctransferkeeper.Keeper

		// make scoped keepers public for test purposes
		scopedIBCKeeper      capabilitykeeper.ScopedKeeper
		scopedTransferKeeper capabilitykeeper.ScopedKeeper

		// akash keepers
		escrow     escrowkeeper.Keeper
		deployment dkeeper.IKeeper
		market     mkeeper.IKeeper
		provider   pkeeper.IKeeper
		audit      audit.Keeper
		cert       cert.Keeper
		inflation  inflation.Keeper
	}

	mm *module.Manager

	// simulation manager
	sm *module.SimulationManager

	// module configurator
	configurator module.Configurator
}
```