# Data Integrity — Focus Areas

This is where domain-specific data invariants belong.

- **Apollo cache normalization** — missing `id` fields cause stale or duplicate cache entries. Every selection set for a normalizable type must include `id`
- **Cache type policies** (`src/lib/apollo/cache.ts`) — any change to `typePolicies`, `keyFields`, or `merge` functions can silently corrupt cached data across the app. Treat as high-severity
- **Pagination merge functions** — `fetchMore` merge must dedupe, preserve order, and handle cursor edge cases (empty page, duplicate cursor, cursor missing)
- **Optimistic responses** — must match server response shape exactly, including `__typename` and `id`; mismatches cause cache misses and UI flicker
- **Mutation cache updates** — every mutation that changes displayed data must include `update`, `refetchQueries`, `cache.modify`, or `cache.evict` — otherwise the UI shows stale data
- **REST-proxy data handlers** — field mapping from snake_case (REST) to camelCase (GraphQL) is a frequent place for silent field-dropping. Verify every field in the REST response is either mapped or intentionally ignored
- **Null vs undefined in mutation variables** — GraphQL distinguishes between "field not set" (`undefined`, omitted) and "field explicitly null" (`null`). The REST proxy may reject one or the other. Form state → mutation variable mapping must be intentional about this
- **Form submit → mutation mapping** — Formik values passed directly to a mutation can include unexpected fields if the Yup schema is looser than the GraphQL input type. Flag any `...values` spread into mutation variables without an explicit field allowlist
- **Date serialization** — dates sent to the server should be in a consistent format (ISO-8601 / Luxon); flag any manual `.toString()` or `new Date()` in mutation variables
- **Currency precision** — monetary values must not be truncated or rounded during form handling; the display boundary is the only place for rounding
- **Pagination over `nodes`** — aggregating client-side over a single page of `nodes` silently ignores unpaginated data. Prefer server-provided totals
- **Filter/search state** — when filters change, paginated data must be re-fetched from the first page, not appended to existing pages
- **Optimistic updates on lists** — adding an item optimistically must place it in the correct sort position, not just at the end
