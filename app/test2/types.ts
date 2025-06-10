import {
  ErrorContextInterface,
  EventContextInterface,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
} from "@clockworklabs/spacetimedb-sdk";
import {
  ClientConnected,
  IdentityDisconnected,
  SendMessage,
  SetName,
} from "./reducers/index.ts";
import { RemoteReducers, RemoteTables, SetReducerFlags } from "./index.ts";

export type Reducer =
  | never
  | { name: "ClientConnected"; args: ClientConnected }
  | { name: "IdentityDisconnected"; args: IdentityDisconnected }
  | { name: "SendMessage"; args: SendMessage }
  | { name: "SetName"; args: SetName };

export type EventContext = EventContextInterface<
  RemoteTables,
  RemoteReducers,
  SetReducerFlags,
  Reducer
>;

export type ErrorContext = ErrorContextInterface<
  RemoteTables,
  RemoteReducers,
  SetReducerFlags
>;

export type SubscriptionEventContext = SubscriptionEventContextInterface<
  RemoteTables,
  RemoteReducers,
  SetReducerFlags
>;

export type ReducerEventContext = ReducerEventContextInterface<
  RemoteTables,
  RemoteReducers,
  SetReducerFlags,
  Reducer
>;

export class SubscriptionBuilder extends SubscriptionBuilderImpl<
  RemoteTables,
  RemoteReducers,
  SetReducerFlags
> {}
