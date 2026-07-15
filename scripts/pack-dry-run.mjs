import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(scriptDirectory, '..')
const temporaryRoot = path.join(workspaceRoot, '.tmp', 'package-dry-run')

const packageTargets = [
    {
        name: '@sagifire/ioc',
        directory: 'packages/ioc',
        exports: [
            '.',
            './tokens',
            './container',
            './context',
            './composer',
            './dsl',
            './diagnostics',
            './graph-export',
            './lifecycle',
            './package.json'
        ]
    },
    {
        name: '@sagifire/ioc-next',
        directory: 'packages/ioc-next',
        exports: ['.', './package.json']
    },
    {
        name: '@sagifire/ioc-testing',
        directory: 'packages/ioc-testing',
        exports: ['.', './package.json']
    }
]

await main()

async function main() {
    assertInsideWorkspace(temporaryRoot)

    await rm(temporaryRoot, {
        force: true,
        recursive: true
    })
    await mkdir(temporaryRoot, {
        recursive: true
    })

    run('pnpm', ['build'])

    const packedPackages = []

    for (const packageTarget of packageTargets) {
        packedPackages.push(await packAndValidatePackage(packageTarget))
    }

    await runSmokeProject(packedPackages)

    console.log('Package dry-run validation passed.')
}

async function packAndValidatePackage(packageTarget) {
    const packageDirectory = path.join(workspaceRoot, packageTarget.directory)
    const sourceManifest = await readJson(path.join(packageDirectory, 'package.json'))
    const packDirectory = path.join(
        temporaryRoot,
        'tarballs',
        sanitizePackageName(packageTarget.name)
    )

    await mkdir(packDirectory, {
        recursive: true
    })

    run('pnpm', ['--filter', packageTarget.name, 'pack', '--pack-destination', packDirectory])

    const packedFiles = await readdir(packDirectory)
    const tarballNames = packedFiles.filter((fileName) => {
        return fileName.endsWith('.tgz')
    })

    if (tarballNames.length !== 1) {
        throw new Error(
            `Expected exactly one tarball for ${packageTarget.name}, found ${tarballNames.length}`
        )
    }

    const tarballPath = path.join(packDirectory, tarballNames[0])
    const packageEntries = listTarballEntries(tarballPath)
    const packedManifest = readTarballJson(tarballPath, 'package/package.json')

    validatePackageManifest(packageTarget, sourceManifest, packedManifest)
    validatePackageContents(packageTarget, packedManifest, packageEntries)
    validateExportTargets(packageTarget, packedManifest, packageEntries)

    console.log(`Validated ${packageTarget.name} package contents and metadata.`)

    return {
        target: packageTarget,
        tarballPath,
        manifest: packedManifest
    }
}

async function runSmokeProject(packedPackages) {
    const smokeDirectory = path.join(temporaryRoot, 'smoke')
    const npmCacheDirectory = path.join(smokeDirectory, '.npm-cache')

    await mkdir(smokeDirectory, {
        recursive: true
    })
    await mkdir(npmCacheDirectory, {
        recursive: true
    })
    await writeJson(path.join(smokeDirectory, 'package.json'), {
        private: true,
        type: 'module'
    })

    run(
        'npm',
        [
            'install',
            '--ignore-scripts',
            '--no-audit',
            '--no-fund',
            '--package-lock=false',
            '--cache',
            npmCacheDirectory,
            ...packedPackages.map((packedPackage) => {
                return packedPackage.tarballPath
            })
        ],
        {
            cwd: smokeDirectory
        }
    )

    await writeFile(path.join(smokeDirectory, 'runtime-smoke.mjs'), createRuntimeSmokeSource())
    await writeFile(path.join(smokeDirectory, 'type-smoke.ts'), createTypeSmokeSource())
    await writeJson(path.join(smokeDirectory, 'tsconfig.json'), {
        compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            noImplicitAny: true,
            exactOptionalPropertyTypes: true,
            skipLibCheck: false
        },
        include: ['type-smoke.ts']
    })

    run('node', ['runtime-smoke.mjs'], {
        cwd: smokeDirectory
    })
    run('pnpm', ['exec', 'tsc', '-p', path.join(smokeDirectory, 'tsconfig.json'), '--noEmit'])

    console.log('Validated runtime and TypeScript package export smoke checks.')
}

