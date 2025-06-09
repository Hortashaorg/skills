export class ConnectionDB {
  private ws?: WebSocket;
  private url: string;
  private databaseName: string;
  public isReady: boolean;

  constructor(url: string, databaseName: string) {
    this.url = url;
    this.databaseName = databaseName;
    this.isReady = false;
  }

  connect() {
    this.ws = new WebSocket(
      `ws://${this.url}/v1/database/${this.databaseName}/subscribe`,
      "v1.json.spacetimedb",
    );

    this.ws.onopen = () => {
      console.log("Connected to SpacetimeDB");
      this.isReady = true;
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    };

    this.ws.onmessage = (event) => {
      console.log("Received message:", event.data);
    };

    return this;
  }

  oneOffQuery(sql: string) {
    this.ws!.send(JSON.stringify({
      "OneOffQuery": {
        "message_id": Array.from(new TextEncoder().encode(crypto.randomUUID())),
        "query_string": sql,
      },
    }));
  }

  subscribeQuery(sql: string) {
    this.ws!.send(JSON.stringify({
      "Subscribe": {
        "query_strings": [sql],
        "request_id": 0,
      },
    }));
  }

  subscribeSingleQuery(sql: string) {
    const queryId = Math.floor(Math.random() * 1000000);

    this.ws!.send(JSON.stringify({
      "SubscribeSingle": {
        "query": sql,
        "request_id": 0,
        "query_id": queryId,
      },
    }));
  }
}

new ConnectionDB("localhost:3000", "quickstart").connect();
