# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack and commands

Next.js 15, React, TypeScript, Material UI v7, Apollo Client, Jest with Testing Library. Node version is in `.tool-versions`. Yarn 4, never npm.

| Task            | Command                                       |
| --------------- | --------------------------------------------- |
| Install         | `yarn install --immutable`                    |
| Generate types  | `yarn gql` (after any `.graphql` change)      |
| Run locally     | `yarn start`, then open http://localhost:3000 |
| Test one file   | `yarn test ComponentName.test.tsx`            |
| Test everything | `yarn test`                                   |
| Lint            | `yarn lint:ci`, `yarn prettier:check`         |
| Typecheck       | `yarn lint:ts`                                |

**Preflight:** `yarn install --immutable && yarn gql && yarn lint:ts && yarn test src/lib/intlFormat.test.ts`. If that passes, the box can build and test.

**Demo data:** there is no local database. The local app talks to the staging MPDX API through Okta, so walk features with a staging account. Ask the developer for one; never create or guess one. The `.env` file comes from another developer.

**Full suite on a PR:** CI runs every test in 12 chunks on every PR. Nothing to turn on. Add the `Preview Environment` label for a preview environment.

**Hooks:** pre-commit runs lint-staged. Pre-push runs gitleaks, the typecheck and the tests next to changed files. Do not skip them with `--no-verify`.

## Architecture Overview

MPDX is a Next.js 15 React application using the Pages Router with TypeScript and Material UI v7.

### Dual GraphQL Architecture

The application uses two GraphQL servers:

1. **GraphQL API Server** (`https://api.mpdx.org/graphql`) - Primary GraphQL API
2. **REST Proxy Server** (`/api/graphql-rest`) - Next.js lambda that converts REST to GraphQL

Apollo Link automatically routes queries based on which fields are requested. Check `src/graphql/rootFields.generated.ts` to see which fields are available from the GraphQL API server.

### Component Organization

- Components are organized by feature/page in `src/components/`
- Shared components are in `src/components/Shared/`
- Test files live next to the component they test
- GraphQL operations live next to the component that uses them

## GraphQL Development

### File Naming

- Operations: Use descriptive names, not starting with "Get" or "Load" (e.g., `ContactDetails`, `UpdateContact`)
- Files: PascalCase with `.graphql` extension matching component name
- Generated files: Auto-generated as `.generated.ts`

### Required Patterns

1. **Always include `id` fields** in queries/mutations for Apollo cache normalization
2. **Run `yarn gql`** after any GraphQL file changes
3. **Handle pagination** - most `nodes` fields are paginated (default 25 items)
4. **Use proper imports**: Import generated hooks from `.generated.ts` files

### Pagination Example

```graphql
query ContactNames($accountListId: ID!, $after: String) {
  contacts(accountListId: $accountListId, after: $after, first: 50) {
    nodes {
      id
      name
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

### Adding REST Proxy Queries

When adding queries that need REST API data:

1. Copy existing query folder in `pages/api/Schema/`
2. Define GraphQL schema in `.graphql` file
3. Run `yarn gql` to generate types
4. Implement REST API call in `graphql-rest.page.ts`
5. Create data handler for response transformation
6. Add resolvers to call the data handler
7. Register in `pages/api/Schema/index.ts`

## Testing Patterns

### Component Testing with GraphQL

Use `GqlMockedProvider` to mock GraphQL responses:

```tsx
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

const mutationSpy = jest.fn();

