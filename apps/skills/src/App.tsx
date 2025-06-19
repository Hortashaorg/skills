import { test } from '@package/database/client';
import type { Component } from 'solid-js';
import { stuff } from './test.ts';

const App: Component = () => {
  console.log(test())
  stuff()
  return (
    <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
  );
};

export default App;
