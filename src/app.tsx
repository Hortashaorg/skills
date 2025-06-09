import { createSignal } from "solid-js";

export const App = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>Count: {count()}</h1>
      <button type="button" onClick={() => setCount(count() + 1)}>
        +
      </button>
      <button type="button" onClick={() => setCount(count() - 1)}>
        -
      </button>
    </div>
  );
};