it('loads contact data', async () => {
  const { findByText } = render(
    <GqlMockedProvider<{ ContactDetails: ContactDetailsQuery }>
      mocks={{
        ContactDetails: {
          contact: {
            name: 'John Doe',
          },
        },
      }}
      onCall={mutationSpy}
    >
      <ContactComponent />
    </GqlMockedProvider>,
  );

  expect(await findByText('John Doe')).toBeInTheDocument();

  await waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('ContactDetails', {
      contactId: 'contact-1',
    }),
  );
});
```

### Single Test Execution

```bash
yarn test ComponentName.test.tsx  # Run specific test file
```

### CI Test Chunks

CI runs Jest in 12 chunks (`--shard`). `scripts/jest-shards/sequencer.js` splits them by each file's
time in `scripts/jest-shards/timings.json`, so the chunks finish together. New test files get the
average time until the next refresh. When the chunks drift apart, refresh it from a recent CI run:

```bash
rm -rf /tmp/jest-timings
gh run download <run-id> -p 'jest-timings-*' -D /tmp/jest-timings/<run-id>  # repeat for more runs
node scripts/jest-shards/mergeTimings.js /tmp/jest-timings
```

## Code Standards

### File Naming Conventions

- Components: PascalCase (e.g., `ContactDetails.tsx`)
- Pages: kebab-case with `.page.tsx` (e.g., `contact-details.page.tsx`)
- Tests: Same as file + `.test.tsx`
- GraphQL: PascalCase `.graphql` files

### Export Standards

- **Always use named exports** (never default exports)
- Component exports: `export const ComponentName: React.FC = () => {}`

### Localization

All user-visible text must be localized using `useTranslation`:

```tsx
const { t } = useTranslation();
return <h1>{t('Dashboard')}</h1>;
```

## Authentication & Environment

The app supports two auth providers via `AUTH_PROVIDER` env var:

- `OKTA` (default) - requires `OKTA_*` variables
- `API_OAUTH` - requires `API_OAUTH_*` variables

Critical environment setup:

1. Get `.env` file from another developer
2. Install Node v22.14.0 (use asdf version manager)
3. Install Git LFS: `git lfs pull`
4. Run `yarn && yarn gql && yarn start`

## Agent workflow

`/spec`, then `/answer-key`, then `/implement`, then `/pr`. The skills are in `.claude/skills/`.

- Work on a branch named for the ticket key (for example `MPDX-1234`). `/spec` makes it if needed.
- Builder agents write app code and never write or edit tests. The checker writes the unit tests and fix tests, updates existing tests the spec changes, and reviews; it never commits app code. The session writes the answer keys in `/answer-key`, and `/agent-review:yolo-review` may fix code and tests together.
- Answer-key tests live in `src/answer-key/<KEY>/`. Never special-case inputs to make tests pass. Once the build starts, nobody edits an answer key without the developer's OK.
- The session commits.
- At each step, post one line: what is done, what is next.
- `/pr` runs `/agent-review:yolo-review` once the PR is up (config is in `.claude/review/`). The bot's approval lets a two-way-door PR merge on green.

## One-way-door paths

These are the places where a person's approval adds something the bot and CI can't. A mistake here could switch off a guardrail, show one person's data to someone else, or leak a token or secret, and none of that can be taken back. Work that touches these uses the stricter setup in `.claude/skills/implement/SKILL.md`, and a code owner must approve the PR.

`.github/CODEOWNERS` holds the exact paths. A path is a one-way door when CODEOWNERS gives it an owner; the two lines with no owner at the end are carve-outs. pr-guard reads it to set the one-way-door label. `human_approval` in `.claude/review/config.yml` lists the same paths so the agent-review bot never approves these PRs. Add or remove a path in both files together, not here. The list covers:

- The review's own rules: CI, hooks, Claude config, the root CLAUDE.md and AGENTS.md, the gitleaks ignore list, and lint, test and TypeScript config
- Sign-in, page access, and clearing one user's data before the next: the saved Apollo cache, the sign-out wipe and the service worker's cache rules
- The code that puts the user's API token on outgoing calls
- Build and deploy config where secrets are in reach: Next.js, Amplify and Yarn

HR tools and the HCM reports are not on the list. Tests, the AI review and a check on staging cover their math, not a person's approval.

Tests follow their folder: a test inside an owned folder is a one-way door too. A test next to a single owned file is not, unless CODEOWNERS lists it.

## Do-not-touch list

- `*.generated.ts`: made by `yarn gql`. Change the `.graphql` file and regenerate.
- `yarn.lock` and `.yarn/cache/`: change them only through `yarn add`, `yarn remove` or `yarn up`.
- `public/locales/`: Crowdin owns the translations. Add strings with `t()` and let `yarn extract` and Crowdin do the rest.
- `scripts/jest-shards/timings.json`: refresh it only with the steps under CI Test Chunks.
- `.gitleaksignore`: never add entries to hide a new secret.
- `.env` files: never commit them.
