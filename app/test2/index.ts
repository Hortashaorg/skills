import {
  BinaryWriter,
  CallReducerFlags,
  ClientCache,
  DbConnectionBuilder,
  DbConnectionImpl,
} from "@clockworklabs/spacetimedb-sdk";
import { REMOTE_MODULE } from "./remote-module.ts";
import {
  Message,
  MessageTableHandle,
  User,
  UserTableHandle,
} from "./tables/index.ts";
import { sendMessage, setName } from "./reducers/index.ts";
import {
  ErrorContext,
  ReducerEventContext,
  SubscriptionBuilder,
  SubscriptionEventContext,
} from "./types.ts";

export class DbConnection
  extends DbConnectionImpl<RemoteTables, RemoteReducers, SetReducerFlags> {
  static builder = (): DbConnectionBuilder<
    DbConnection,
    ErrorContext,
    SubscriptionEventContext
  > => {
    return new DbConnectionBuilder<
      DbConnection,
      ErrorContext,
      SubscriptionEventContext
    >(REMOTE_MODULE, (imp: DbConnectionImpl) => imp as DbConnection);
  };
  override subscriptionBuilder = (): SubscriptionBuilder => {
    return new SubscriptionBuilder(this);
  };
}

export class RemoteReducers {
  constructor(
    private connection: DbConnectionImpl,
    private setCallReducerFlags: SetReducerFlags,
  ) {}

  onClientConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("client_connected", callback);
  }

  removeOnClientConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("client_connected", callback);
  }

  onIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("identity_disconnected", callback);
  }

  removeOnIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("identity_disconnected", callback);
  }

  sendMessage(text: string) {
    const __args = { text };
    const __writer = new BinaryWriter(1024);
    sendMessage.getTypeScriptAlgebraicType().serialize(__writer, __args);
    const __argsBuffer = __writer.getBuffer();
    this.connection.callReducer(
      "send_message",
      __argsBuffer,
      this.setCallReducerFlags.sendMessageFlags,
    );
  }

  onSendMessage(callback: (ctx: ReducerEventContext, text: string) => void) {
    this.connection.onReducer("send_message", callback);
  }

  removeOnSendMessage(
    callback: (ctx: ReducerEventContext, text: string) => void,
  ) {
    this.connection.offReducer("send_message", callback);
  }

  setName(name: string) {
    const __args = { name };
    const __writer = new BinaryWriter(1024);
    setName.getTypeScriptAlgebraicType().serialize(__writer, __args);
    const __argsBuffer = __writer.getBuffer();
    this.connection.callReducer(
      "set_name",
      __argsBuffer,
      this.setCallReducerFlags.setNameFlags,
    );
  }

  onSetName(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.onReducer("set_name", callback);
  }

  removeOnSetName(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.offReducer("set_name", callback);
  }
}

export class SetReducerFlags {
  sendMessageFlags: CallReducerFlags = "FullUpdate";
  sendMessage(flags: CallReducerFlags) {
    this.sendMessageFlags = flags;
  }

  setNameFlags: CallReducerFlags = "FullUpdate";
  setName(flags: CallReducerFlags) {
    this.setNameFlags = flags;
  }
}

export class RemoteTables {
  constructor(private connection: DbConnectionImpl) {}

  get message(): MessageTableHandle {
    return new MessageTableHandle(
      (this.connection["clientCache"] as ClientCache).getOrCreateTable<Message>(
        REMOTE_MODULE.tables.message,
      ),
    );
  }

  get user(): UserTableHandle {
    return new UserTableHandle(
      (this.connection["clientCache"] as ClientCache).getOrCreateTable<User>(
        REMOTE_MODULE.tables.user,
      ),
    );
  }
}
