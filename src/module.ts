import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { DEFAULT_WORKFLOW_PATH } from './workflow/constants'
import { renderWorkflowYaml } from './workflow/render'
import { renderWranglerToml } from './wrangler/render'
import type { ModuleOptions } from './wrangler/types'

export type { ModuleOptions } from './wrangler/types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtlib/cf-deployment',
    configKey: 'cfDeployment',
    compatibility: {
      nuxt: '>=3.0.0 <5.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  // This setup function is here to generate deployment config during Nuxt setup.
  // It renders `wrangler.toml` from `cfDeployment` options and writes it to the project root.
  // We need this so deploy settings stay in sync with app config every time setup runs.
  async setup(options, nuxt) {
    const logger = useLogger('@nuxtlib/cf-deployment')
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.preset = 'cloudflare_module'

    const wranglerPath = resolve(nuxt.options.rootDir, 'wrangler.toml')
    const workflowPath = resolve(nuxt.options.rootDir, DEFAULT_WORKFLOW_PATH)

    // We must rewrite wrangler.toml on each setup so config changes are not silently ignored.
    // If we "optimize" by skipping existing files, users can change `cfDeployment` and still deploy stale settings.
    const wranglerContent = renderWranglerToml(options)
    await writeFile(wranglerPath, wranglerContent, 'utf8')
    logger.success(`Generated wrangler.toml at ${wranglerPath}`)

    // We must also generate workflow YAML from the same options to keep deploy automation in sync.
    // If this file is edited by hand, next setup will replace it with config-driven output by design.
    const workflowContent = renderWorkflowYaml(options)
    await mkdir(dirname(workflowPath), { recursive: true })
    await writeFile(workflowPath, workflowContent, 'utf8')
    logger.success(`Generated workflow file at ${workflowPath}`)
  },
})
