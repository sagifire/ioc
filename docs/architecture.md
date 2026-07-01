# Architecture

Status: skeleton.

The detailed architecture documentation will be written after the relevant runtime layers
are implemented. The current implementation includes the core token API, Stage 4 sync
single-provider container API, Stage 5 multi-provider contributions and Stage 6 sync
scopes, plus Stage 7 async single-provider bindings, async resources and runtime/scope
disposal. Stage 8 core diagnostics include typed errors, diagnostic reports and plain-text
formatting. Stage 9 composer/modules now include explicit module definitions, composer
builder/static validation, module setup/private provider isolation, composed runtime
capability access and safe inspection metadata. Stage 10 dependency edges and module cycle
diagnostics are implemented. Stage 11 DSL includes `module()` for module definitions,
`defineApp()` for deterministic conversion to existing composer configuration, bind helper
declarations and `adapt()` for explicit composition adapters. Testing helpers and adapters
are now split into a Stage 12 testing package foundation and later helper/adapter stages.
`@sagifire/ioc-testing` currently provides `createTestRuntime()` for isolated core
container runtimes.

## DSL Boundary

The DSL is optional. It is an ergonomic declaration layer over the explicit
object-configuration and composer APIs, not a second runtime or hidden registry.

- `module()` normalizes to the same module definition semantics as `defineModule()`.
- `defineApp()` creates a fresh configured composer from declared modules and bindings.
- `bind(token)` creates composition binding declarations for existing `composer.bind()`
  provider forms.
- `adapt(token, factory)` is an explicit factory binding helper for consumer-owned
  required ports.

Object configuration remains first-class:

```ts
const composer = createComposer()
    .use(authModule)
    .use(contactRequestsModule)

composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory((context) => {
    const auth = context.get(AUTH_PUBLIC_API)

    return {
        currentUserId(): string {
            return auth.requireUser()
        }
    }
})
```

The equivalent DSL path produces the same inspectable graph shape:

```ts
const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapt(CONTACT_REQUESTS_AUTH_READER, (context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
    ]
})
```

Validation and inspection use declared module requirements, capabilities and composition
bindings. They do not execute module setup, provider factories, binding factories, adapter
factories or async resources to infer hidden dependencies. The core package still has no
decorators, `reflect-metadata`, constructor metadata, filesystem discovery, framework
imports, global mutable app registry or service locator behavior.
