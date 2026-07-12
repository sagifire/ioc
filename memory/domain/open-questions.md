# Open Questions

## Stage 18: async multi-providers

- Чи може sync `getAll()` читати collection, усі async contributions якого eager-ready
  після `freeze()`, чи наявність async contributor завжди вимагає explicit async API?
- Чи входять async resources у перший slice, і хто володіє успішними resources після
  partial collection failure?
- Які concurrency, fail-fast/aggregate error, retry і rollback semantics застосовуються
  per contribution?
- Як mixed sync/async contributions, eager/lazy state, scope-local values і deterministic
  registration order відображаються в inspection та testing overrides?

Ці питання блокують implementation відповідних candidates, але не блокують окремий
bounded graph-export slice.
