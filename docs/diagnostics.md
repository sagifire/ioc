# Diagnostics

Diagnostics are the public failure language of `@sagifire/ioc`. Runtime errors are typed,
validation returns reports, and formatting stays deterministic plain text so failures are
readable in logs, tests and agent reviews.

## Imports

```ts
import {
    ComposerValidationError,
    SagifireIocError,
    diagnosticFromError,
    formatDiagnostics,
    isSagifireIocError
} from '@sagifire/ioc'
```

For narrower imports:

```ts
import {
    SagifireIocError,
    diagnosticFromError,
    formatDiagnostics,
    isSagifireIocError
} from '@sagifire/ioc/diagnostics'
```

Composer-specific errors such as `ComposerValidationError`, `MissingRequiredPortError`,
`DuplicateComposerBindingError` and `ModuleCycleError` are exported from the root package
and `@sagifire/ioc/composer`.

## Typed Errors

Public IoC errors extend `SagifireIocError`:

```ts
try {
    await composer.compose()
} catch (error) {
    if (isSagifireIocError(error)) {
        console.error(error.code)
        console.error(error.message)
        console.error(error.details)
    }
}
```

`SagifireIocError` exposes:

- `code`: stable machine-readable code;
- `message`: readable human message;
- `details`: optional safe structured data;
- `cause`: optional original cause.

The public code convention is stable uppercase snake case, for example
`SAGIFIRE_IOC_PROVIDER_NOT_FOUND`, `SAGIFIRE_IOC_MISSING_REQUIRED_PORT` and
`SAGIFIRE_IOC_MODULE_CYCLE`.

Details are intentionally safe. They may include token IDs, module IDs, lifecycle modes,
provider kinds, access methods and cycle paths. They must not include provider values,
resource instances, scope-local values or private runtime internals.

## Diagnostic Reports

A `DiagnosticReport` is validation output:

```ts
interface DiagnosticReport {
    readonly ok: boolean
    readonly diagnostics: readonly Diagnostic[]
}
```

Composer validation returns reports instead of throwing:

```ts
const report = composer.validate()

if (!report.ok) {
    console.error(formatDiagnostics(report))
}
```

`prepare()` and `compose()` use the same validation path, but they throw
`ComposerValidationError` when validation fails:

```ts
try {
    await composer.compose()
} catch (error) {
    if (error instanceof ComposerValidationError) {
        console.error(formatDiagnostics(error.report))
    }
}
```

## Converting Errors To Diagnostics

Use `diagnosticFromError(error)` when you need report-style data from a thrown value:

```ts
const diagnostic = diagnosticFromError(error)

console.log(diagnostic.code)
console.log(diagnostic.severity)
console.log(diagnostic.message)
```

For `SagifireIocError`, the diagnostic preserves the error code, message and details with
`severity: 'error'`. Plain `Error` instances become `UNKNOWN_ERROR` diagnostics. Unknown
thrown values also become `UNKNOWN_ERROR` diagnostics with a safe value type.

## Formatting

`formatDiagnostics(report)` returns deterministic plain text:

```ts
const text = formatDiagnostics({
    ok: false,
    diagnostics: [
        {
            code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
            severity: 'error',
            message: 'Missing required port "app.auth-reader" for module "contact-requests"',
            details: {
                moduleId: 'contact-requests',
                tokenId: 'app.auth-reader',
                dependencyKind: 'external'
            }
        }
    ]
})
```

The formatted output starts with the report status, keeps diagnostics in input order and
renders safe detail fields such as `tokenId`, `moduleIdPath` and `tokenIdPath` readably.
It does not use terminal colors, Node-only APIs or framework dependencies.

An ok empty report formats as:

```text
Diagnostic report: ok
No diagnostics.
```

## Composer Diagnostics

Composer validation reports graph problems through the same diagnostics model:

```ts
const missingPortReport = createComposer().use(contactRequestsModule).validate()

console.log(formatDiagnostics(missingPortReport))
```

Representative composer diagnostics:

- `SAGIFIRE_IOC_DUPLICATE_MODULE_ID`
- `SAGIFIRE_IOC_DUPLICATE_MODULE_CAPABILITY`
- `SAGIFIRE_IOC_MISSING_REQUIRED_PORT`
- `SAGIFIRE_IOC_DUPLICATE_COMPOSER_BINDING`
- `SAGIFIRE_IOC_INVALID_COMPOSER_BINDING`
- `SAGIFIRE_IOC_MODULE_CYCLE`
- `SAGIFIRE_IOC_MISSING_MODULE_PROVIDER`
- `SAGIFIRE_IOC_PRIVATE_PROVIDER_ACCESS`

Module cycle diagnostics include safe paths:

```ts
{
    code: 'SAGIFIRE_IOC_MODULE_CYCLE',
    severity: 'error',
    message: 'Module dependency cycle detected: billing -> users -> billing',
    details: {
        moduleIdPath: ['billing', 'users', 'billing'],
        tokenIdPath: ['users.public-api', 'billing.public-api'],
        edgeKinds: ['capability', 'capability']
    }
}
```

Cycle detection runs over capability dependency edges. Binding edges are composition
adapters and do not create module-level cycles by themselves.

## Validation And Factory Execution

Composer diagnostics are based on explicit metadata:

- module IDs;
- declared required ports;
- declared capabilities;
- explicit composer bindings;
- dependency edges derived from those declarations.

`validate()`, `inspect()` and `getGraph()` do not execute user binding factories, module
provider factories or async resources to infer hidden dependencies. This keeps validation
side-effect free and prevents private provider internals from leaking into graph metadata.

Provider-level problems inside factories still surface when the provider is actually
resolved. For example, a factory-level provider cycle remains a container/runtime
diagnostic rather than a static module graph diagnostic.

## Diagnostic Assertions In Tests

`@sagifire/ioc-testing` adds assertion helpers over public diagnostic and graph data:

```ts
import {
    assertDiagnosticReportHasDiagnostic,
    assertDiagnosticReportOk,
    assertErrorDiagnostic,
    assertGraphHasEdge
} from '@sagifire/ioc-testing'

assertDiagnosticReportOk(composer.validate())

assertDiagnosticReportHasDiagnostic(composer.validate(), {
    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
})

assertErrorDiagnostic(error, {
    code: 'SAGIFIRE_IOC_MODULE_CYCLE'
})

assertGraphHasEdge(composer.getGraph(), {
    edgeKind: 'binding',
    requiredTokenId: CONTACT_REQUESTS_AUTH_READER.id,
    bindingTokenId: CONTACT_REQUESTS_AUTH_READER.id
})
```

These helpers read `DiagnosticReport`, typed-error-derived diagnostics and public
`ModuleGraph` / inspection data only. They do not depend on Vitest internals and do not
mutate runtimes or inspect private provider storage.
