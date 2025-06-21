import type { Component } from "solid-js";
import { Button } from "@/components/ui/button.tsx";

const App: Component = () => {
    return (
        <div>
            <p class="p-4 text-green-500 text-center">Hello tailwind!</p>
            <Button>Hello world</Button>
        </div>
    );
};

export default App;
