import { describe, expect, test } from 'vitest'

import coreComposerSource from '../packages/ioc/src/composer.ts?raw'
import coreContainerSource from '../packages/ioc/src/container.ts?raw'
import coreContextSource from '../packages/ioc/src/context.ts?raw'
import coreDiagnosticsSource from '../packages/ioc/src/diagnostics.ts?raw'
import coreDslSource from '../packages/ioc/src/dsl.ts?raw'
import coreIndexSource from '../packages/ioc/src/index.ts?raw'
import coreLifecycleSource from '../packages/ioc/src/lifecycle.ts?raw'
import corePackageSource from '../packages/ioc/package.json?raw'
import coreTokensSource from '../packages/ioc/src/tokens.ts?raw'
import nextIndexSource from '../packages/ioc-next/src/index.ts?raw'
import actionExampleSource from '../examples/next-app-router/app/contact/actions.ts?raw'
import routeExampleSource from '../examples/next-app-router/app/api/contacts/[id]/route.ts?raw'
import testingIndexSource from '../packages/ioc-testing/src/index.ts?raw'
import testingPackageSource from '../packages/ioc-testing/package.json?raw'
import * as core from '@sagifire/ioc'
import * as nextAdapter from '@sagifire/ioc-next'
import * as testing from '@sagifire/ioc-testing'

interface SourceFile {
    readonly path: string
    readonly text: string
}

interface ForbiddenSourcePattern {
    readonly label: string
    readonly pattern: RegExp
}

interface PackageManifest {
    readonly dependencies?: Record<string, string>
    readonly devDependencies?: Record<string, string>
    readonly peerDependencies?: Record<string, string>
    readonly optionalDependencies?: Record<string, string>
}

