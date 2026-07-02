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
            skipLibCheck: true
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
    if (packageEntries.includes(requiredEntry)) {
        return
    }

    throw new Error(`${packageName} tarball is missing ${requiredEntry}`)
}

function createRuntimeSmokeSource() {
    return `import {
    createComposer,
    createContainer,
    defineApp,
    defineModule,
    diagnosticFromError,
    formatDiagnostics,
    module as defineModuleDsl,
    token
} from '@sagifire/ioc'
import { token as tokenFromSubpath } from '@sagifire/ioc/tokens'
import { createContainer as createContainerFromSubpath, scopeValue } from '@sagifire/ioc/container'
import { defineModule as defineModuleFromSubpath } from '@sagifire/ioc/composer'
import { module as moduleFromDslSubpath, bind } from '@sagifire/ioc/dsl'
import { diagnosticFromError as diagnosticFromSubpath } from '@sagifire/ioc/diagnostics'
import { createNextRequestContext, createNextRuntime, nextRequestValue, withRouteScope, withServerActionScope } from '@sagifire/ioc-next'
import { assertDiagnosticReportOk, assertGraphHasCapability, assertGraphHasModule, createModuleHarness, createTestRuntime, fakeModule, override } from '@sagifire/ioc-testing'

const valueToken = token('smoke.value')
const secondaryToken = tokenFromSubpath('smoke.secondary')
const container = createContainer()
container.bind(valueToken).toValue('container')
const runtime = await container.freeze()

assertEqual(runtime.get(valueToken), 'container', 'root container export')

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

void defineModuleFromSubpath
void moduleFromDslSubpath

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
    overrides: [override(valueToken).toValue('test')]
})

assertEqual(testRuntime.get(valueToken), 'test', 'testing runtime export')

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

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(\`\${label} failed: expected \${expected}, got \${actual}\`)
    }
}
`
}

function createTypeSmokeSource() {
    return `import {
    createContainer,
    token,
    type ContainerRuntime,
    type DiagnosticReport,
    type Token
} from '@sagifire/ioc'
import { namespace } from '@sagifire/ioc/tokens'
import { createComposer, type Composer } from '@sagifire/ioc/composer'
import { defineApp, module as defineModuleDsl } from '@sagifire/ioc/dsl'
import { formatDiagnostics } from '@sagifire/ioc/diagnostics'
import { createNextRequestContext, nextRequestValue, type NextRequestContext } from '@sagifire/ioc-next'
import { createTestRuntime, override, type TestOverride } from '@sagifire/ioc-testing'

const valueToken: Token<string> = token<string>('types.value')
const namespacedToken: Token<number> = namespace('types').token<number>('count')
const container = createContainer()
container.bind(valueToken).toValue('value')

async function createRuntime(): Promise<ContainerRuntime> {
    return container.freeze()
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
    modules: [dslModule]
})
const report: DiagnosticReport = app.validate()
const formatted: string = formatDiagnostics(report)
const requestContext: NextRequestContext = createNextRequestContext({
    values: [nextRequestValue(valueToken, 'request')]
})
const testOverride: TestOverride<string> = override(valueToken).toValue('test')
const testRuntime = createTestRuntime({
    overrides: [testOverride]
})

void namespacedToken
void composer
void formatted
void requestContext
void testRuntime
void createRuntime
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