function validatePackageManifest(packageTarget, sourceManifest, packedManifest) {
    assertEqual(packedManifest.name, packageTarget.name, `${packageTarget.name} package name`)
    assertEqual(packedManifest.version, sourceManifest.version, `${packageTarget.name} version`)
    assertEqual(packedManifest.type, 'module', `${packageTarget.name} module type`)
    assertEqual(packedManifest.license, 'Apache-2.0', `${packageTarget.name} license`)
    assertEqual(packedManifest.sideEffects, false, `${packageTarget.name} sideEffects`)
    assertEqual(
        packedManifest.publishConfig?.access,
        'public',
        `${packageTarget.name} publish access`
    )

    if (!isRecord(packedManifest.repository)) {
        throw new Error(`${packageTarget.name} package metadata must include repository`)
    }

    if (!isRecord(packedManifest.bugs) || typeof packedManifest.bugs.url !== 'string') {
        throw new Error(`${packageTarget.name} package metadata must include bugs.url`)
    }

    if (typeof packedManifest.homepage !== 'string') {
        throw new Error(`${packageTarget.name} package metadata must include homepage`)
    }

    assertNoWorkspaceProtocol(packageTarget.name, packedManifest)
}

function validatePackageContents(packageTarget, packedManifest, packageEntries) {
    const requiredEntries = [
        'package.json',
        'README.md',
        'LICENSE',
        'NOTICE',
        'CHANGELOG.md',
        ...getManifestFiles(packageTarget.name, packedManifest)
    ]

    for (const requiredEntry of requiredEntries) {
        assertPackageEntry(packageTarget.name, packageEntries, requiredEntry)
    }

    const forbiddenPrefixes = ['src/', 'test/', 'node_modules/', '.vite/']
    const forbiddenNames = ['tsconfig.json', 'tsup.config.ts']

    for (const packageEntry of packageEntries) {
        for (const forbiddenPrefix of forbiddenPrefixes) {
            if (packageEntry.startsWith(forbiddenPrefix)) {
                throw new Error(`${packageTarget.name} tarball must not include ${packageEntry}`)
            }
        }

        if (forbiddenNames.includes(packageEntry)) {
            throw new Error(`${packageTarget.name} tarball must not include ${packageEntry}`)
        }
    }
}

function validateExportTargets(packageTarget, packedManifest, packageEntries) {
    assertPackageEntry(
        packageTarget.name,
        packageEntries,
        normalizePackagePath(packedManifest.main)
    )
    assertPackageEntry(
        packageTarget.name,
        packageEntries,
        normalizePackagePath(packedManifest.types)
    )

    if (!isRecord(packedManifest.exports)) {
        throw new Error(`${packageTarget.name} package exports must be an object`)
    }

    for (const exportKey of packageTarget.exports) {
        if (!(exportKey in packedManifest.exports)) {
            throw new Error(`${packageTarget.name} package exports must include ${exportKey}`)
        }

        for (const exportPath of collectExportPaths(packedManifest.exports[exportKey])) {
            assertPackageEntry(packageTarget.name, packageEntries, normalizePackagePath(exportPath))
        }
    }
}

function collectExportPaths(exportDefinition) {
    if (typeof exportDefinition === 'string') {
        return [exportDefinition]
    }

    if (!isRecord(exportDefinition)) {
        return []
    }

    return Object.values(exportDefinition).flatMap((value) => {
        return collectExportPaths(value)
    })
}

function getManifestFiles(packageName, packedManifest) {
    if (!Array.isArray(packedManifest.files)) {
        throw new Error(`${packageName} package files must be an array`)
    }

    return packedManifest.files.map((fileEntry) => {
        if (typeof fileEntry !== 'string') {
            throw new Error(`${packageName} package files entries must be strings`)
        }

        return normalizePackagePath(fileEntry)
    })
}

