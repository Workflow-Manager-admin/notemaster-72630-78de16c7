/**
 * NoteMaster Nuxt App Configuration
 * - Imports main CSS for modern, minimal design
 * - Sets compatibility and dev server style
 */
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  css: [
    '~/assets/main.css'
  ],
  devtools: { enabled: true },
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    },
  },
  vite: {
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      port: 3000,
    },
  },
});
