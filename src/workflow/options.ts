import { resolveEnvironments } from '../wrangler/environments'
import type { ModuleOptions } from '../wrangler/types'
import { DEFAULT_NODE_VERSION, DEFAULT_PACKAGE_MANAGER } from './constants'
import type { ResolvedWorkflowOptions, WorkflowPackageManager, WorkflowTarget } from './types'

const WORKFLOW_PACKAGE_MANAGERS: WorkflowPackageManager[] = ['npm', 'pnpm', 'yarn']

// This helper is here to normalize package-manager config from user input.
// It accepts known values (`npm`, `pnpm`, `yarn`) and falls back to npm for anything else.
// We need this so generated workflow steps are always valid even when config is missing or misspelled.
function normalizePackageManager(input: string | undefined): WorkflowPackageManager {
  if (!input?.trim()) {
    return DEFAULT_PACKAGE_MANAGER
  }

  const normalized = input.trim().toLowerCase()
  return WORKFLOW_PACKAGE_MANAGERS.includes(normalized as WorkflowPackageManager)
    ? normalized as WorkflowPackageManager
    : DEFAULT_PACKAGE_MANAGER
}

// This helper is here to normalize Node.js version input for actions/setup-node.
// It keeps explicit user values and falls back to a known working default.
// We need this so the workflow remains deterministic when nodeVersion is omitted.
function normalizeNodeVersion(input: string | undefined): string {
  return input?.trim() || DEFAULT_NODE_VERSION
}

// This helper is here to map deployment environments to workflow deploy targets.
// It reuses wrangler environment resolution so branch-to-env mapping stays consistent.
// We need this so `wrangler deploy --env <name>` always matches generated wrangler env blocks.
function resolveWorkflowTargets(environments: ModuleOptions['environments']): WorkflowTarget[] {
  return resolveEnvironments(environments).map(environment => ({
    branch: environment.branch,
    environmentName: environment.name,
  }))
}

// This function is here to build one normalized workflow config object.
// It resolves package manager, Node.js version, and deploy targets from module options.
// We need this single normalization step so the renderer can stay simple and predictable.
export function resolveWorkflowOptions(options: ModuleOptions): ResolvedWorkflowOptions {
  return {
    packageManager: normalizePackageManager(options.packageManager),
    nodeVersion: normalizeNodeVersion(options.nodeVersion),
    targets: resolveWorkflowTargets(options.environments),
  }
}