function assertNoWorkspaceProtocol(packageName, manifest) {
    for (const dependencyField of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
        const dependencies = manifest[dependencyField]

        if (dependencies === undefined) {
            continue
        }

        if (!isRecord(dependencies)) {
            throw new Error(`${packageName} ${dependencyField} must be an object`)
        }

        for (const [dependencyName, dependencyRange] of Object.entries(dependencies)) {
            if (typeof dependencyRange !== 'string') {
                throw new Error(
                    `${packageName} dependency ${dependencyName} must use a string range`
                )
            }

            if (dependencyRange.startsWith('workspace:')) {
                throw new Error(
                    `${packageName} packed dependency ${dependencyName} still uses ${dependencyRange}`
                )
            }
        }
    }
}

function listTarballEntries(tarballPath) {
    return runAndCapture('tar', ['-tf', tarballPath])
        .split(/\r?\n/u)
        .filter((line) => {
            return line.length > 0
        })
        .map((entry) => {
            return normalizeTarballEntry(entry)
        })
}

function readTarballJson(tarballPath, entryPath) {
    return JSON.parse(runAndCapture('tar', ['-xOf', tarballPath, entryPath]))
}

function normalizeTarballEntry(entry) {
    return entry.replace(/^package\//u, '').replace(/\\/gu, '/')
}

function normalizePackagePath(packagePath) {
    if (typeof packagePath !== 'string') {
        throw new Error('Package path must be a string')
    }

    return packagePath.replace(/^\.\//u, '').replace(/\\/gu, '/')
}

function assertPackageEntry(packageName, packageEntries, requiredEntry) {
    if (
        packageEntries.includes(requiredEntry) ||
        (requiredEntry.includes('*') &&
            packageEntries.some((packageEntry) => {
                return createManifestFilePattern(requiredEntry).test(packageEntry)
            }))
    ) {
        return
    }

    throw new Error(`${packageName} tarball is missing ${requiredEntry}`)
}

function createManifestFilePattern(manifestFile) {
    const escapedPattern = manifestFile.replace(/[.+?^${}()|[\]\\]/gu, '\\$&').replace(/\*/gu, '.*')

    return new RegExp(`^${escapedPattern}$`, 'u')
}

function createRuntimeSmokeSource() {
    return `import {
    AdapterSourceCardinalityMismatchError,
    AdapterSourceMissingError,
    AdapterSourcePrivateError,
    AdapterTargetInvalidError,
    CapabilityCardinalityConflictError,
    CapabilityRegistrationCardinalityMismatchError,
    ComposerBindingCardinalityConflictError,
    DuplicateSingleCapabilityError,
    GetAllUsedForSingleTokenError,
    GetUsedForMultiTokenError,
    GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION,
    GRAPH_EXPORT_SCHEMA_VERSION_V2,
    GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS,
    InvalidComposerMultiBindingError,
    RequiredMultiCapabilityMissingError,
    RequiredPortCardinalityMismatchError,
    adapter,
    add,
    contributionToken,
    createGraphExportDocument,
    createComposer,
    createContainer,
    defineApp,
    defineModule,
    diagnosticFromError,
    formatDiagnostics,
    getLifetimeValidationReport,
    multiToken,
    module as defineModuleDsl,
    renderGraphExportDot,
    token
} from '@sagifire/ioc'
import { contributionToken as contributionTokenFromSubpath, multiToken as multiTokenFromSubpath, token as tokenFromSubpath } from '@sagifire/ioc/tokens'
import { createContainer as createContainerFromSubpath, scopeValue } from '@sagifire/ioc/container'
import { AdapterSourceMissingError as AdapterSourceMissingErrorFromSubpath, defineModule as defineModuleFromSubpath } from '@sagifire/ioc/composer'
import { add as addFromDslSubpath, adapter as adapterFromDslSubpath, bind, module as moduleFromDslSubpath } from '@sagifire/ioc/dsl'
import { diagnosticFromError as diagnosticFromSubpath } from '@sagifire/ioc/diagnostics'
import {
    GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION as GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION_FROM_SUBPATH,
    GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS as GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS_FROM_SUBPATH,
    renderGraphExportMermaid,
    serializeGraphExport
} from '@sagifire/ioc/graph-export'
import { createNextRequestContext, createNextRuntime, nextRequestValue, withRouteScope, withServerActionScope } from '@sagifire/ioc-next'
import { assertDiagnosticReportOk, assertGraphExportSnapshot, assertGraphHasCapability, assertGraphHasModule, assertLifetimeValidationReportOk, assertProviderGraphCoverage, assertProviderGraphHasNode, createModuleHarness, createTestRuntime, fakeModule, multiOverride, override } from '@sagifire/ioc-testing'

const valueToken = token('smoke.value')
const secondaryToken = tokenFromSubpath('smoke.secondary')
const pluginToken = multiToken('smoke.plugins')
const contribution = contributionToken('smoke.contribution')
const subpathPluginToken = multiTokenFromSubpath('smoke.subpath-plugins')
const subpathContribution = contributionTokenFromSubpath('smoke.subpath-contribution')
const container = createContainer()
container.bind(valueToken).toValue('container')
const runtime = await container.freeze()

assertEqual(runtime.get(valueToken), 'container', 'root container export')
assertLifetimeValidationReportOk(getLifetimeValidationReport(runtime))
assertProviderGraphCoverage(runtime.inspect(), 'complete')
assertProviderGraphHasNode(runtime.inspect(), {
    key: { visibility: 'public', tokenId: valueToken.id },
    providerKind: 'value'
})
assertEqual(pluginToken.id, 'smoke.plugins', 'root multiToken export')
assertEqual(contribution.id, 'smoke.contribution', 'root contributionToken export')
assertEqual(subpathPluginToken.id, 'smoke.subpath-plugins', 'tokens subpath multiToken export')
assertEqual(subpathContribution.id, 'smoke.subpath-contribution', 'tokens subpath contributionToken export')

const subpathContainer = createContainerFromSubpath()
subpathContainer.bind(secondaryToken).toValue('subpath')
const subpathRuntime = await subpathContainer.freeze()

assertEqual(subpathRuntime.get(secondaryToken), 'subpath', 'container subpath export')
assertEqual(scopeValue(secondaryToken, 'scoped').value, 'scoped', 'context subpath export')

const moduleDefinition = defineModule({
    id: 'smoke.module',
    provides: [
        {
            token: valueToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(valueToken).toValue('module')
    }
})
const composedRuntime = await createComposer().use(moduleDefinition).compose()
const graphJson = serializeGraphExport(createGraphExportDocument(composedRuntime.inspect()))
const graphV2 = createGraphExportDocument(composedRuntime.inspect(), { schemaVersion: '2' })
const graphJsonV2 = serializeGraphExport(graphV2)
assertGraphExportSnapshot(composedRuntime.inspect(), graphJson)
assertIncludes(graphJson, '"schemaVersion": "1"', 'graph export root and subpath exports')
assertEqual(
    GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION,
    '1',
    'graph export root default schema version export'
)
assertEqual(
    GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION_FROM_SUBPATH,
    GRAPH_EXPORT_DEFAULT_SCHEMA_VERSION,
    'graph export subpath default schema version export'
)
assertEqual(
    GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS.join(','),
    '1,2',
    'graph export root supported schema versions export'
)
assertEqual(
    GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS_FROM_SUBPATH.join(','),
    GRAPH_EXPORT_SUPPORTED_SCHEMA_VERSIONS.join(','),
    'graph export subpath supported schema versions export'
)
assertEqual(
    graphV2.schemaVersion,
    GRAPH_EXPORT_SCHEMA_VERSION_V2,
    'graph export v2 root type and constant exports'
)
assertIncludes(graphJsonV2, '"providers"', 'graph export v2 provider projection')
assertEqual(
    composedRuntime.inspect().providerGraph.nodes.length,
    1,
    'runtime provider inspection export'
)
assertIncludes(
    renderGraphExportDot(createGraphExportDocument(composedRuntime.inspect())),
    'digraph "SagifireIocGraph"',
    'DOT renderer root export'
)
assertIncludes(
    renderGraphExportMermaid(createGraphExportDocument(composedRuntime.inspect())),
    'flowchart TB',
    'Mermaid renderer subpath export'
)

assertEqual(composedRuntime.get(valueToken), 'module', 'composer root export')

const dslModule = defineModuleDsl('smoke.dsl', {
    requires: [
        {
            token: valueToken
        }
    ],
    provides: [
        {
            token: secondaryToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(secondaryToken).toFactory((providerContext) => {
            return providerContext.get(valueToken)
        })
    }
})
const app = defineApp({
    modules: [dslModule],
    bindings: [bind(valueToken).toValue('bound')]
})

assertDiagnosticReportOk(app.validate())
assertEqual((await app.compose()).get(secondaryToken), 'bound', 'DSL root export')

const multiSummaryToken = token('smoke.multi-summary')
const multiProviderModule = defineModuleFromSubpath({
    id: 'smoke.multi-provider',
    provides: [
        {
            token: pluginToken,
            kind: 'public-api',
            cardinality: 'multi'
        }
    ],
    setup(context) {
        context.add(pluginToken).toValue('module-plugin')
    }
})
const multiConsumerModule = moduleFromDslSubpath('smoke.multi-consumer', {
    requires: [
        {
            token: pluginToken,
            cardinality: 'multi'
        }
    ],
    provides: [
        {
            token: multiSummaryToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(multiSummaryToken).toFactory((providerContext) => {
            return providerContext.getAll(pluginToken).join(',')
        })
    }
})
const multiApp = defineApp({
    modules: [multiProviderModule, multiConsumerModule],
    bindings: [add(pluginToken).toValue('root-plugin')]
})
const multiRuntime = await multiApp.compose()

assertDiagnosticReportOk(multiApp.validate())
assertEqual(multiRuntime.get(multiSummaryToken), 'module-plugin,root-plugin', 'DSL add root export')

const asyncMultiApp = defineApp({
    modules: [multiProviderModule],
    bindings: [
        add(pluginToken)
            .toAsyncFactory(async () => 'async-dsl-plugin')
            .singleton()
            .eager()
    ]
})
const asyncMultiRuntime = await asyncMultiApp.compose()

assertEqual(
    (await asyncMultiRuntime.getAllAsync(pluginToken)).join(','),
    'module-plugin,async-dsl-plugin',
    'DSL async add root export'
)

const authApiToken = token('smoke.auth-api')
const authReaderToken = token('smoke.auth-reader')
const authSummaryToken = token('smoke.auth-summary')
const authProviderModule = defineModule({
    id: 'smoke.auth-provider',
    provides: [
        {
            token: authApiToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(authApiToken).toValue({
            read() {
                return 'adapted'
            }
        })
    }
})
const authConsumerModule = defineModule({
    id: 'smoke.auth-consumer',
    requires: [
        {
            token: authReaderToken
        }
    ],
    provides: [
        {
            token: authSummaryToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(authSummaryToken).toFactory((providerContext) => {
            return providerContext.get(authReaderToken).read()
        })
    }
})
const adapterApp = defineApp({
    modules: [authProviderModule, authConsumerModule],
    bindings: [
        adapter(authReaderToken).from(authApiToken).using((authApi) => {
            return {
                read() {
                    return authApi.read()
                }
            }
        })
    ]
})
const adapterRuntime = await adapterApp.compose()

assertDiagnosticReportOk(adapterApp.validate())
assertEqual(adapterRuntime.get(authSummaryToken), 'adapted', 'DSL adapter root export')

const subpathAddBinding = addFromDslSubpath(subpathPluginToken).toValue('subpath-plugin')
const subpathAdapterBinding = adapterFromDslSubpath(authReaderToken)
    .from(authApiToken)
    .using((authApi) => {
        return {
            read() {
                return authApi.read()
            }
        }
    })

assertEqual(subpathAddBinding.addValue, 'subpath-plugin', 'DSL subpath add export')
assertEqual(subpathAdapterBinding.source, authApiToken, 'DSL subpath adapter export')

const diagnosticText = formatDiagnostics({
    ok: false,
    diagnostics: [diagnosticFromError(new Error('smoke diagnostic'))]
})

if (!diagnosticText.includes('smoke diagnostic')) {
    throw new Error('diagnostics root export failed')
}

if (diagnosticFromSubpath(new Error('subpath diagnostic')).severity !== 'error') {
    throw new Error('diagnostics subpath export failed')
}

const stage17ErrorCodes = [
    new DuplicateSingleCapabilityError(valueToken.id, ['a', 'b']).code,
    new CapabilityCardinalityConflictError(valueToken.id, ['single'], ['multi']).code,
    new RequiredMultiCapabilityMissingError('smoke.module', pluginToken.id, 'external').code,
    new RequiredPortCardinalityMismatchError(
        'smoke.module',
        pluginToken.id,
        'external',
        'multi',
        'single',
        'capability'
    ).code,
    new InvalidComposerMultiBindingError(pluginToken.id, 'value', 'single-capability').code,
    new AdapterSourceMissingError(authReaderToken.id, authApiToken.id).code,
    new AdapterSourcePrivateError(authReaderToken.id, authApiToken.id, 'source').code,
    new AdapterSourceCardinalityMismatchError(authReaderToken.id, pluginToken.id, 'capability').code,
    new AdapterTargetInvalidError(authReaderToken.id).code,
    new ComposerBindingCardinalityConflictError(valueToken.id, ['value'], ['value']).code,
    new CapabilityRegistrationCardinalityMismatchError(
        'smoke.module',
        pluginToken.id,
        'multi',
        'bind'
    ).code,
    new GetUsedForMultiTokenError(pluginToken.id).code,
    new GetAllUsedForSingleTokenError(valueToken.id).code,
    new AdapterSourceMissingErrorFromSubpath(authReaderToken.id, authApiToken.id).code
]

assertIncludes(
    stage17ErrorCodes,
    'SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT',
    'Stage 17 cardinality diagnostic export'
)
assertIncludes(
    stage17ErrorCodes,
    'SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING',
    'Stage 17 adapter diagnostic export'
)
assertIncludes(
    stage17ErrorCodes,
    'SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN',
    'Stage 17 runtime gating diagnostic export'
)

const nextRuntime = createNextRuntime(async () => runtime)
const routeContext = createNextRequestContext({
    values: [nextRequestValue(valueToken, 'route')]
})
const routeValue = await withRouteScope(
    nextRuntime,
    {
        request: {
            method: 'GET'
        },
        context: {
            params: {}
        },
        requestContext: routeContext
    },
    async ({ scope }) => {
        return scope.get(valueToken)
    }
)

assertEqual(routeValue, 'route', 'Next route scope export')

const action = withServerActionScope(
    nextRuntime,
    {
        context: {
            operation: 'smoke'
        },
        actionContext: createNextRequestContext({
            values: [nextRequestValue(valueToken, 'action')]
        })
    },
    async ({ scope }) => {
        return scope.get(valueToken)
    }
)

assertEqual(await action(), 'action', 'Next server action scope export')

const testRuntime = await createTestRuntime({
    overrides: [override(valueToken).toValue('test')],
    multiOverrides: [
        multiOverride(pluginToken).appendAsyncFactory(async () => 'testing-async-plugin')
    ]
})

assertEqual(testRuntime.get(valueToken), 'test', 'testing runtime export')
assertEqual(
    (await testRuntime.getAllAsync(pluginToken)).join(','),
    'testing-async-plugin',
    'testing async multi override export'
)

const fake = fakeModule({
    id: 'smoke.fake',
    provides: [
        {
            token: valueToken,
            useValue: 'fake'
        }
    ]
})
const harness = createModuleHarness({
    module: fake
})

assertDiagnosticReportOk(harness.validate())
assertGraphHasModule(harness.getGraph(), 'smoke.fake')
assertGraphHasCapability(harness.getGraph(), {
    tokenId: valueToken.id
})

const asyncFake = fakeModule({
    id: 'smoke.async-fake',
    provides: [
        {
            token: pluginToken,
            cardinality: 'multi',
            useAsyncResource: async () => ({ value: 'fake-resource' }),
            lifetime: 'singleton'
        }
    ]
})
const asyncFakeRuntime = await createModuleHarness({ module: asyncFake }).compose()

assertEqual(
    (await asyncFakeRuntime.getAllAsync(pluginToken)).join(','),
    'fake-resource',
    'testing async fake module export'
)

await asyncFakeRuntime.dispose()
await testRuntime.dispose()
await adapterRuntime.dispose()
await asyncMultiRuntime.dispose()
await multiRuntime.dispose()

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(\`\${label} failed: expected \${expected}, got \${actual}\`)
    }
}

function assertIncludes(values, expected, label) {
    if (!values.includes(expected)) {
        throw new Error(\`\${label} failed: missing \${expected}\`)
    }
}
`
}

function createTypeSmokeSource() {
    return `import {
    adapter,
    add,
    contributionToken,
    createContainer,
    createGraphExportDocument,
    multiToken,
    token,
    type ContainerRuntime,
    type DiagnosticReport,
    type GraphExportDocumentV2,
    type GraphExportOptions,
    type GraphExportSchemaVersion,
    type ProviderInspection,
    type ContributionToken,
    type ModuleCardinality,
    type MultiToken,
    type ProviderDependencyOptions,
    type Token
} from '@sagifire/ioc'
import { namespace } from '@sagifire/ioc/tokens'
import { createComposer, type Composer } from '@sagifire/ioc/composer'
import { add as addFromDslSubpath, adapter as adapterFromDslSubpath, defineApp, module as defineModuleDsl } from '@sagifire/ioc/dsl'
import { formatDiagnostics } from '@sagifire/ioc/diagnostics'
import { createNextRequestContext, nextRequestValue, type NextRequestContext } from '@sagifire/ioc-next'
import { createTestRuntime, multiOverride, override, type ProviderNodeExpectation, type TestMultiOverride, type TestOverride } from '@sagifire/ioc-testing'

const valueToken: Token<string> = token<string>('types.value')
const namespacedToken: Token<number> = namespace('types').token<number>('count')
const pluginToken: MultiToken<string> = multiToken<string>('types.plugins')
const contribution: ContributionToken<string> = contributionToken<string>('types.contribution')
const namespacedPlugin: MultiToken<string> = namespace('types').multiToken<string>('plugins')
const namespacedContribution: ContributionToken<string> =
    namespace('types').contributionToken<string>('contribution')
const cardinality: ModuleCardinality = 'multi'
const dependencyOptions: ProviderDependencyOptions = { dependencies: [] }
const providerExpectation: ProviderNodeExpectation = {
    key: { visibility: 'public', tokenId: valueToken.id },
    providerKind: 'value'
}
const graphSchemaVersion: GraphExportSchemaVersion = '2'
const graphExportOptions: GraphExportOptions = { schemaVersion: graphSchemaVersion }
const container = createContainer()
container.bind(valueToken).toValue('value')

async function createRuntime(): Promise<ContainerRuntime> {
    return container.freeze()
}

async function createProviderInspectionDocument(): Promise<GraphExportDocumentV2> {
    const runtime = await createRuntime()
    const inspection: ProviderInspection = runtime.inspect()

    if (graphExportOptions.schemaVersion !== '2') {
        throw new Error('Expected the graph export v2 type-smoke option')
    }

    return createGraphExportDocument(inspection, {
        schemaVersion: graphExportOptions.schemaVersion
    })
}

const composer: Composer = createComposer()
const dslModule = defineModuleDsl('types.module', {
    provides: [
        {
            token: valueToken,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(valueToken).toValue('module')
    }
})
const app = defineApp({
    modules: [dslModule],
    options: {
        lifetimeValidation: {
            mode: 'report'
        }
    }
})
const addBinding = add(pluginToken).toValue('root-plugin')
const adapterBinding = adapter(valueToken).from(namespacedToken).using((count) => {
    return count.toString()
})
const subpathAddBinding = addFromDslSubpath(pluginToken).toFactory(
    () => {
        return 'subpath-plugin'
    },
    dependencyOptions
)
const asyncAddBinding = add(pluginToken)
    .toAsyncFactory(async () => 'async-plugin')
    .singleton()
    .eager()
const subpathAdapterBinding = adapterFromDslSubpath(valueToken)
    .from(namespacedToken)
    .using((count) => {
        return count.toString()
    })
const report: DiagnosticReport = app.validate()
const formatted: string = formatDiagnostics(report)
const requestContext: NextRequestContext = createNextRequestContext({
    values: [nextRequestValue(valueToken, 'request')]
})
const testOverride: TestOverride<string> = override(valueToken).toValue('test')
const testMultiOverride: TestMultiOverride<string> = multiOverride(pluginToken)
    .appendAsyncResource(async () => ({ value: 'test-resource' }), {
        lifetime: 'singleton'
    })
const testRuntime = createTestRuntime({
    overrides: [testOverride],
    multiOverrides: [testMultiOverride]
})

void namespacedToken
void contribution
void namespacedPlugin
void namespacedContribution
void cardinality
void dependencyOptions
void providerExpectation
void addBinding
void adapterBinding
void subpathAddBinding
void asyncAddBinding
void subpathAdapterBinding
void composer
void formatted
void requestContext
void testRuntime
void createRuntime
void createProviderInspectionDocument
`
}

function run(command, args, options = {}) {
    console.log(`> ${command} ${args.join(' ')}`)
    execFileSync(resolveBinary(command), resolveArguments(command, args), {
        cwd: options.cwd ?? workspaceRoot,
        stdio: 'inherit'
    })
}

function runAndCapture(command, args) {
    return execFileSync(resolveBinary(command), resolveArguments(command, args), {
        cwd: workspaceRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
    })
}

function resolveBinary(command) {
    if (process.platform === 'win32' && (command === 'pnpm' || command === 'npm')) {
        return 'cmd.exe'
    }

    return command
}

function resolveArguments(command, args) {
    if (process.platform === 'win32' && (command === 'pnpm' || command === 'npm')) {
        return ['/d', '/s', '/c', `${command}.cmd`, ...args]
    }

    return args
}

async function readJson(filePath) {
    return JSON.parse(await readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
    await writeFile(`${filePath}`, `${JSON.stringify(value, null, 4)}\n`)
}

function assertEqual(actual, expected, label) {
    if (actual === expected) {
        return
    }

    throw new Error(`Expected ${label} to be ${String(expected)}, got ${String(actual)}`)
}

function sanitizePackageName(packageName) {
    return packageName.replace(/^@/u, '').replace(/\//gu, '-')
}

function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertInsideWorkspace(targetPath) {
    const relativePath = path.relative(workspaceRoot, targetPath)

    if (
        relativePath.length === 0 ||
        relativePath.startsWith('..') ||
        path.isAbsolute(relativePath)
    ) {
        throw new Error(`Refusing to use temp path outside workspace: ${targetPath}`)
    }

    if (existsSync(targetPath) && !targetPath.startsWith(path.join(workspaceRoot, '.tmp'))) {
        throw new Error(`Refusing to reuse non-.tmp path: ${targetPath}`)
    }
}
