import { describe, expect, it } from 'vitest'
import { renderWorkflowYaml } from '../src/workflow/render'

describe('renderWorkflowYaml', () => {
  it('renders a default npm workflow when no environments are configured', () => {
    const output = renderWorkflowYaml({})

    expect(output).toContain('name: Deploy to Cloudflare Workers')
    expect(output).toContain('on:\n  push:')
    expect(output).not.toContain('branches:')
    expect(output).toContain('node-version: 24')
    expect(output).toContain('run: npx wrangler deploy')
    expect(output).not.toContain('--env')
  })

  it('renders branch-targeted deploy steps and package-manager-specific commands', () => {
    const output = renderWorkflowYaml({
      packageManager: 'pnpm',
      nodeVersion: '20',
      environments: [
        { branch: 'main', url: 'https://app.example.com' },
        { branch: 'feature-1', url: 'https://feature-1.app.example.com' },
      ],
    })

    expect(output).toContain('branches:')
    expect(output).toContain('      - main')
    expect(output).toContain('      - feature-1')

    expect(output).toContain('name: Enable Corepack')
    expect(output).toContain('run: corepack enable')
    expect(output).not.toContain('uses: pnpm/action-setup@v4')
    expect(output).toContain('node-version: 20')

    expect(output).toContain('if: github.ref == \'refs/heads/main\'')
    expect(output).toContain('run: pnpm dlx wrangler deploy --env main')
    expect(output).toContain('if: github.ref == \'refs/heads/feature-1\'')
    expect(output).toContain('run: pnpm dlx wrangler deploy --env feature_1')
  })
})
