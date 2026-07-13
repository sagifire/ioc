# Modules

Modules are the public composition units of `@sagifire/ioc`. A module declares the tokens
it requires, the capabilities it provides, and the provider registrations needed to build
those capabilities.

The key rule is ownership: a required port belongs to the module that consumes it. A public
capability belongs to the module that exports it. Application composition binds those two
ideas together without letting modules reach through each other's private providers.

## Module Definition

Use `defineModule()` for the object API:

```ts
import { defineModule, token } from '@sagifire/ioc'

interface AuthReader {
    currentUserId(): string
}

interface ContactRequestsApi {
    submit(subject: string): string
}

const CONTACT_REQUESTS_AUTH_READER = token<AuthReader>('contact-requests.auth-reader')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>('contact-requests.public-api')

const contactRequestsModule = defineModule({
    id: 'contact-requests',
    version: '1.0.0',
    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER,
            description: 'Consumer-owned auth reader'
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api',
            description: 'Contact requests use cases'
        }
    ],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)

            return {
                submit(subject): string {
                    return `${auth.currentUserId()}:${subject}`
                }
            }
        })
    }
})
```

A module definition contains:

- `id`: stable module identity. It must be non-empty and use the supported ASCII ID
  characters.
- `version`: optional metadata for inspection.
- `metadata`: optional safe metadata summarized by inspection.
- `requires`: required ports declared by this consumer module.
- `provides`: exported capabilities declared by this provider module.
- `setup(context)`: registration function for module providers.

`requires` defaults to an empty array, and `provides` defaults to an empty array. Duplicate
required tokens or duplicate provided tokens inside one module are rejected by
`defineModule()`.

## Required Ports

Required ports describe what a module needs from the application graph:

```ts
requires: [
    {
        token: CONTACT_REQUESTS_AUTH_READER,
        required: true,
        kind: 'external',
        description: 'Auth access shaped for contact requests'
    }
]
```

Fields:

- `token`: typed token for the port value.
- `required`: optional; defaults to `true`.
- `kind`: optional; defaults to `external`. The current kinds are `external` and `shared`.
- `cardinality`: optional; defaults to `single`. Use `multi` for required collections.
- `description`: optional inspection text.

Required ports are not public runtime capabilities. They are inputs owned by the consumer
module. A required port can be satisfied by another module capability with the same token
ID, by an explicit `composer.bind(portToken)` binding or by a graph-aware
`composer.adapt(portToken).from(sourceToken).using(factory)` adapter.

Prefer consumer-owned ports when one module only needs a narrowed view of another module.
For example, `contact-requests` can require `CONTACT_REQUESTS_AUTH_READER` instead of
requiring the entire `AUTH_PUBLIC_API`.

Multi required ports use the same `required` field with collection semantics:

```ts
requires: [
    {
        token: AUDIT_SINKS,
        required: false,
        cardinality: 'multi',
        description: 'Optional audit sinks'
    }
]
```

`required: true` means at least one contributor must be available. `required: false`
allows no contributors, and provider code that calls `getAll(AUDIT_SINKS)` receives `[]`.
The `kind` field remains dependency kind (`external` or `shared`); it is not used for
single/multi semantics.

## Capabilities

Capabilities describe what a module exports:

```ts
provides: [
    {
        token: CONTACT_REQUESTS_PUBLIC_API,
        kind: 'public-api',
        cardinality: 'single',
        description: 'Contact requests public API'
    }
]
```

Supported capability kinds are:

- `public-api`
- `admin-contribution`
- `event-publisher`
- `event-subscriber`
- `shared-service`
- `custom`

A declared capability is a contract. The module must register a provider for that token
during setup, otherwise `prepare()` / `compose()` fail with a validation error. Declaring a
capability without registering it is treated as a broken module, not as a missing
dependency.

Capabilities also default to `cardinality: 'single'`. Use `cardinality: 'multi'` for
contributor catalogs:

```ts
provides: [
    {
        token: ADMIN_ITEMS,
        kind: 'admin-contribution',
        cardinality: 'multi'
    }
]
```

Single capabilities must be registered through `context.bind(token)`. Multi capabilities
must be registered through `context.add(token)`. A token ID cannot be single in one
declaration/registration and multi in another; validation reports the conflict instead of
guessing intent.

## Setup Context

Module setup receives a module-bound context:

```ts
setup(context) {
    context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
        const auth = get(CONTACT_REQUESTS_AUTH_READER)

        return createContactRequestsApi(auth)
    })
}
```

The setup context exposes:

- `moduleId`;
- `bind(token)` for single-provider registrations;
- `add(token)` for multi-provider registrations;
- resolution methods inherited from the container context.

During setup registration, resolution methods are intentionally not active. Setup should
register providers, not resolve the graph. Provider factories receive a resolution context
when the provider is actually resolved through the prepared/composed runtime.

Module setup can register:

