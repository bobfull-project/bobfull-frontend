const USE_MOCK = import.meta.env.VITE_USE_MOCK

export const apiConfig = { useMock: USE_MOCK === undefined ? import.meta.env.DEV : USE_MOCK === 'true' }
