# @sagifire/ioc

Staged implementation of the planned `@sagifire/ioc` package family.

This repository currently provides workspace structure, package manifests, TypeScript
configuration, build/test/lint/format tooling, documentation skeletons and the Stage 3 core
token API plus the Stage 4/5/6 sync container API for single-provider registrations,
multi-provider contributions and scopes. Stage 7 async single-provider bindings, explicit
`getAsync()` resolution, async resources and runtime/scope disposal are implemented.
Composer, DSL, diagnostics and framework adapter behavior are planned for later roadmap
stages.

## Packages

- `@sagifire/ioc`
- `@sagifire/ioc-next`
- `@sagifire/ioc-testing`

## Current Commands

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

## Documentation

The files in `docs/` are skeletons for later stages. They intentionally do not describe
unimplemented composer, DSL or adapter APIs before those layers are implemented.

## License

License selection is pending.
