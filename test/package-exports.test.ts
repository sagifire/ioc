import { describe, expect, test } from 'vitest'

const exportSpecifiers = [
    '@sagifire/ioc',
    '@sagifire/ioc/tokens',
    '@sagifire/ioc/container',
    '@sagifire/ioc/context',
    '@sagifire/ioc/composer',
    '@sagifire/ioc/dsl',
    '@sagifire/ioc/diagnostics',
    '@sagifire/ioc/lifecycle',
    '@sagifire/ioc-next',
    '@sagifire/ioc-testing'
]

describe('package export placeholders', () => {
    test.each(exportSpecifiers)('%s resolves as an ESM module', async (specifier) => {
        const module = await import(specifier)

        expect(module).toBeTypeOf('object')
    })
})
