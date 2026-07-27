# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
