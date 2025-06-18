/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  // Add other Vite environment variables here as needed
  // readonly VITE_SOME_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
