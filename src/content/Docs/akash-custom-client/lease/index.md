---
categories: ["Akash Custom Client"]
tags: []
title: "Lease"
linkTitle: "Lease"
weight: 1
description: >-
---

## Lease Tendermint RPC Endpoint Overview

Client communication for Akash lease creation, updates, and deletions occurs via the Tendermint RPC implementation.

Further details on the Tendermint RPC implementation can be found [here](https://docs.cosmos.network/main/core/grpc\_rest#tendermint-rpc).

The source code review in this section primarily focus on the module directory of `node/x/market`.

### Lease RPC Endpoint Route Registration

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/market/module.go)

The RPC Endpoint for Deployments - allowing inbound communication for CRUD operations - is found in `node/x/market/module.go`.

When encountered this Route calls the `NewHandler` method for further message handling.

```
func (am AppModule) Route() sdk.Route {
	return sdk.NewRoute(types.RouterKey, handler.NewHandler(am.keepers))
}
```

## Lease RPC Endpoint Handler

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/market/handler/handler.go)

The Lease handler matches a case based on the types defined via protobuf and contained within the `node/x/market/types/v1beta2/lease.pb.go` file.  An example of the protobuf file is covered in the subsequent section.

```
func NewHandler(keepers Keepers) sdk.Handler {
	ms := NewServer(keepers)

	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		case *types.MsgCreateBid:
			res, err := ms.CreateBid(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgCloseBid:
			res, err := ms.CloseBid(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgWithdrawLease:
			res, err := ms.WithdrawLease(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgCreateLease:
			res, err := ms.CreateLease(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgCloseLease:
			res, err := ms.CloseLease(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		default:
			return nil, sdkerrors.ErrUnknownRequest
		}
	}
}
```

## Example Msg Type - Create Lease

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/market/types/v1beta2/lease.pb.go#L301)

```
type MsgCreateLease struct {
	BidID BidID `protobuf:"bytes,1,opt,name=bid_id,json=bidId,proto3" json:"id" yaml:"id"`
}
```

## Create Lease Keeper Initiation

In a prior section the Handler matching of the message `MsgCreateLease` was introduced.  Including the `NewHandler` message correlation logic anew below for clarity.

```
func NewHandler(keepers Keepers) sdk.Handler {
	ms := NewServer(keepers)

	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		...

		case *types.MsgCreateLease:
			res, err := ms.CreateLease(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)
		...
	}
}
```

When the `MsgCreateLease` is received and correlated in the Handler, the `CreateLease` method is called.  This method is found in `node/x/market/handler/server.go`.

Several validations are performed - such as `GetBid` to ensure that the associated bid is found, `BidOpen` to ensure that the bid is open, etc - and eventually the following methods are called for lease creation and associated blockchain entries.

* ms.keepers.Market.CreateLease
* ms.keepers.Market.OnOrderMatched
* ms.keepers.Market.OnBidMatched

Additionally all lost bids are closed via:

* ms.keepers.Market.OnBidLost

The methods called - and as reviewed in the subsequent section - call their respective Keepers for blockchain store population.

