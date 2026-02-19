import { DEFAULT_APP_NAME } from './constants'
import { resolveEnvironments } from './environments'
import type { ModuleOptions } from './types'
import { getEnvironmentSection, getHeaderBlock, getNoEnvironmentSection } from './wrangler-blocks'

// WHAT: This is the main renderer for wrangler.toml content.
// HOW: It turns module options into one complete TOML string.
// WHY: We need one place for this so output stays predictable and testable.
export function renderWranglerToml(options: ModuleOptions): string {
  const appName = options.appName?.trim() || DEFAULT_APP_NAME
  const environments = resolveEnvironments(options.environments)
  const headerBlock = getHeaderBlock(appName)
  const lines: string[] = [headerBlock]

  lines.push('')

  if (environments.length === 0) {
    lines.push(getNoEnvironmentSection())
    return lines.join('\n').trimEnd() + '\n'
  }

  lines.push('# One block is generated for each item in `cfDeployment.environments`.')
  lines.push('')
  for (const environment of environments) {
    lines.push(getEnvironmentSection(appName, environment))
    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}
