// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint"],
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
