import { describe, expect, it } from 'vitest'
import { renderWranglerToml } from '../src/wrangler/render'

describe('renderWranglerToml', () => {
  it('renders a safe default when no environments are configured', () => {
    const output = renderWranglerToml({ appName: 'docs-app' })

    expect(output).toContain('name = "docs-app"')
    expect(output).toContain('routes = [{ pattern = "app.example.com", custom_domain = true }]')
    expect(output).not.toContain('[observability]')
    expect(output).not.toContain('[env.')
  })

  it('renders one environment block per entry and enables observability only when sampling is set', () => {
    const output = renderWranglerToml({
      appName: 'docs-app',
      environments: [
        { branch: 'main', url: 'https://app.example.com/' },
        { branch: 'staging', url: 'staging.app.example.com', samplingRate: 1 },
        { branch: 'staging', url: 'https://staging-2.app.example.com', samplingRate: 0.35 },
      ],
    })

    expect(output).toContain('[env.main]')
    expect(output).toContain('name = "docs-app-main"')
    expect(output).not.toContain('[env.main.observability]')

    expect(output).toContain('[env.staging]')
    expect(output).toContain('[env.staging.observability]')
    expect(output).toContain('head_sampling_rate = 1')

    expect(output).toContain('[env.staging_2]')
    expect(output).toContain('name = "docs-app-staging_2"')
    expect(output).toContain('[env.staging_2.observability]')
    expect(output).toContain('head_sampling_rate = 0.35')
    expect(output).toContain('{ pattern = "staging-2.app.example.com", custom_domain = true }')
  })
})
