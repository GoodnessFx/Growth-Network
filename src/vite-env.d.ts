/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Deployed API origin (option b) — e.g. https://growth-network-api.up.railway.app */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
