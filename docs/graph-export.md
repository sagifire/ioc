# Graph Export

Graph export turns the public composition graph into a portable, deterministic artifact.
Use canonical JSON for tools, tests and diffs. Use DOT or Mermaid only as human-readable
views derived from that JSON document.

## Public API

```ts
import {
    createGraphExportDocument,
    renderGraphExportDot,
    renderGraphExportMermaid,
    serializeGraphExport
} from '@sagifire/ioc/graph-export'

const document = createGraphExportDocument(composer.getGraph())
const json = serializeGraphExport(document)
const dot = renderGraphExportDot(document, { direction: 'LR' })
const mermaid = renderGraphExportMermaid(document, { direction: 'LR' })
```

`createGraphExportDocument()` also accepts `composer.inspect()` and `runtime.inspect()`
because those values expose the same public graph fields. The default v1 projection ignores
validation and provider inspection extras. Opt-in v2 requires public provider inspection data.
Neither projection executes setup functions, factories or resources.

## V1 Schema And Compatibility

The v1 envelope is:

```json
{
    "schema": "sagifire.ioc.graph",
    "schemaVersion": "1",
    "graph": {
        "modules": [],
        "requiredPorts": [],
        "capabilities": [],
        "bindings": [],
        "edges": []
    }
}
```

The schema version is independent of the npm package version. V1 consumers may ignore
unknown optional fields. Removing a field, changing its type or meaning, or making an enum
expansion unsafe for exhaustive consumers requires a new schema version. Optional fields
are omitted instead of serialized as `null`. Serializers and renderers reject unsupported
schema envelopes.

### Graph Collections

All fields are required unless marked optional. Arrays are readonly semantic sequences.

| Collection      | Fields                                                                                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modules`       | `id: string`; optional `version: string`; `requiredPortIds: string[]`; `capabilityIds: string[]`                                                                                                                                                                                                                                       |
| `requiredPorts` | `moduleId: string`; `tokenId: string`; `required: boolean`; `kind: 'external' \| 'shared'`; `cardinality: 'single' \| 'multi'`; `providerCount: number`; `satisfiedBy: 'capability' \| 'binding' \| 'optional' \| 'missing'`                                                                                                           |
| `capabilities`  | `moduleId: string`; `tokenId: string`; `kind: ModuleCapabilityKind`; `cardinality: 'single' \| 'multi'`; `providers: CapabilityProvider[]`                                                                                                                                                                                             |
| `bindings`      | `tokenId: string`; `kind: 'value' \| 'factory' \| 'class' \| 'async-factory' \| 'adapter'`; `providerKind: 'value' \| 'factory' \| 'class' \| 'async-factory' \| 'async-resource'`; optional `lifetime: 'singleton' \| 'transient' \| 'scoped'`; optional `initialization: 'eager' \| 'lazy'`; optional `adapterSource: AdapterSource` |
| `edges`         | Discriminated `Edge` values described below.                                                                                                                                                                                                                                                                                           |

`ModuleCapabilityKind` is the closed `'public-api' | 'admin-contribution' |
'event-publisher' | 'event-subscriber' | 'shared-service' | 'custom'` union.
`ModuleDependencyKind` is the closed `'external' | 'shared'` union.

### Capability Providers

Each capability provider contains:

- `source: 'module' | 'composition-root'`;
- optional `moduleId: string`, present for module-owned providers;
- `registrationKind: 'bind' | 'add'`;
- `registrationIndex: number`.

Registration index and array position are provenance/order data, not runtime object IDs.

### Adapter Sources

`adapterSource` is discriminated by `kind`:

- `kind: 'token'` has `tokenId: string` and `providers: AdapterSourceProvider[]`;
- `kind: 'object'` has `properties`, each with `property: string`, `tokenId: string` and
  `providers: AdapterSourceProvider[]`.

`AdapterSourceProvider` has three variants:

| Discriminants                                                 | Remaining fields                                                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `source: 'module'`, `providerKind: 'capability'`              | `moduleId`, `tokenId`, `capabilityKind: ModuleCapabilityKind`, `cardinality`, `registrationKind`, `registrationIndex`              |
| `source: 'composition-root'`, `providerKind: 'binding'`       | `tokenId`, `bindingKind`, `cardinality: 'single'`, `registrationIndex`                                                             |
| `source: 'composition-root'`, `providerKind: 'multi-binding'` | `tokenId`, `bindingKind: 'value' \| 'factory' \| 'async-factory' \| 'async-resource'`, `cardinality: 'multi'`, `registrationIndex` |

Here `capabilityKind` uses `ModuleCapabilityKind`, `cardinality` is `'single' | 'multi'`,
`registrationKind` is `'bind' | 'add'`, and `bindingKind` uses the binding enum from the
graph collections table unless narrowed in the row.

### Dependency Edges

Every edge contains `edgeKind`, `consumerModuleId`, `requiredTokenId` and
`dependencyKind: 'external' | 'shared'`. The discriminant adds:

| `edgeKind`       | Variant fields                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `capability`     | `providerModuleId`, `capabilityTokenId`, `capabilityKind: ModuleCapabilityKind`                                                                                                      |
| `binding`        | `bindingTokenId`, `bindingKind`                                                                                                                                                      |
| `adapter-source` | `adapterTargetTokenId`, `adapterSourceTokenId`, `adapterSourceKind: 'token' \| 'object'`; optional `adapterSourceProperty: string`; optional `sourceProvider: AdapterSourceProvider` |

`adapterSourceProperty` is present for an object-source property. `sourceProvider` can be
omitted when no resolved public provider provenance exists; consumers must not invent one.

Array order is semantic. Module, declaration, provider registration and edge order is
preserved and must not be sorted before comparison. Canonical JSON uses stable object-key
order, four spaces, LF line endings and exactly one final newline.

## Opt-In V2 Provider Graph

V1 remains the default and is frozen: provider fields are not added to v1 documents. Request v2
explicitly from `runtime.inspect()` or `scope.inspect()`:

```ts
const document = createGraphExportDocument(runtime.inspect(), {
    schemaVersion: '2'
})
```

V2 retains all v1 collections and adds:

| Collection                    | Meaning                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `providers`                   | Safe provider key/label, registration kind, provider kind, optional lifetime, initialization and optional `scopeOwned` marker |
| `providerDependencySelectors` | Declared aggregate selectors, including instance/deferred access and cardinality                                              |
| `providerDependencyEdges`     | Concrete registration-indexed consumer-to-dependency edges                                                                    |
| `providerOwnershipEdges`      | Derived runtime/scope resource or local-value ownership                                                                       |
| `providerCoverage`            | Per-provider coverage: `not-applicable`, `declared` or `undeclared`                                                           |
| `coverage`                    | Aggregate coverage: `complete`, `partial` or `none`                                                                           |

Validation, inspection and v2 export consume the same immutable normalized provider snapshot;
v2 does not rebuild a parallel graph. JSON remains canonical, and DOT/Mermaid renderers accept
both schema versions with deterministic safe labels. Private provider keys contain module ID and
registration index only. V2 omits private token IDs, values, readiness state, promises and
disposers.

Coverage is declaration coverage, not proof of factory body behavior. See
[lifetime dependency validation](lifetime-validation.md) for the lifetime matrix, deferred
handles, ownership and staged adoption.

## Privacy Boundary

The document contains declared public module and token IDs plus safe structural provider
metadata. It excludes arbitrary module metadata, descriptions, diagnostics, provider
values, resources, scope-local values, private module-provider IDs, function source,
timestamps, random identities and filesystem paths.

Declared IDs are intentionally lossless. Treat them as public, stable identifiers: never
put secrets, tenant data or environment-specific absolute paths in module or token IDs.
Export only to evidence locations whose access policy is appropriate for the graph.

## DOT And Mermaid

DOT and Mermaid renderers consume `GraphExportDocument` v1 or v2. Their positional node IDs
are collision-safe for the same document, and raw public IDs appear only in escaped labels.
Renderer direction and DOT graph name are presentation options and do not change JSON.

The library returns text only. It does not write files, run Graphviz or Mermaid, or produce
PNG/SVG. External renderer versions can change layout, so renderer labels and geometry must
never be parsed as graph semantics.

## Application-Edge File Recipe

Filesystem writes belong to the application or build script, not `@sagifire/ioc`:

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createGraphExportDocument, serializeGraphExport } from '@sagifire/ioc/graph-export'

const target = 'review-evidence/composition-graph.v1.json'
const json = serializeGraphExport(createGraphExportDocument(composer.getGraph()))

await mkdir(dirname(target), { recursive: true })
await writeFile(target, json, 'utf8')
```