- `bind(token).toValue(value)`;
- `bind(token).toFactory(factory)`;
- `bind(token).toClass(ClassConstructor)`;
- `bind(token).toAsyncFactory(factory)`;
- `bind(token).toAsyncResource(factory)`;
- `add(token).toValue(value)`;
- `add(token).toFactory(factory)`;
- `add(token).toAsyncFactory(factory)`;
- `add(token).toAsyncResource(factory)`.

The usual container lifetime and async initialization helpers apply to the returned
bindings where the underlying provider kind supports them.

For declared multi capabilities, register each contribution explicitly:

```ts
setup(context) {
    context.add(ADMIN_ITEMS).toValue({
        label: 'Contact requests'
    })

    context.add(ADMIN_ITEMS).toFactory(() => ({
        label: 'Generated report'
    }))

    context
        .add(ADMIN_ITEMS)
        .toAsyncFactory(async () => loadAdminItem('remote-report'))
        .singleton()
}
```

Module and composition-root async contributions share the same `getAllAsync()` ordering,
retry, scope and resource-ownership semantics as container registrations.

## Private Providers

A provider registered for a declared capability token is exported. A provider registered
for any other token is module-private:

```ts
const CONTACT_REQUESTS_REPOSITORY = token<ContactRequestsRepository>('contact-requests.repository')

const contactRequestsModule = defineModule({
    id: 'contact-requests',
    provides: [{ token: CONTACT_REQUESTS_PUBLIC_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_REQUESTS_REPOSITORY).toFactory(() => createRepository())
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const repository = get(CONTACT_REQUESTS_REPOSITORY)

            return createContactRequestsApi(repository)
        })
    }
})
```

`CONTACT_REQUESTS_REPOSITORY` is visible to providers inside `contact-requests`, but it is
not resolvable from the composed runtime and is not visible to other modules. Inspection
does not expose private provider values or private runtime internals.

This is the module isolation boundary:

- a module can resolve its own private providers from its provider factories;
- a module can resolve its declared required ports;
- a module can resolve allowed public capabilities;
- a module cannot resolve another module's private providers;
- the composed runtime cannot resolve module-private providers;
- composition-level required-port bindings do not become public capabilities by default.

## Application Composition

Modules become useful when the application composes them:

```ts
const composer = createComposer().use(authModule).use(contactRequestsModule)

composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using((auth) => {
        return {
            currentUserId(): string {
                return auth.requireUser()
            }
        }
    })

composer.add(ADMIN_ITEMS).toValue({
    label: 'Root shortcut'
})

const report = composer.validate()
const runtime = await composer.compose()
```

The adapter adapts `AUTH_PUBLIC_API` to the consumer-owned
`CONTACT_REQUESTS_AUTH_READER` port. The `using()` factory receives only the declared
source value, not a resolver context, so the source edge stays visible in inspection.
Composition-root `add()` contributions are appended after module contributions for the
same declared multi capability.

## Graph Inspection

`composer.getGraph()`, `composer.inspect()` and `runtime.inspect()` expose public graph
metadata:

```ts
const graph = composer.getGraph()

graph.requiredPorts
graph.capabilities
graph.bindings
graph.edges
```

Required ports include `satisfiedBy`:

- `binding`: satisfied by an explicit composer binding;
- `capability`: satisfied by a declared module capability;
- `optional`: optional and currently unsatisfied;
- `missing`: required and unsatisfied.

Dependency edges preserve this distinction. Capability edges connect module to module.
Binding edges connect module to application-level binding. Adapter-source edges connect a
graph-aware adapter binding to its explicit source token. Binding edges are not treated as
module cycles; adapter-source edges participate in cycle diagnostics when the source is a
single module public capability.

Validation and inspection do not execute binding factories, module provider factories or
async resources to infer hidden edges. If provider code has a runtime provider-level cycle,
that remains a container/runtime diagnostic when the provider is actually resolved.

## Optional DSL Parity

The `module()` DSL helper creates the same kind of module definition as `defineModule()`:

```ts
import { module } from '@sagifire/ioc/dsl'

const contactRequestsModule = module('contact-requests', {
    requires: [{ token: CONTACT_REQUESTS_AUTH_READER }],
    provides: [{ token: CONTACT_REQUESTS_PUBLIC_API, kind: 'public-api' }],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            return createContactRequestsApi(get(CONTACT_REQUESTS_AUTH_READER))
        })
    }
})
```

Application DSL also compiles to explicit composer usage:

```ts
import { add, adapter, defineApp } from '@sagifire/ioc/dsl'

const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapter(CONTACT_REQUESTS_AUTH_READER)
            .from(AUTH_PUBLIC_API)
            .using((auth) => {
                return createAuthReader(auth)
            }),
        add(ADMIN_ITEMS).toValue({
            label: 'Root shortcut'
        })
    ]
})
```

The object API is not a legacy path. The DSL is optional and delegates to the same
validation, inspection, preparation and composition behavior. It does not scan files,
register modules globally, use decorators, require `reflect-metadata` or hide graph edges.
The compatibility `adapt(token, factory)` DSL helper still exists for factory bindings
that intentionally use the older resolver-context shape, but it does not infer adapter
source edges.
