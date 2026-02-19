import { DEFAULT_ROUTE } from './constants'
import type { DeploymentEnvironmentInput, ModuleOptions, ResolvedEnvironment } from './types'

// This type guard is here to keep bad or half-filled entries out of rendering.
// It checks that branch and URL exist and are non-empty strings.
// We need this so later code can rely on clean values without extra checks everywhere.
function isCompleteEnvironment(environment: unknown): environment is DeploymentEnvironmentInput {
  return Boolean(
    typeof environment === 'object'
    && environment
    && 'branch' in environment
    && 'url' in environment
    && typeof environment.branch === 'string'
    && typeof environment.url === 'string'
    && environment.branch.trim()
    && environment.url.trim(),
  )
}

// This helper is here to convert user input into Wrangler route format.
// It accepts full URLs or host/path values and returns `host[/path]`.
// We need this because Wrangler expects route patterns, and users often paste full URLs.
function normalizeRoutePattern(input: string | undefined, fallback: string = DEFAULT_ROUTE): string {
  if (!input?.trim()) {
    return fallback
  }

  const rawValue = input.trim()
  const urlValue = /^[a-z][\w+.-]*:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`

  try {
    const parsedUrl = new URL(urlValue)
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, '')
    return `${parsedUrl.host}${normalizedPath}`
  }
  catch {
    return rawValue.replace(/^[a-z][\w+.-]*:\/\//i, '').replace(/\/+$/, '')
  }
}

// This helper is here to make safe env keys from branch names.
// It lowercases and replaces unsupported characters with underscores.
// We need this so `[env.<name>]` blocks are stable and TOML-safe.
function toEnvironmentName(branch: string): string {
  const normalized = branch
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || 'env'
}

// This helper is here to normalize optional sampling input.
// It accepts only explicit numeric values from the user config.
// We need this because observability should be opt-in: no value means no logs block.
function toSamplingRate(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return undefined
  }

  // Cloudflare sampling is expected in [0, 1]. Out-of-range values are treated as "not set".
  if (value < 0 || value > 1) {
    return undefined
  }

  return value
}

// WHAT: This function is here to prepare all env entries before rendering.
// HOW: It filters invalid entries, normalizes routes, picks sampling rates, and ensures unique env names.
// WHY: We need this single prep step so rendering stays simple and every env block follows the same rules.
export function resolveEnvironments(
  environments: ModuleOptions['environments'],
  fallbackRoute: string = DEFAULT_ROUTE,
): ResolvedEnvironment[] {
  const validEnvironments = (environments ?? []).filter(isCompleteEnvironment)
  const usedEnvironmentNames = new Set<string>()

  return validEnvironments.map((environment) => {
    const branch = environment.branch.trim()
    const routePattern = normalizeRoutePattern(environment.url, fallbackRoute)
    const samplingRate = toSamplingRate(environment.samplingRate)
    let name = toEnvironmentName(branch)

    if (usedEnvironmentNames.has(name)) {
      let suffix = 2
      while (usedEnvironmentNames.has(`${name}_${suffix}`)) {
        suffix += 1
      }
      name = `${name}_${suffix}`
    }
    usedEnvironmentNames.add(name)

    return {
      branch,
      name,
      routePattern,
      samplingRate,
    }
  })
}
