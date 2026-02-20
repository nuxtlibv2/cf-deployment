import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  nitro: {
    preset: 'node-server',
  },
})
