// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Mahoo Resume",
      meta: [
        {
          name: "description",
          content: "Mahoo12138's Resume",
        },
      ],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  devServer: {
    port: 5000,
  },
});
