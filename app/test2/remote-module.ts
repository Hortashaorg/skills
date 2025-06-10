import { DbConnectionImpl, Event } from "@clockworklabs/spacetimedb-sdk";
import {
  DbConnection,
  RemoteReducers,
  RemoteTables,
  SetReducerFlags,
} from "./index.ts";
import { Reducer } from "./types.ts";
import { message, user } from "./tables/index.ts";
import {
  clientConnected,
  identityDisconnected,
  sendMessage,
  setName,
} from "./reducers/index.ts";

export const REMOTE_MODULE = {
  tables: {
    message: {
      tableName: "message",
      rowType: message.getTypeScriptAlgebraicType(),
    },
    user: {
      tableName: "user",
      rowType: user.getTypeScriptAlgebraicType(),
      primaryKey: "identity",
    },
  },
  reducers: {
    client_connected: {
      reducerName: "client_connected",
      argsType: clientConnected.getTypeScriptAlgebraicType(),
    },
    identity_disconnected: {
      reducerName: "identity_disconnected",
      argsType: identityDisconnected.getTypeScriptAlgebraicType(),
    },
    send_message: {
      reducerName: "send_message",
      argsType: sendMessage.getTypeScriptAlgebraicType(),
    },
    set_name: {
      reducerName: "set_name",
      argsType: setName.getTypeScriptAlgebraicType(),
    },
  },

  eventContextConstructor: (imp: DbConnectionImpl, event: Event<Reducer>) => {
    return {
      ...(imp as DbConnection),
      event,
    };
  },
  dbViewConstructor: (imp: DbConnectionImpl) => {
    return new RemoteTables(imp);
  },
  reducersConstructor: (
    imp: DbConnectionImpl,
    setReducerFlags: SetReducerFlags,
  ) => {
    return new RemoteReducers(imp, setReducerFlags);
  },
  setReducerFlagsConstructor: () => {
    return new SetReducerFlags();
  },
};
