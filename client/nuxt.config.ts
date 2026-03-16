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
    port: 5173,
  },
  runtimeConfig: {
    public: {
      apiBase: "/api",
    },
  },
  routeRules: {
    "/api/**": { proxy: "http://127.0.0.1:5050/api/**" },
  },
});
