// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint", "@pinia/nuxt"],
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
        },
        {
          rel: "stylesheet",
          href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        },
      ],
    },
  },
  devServer: {
    port: 3333,
  },
  runtimeConfig: {
    public: {
      apiBase: "/api",
    },
  },
  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:5050/api",
        changeOrigin: true,
      },
    },
  },
});
