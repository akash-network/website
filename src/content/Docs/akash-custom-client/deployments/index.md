---
categories: ["Akash Custom Client"]
tags: []
title: "Deployments"
linkTitle: "Deployments"
weight: 1
description: >-
---

## Deployments Tendermint RPC Endpoint Overview

Client communication for Akash deployment creation, updates, and deletions occurs via the Tendermint RPC implementation.

Further details on the Tendermint RPC implementation can be found [here](https://docs.cosmos.network/main/core/grpc\_rest#tendermint-rpc).

The source code review in this section primarily focus on the module directory of `node/x/deployment`.

## Deployments RPC Endpoint Route Registration

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/module.go#L138)

```
func (am AppModule) Route() sdk.Route {
	return sdk.NewRoute(types.RouterKey, handler.NewHandler(am.keeper, am.mkeeper, am.ekeeper, am.authzKeeper))
}
```

## Deployments RPC Endpoint Handler

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/handler/handler.go#L12)

The Deployments handler matches a case based on the types defined via protobuf and contained within the `node//x/deployment/types/v1beta2/deploymentmsg.pb.go` file.  An example of the protobuf file is covered in the subsequent section.

```
func NewHandler(keeper keeper.IKeeper, mkeeper MarketKeeper, ekeeper EscrowKeeper, authzKeeper AuthzKeeper) sdk.Handler {
	ms := NewServer(keeper, mkeeper, ekeeper, authzKeeper)

	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		case *types.MsgCreateDeployment:
			res, err := ms.CreateDeployment(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgDepositDeployment:
			res, err := ms.DepositDeployment(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgUpdateDeployment:
			res, err := ms.UpdateDeployment(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgCloseDeployment:
			res, err := ms.CloseDeployment(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgCloseGroup:
			res, err := ms.CloseGroup(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgPauseGroup:
			res, err := ms.PauseGroup(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		case *types.MsgStartGroup:
			res, err := ms.StartGroup(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)

		default:
			return nil, sdkerrors.ErrUnknownRequest
		}
	}
}
```

## Example Msg Type - Create Deployment

> [Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/types/v1beta2/deploymentmsg.pb.go#L28)

```
type MsgCreateDeployment struct {
	ID      DeploymentID `protobuf:"bytes,1,opt,name=id,proto3" json:"id" yaml:"id"`
	Groups  []GroupSpec  `protobuf:"bytes,2,rep,name=groups,proto3" json:"groups" yaml:"groups"`
	Version []byte       `protobuf:"bytes,3,opt,name=version,proto3" json:"version" yaml:"version"`
	Deposit types.Coin   `protobuf:"bytes,4,opt,name=deposit,proto3" json:"deposit" yaml:"deposit"`
	// Depositor pays for the deposit
	Depositor string `protobuf:"bytes,5,opt,name=depositor,proto3" json:"depositor" yaml:"depositor"`
}
```

## Create Deployment Keeper Initiation

In a prior section the Handler matching of the message `MsgCreateDeployment` was introduced.  Including the `NewHandler` message correlation logic again below for clarity.

```
func NewHandler(keeper keeper.IKeeper, mkeeper MarketKeeper, ekeeper EscrowKeeper, authzKeeper AuthzKeeper) sdk.Handler {
	ms := NewServer(keeper, mkeeper, ekeeper, authzKeeper)

	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		case *types.MsgCreateDeployment:
			res, err := ms.CreateDeployment(sdk.WrapSDKContext(ctx), msg)
			return sdk.WrapServiceResult(ctx, res, err)
```

When the `MsgCreateDeployment` is received and correlated in the Handler, the `CreateDeployment` method is called.  This method is found in `node/x/deployment/handler/server.go`.

Several validations are performed - such as `GetDeployment` to ensure that the deployment does not already exist, assurance that the minimum deposit is fulfilled, etc - and eventually the following methods are called for deployment, order, and escrow blockchain entries.

* ms.deployment.Create
* ms.market.CreateOrder
* ms.escrow.AccountCreate

The methods called - and as reviewed in the subsequent section - call their respective Keepers for blockchain store population.

```
func (ms msgServer) CreateDeployment(goCtx context.Context, msg *types.MsgCreateDeployment) (*types.MsgCreateDeploymentResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	if _, found := ms.deployment.GetDeployment(ctx, msg.ID); found {
		return nil, types.ErrDeploymentExists
	}

	minDeposit := ms.deployment.GetParams(ctx).DeploymentMinDeposit

	if minDeposit.Denom != msg.Deposit.Denom {
		return nil, errors.Wrapf(types.ErrInvalidDeposit, "mininum:%v received:%v", minDeposit, msg.Deposit)
	}
	if minDeposit.Amount.GT(msg.Deposit.Amount) {
		return nil, errors.Wrapf(types.ErrInvalidDeposit, "mininum:%v received:%v", minDeposit, msg.Deposit)
	}

	deployment := types.Deployment{
		DeploymentID: msg.ID,
		State:        types.DeploymentActive,
		Version:      msg.Version,
		CreatedAt:    ctx.BlockHeight(),
	}

	if err := types.ValidateDeploymentGroups(msg.Groups); err != nil {
		return nil, errors.Wrap(types.ErrInvalidGroups, err.Error())
	}

	owner, err := sdk.AccAddressFromBech32(msg.ID.Owner)
	if err != nil {
		return &types.MsgCreateDeploymentResponse{}, err
	}

	depositor, err := sdk.AccAddressFromBech32(msg.Depositor)
	if err != nil {
		return &types.MsgCreateDeploymentResponse{}, err
	}

	if err = ms.authorizeDeposit(ctx, owner, depositor, msg.Deposit); err != nil {
		return nil, err
	}

	groups := make([]types.Group, 0, len(msg.Groups))

	for idx, spec := range msg.Groups {
		groups = append(groups, types.Group{
			GroupID:   types.MakeGroupID(deployment.ID(), uint32(idx+1)),
			State:     types.GroupOpen,
			GroupSpec: spec,
			CreatedAt: ctx.BlockHeight(),
		})
	}

	if err := ms.deployment.Create(ctx, deployment, groups); err != nil {
		return nil, errors.Wrap(types.ErrInternal, err.Error())
	}

	// create orders
	for _, group := range groups {
		if _, err := ms.market.CreateOrder(ctx, group.ID(), group.GroupSpec); err != nil {
			return &types.MsgCreateDeploymentResponse{}, err
		}
	}

	if err := ms.escrow.AccountCreate(ctx,
		types.EscrowAccountForDeployment(deployment.ID()),
		owner,
		depositor,
		msg.Deposit,
	); err != nil {
		return &types.MsgCreateDeploymentResponse{}, err
	}

	return &types.MsgCreateDeploymentResponse{}, nil
}
```

## Deployments Keeper Processing for Store/Chain Population

[Source code reference location](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/keeper/keeper.go#L123)

The `Create` method takes in Deployment details as an argument and writes the new Deployment to the blockchain.

```
func (k Keeper) Create(ctx sdk.Context, deployment types.Deployment, groups []types.Group) error {
	store := ctx.KVStore(k.skey)

	key := deploymentKey(deployment.ID())

	if store.Has(key) {
		return types.ErrDeploymentExists
	}

	store.Set(key, k.cdc.MustMarshal(&deployment))

	for idx := range groups {
		group := groups[idx]

		if !group.ID().DeploymentID().Equals(deployment.ID()) {
			return types.ErrInvalidGroupID
		}
		gkey := groupKey(group.ID())
		store.Set(gkey, k.cdc.MustMarshal(&group))
	}

	ctx.EventManager().EmitEvent(
		types.NewEventDeploymentCreated(deployment.ID(), deployment.Version).
			ToSDKEvent(),
	)

	telemetry.IncrCounter(1.0, "akash.deployment_created")

	return nil
}
```

## Deployments API Amino Definitions

> [Source code reference location](https://github.com/akash-network/node/blob/9c376e978213fba72e1023b829d780f1f4ce64e5/x/deployment/types/v1beta2/codec.go)

Based on the use of the Tendermint RPC implementation and the associated amino client encoding standards the Deployment messages are registered with the Amino Codec.

```
func init() {
	RegisterLegacyAminoCodec(amino)
	cryptocodec.RegisterCrypto(amino)
	amino.Seal()
}

// RegisterLegacyAminoCodec register concrete types on codec
func RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	cdc.RegisterConcrete(&MsgCreateDeployment{}, ModuleName+"/"+MsgTypeCreateDeployment, nil)
	cdc.RegisterConcrete(&MsgUpdateDeployment{}, ModuleName+"/"+MsgTypeUpdateDeployment, nil)
	cdc.RegisterConcrete(&MsgDepositDeployment{}, ModuleName+"/"+MsgTypeDepositDeployment, nil)
	cdc.RegisterConcrete(&MsgCloseDeployment{}, ModuleName+"/"+MsgTypeCloseDeployment, nil)
	cdc.RegisterConcrete(&MsgCloseGroup{}, ModuleName+"/"+MsgTypeCloseGroup, nil)
	cdc.RegisterConcrete(&MsgPauseGroup{}, ModuleName+"/"+MsgTypePauseGroup, nil)
	cdc.RegisterConcrete(&MsgStartGroup{}, ModuleName+"/"+MsgTypeStartGroup, nil)
}
```

The Messages types are defined in Protobuf file `node/proto/akash/deployment/v1beta1/deployment.proto`.  The `MsgCreateDeployment` Protobuf file is referenced below as an example.

```
// MsgCreateDeployment defines an SDK message for creating deployment
message MsgCreateDeployment {
  option (gogoproto.equal) = false;

  DeploymentID id = 1 [
    (gogoproto.nullable)   = false,
    (gogoproto.customname) = "ID",
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];
  repeated GroupSpec groups = 2
      [(gogoproto.nullable) = false, (gogoproto.jsontag) = "groups", (gogoproto.moretags) = "yaml:\"groups\""];
  bytes version = 3 [(gogoproto.jsontag) = "version", (gogoproto.moretags) = "yaml:\"version\""];

  cosmos.base.v1beta1.Coin deposit = 4
      [(gogoproto.nullable) = false, (gogoproto.jsontag) = "deposit", (gogoproto.moretags) = "yaml:\"deposit\""];
}
```