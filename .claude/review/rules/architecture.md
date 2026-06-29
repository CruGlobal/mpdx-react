# Architecture — Focus Areas

- **Dual GraphQL boundary** — new queries should route cleanly to one server. Mixing rootFields (primary API) with REST-proxy-only fields in the same operation is a smell; the Apollo link will split them but the result can be confusing and harder to cache
- **REST-proxy layering** — new proxy queries follow the pattern: `pages/api/Schema/<Feature>/<Feature>.graphql` → `resolvers.ts` in the same folder → `datahandler.ts` sibling file → REST call in `graphql-rest.page.ts`. Deviations should be justified
- **Thin page components** — route-level pages (`pages/**/*.page.tsx`) should compose feature components, not contain business logic. Logic lives in hooks or feature components
- **Component feature organization** — new components belong under `src/components/<Feature>/`; components used across multiple features go in `src/components/Shared/`. Don't add one-off components to `Shared/`
- **Hook placement** — reusable hooks in `src/hooks/`; feature-specific hooks stay next to their components
- **Pages Router conventions** — `.page.tsx` suffix for routes, `.page.ts` for API routes, no App Router patterns (`app/`, `layout.tsx`, `use client`, RSC)
- **useEffect dependency arrays** — verify all referenced values are listed; flag empty arrays that reference props/state (stale closures); flag effects that should be `useMemo` or event handlers instead
- **Error boundaries** — new top-level views should be wrapped in an error boundary or compose one that is. Apollo errors should surface to the user, not be swallowed
- **N+1 / waterfall queries** — component mounts that fire Apollo queries in a `useEffect` chain (query A → then query B based on A's result) should be collapsed into one operation or use `skip` + parallel queries
- **Prop drilling vs context vs Apollo cache** — if a value is passed through 3+ layers, consider Apollo cache, a context, or moving the data fetch closer to the consumer
- **Technical debt** — debt added vs reduced by this PR. Refactors that only move code without improving clarity are neutral, not positive
- **Pattern compliance** with `CLAUDE.md` and the existing codebase — new code should look like the code around it unless the existing pattern is what's being fixed
