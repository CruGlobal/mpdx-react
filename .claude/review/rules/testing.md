# Testing — Focus Areas

Project-specific testing conventions added to the Testing agent's universal checks.

- **`GqlMockedProvider` is the only GraphQL mock pattern.** All component tests that hit GraphQL must wrap in `<GqlMockedProvider<{ OperationName: OperationNameQuery }> mocks={...}>` with typed generics so mock shapes are type-checked at compile time
- **`mutationSpy` + `toHaveGraphqlOperation(...)` pattern** is preferred over brittle snapshot-based assertions for verifying mutations
- **`toHaveTableStructure(...)` for full table contents** — when asserting more than a couple table cells, use `expect(getByRole('table')).toHaveTableStructure({ columnHeaders, rowHeaders, cells })` instead of ad-hoc `getByRole('cell')`
- **`findBy*` for async assertions** — prefer `await findByText(...)` over `await waitFor(() => getByText(...))`
- **No `fetch` mocking** — never mock `global.fetch` or `window.fetch`; use Apollo operation-level mocks
- **No `any` in test types** — mock shapes use generated operation types (`ContactDetailsQuery`, etc.) from `.generated.ts` files
- **`i18next` in tests** — `t()` returns the translation key by default in test env; don't assert on translated strings unless the test specifically exercises i18n
- **Test file colocation** — test files live next to the component under test (`Foo.test.tsx` alongside `Foo.tsx`), not in a separate `__tests__/` tree (except for shared test utilities)
- **Time-dependent tests** — use Jest fake timers (`jest.useFakeTimers()`) or Luxon's `Settings.now` override; never rely on actual system time
- **Edge case coverage** — every new component test should include: empty state, loading state, error state, at least one happy path, and boundary conditions (0 items, 1 item, many items)
- **Error path testing** — not just happy paths. Test validation failures, Apollo error responses, and user-visible error states
