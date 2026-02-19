---
name: pr-review
description: Comprehensive PR code review
approve_tools:
  - Bash(gh:*)
---

# PR Code Review Command

This command performs a thorough code review by analyzing all git changes compared to the base branch.

## Review Mode

Before the review, print exactly: Operating in review-only mode.

MODE

- REVIEW ONLY of the current PR diff; do NOT modify existing files or stage/commit changes.
- All findings will be collected and optionally posted to the PR via GitHub CLI at the end.

### Stage 0 — Setup Knowledge

First, read the .CLAUDE/CLAUDE.md file to understand project conventions, architecture, and coding standards.

Then use search tools to build context for reuse analysis:

- `Grep "export" src/lib/ -n` - Find available utility functions
- `Glob "src/hooks/*.ts"` - List custom hooks
- `Glob "src/components/Shared/**/*.tsx"` - Find shared components
- `Read` key files that show up frequently in imports

Note common patterns for later reuse identification in Stages 2-3.

Repo heuristics to enforce:

- Currency/number formatting must use intlFormat helpers; avoid raw toLocaleString.
- Dates use Luxon DateTime; avoid new Date.
- React keys: avoid index as key.
- Theme: use theme tokens, not hardcoded hex.
- Prefer context over deep prop-drilling for cross-cutting state (e.g., MPGA context).
- Prefer shared Empty/Loading/Print styles/components over ad-hoc duplicates.
- Tests: prefer central mockData; test print paths; name/intent clear; verify formatting using prod helpers.
- File types: pure helpers should be .ts, not .tsx.

### Stage 1 — Get Git Changes

Use GitHub CLI to get the exact refs for the currently checked-out PR:

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid)