const coreSourceFiles: readonly SourceFile[] = [
    {
        path: 'packages/ioc/src/composer.ts',
        text: coreComposerSource
    },
    {
        path: 'packages/ioc/src/container.ts',
        text: coreContainerSource
    },
    {
        path: 'packages/ioc/src/context.ts',
        text: coreContextSource
    },
    {
        path: 'packages/ioc/src/diagnostics.ts',
        text: coreDiagnosticsSource
    },
    {
        path: 'packages/ioc/src/dsl.ts',
        text: coreDslSource
    },
    {
        path: 'packages/ioc/src/index.ts',
        text: coreIndexSource
    },
    {
        path: 'packages/ioc/src/lifecycle.ts',
        text: coreLifecycleSource
    },
    {
        path: 'packages/ioc/src/tokens.ts',
        text: coreTokensSource
    }
]
const testingSourceFiles: readonly SourceFile[] = [
    {
        path: 'packages/ioc-testing/src/index.ts',
        text: testingIndexSource
    }
]
const nextSourceFiles: readonly SourceFile[] = [
    {
        path: 'packages/ioc-next/src/index.ts',
        text: nextIndexSource
    }
]
const nextOrReactImportPatterns: readonly ForbiddenSourcePattern[] = [
    {
        label: '@sagifire/ioc-next import',
        pattern: /(?:from\s+|import\s*\(\s*|import\s+)['"]@sagifire\/ioc-next(?:\/[^'"]*)?['"]/u
    },
    {
        label: 'Next.js import',
        pattern: /(?:from\s+|import\s*\(\s*|import\s+)['"]next(?:\/[^'"]*)?['"]/u
    },
    {
        label: 'React import',
        pattern: /(?:from\s+|import\s*\(\s*|import\s+)['"]react(?:\/[^'"]*)?['"]/u
    }
]
const nextHiddenBehaviorPatterns: readonly ForbiddenSourcePattern[] = [
    {
        label: 'filesystem import',
        pattern: /(?:from\s+|import\s*\(\s*|import\s+)['"](?:node:)?(?:fs|path)(?:\/[^'"]*)?['"]/u
    },
    {
        label: 'hidden current context access',
        pattern:
            /\b(?:AsyncLocalStorage|getCurrent(?:Request|Action|Scope)?|current(?:Request|Action|Scope)|serviceLocator|service\s+locator)\b/u
    },
    {
        label: 'discovery or scanning API',
        pattern:
            /\b(?:discover[A-Z]\w*|scan[A-Z]\w*|autoDiscovery|routeScanning|moduleDiscovery|filesystemDiscovery)\b/u
    }
]
const forbiddenFrameworkDependencies = ['@sagifire/ioc-next', 'next', 'react']
const frameworkBoundaryImplementationPatterns: readonly ForbiddenSourcePattern[] = [
    {
        label: 'module definition in framework file',
        pattern: /\bdefineModule\b/u
    },
    {
        label: 'composer construction in framework file',
        pattern: /\bcreateComposer\b/u
    },
    {
        label: 'container construction in framework file',
        pattern: /\bcreateContainer\b/u
    },
    {
        label: 'provider binding in framework file',
        pattern: /\b(?:bind|add)\s*\(/u
    },
    {
        label: 'business API factory in framework file',
        pattern: /\bcreateContactRequestsPublicApi\b/u
    }
]

describe('package boundaries', () => {
    test('core source and manifest do not import or depend on Next.js, React or adapter package', () => {
        expect(findForbiddenSourceMatches(coreSourceFiles, nextOrReactImportPatterns)).toEqual([])
        expect(
            findForbiddenDependencies(
                readPackageManifest(corePackageSource),
                forbiddenFrameworkDependencies
            )
        ).toEqual([])
    })

    test('core public surface does not expose testing helpers', () => {
        const testingExportNames = [
            'createTestRuntime',
            'createTestComposer',
            'override',
            'fakeModule',
            'createModuleHarness',
            'assertGraphHasModule',
            'assertGraphHasCapability',
            'assertGraphHasRequiredPort',
            'assertGraphHasBinding',
            'assertGraphHasEdge',
            'assertDiagnosticReportOk',
            'assertDiagnosticReportHasDiagnostic',
            'assertErrorDiagnostic',
            'DuplicateTestOverrideError',
            'GraphAssertionError',
            'DiagnosticAssertionError'
        ]
        const publicExportViolations = testingExportNames.filter((exportName) => {
            return exportName in core
        })

        expect(publicExportViolations).toEqual([])
    })

    test('testing source and manifest do not import or depend on Next.js, React or adapter package', () => {
        expect(findForbiddenSourceMatches(testingSourceFiles, nextOrReactImportPatterns)).toEqual(
            []
        )
        expect(
            findForbiddenDependencies(
                readPackageManifest(testingPackageSource),
                forbiddenFrameworkDependencies
            )
        ).toEqual([])
    })

    test('testing public surface does not expose Next.js adapter helpers', () => {
        const forbiddenExportNames = Object.keys(testing).filter((exportName) => {
            const normalizedExportName = exportName.toLowerCase()

            return (
                normalizedExportName.includes('next') ||
                normalizedExportName.includes('routehandler') ||
                normalizedExportName.includes('serveraction') ||
                normalizedExportName.includes('requestcontext')
            )
        })

        expect(forbiddenExportNames).toEqual([])
    })

    test('Next.js adapter source does not add hidden discovery or current-context APIs', () => {
        expect(findForbiddenSourceMatches(nextSourceFiles, nextHiddenBehaviorPatterns)).toEqual([])
    })

    test('minimal Next App Router examples keep framework boundary files thin', () => {
        const routeExample = {
            path: 'examples/next-app-router/app/api/contacts/[id]/route.ts',
            text: routeExampleSource
        }
        const actionExample = {
            path: 'examples/next-app-router/app/contact/actions.ts',
            text: actionExampleSource
        }

        expect(routeExample.text).toContain('withRouteScope')
        expect(routeExample.text).toContain('scope.get(CONTACT_REQUESTS_PUBLIC_API)')
        expect(actionExample.text).toContain('withServerActionScope')
        expect(actionExample.text).toContain('scope.get(CONTACT_REQUESTS_PUBLIC_API)')
        expect(
            findForbiddenSourceMatches(
                [routeExample, actionExample],
                frameworkBoundaryImplementationPatterns
            )
        ).toEqual([])
    })

    test('Next.js adapter package remains separate from testing helpers', () => {
        const nextExportNames = Object.keys(nextAdapter)
        const testingHelperNames = [
            'createTestRuntime',
            'createTestComposer',
            'override',
            'fakeModule',
            'createModuleHarness'
        ]
        const leakedTestingHelpers = testingHelperNames.filter((exportName) => {
            return exportName in nextAdapter
        })
        const futureStageHelperNames = ['createRouteHandlerScope', 'createServerActionScope']
        const earlyFutureStageHelpers = futureStageHelperNames.filter((exportName) => {
            return exportName in nextAdapter
        })
        const hiddenRequestContextHelpers = nextExportNames.filter((exportName) => {
            const normalizedExportName = exportName.toLowerCase()

            return (
                normalizedExportName.includes('current') ||
                normalizedExportName.includes('asynclocal') ||
                normalizedExportName.includes('global')
            )
        })

        expect(nextAdapter.createNextRequestContext).toBeTypeOf('function')
        expect(nextAdapter.createNextRuntime).toBeTypeOf('function')
        expect(nextAdapter.nextRequestMultiValue).toBeTypeOf('function')
        expect(nextAdapter.nextRequestValue).toBeTypeOf('function')
        expect(nextAdapter.withRouteScope).toBeTypeOf('function')
        expect(nextAdapter.withServerActionScope).toBeTypeOf('function')
        expect(nextExportNames.sort()).toEqual(
            [
                'createNextRequestContext',
                'createNextRuntime',
                'nextRequestMultiValue',
                'nextRequestValue',
                'withRouteScope',
                'withServerActionScope'
            ].sort()
        )
        expect(leakedTestingHelpers).toEqual([])
        expect(earlyFutureStageHelpers).toEqual([])
        expect(hiddenRequestContextHelpers).toEqual([])
    })
})

function readPackageManifest(source: string): PackageManifest {
    return JSON.parse(source) as PackageManifest
}

function findForbiddenSourceMatches(
    files: readonly SourceFile[],
    patterns: readonly ForbiddenSourcePattern[]
): readonly string[] {
    return files.flatMap((file) => {
        return patterns
            .filter((forbiddenPattern) => {
                return forbiddenPattern.pattern.test(file.text)
            })
            .map((forbiddenPattern) => {
                return `${file.path}: ${forbiddenPattern.label}`
            })
    })
}

function findForbiddenDependencies(
    manifest: PackageManifest,
    forbiddenDependencyNames: readonly string[]
): readonly string[] {
    const dependencyNames = [
        ...Object.keys(manifest.dependencies ?? {}),
        ...Object.keys(manifest.devDependencies ?? {}),
        ...Object.keys(manifest.peerDependencies ?? {}),
        ...Object.keys(manifest.optionalDependencies ?? {})
    ]

    return dependencyNames.filter((dependencyName) => {
        return forbiddenDependencyNames.includes(dependencyName)
    })
}