Choose the target explicitly. Do not let the library discover, mutate or commit Project
Memory or repository files.

## Snapshot And Diff Workflow

For a task, pull request or architecture review:

1. Record provenance: task/run ID, generating command, package commit, schema name/version
   and the composition entry point.
2. Generate canonical JSON from `composer.getGraph()` or safe inspection data without
   composing solely for export.
3. Write it to an explicitly approved evidence path. A task-local evidence folder is
   preferable to a canonical product/domain/technical memory document.
4. Regenerate from the same entry point and compare bytes. Review array changes in semantic
   order and edge tuples such as `edgeKind`, consumer, required token and provider fields.
5. Optionally regenerate DOT/Mermaid for humans, but resolve every disagreement from JSON.
6. Record disposition in the task/run result: accepted evidence, incorporated finding,
   superseded snapshot or follow-up proposal.
7. Update canonical Project Memory only through its normal reviewed workflow. Generation
   itself never authorizes mutation or commit.

For coding agents, JSON is the source of truth. Check `schema` and `schemaVersion` first,
then compare typed arrays and edges. Do not infer architecture from renderer labels, node
positions, styles or external-renderer output.

## Testing Helper

`@sagifire/ioc-testing` can compare a public graph, inspection value or existing export
document with canonical JSON:

```ts
import { assertGraphExportSnapshot } from '@sagifire/ioc-testing'

assertGraphExportSnapshot(composer.getGraph(), expectedCanonicalJson)
```

The helper uses only `createGraphExportDocument()` and `serializeGraphExport()`. It performs
no filesystem access and reports the first differing line. Keep snapshot file reads and
updates in the test runner/application edge, with updates enabled only by an explicit
reviewed command.

## Additive Adoption

Graph export is additive. Existing `getGraph()` and `inspect()` callers do not need to
migrate, and object configuration remains fully usable without the DSL. Adopt the export
API only where a portable schema, deterministic diff or presentation artifact is useful.

See the runnable [module composition example](../examples/module-composition/README.md).