git diff $BASE_REF..$HEAD_REF --name-only
git diff $BASE_REF..$HEAD_REF
```

If GitHub CLI is unavailable or the branch is not a PR, compare the current branch against main:

```bash
git branch --show-current
git merge-base HEAD main || git merge-base HEAD master
git diff $(git merge-base HEAD main)..HEAD --name-only
git diff $(git merge-base HEAD main)..HEAD
```

List EVERY file changed in this PR (relative path). For each file, include:

- Kind: {component | hook | util | helper | styled | test | other}
- Risk: {low|med|high}
- Why (1 sentence)

Do not skip any file. If any file can't be read, state it and continue.

### Stage 2 — Deep Review (File-by-File)

IMPORTANT: Only review files that appear in the git diff from Stage 1. Do not review files that are not part of this PR.

**Issue Severity Guidelines:**

- **Must-fix**: Bugs, security issues, breaking changes, type errors, performance problems
- **Nice-to-have**: Style improvements, minor refactoring, better naming, documentation

For EACH changed file from Stage 1, review for:

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
- **Document assumptions** - Like why ! non-null assertions are safe
- **Remove outdated comments** - Delete comments that no longer apply

#### Accessibility

- **Use proper ARIA attributes** - But don't duplicate what MUI provides by default
- **Provide button labels** - All interactive elements need accessible names
- **Use semantic HTML roles** - For finding elements in tests and screen readers

#### General Concerns

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

For each file, document:

- Must-fix: file:line → issue → fix (unified diff if trivial)
  - Evidence (file:line-range quote)
  - Impact (correctness/perf/clarity)
- Nice-to-have (same format)
- Suggested tests (anchor to this file's code)
- Quick patches (tiny unified diffs only; do not apply)

RULE: If no issues found for a file, state: "No issues found after deep check" AND explain the checks you ran.

### Stage 3 — Reuse Sweep (Repo-Wide)

Search for reuse opportunities in the PR changes:

**Global Shared Resources:**
Use targeted searches based on PR content:

- If PR has date/time logic: `Grep "date|time|format" src/lib/`
- If PR has state management: `Grep "use.*State|use.*Effect" src/hooks/`
- If PR has UI components: `Grep "export.*Component|export.*FC" src/components/Shared/`
- If PR has validation/forms: `Grep "validate|schema|form" src/lib/`

**Local Context Analysis:**
For each changed .ts/.tsx file, search:

- Sibling files in the same directory for similar functions/components
- Parent directory files for shared utilities
- Nearby test files for common mock patterns or test utilities

**Duplication Detection:**

- Look for similar code patterns across changed files that could be consolidated
- Identify repeated logic that could be extracted to a shared location

For each reuse candidate found:

- Evidence: existing function/component location + where it applies in PR (file:line)
- Impact: consistency/maintainability/perf/bundle size
- Patch: minimal unified diff to adopt existing solution or create shared utility
- Consolidation opportunity: if creating new shared code, suggest location (src/lib/, src/hooks/, etc.)

### Stage 4 — Pattern Sweep (Regex-Guided)

Search ONLY the files changed in this PR (from Stage 1 git diff) for these patterns; for each hit, either propose a fix or mark "N/A" with reason. Cite exact lines.

- `toLocaleString.*currency` → replace with intlFormat helpers
- `new Date\\(` → use Luxon DateTime instead
- `key={index}` → use stable keys (object.id, etc.)
- `#[0-9a-fA-F]{3,6}\\b` → use theme tokens instead of hex colors
- `console\\.(log|warn|error)` → remove before merge
- `useState.*\\[\\]` → consider if custom hook exists
- `useEffect.*fetch` → consider using existing data hooks
- `styled.*\\$\\{` → verify theme token usage in styled-components
- Duplicated helpers (e.g., monthCount/getFirstMonth) across MPGA files → centralize
- Pure helpers in .tsx → move to .ts
- Tests not using central mockData → switch to shared mocks
- Recharts mocks duplicated → move to shared test util

### Stage 5 — Generate Review Report

Print a detailed report grouped by confidence level:

**Summary** (3–7 bullets covering key findings)

**High Confidence Issues** (very likely needs to be changed)
For each issue include:

- The concern
- The filename and line numbers
- Why the code is suboptimal
- How to fix it

**Medium Confidence Issues** (probably should be changed)
For each issue include:

- The concern
- The filename and line numbers
- Why the code might be suboptimal
- How to fix it

**Low Confidence Suggestions** (consider changing)
For each issue include:

- The suggestion
- The filename and line numbers
- Why it might be better
- How to change it

**Architecture & Performance** (high-level concerns)

**Reuse Opportunities** (existing utilities/components that could be used)

**Testing Suggestions** (missing tests, test improvements)

### Stage 6 — Offer to Post Comments

After completing the review report, get the current branch's PR number with `gh pr view --json number -q .number`.
If the branch does not have a PR yet, skip this step. If it does have a PR, ask the user:

"Would you like me to post these review comments to the PR via GitHub CLI?

I can create review comments on specific lines using `gh pr review` command."

Options:

1. Post all comments (Must-fix and Nice-to-have)
2. Post only Must-fix comments
3. Don't post

If the user agrees to post comments:

1. For each comment, use:

```bash
gh pr review [PR_NUMBER] --comment --body "[Must-fix/Nice-to-have] Issue at file:line

Evidence: <code fragment>
Impact: <why this matters>
Fix: <suggested change>"
```

2. Keep each comment concise (≤ 220 characters when possible)
3. Use collaborative, direct phrasing: "Could we..." or "Consider..."
4. Group related comments when appropriate
5. After posting, confirm: "Posted X review comments to PR #[NUMBER]"

Comment formatting rules:

- Start with severity: [Must-fix] or [Nice-to-have]
- Include file path and line number
- Be specific and actionable
- Provide evidence from the code
- Explain impact
- Suggest concrete fix
- Be kind and collaborative in tone

### Stage 7 — Offer to Fix Issues

If the current branch does not have a PR yet, ask the user:

"Would you like me to the issues?"

Options:

1. Fix all issues
2. Fix only Must-fix issues
3. Don't fix

If the user agrees to fix the issues, make the changes on behalf of the user. You may only modify files in this step.
