# Lifetime Dependency Validation

Lifetime dependency validation is an additive, opt-in analysis of explicit provider dependency
metadata. It detects declared direct captures such as a singleton retaining a scoped instance,
reports lifetime-sensitive edges, and exposes one normalized provider graph to validation,
inspection, testing and graph export.

The API described here is available in the current workspace and is not a version or publish
claim. Package manifests remain at `0.0.2`; changing a release version or the default validation
policy is outside this feature slice.

## Public API

Factory registrations accept the same optional `ProviderDependencyOptions` object in the
container, module setup context, composer and DSL:

```ts
import { createContainer, token } from '@sagifire/ioc'

const REQUEST = token<{ id: string }>('example.request')
const SERVICE = token<{ requestId: string }>('example.service')

const container = createContainer({
    lifetimeValidation: {
        mode: 'report',
        coverage: 'summary'
    }
})

container
    .bind(REQUEST)
    .toFactory(() => ({ id: 'request' }), { dependencies: [] })
    .scoped()

container
    .bind(SERVICE)
    .toFactory((context) => ({ requestId: context.get(REQUEST).id }), {
        dependencies: [
            {
                token: REQUEST,
                access: 'instance'
            }
        ]
    })
    .singleton()

const reportBeforeFreeze = container.validateLifetime()
const runtime = await container.freeze()
const report = runtime.inspect().lifetimeValidation
```

`createComposer({ lifetimeValidation })` uses the same options. `runtime.inspect()` and
`scope.inspect()` expose a safe `providerGraph`; when mode is not `off`, they also expose the
corresponding `lifetimeValidation` report. `getLifetimeValidationReport(runtime)` retrieves the
report directly from a runtime, including the default `off` report.

## Dependency Declarations

Only providers whose factories can read a resolution context accept dependency metadata:

- sync factories;
- async factories;
- async resources;
- single and multi registrations where those provider kinds are supported.

Values and no-argument class providers are `not-applicable`. The library does not inspect class
constructor metadata and does not infer dependencies from source code or factory execution.

An `instance` declaration means that the consumer directly receives and may retain the resolved
instance:

```ts
{
    token: REQUEST,
    access: 'instance',
    cardinality: 'single'
}
```

`cardinality` defaults to `single`. Use `multi` when the factory reads a multi-provider collection;
the normalized graph expands the selector to deterministic concrete registration-indexed edges.
An empty multi target is valid and produces no concrete edge. A missing single target or a
cardinality mismatch is invalid metadata.

A `deferred` declaration records the ultimate dependency separately from the retained handle:

```ts
{
    token: REQUEST,
    access: 'deferred',
    via: REQUEST_ACCESSOR,
    scope: 'caller',
    cardinality: 'single'
}
```

`token` is the value eventually requested, while `via` is the single registered handle retained
by the consumer. `scope: 'caller'` is explicit: the handle must resolve against the caller's
active scope. A deferred selector is not treated as a direct instance capture. Missing or multi
`via` registrations are invalid metadata.

## Lifetime And Evidence Matrix

Validation separates evidence from coverage. A declaration can establish a proven unsafe or
lifetime-sensitive edge; missing declarations remain unknown rather than being guessed.

| Consumer to dependency       | `instance` evidence               | `deferred` evidence       | Enforcement               |
| ---------------------------- | --------------------------------- | ------------------------- | ------------------------- |
| singleton to singleton/value | no finding                        | no finding                | allowed                   |
| singleton to scoped          | `proven-unsafe`, error            | no direct-capture finding | blocked only in `enforce` |
| singleton to transient       | `lifetime-sensitive`, warning     | no direct-capture finding | never blocked as unsafe   |
| scoped to singleton/value    | no finding                        | no finding                | allowed                   |
| scoped to scoped             | no finding in the effective scope | no finding                | allowed                   |
| scoped to transient          | `lifetime-sensitive`, warning     | no direct-capture finding | warning only              |
| transient to singleton       | no finding                        | no finding                | allowed                   |
| transient to scoped          | `lifetime-sensitive`, warning     | no direct-capture finding | warning only              |
| transient to transient       | `lifetime-sensitive`, warning     | no direct-capture finding | warning only              |

`SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE` is reserved for a declared, proven singleton-to-scoped
direct capture. `SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE` is a warning and does not claim a leak.
Invalid selectors use `SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID`.

Managed async-resource ownership is derived from the actual runtime or scope owner ledger. It is
not a user-authored dependency access mode and it does not transfer ownership to a consumer.
Singleton resources are runtime-owned; scoped resources and scope-local values are scope-owned.
Inspection and graph export expose ownership edges, never values or disposer functions.

## Modes And Coverage

The production default remains:

```ts
{ mode: 'off', coverage: 'ignore' }
```

| Mode      | Capture analysis    | Proven unsafe capture                        | Invalid explicit metadata |
| --------- | ------------------- | -------------------------------------------- | ------------------------- |
| `off`     | skipped             | not reported                                 | still rejected            |
| `report`  | diagnostics emitted | error diagnostic, runtime creation continues | rejected                  |
| `enforce` | diagnostics emitted | blocks runtime or scope creation             | rejected                  |

`coverage: 'summary'` adds one `SAGIFIRE_IOC_DEPENDENCY_METADATA_INCOMPLETE` warning when the
aggregate coverage is not complete and validation is enabled. It does not turn unknown metadata
into unsafe evidence.

