import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        tokens: 'src/tokens.ts',
        container: 'src/container.ts',
        context: 'src/context.ts',
        composer: 'src/composer.ts',
        dsl: 'src/dsl.ts',
        diagnostics: 'src/diagnostics.ts',
        'graph-export': 'src/graph-export.ts',
        lifecycle: 'src/lifecycle.ts'
    },
    format: ['esm'],
    target: 'es2022',
    dts: {
        compilerOptions: {
            composite: false
        }
    },
    sourcemap: true,
    clean: true,
    splitting: false
})
