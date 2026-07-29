/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_PORTONE_STORE_ID?: string
  readonly VITE_PORTONE_CHANNEL_KEY?: string
}

interface ImportMeta { readonly env: ImportMetaEnv }