Provider coverage values are:

- `not-applicable` for values and no-argument classes;
- `declared` when a dependency-capable provider supplies an options object, including
  `{ dependencies: [] }`;
- `undeclared` when a dependency-capable provider supplies no metadata.

The aggregate is `complete`, `partial` or `none` across dependency-capable registrations. Private
providers participate in the aggregate without exposing their token IDs.

Complete declaration coverage is not proof that factory implementations are honest. The library
does not parse, execute or trace factory bodies to compare actual lookups with declarations.
Coverage means only that every dependency-capable registration supplied an auditable declaration.

## Scope-Effective Validation

Base runtime validation occurs before user factories execute. Child-scope validation runs after
local and inherited values are normalized and before the child is published or its callback runs.

The effective target domain follows the consumer:

- singleton consumers keep base-runtime targets, regardless of readiness;
- scoped consumers use effective scope targets;
- transient consumers use the explicit runtime or scope resolution domain;
- deferred selectors use caller-scope targets;
- local values are scope-owned registrations and never retroactively rebind an existing
  singleton.

`scope.inspect()` returns the immutable effective provider graph. Failed enforced validation does
not insert a partial child scope into its parent and does not execute user factories.

## Privacy Boundary

Public provider identities use token ID plus registration index. Private identities contain only
module ID plus module-wide registration index. Diagnostics, testing assertion errors, canonical
JSON, DOT and Mermaid must not contain private token IDs, values, readiness state, in-flight
promises, resource values or disposers.

Private labels are correlation aids such as `private:orders#2`; they are not service locators and
cannot be resolved through the runtime.

## Graph Export v1 And v2

Schema v1 remains the default and is byte-stable. It contains the established module graph and
does not gain provider nodes, provider dependency edges, ownership or coverage fields.

Schema v2 is explicit:

```ts
import { createGraphExportDocument, serializeGraphExport } from '@sagifire/ioc'

const document = createGraphExportDocument(runtime.inspect(), {
    schemaVersion: '2'
})

const canonicalJson = serializeGraphExport(document)
```

V2 projects provider nodes, selectors, concrete dependency edges, ownership edges and coverage
from the same immutable snapshot used by validation and inspection. JSON ordering is canonical;
DOT and Mermaid render the same safe projection deterministically. V2 remains opt-in and does not
change v1 snapshots.

## DSL Parity

The DSL passes the object options one-to-one; it does not infer dependencies or resolve them
itself:

```ts
import { bind, defineApp } from '@sagifire/ioc'

const app = defineApp({
    modules: [applicationModule],
    options: {
        lifetimeValidation: {
            mode: 'report',
            coverage: 'summary'
        }
    },
    bindings: [
        bind(SERVICE).toFactory(createService, {
            dependencies: [
                {
                    token: REQUEST,
                    access: 'instance'
                }
            ]
        })
    ]
})
```

The same second argument is supported by DSL sync factories, async factories and async resources
where the corresponding object builder supports them. The object-configuration API remains fully
usable without the DSL.

## Testing Support

`@sagifire/ioc-testing` accepts `lifetimeValidation` in test runtime, test composer and module
harness options. Overrides, multi overrides and fake factory/resource providers preserve explicit
dependency metadata and delegate to public production builders before `freeze()` or `compose()`.

Provider assertions accept a normalized provider graph, public inspection object or scope:

```ts
import {
    assertLifetimeValidationReportHasDiagnostic,
    assertProviderGraphCoverage,
    assertProviderGraphHasDependencyEdge
} from '@sagifire/ioc-testing'

const inspection = runtime.inspect()

assertProviderGraphCoverage(inspection, 'complete')
assertProviderGraphHasDependencyEdge(inspection, {
    consumer: { visibility: 'public', tokenId: SERVICE.id },
    dependency: { visibility: 'public', tokenId: REQUEST.id },
    access: 'instance'
})
assertLifetimeValidationReportHasDiagnostic(inspection.lifetimeValidation!, {
    code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
    severity: 'error'
})
```

These helpers read only public immutable inspection data. They do not mutate frozen runtimes or
inspect private container records.

## Staged Adoption

Adopt validation as an evidence-building workflow:

1. Enable `{ mode: 'report', coverage: 'summary' }` in a representative test or composition root.
2. Review unsafe and lifetime-sensitive diagnostics; do not treat incomplete coverage as a leak.
3. Add declarations first to high-risk singleton/scoped factories and async resources, then to
   module-private providers. Use `{ dependencies: [] }` only after reviewing the factory body.
4. Review provider coverage and schema v2 output. Confirm that private identities remain safe and
   that declaration cardinality matches actual registrations.
5. Correct unsafe captures, usually by shortening the consumer lifetime or retaining an explicit
   caller-scope deferred handle instead of a scoped instance.
6. Reach an intentionally reviewed coverage level and keep report mode in CI.
7. Opt selected composition roots into `enforce`. Enforcement is an explicit application choice;
   the library default remains `off`.

Do not enable `enforce` merely because aggregate coverage says `complete`: declarations can drift
from factory behavior. Code review and behavior tests remain necessary.

## Related Guides

- [Container](container.md)
- [Composer](composer.md)
- [Graph export](graph-export.md)
- [Testing](testing.md)
- [Migration from DI containers](migration-from-di-container.md)
