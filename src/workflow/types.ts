export type WorkflowPackageManager = 'npm' | 'pnpm' | 'yarn'

export interface WorkflowTarget {
  branch: string
  environmentName: string
}

export interface ResolvedWorkflowOptions {
  packageManager: WorkflowPackageManager
  nodeVersion: string
  targets: WorkflowTarget[]
}
