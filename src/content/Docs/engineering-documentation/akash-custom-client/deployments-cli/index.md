---
categories: ["Akash Custom Client"]
tags: []
title: "Deployments CLI"
linkTitle: "Deployments CLI"
weight: 1
description: >-
---

## Cobra CLI Command Registration

#### Cobra sets root command of `akash` via `node/cmd/akash/cmd/root.go`

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

#### Akash CLI command is registered via Cobra for deployment creation (file location = x/deployment/client/cli/tx.go).

```
func cmdCreate(key string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create [sdl-file]"
```

#### Flags - which in Cobra are command switches are added via the following function call. This call is made within the `cmdCreate` function discussed above.

The flags package used comes from Cosmos SDK at `github.com/cosmos/cosmos-sdk/client/flags` which is called as an import withn the tx.go file.

```
flags.AddTxFlagsToCmd(cmd)
```

The Cosmos SDK function called registers the following flags for items such as:

* Specifying the RPC node used in the command via `FlagNode`. In this example a `FlagNode` const exists which specified the flag should be `node` which allows command CLI command execution such as: `akash deployment create --node <node-address:port>`.

```
func AddTxFlagsToCmd(cmd *cobra.Command) {
	f := cmd.Flags()
	f.StringP(FlagOutput, "o", "json", "Output format (text|json)")
	f.String(FlagFrom, "", "Name or address of private key with which to sign")
	f.Uint64P(FlagAccountNumber, "a", 0, "The account number of the signing account (offline mode only)")
	f.Uint64P(FlagSequence, "s", 0, "The sequence number of the signing account (offline mode only)")
	f.String(FlagNote, "", "Note to add a description to the transaction (previously --memo)")
	f.String(FlagFees, "", "Fees to pay along with transaction; eg: 10uatom")
	f.String(FlagGasPrices, "", "Gas prices in decimal format to determine the transaction fee (e.g. 0.1uatom)")
	f.String(FlagNode, "tcp://localhost:26657", "<host>:<port> to tendermint rpc interface for this chain")
	f.Bool(FlagUseLedger, false, "Use a connected Ledger device")
	f.Float64(FlagGasAdjustment, DefaultGasAdjustment, "adjustment factor to be multiplied against the estimate returned by the tx simulation; if the gas limit is set manually this flag is ignored ")
	f.StringP(FlagBroadcastMode, "b", BroadcastSync, "Transaction broadcasting mode (sync|async)")
	f.Bool(FlagDryRun, false, "ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it (when enabled, the local Keybase is not accessible)")
	f.Bool(FlagGenerateOnly, false, "Build an unsigned transaction and write it to STDOUT (when enabled, the local Keybase only accessed when providing a key name)")
	f.Bool(FlagOffline, false, "Offline mode (does not allow any online functionality)")
	f.BoolP(FlagSkipConfirmation, "y", false, "Skip tx broadcasting prompt confirmation")
	f.String(FlagSignMode, "", "Choose sign mode (direct|amino-json|direct-aux), this is an advanced feature")
	f.Uint64(FlagTimeoutHeight, 0, "Set a block timeout height to prevent the tx from being committed past a certain height")
	f.String(FlagFeePayer, "", "Fee payer pays fees for the transaction instead of deducting from the signer")
	f.String(FlagFeeGranter, "", "Fee granter grants fees for the transaction")
	f.String(FlagTip, "", "Tip is the amount that is going to be transferred to the fee payer on the target chain. This flag is only valid when used with --aux, and is ignored if the target chain didn't enable the TipDecorator")
	f.Bool(FlagAux, false, "Generate aux signer data instead of sending a tx")
	f.String(FlagChainID, "", "The network chain ID")
```