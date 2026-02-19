import type { ModuleOptions } from '../wrangler/types'
import { resolveWorkflowOptions } from './options'
import { getBuildStepsBlock, getDeployStepsBlock, getWorkflowHeaderBlock } from './workflow-blocks'

// This is the main renderer for GitHub Actions workflow content.
// It turns module options into one complete YAML string.
// We need one central renderer so workflow output stays predictable and testable.
export function renderWorkflowYaml(options: ModuleOptions): string {
  const resolvedOptions = resolveWorkflowOptions(options)
  const branches = resolvedOptions.targets.map(target => target.branch)
  const lines = [
    getWorkflowHeaderBlock(branches),
    '',
    getBuildStepsBlock(resolvedOptions.packageManager, resolvedOptions.nodeVersion),
    '',
    getDeployStepsBlock(resolvedOptions.packageManager, resolvedOptions.targets),
  ]

  return lines.join('\n').trimEnd() + '\n'
}
