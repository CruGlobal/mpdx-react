---
name: pr-review-caleb
description: Comprehensive PR code review
approve_tools:
  - Bash(gh:*)
---

# Code Review Command

This command performs a thorough code review by analyzing all git changes compared to the base branch.

## Review Process

### Step 1: Get Git Changes

Use GitHub CLI to get the exact refs for the currently checked-out PR:

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid)

git diff $BASE_REF..$HEAD_REF --name-only
git diff $BASE_REF..$HEAD_REF
```

If it is unavailable or the branch is not a PR, compare the current branch against main.

### Step 2: Analyze Each Changed File for Specific Issues

For each file in the diff, review for:

#### General Code Quality Principles

- **Avoid unnecessary changes** - Don't modify files or add newlines/whitespace if not required for the feature
- **Remove unused code** - Delete unused imports, types, fields, props, variables, and commented-out code
- **Minimize mocks in tests** - Only mock fields that tests actually care about; omit irrelevant fields
- **Prefer existing patterns** - Reuse existing helper methods, components, and utilities rather than creating new ones
- **Keep code DRY** - Consolidate duplicated logic, interfaces, and test setup code
- **Use intermediate variables judiciously** - Avoid them in tests when only used once; consider inlining
- **Use Luxon over native Date** - Consistent with project standards

#### TypeScript & Type Safety

- **Avoid type casts** - Remove `as` casts when TypeScript can infer types correctly
- **Use proper TypeScript types** - Prefer interfaces over types; make required fields non-nullable
- **Leverage generated types** - Use GraphQL fragment types instead of manually defining interfaces
- **Add type parameters to generics** - Specify types for Maps, Records, etc.
- **Use `satisfies` for mock type safety** - Add `satisfies DeepPartial<Mocks>` to mock definitions
- **Handle nullability correctly** - Only use optional chaining (`?.`) and nullish coalescing (`??`) when fields are actually nullable

#### React & Hooks

- **Functions using hooks must be hooks** - Prefix with `use` and follow Rules of Hooks
- **Don't capitalize non-component functions** - Only React components should be PascalCase
- **Memoize expensive calculations** - Use `useMemo` for complex computations and transformations
- **Memoize objects/arrays passed as props** - Prevents unnecessary re-renders
- **Don't define components inside components** - They get recreated on every render; extract or wrap in `useMemo`
- **Hooks can be self-contained** - Get dependencies like `locale` from `useLocale()` instead of passing in
- **Prefer hook-provided state** - Use `loading` from `useQuery`/`useMutation` hooks
- **Check if state is truly needed** - Can it be derived from props or other state?
- **Validate if context is necessary** - Could it be a helper function or hook instead?

#### GraphQL & Apollo

- **Load the `id` field** - Always query `id` so Apollo can cache properly
- **Use fragments for reusability** - Share field definitions across queries with fragments
- **Use optimistic responses** - Updates show immediately in the UI before server confirms
- **Use `cache.updateFragment`** - Cleaner API than manual cache manipulation
- **Set correct `__typename` in optimistic responses** - Required for cache updates to work
- **Use `fetchPolicy: 'cache-first'`** - For data that doesn't change often to minimize refetches

#### Testing Best Practices

- **Use `userEvent` over `fireEvent`** - More realistic user interaction simulation
- **Use `findBy` instead of `waitFor` + `getBy`** - More concise async queries
- **Use `getBy` for elements that should exist** - Only use `queryBy` when expecting absence
- **Remove `.toBeInTheDocument()` when doing other assertions** - Redundant if already asserting on the element
- **Test GraphQL mutations were called** - Use `toHaveGraphqlOperation` to verify operations and variables
- **Don't await `userEvent` in older versions** - Not necessary in the version being used
- **Combine similar test cases** - Reduce duplication by testing related behavior together
- **Use `TestRouter` instead of mocking hooks** - More realistic and less brittle
- **Don't mock Apollo hooks** - Use `GqlMockedProvider` with mock data instead
- **Define `mutationSpy` outside component** - Makes tests less verbose
- **Use role-based queries** - More accessible and robust than test IDs
- **Set up default props in test components** - Let individual tests only override what they need
- **Use `Settings.now()` for mocking time** - Allows tests to control current time

#### Styling & UI

- **Use theme spacing values** - `theme.spacing(2)` instead of hardcoded pixels
- **Use `Stack` with gap** - Instead of manually creating flex containers with margins
- **Avoid `!important` in styles** - Usually indicates fighting against existing styles
- **Remove redundant wrappers** - Single-child `Box` components often unnecessary

#### Localization

- **Translation keys must be static strings** - Can't use template literals or variables in `t()` calls
- **Localize all user-facing text** - Including labels, messages, button text
- **Use translation parameters** - `t('Hello {{name}}', { name })` for dynamic values
- **Don't check against localized strings in code** - Use unlocalized identifiers/enums

#### Code Organization

- **Place helpers in appropriate directories** - Generic helpers in shared utils, specific ones near usage
- **Extract complex logic to helper functions** - Makes it easier to test and reason about
- **Avoid deeply nested conditionals** - Refactor to `if/else if/else` or early returns
- **Use object parameters for many arguments** - Harder to mix up than positional arguments

#### Commenting & Documentation

- **Add comments for non-obvious logic** - Especially for workarounds or complex algorithms
- **Explain why, not what** - Code shows what, comments explain reasoning
- **Document assumptions** - Like why `!` non-null assertions are safe
- **Remove outdated comments** - Delete comments that no longer apply

#### Accessibility

- **Use proper ARIA attributes** - But don't duplicate what MUI provides by default
- **Provide button labels** - All interactive elements need accessible names
- **Use semantic HTML roles** - For finding elements in tests and screen readers

### Step 3: Analyze Each Changed File for General Concerns

For each file in the diff, review for:

**Correctness Issues**

- Logic errors or bugs
- Type safety issues
- Edge cases not handled
- Incorrect assumptions

**Code Complexity**

- Simpler logic to achieve the same result
- Redundant logic that can be removed
- Complex logic in components that could be moved to hook
- Long components that could be split into multiple components
- Duplicated logic or components that could be split out and reused

**Confusing Code**

- Unclear or misleading variable or function names
- Comments that describe WHAT not WHY

**Code Quality**

- Inconsistent patterns compared to codebase
- Missing TypeScript types

**Testing Concerns**

- Critical paths without test coverage
- Complex logic that needs tests
- Edge cases that should be tested

### Step 4: Generate Report

Print a detailed report including the following for each flagged issue. Group by how confident you are that the code needs changed.

- The concern
- The filename and line numbers
- Why the code is suboptimal
- How to fix it

Offer to fix all the issues automatically.
