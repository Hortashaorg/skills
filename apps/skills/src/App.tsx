import {
    createQuery,
    type Mutators,
    type Schema,
    type Zero,
} from "@package/database/client";
import { For } from "solid-js";
import { Button } from "@/components/ui/button";

const App = ({ z }: { z: Zero<Schema> }) => {
    const [messages] = createQuery(() => z.query.message, { ttl: "5m" });

    z.mutate.message.insert({
        message: "hello world",
    });

    return (
        <div>
            <For each={messages()}>{(m) => <p>{m.message}</p>}</For>
            <Button>Hello world</Button>
        </div>
    );
};

export default App;
