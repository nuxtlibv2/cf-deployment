export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  cfDeployment: {
    appName: 'my-pretty-application',
    packageManager: 'pnpm',
    environments: [
      { branch: 'main', url: 'https://my-pretty-application.com', samplingRate: 0.2 },
      { branch: 'feature-1', url: 'https://feature-1.my-pretty-application.com' },
    ],
  },
})
