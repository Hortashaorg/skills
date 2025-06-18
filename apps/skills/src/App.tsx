import { test } from "@package/database";
import type { Component } from 'solid-js';

const App: Component = () => {
  console.log(test())
  return (
    <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
  );
};

export default App;
