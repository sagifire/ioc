# Modules

Status: module definition, composer static validation, module setup preparation, composed
runtime capability access and safe inspection metadata implemented.

Modules can now be described with the explicit object-configuration `defineModule()` API.
The `module()` DSL helper is also available as an optional thin layer that produces the
same module definition shape. The `defineApp()` DSL helper can collect module definitions,
object-form binding declarations, bind helper declarations and `adapt()` declarations,
then convert them to a fresh configured composer through existing `createComposer().use()`
and `composer.bind()` semantics.
Composer configuration can register those definitions with `createComposer().use()`,
validate declared capabilities, required ports and explicit bindings with
`composer.validate()`, and execute setup/private provider registration with
`composer.prepare()`. `composer.compose()` creates an immutable composed runtime that
exposes declared exported capabilities while hiding private module providers and
required-port-only bindings.

Module graph inspection is available through `composer.inspect()`, `composer.getGraph()`
and `runtime.inspect()`. It includes module IDs, versions, safe metadata summaries,
required port metadata, capability metadata, composition binding metadata, validation
status, dependency edge metadata and exported provider registration summaries.

Stage 10 dependency edge metadata is implemented for capability-satisfied and
binding-satisfied required ports. Module cycle detection is implemented over capability
dependency edges, and cycle diagnostics include module and token paths without exposing
provider values or private runtime internals.

## Object API And DSL Parity

The explicit object API remains fully supported:

```ts
const contactRequestsModule = defineModule({
    id: 'contact-requests',
    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const authReader = resolutionContext.get(CONTACT_REQUESTS_AUTH_READER)

            return {
                submit(): string {
                    return authReader.currentUserId()
                }
            }
        })
    }
})
```

The DSL version is only a declaration convenience:

```ts
const contactRequestsModule = module('contact-requests', {
    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context) {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const authReader = resolutionContext.get(CONTACT_REQUESTS_AUTH_READER)

            return {
                submit(): string {
                    return authReader.currentUserId()
                }
            }
        })
    }
})
```

Application-level DSL keeps required-port ownership explicit:

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

Only modules and bindings passed to `defineApp()` participate in validation and
composition. The DSL does not register modules globally, scan the filesystem, use
decorators or hide dependency edges behind factory execution.
