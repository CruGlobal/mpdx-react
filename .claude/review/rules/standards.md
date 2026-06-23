# Standards — Checklist

Every item here is mandatory. The Standards agent must report compliance per item.

**Exports & Naming**

- [ ] **Named exports only** — no `export default` in components, hooks, or libs (`export const ComponentName: React.FC = () => {}`)
- [ ] **File naming** — components PascalCase (`Foo.tsx`), pages kebab-case with `.page.tsx`, API routes with `.page.ts`, tests colocated as `Foo.test.tsx`, GraphQL as PascalCase `.graphql`
- [ ] **GraphQL operation names** — descriptive, not prefixed with `Get` or `Load` (e.g. `ContactDetails`, not `GetContactDetails`)
- [ ] **Hook names** — must start with `use` and live in `src/hooks/` (reusable) or next to the component (feature-specific)

**Localization (i18n)**

- [ ] Every user-visible string uses `useTranslation` / `t()` — no hard-coded display text in JSX, `Alert`, `Snackbar`, error messages, `aria-label`, or form labels
- [ ] No string interpolation inside `t()` calls — use interpolation variables: `t('Hello {{name}}', { name })`, not `t(`Hello ${name}`)`
- [ ] No dynamic `t()` keys (`t(varName)`) — extraction tool can't find them

**GraphQL & Apollo**

- [ ] Every query/mutation selection set includes `id` on normalizable types (for cache normalization)
- [ ] Any `.graphql` change has been verified by running `yarn gql` successfully
- [ ] Any query returning `nodes` either handles pagination via `pageInfo` / `after` / `fetchMore`, or documents why the default 25-item limit is sufficient
- [ ] Mutations that change cached data include either `update`, `refetchQueries`, or `cache.evict` to reflect the change in the UI
- [ ] Apollo routing awareness — when adding a field, check `src/graphql/rootFields.generated.ts` to know which server handles it; don't mix rootFields with REST-proxy-only fields in one operation
- [ ] No raw `fetch` or `axios` calls for data that could go through Apollo — centralize in GraphQL. Exception: the REST-proxy boundary layer (`pages/api/graphql-rest.page.ts` and `pages/api/Schema/**/datahandler*.ts`) uses `fetch` intentionally to call the upstream REST API

**TypeScript**

- [ ] No `any` types in new code (use `unknown` + narrowing, or proper generics)
- [ ] No `@ts-ignore` / `@ts-expect-error` without an inline comment explaining why
- [ ] No non-null assertions (`!`) on values that could legitimately be null — prefer explicit null checks
- [ ] Generated operation types from `.generated.ts` files are used for Apollo hooks and mocks

**Forms**

- [ ] Forms use Formik + Yup — no manual `useState` form state for anything beyond trivial single-field inputs
- [ ] Every Yup schema has matching server-side validation (don't rely on client-only validation)
- [ ] Submit buttons are `disabled` while `isSubmitting` is true

**Testing**

- [ ] Every new component, hook, and lib function has a colocated `*.test.{ts,tsx}`
- [ ] Component tests using GraphQL wrap in `GqlMockedProvider<{ OperationName: OperationNameQuery }>` with typed mocks
- [ ] Tests use `findBy*` for async assertions rather than `waitFor(() => getBy*)`
- [ ] No `any` in test types — use generated operation types for mock shapes
- [ ] No global `fetch` mocking — use Apollo mocks at the operation level

**Code Quality**

- [ ] Passes `yarn lint` and `yarn lint:ts`
- [ ] No debug output (`console.log`, `console.debug`, `debugger`, `// TODO` without a Jira/MPDX ticket reference)
- [ ] No `new Date()` — use Luxon (`DateTime.now()`, `DateTime.local()`) per project convention
- [ ] No unused imports or variables
- [ ] No commented-out code blocks (delete, don't comment)
- [ ] No empty `catch {}` blocks that swallow errors silently
