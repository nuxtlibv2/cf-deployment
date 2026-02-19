export interface DeploymentEnvironmentInput {
  branch: string
  url: string
  samplingRate?: number
}

export interface ModuleOptions {
  // Package manager of choice used for github actions
  packageManager?: string
  // App name used to generate the `name` field in wrangler.toml and as a prefix for env names.
  appName?: string
  // List of environments to generate in wrangler.toml; each item should have a branch name and URL pattern, with optional sampling rate.
  // Example: [{ branch: 'main', url: 'https://app.example.com' }]
  environments?: DeploymentEnvironmentInput[]
  // Assumes this is consumed by workflow generation, not wrangler rendering.
  nodeVersion?: string
}

export interface ResolvedEnvironment {
  branch: string
  name: string
  routePattern: string
  samplingRate?: number
}