```
func (ms msgServer) CreateLease(goCtx context.Context, msg *types.MsgCreateLease) (*types.MsgCreateLeaseResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	bid, found := ms.keepers.Market.GetBid(ctx, msg.BidID)
	if !found {
		return &types.MsgCreateLeaseResponse{}, types.ErrBidNotFound
	}

	if bid.State != types.BidOpen {
		return &types.MsgCreateLeaseResponse{}, types.ErrBidNotOpen
	}

	order, found := ms.keepers.Market.GetOrder(ctx, msg.BidID.OrderID())
	if !found {
		return &types.MsgCreateLeaseResponse{}, types.ErrOrderNotFound
	}

	if order.State != types.OrderOpen {
		return &types.MsgCreateLeaseResponse{}, types.ErrOrderNotOpen
	}

	group, found := ms.keepers.Deployment.GetGroup(ctx, order.ID().GroupID())
	if !found {
		return &types.MsgCreateLeaseResponse{}, types.ErrGroupNotFound
	}

	if group.State != dtypes.GroupOpen {
		return &types.MsgCreateLeaseResponse{}, types.ErrGroupNotOpen
	}

	owner, err := sdk.AccAddressFromBech32(msg.BidID.Provider)
	if err != nil {
		return &types.MsgCreateLeaseResponse{}, err
	}

	if err := ms.keepers.Escrow.PaymentCreate(ctx,
		dtypes.EscrowAccountForDeployment(msg.BidID.DeploymentID()),
		types.EscrowPaymentForLease(msg.BidID.LeaseID()),
		owner,
		bid.Price); err != nil {
		return &types.MsgCreateLeaseResponse{}, err
	}

	ms.keepers.Market.CreateLease(ctx, bid)
	ms.keepers.Market.OnOrderMatched(ctx, order)
	ms.keepers.Market.OnBidMatched(ctx, bid)

	// close losing bids
	var lostbids []types.Bid
	ms.keepers.Market.WithBidsForOrder(ctx, msg.BidID.OrderID(), func(bid types.Bid) bool {
		if bid.ID().Equals(msg.BidID) {
			return false
		}
		if bid.State != types.BidOpen {
			return false
		}

		lostbids = append(lostbids, bid)
		return false
	})

	for _, bid := range lostbids {
		ms.keepers.Market.OnBidLost(ctx, bid)
		if err := ms.keepers.Escrow.AccountClose(ctx,
			types.EscrowAccountForBid(bid.ID())); err != nil {
			return &types.MsgCreateLeaseResponse{}, err
		}
	}

	return &types.MsgCreateLeaseResponse{}, nil
}
```

## Create Lease Keeper Processing for Store/Chain Population

[Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/market/keeper/keeper.go#L144)

The `CreateLease` method within `node/x/market/keeper/keeper.go` takes in Bid details as an argument and writes the new Lease to the blockchain.

```
func (k Keeper) CreateLease(ctx sdk.Context, bid types.Bid) {
	store := ctx.KVStore(k.skey)

	lease := types.Lease{
		LeaseID:   types.LeaseID(bid.ID()),
		State:     types.LeaseActive,
		Price:     bid.Price,
		CreatedAt: ctx.BlockHeight(),
	}

	// create (active) lease in store
	key := keys.LeaseKey(lease.ID())
	store.Set(key, k.cdc.MustMarshal(&lease))

	ctx.Logger().Info("created lease", "lease", lease.ID())
	ctx.EventManager().EmitEvent(
		types.NewEventLeaseCreated(lease.ID(), lease.Price).
			ToSDKEvent(),
	)

	secondaryKeys := keys.SecondaryKeysForLease(lease.ID())
	for _, secondaryKey := range secondaryKeys {
		store.Set(secondaryKey, key)
	}
}
```

## Deployments API Amino Definitions

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/market/types/v1beta2/codec.go)

Based on the use of the Tendermint RPC implementation and the associated amino client encoding standards the Lease messages are registered with the Amino Codec.

```
func init() {
	RegisterLegacyAminoCodec(amino)
	cryptocodec.RegisterCrypto(amino)
	amino.Seal()
}

// RegisterCodec registers the necessary x/market interfaces and concrete types
// on the provided Amino codec. These types are used for Amino JSON serialization.
func RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	cdc.RegisterConcrete(&MsgCreateBid{}, ModuleName+"/"+MsgTypeCreateBid, nil)
	cdc.RegisterConcrete(&MsgCloseBid{}, ModuleName+"/"+MsgTypeCloseBid, nil)
	cdc.RegisterConcrete(&MsgCreateLease{}, ModuleName+"/"+MsgTypeCreateLease, nil)
	cdc.RegisterConcrete(&MsgWithdrawLease{}, ModuleName+"/"+MsgTypeWithdrawLease, nil)
	cdc.RegisterConcrete(&MsgCloseLease{}, ModuleName+"/"+MsgTypeCloseLease, nil)
}
```

The Messages types are defined in Protobuf file `node/proto/akash/market/v1beta2/lease.proto`.  The `MsgCreateLease` Protobuf file is referenced below as an example.

```
// MsgCreateLease is sent to create a lease
message MsgCreateLease {
  option (gogoproto.equal) = false;

  BidID bid_id = 1 [
    (gogoproto.customname) = "BidID",
    (gogoproto.nullable)   = false,
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];
}

// MsgCreateLeaseResponse is the response from creating a lease
message MsgCreateLeaseResponse {}
```