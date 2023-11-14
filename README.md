# MPDX

This is a [Next.js 12](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
The project uses node version 18.13.0.

## Environments

- Production: https://next.mpdx.org/
- Staging: https://next-stage.mpdx.org/
- Local: http://localhost:3000/

## Getting Started

First, make sure that you have a suitable version of Node.js. This project uses node v18.13.0. To check your node version, run `node --version`. If you don't have node v18.13.0 installed or a suitable version, an easy way to install it is with [fnm](https://github.com/Schniz/fnm), a node version manager.

```bash
# Install fnm
brew install fnm

# Integrate it with your shell (you will need to change this if you use a different shell than zsh)
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc

# IMPORTANT: Close that terminal tab/window and open another one to apply the changes to your shell configuration file

# Install the version of node defined in this project's .nvmrc file
fnm install

# Check that the node version is now 18.13.0
node --version
```

Then, make sure you get the environment variables necessary for this project from another developer and put them in a `.env` file in the project's root directory.

Once you have these variables you can install the dependencies.

```bash
yarn
```

Next, generate types for REST -> GraphQL:

```bash
yarn gql:server
```

Then, run create GraphQL generated files:

```bash
yarn gql
```

Lastly, run the development server:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
Note: there is a test account you can use. Get this from another developer if you want to use it.

### Cru specific secrets

- `AUTH_PROVIDER` - Name of auth provider used in application. Set to `OKTA` or `API_OAUTH`
- `ROLLBAR_ACCESS_TOKEN` - Optional token for sending error reports to Rollbar
- `ROLLBAR_SERVER_ACCESS_TOKEN` - Optional token for sending error reports on server pages to Rollbar
- `ONESKY_API_KEY` - Public key for uploading/downloading translations from OneSky
- `ONESKY_API_SECRET` - Secret key for uploading/downloading translations from OneSky
- `ONESKY_PROJECT_ID` - Project id for uploading/downloading translations from OneSky
- `GOOGLE_TAG_MANAGER_CONTAINER_ID` - Optional Google Tag Manager container ID
- `NEXT_PUBLIC_MEDIA_FAVICON` - Application favicon image url
- `NEXT_PUBLIC_MEDIA_LOGO` - Application logo image url
- `REWRITE_DOMAIN` - The domain which where new & old MPDX applications live. Set to `mpdx.org` for next.mpdx.org & `stage.mpdx.org` for staging.
- `DATADOG_APP_ID` - Datadog tracking application ID.
- `DATADOG_CLIENT_TOKEN` - Datadog tracking client token.
- `BEACON_TOKEN` - HelpScout beacon token
- `HS_CONTACTS_SUGGESTIONS` - Comma-separated IDs of the HelpScout articles to suggest on the contacts page
- `HS_CONTACTS_CONTACT_SUGGESTIONS` - Comma-separated IDs of the HelpScout articles to suggest on the contact page
- `HS_HOME_SUGGESTIONS` - Comma-separated IDs of the HelpScout articles to suggest on the dashboard page
- `HS_REPORTS_SUGGESTIONS` - Comma-separated IDs of the HelpScout articles to suggest on the reports pages
- `HS_TASKS_SUGGESTIONS` - Comma-separated IDs of the HelpScout articles to suggest on the tasks page

#### Auth provider

MPDX has two auth providers, Okta (which is default) and our own API OAuth. You'll need to configure one.

```
AUTH_PROVIDER=OKTA
```

AUTH_PROVIDER can be changed to the following auth providers options: `OKTA` or `API_OAUTH`.

If you choose `OKTA`, you will also need to configure these environment variables.

- `OKTA_CLIENT_ID` - Okta Client ID for your Okta account
- `OKTA_CLIENT_SECRET` - Okta Client secret for your Okta account
- `OKTA_ISSUER` - Okta issuer web address
- `OKTA_SIGNOUT_REDIRECT_URL` - URL to send user after successful logout. Must match Default App Sign-In Custom Url on Okta's settings.

If you choose `API_OAUTH`, you will need to configure these environment variables.

- `API_OAUTH_CLIENT_ID` - Api OAuth Client ID
- `API_OAUTH_CLIENT_SECRET` - Api OAuth Client Secret
- `API_OAUTH_ISSUER_AUTHORIZATION_URL` - Api OAuth issuer authorization url
- `API_OAUTH_ISSUER_TOKEN_URL` - Api OAuth issuer token url
- `API_OAUTH_SCOPE` - Scope for Api OAuth
- `API_OAUTH_VISIBLE_NAME` - UI name for your OAuth, default is `SSO`.

_Also if you're viewing the next-auth code, you'll come across this file `pages/api/auth/apiOauthSignIn.ts`. `apiOauthSignIn.ts` is a Graphql generated file, but since the apiOauthSignIn Graphql isn't added to MPDX API Prod, only to MPDX API Staging for security reasons. We've added the generated file for apiOauthSignIn and not the GraphQl file since it will cause build errors on prod._

#### Favicon & Logo Env Vars

Since we don't want accidental re-use of our logos by non-Cru organizations, the values of `NEXT_PUBLIC_MEDIA_LOGO` and `NEXT_PUBLIC_MEDIA_FAVICON` are not included in this README.
If you need them, request a developer to send you the values to these env variables.

## Directory Structure

This project uses the Next.js 12 Pages Router, which you can learn more about [here](https://nextjs.org/docs/pages). Next.js provides a file-based router, so the directory structure the filenames of pages in the `pages/` directory determines their URL. For example, `pages/accountLists/[accountListId]/reports/expectedMonthlyTotal.page.tsx` will handle URLs like `/accountLists/01234567-89ab-cdef-0123-456789abcdef/reports/expectedMonthlyTotal`. The page is rendered on the server as HTML so that the user can see the content and not a blank page while React and the page's components load. Onces the JavaScript loads and the page "hydrates", the page will be interactive. You can learn more about hydration in React [here](https://react.dev/reference/react-dom/client/hydrateRoot).

`pages/_app.page.tsx` is a wrapper for all pages and contains setup for various React context providers that the application uses.

`src/` contains all of the React components, hooks, and helpers that the components in `pages/` uses.

`src/components` contains React components, some of which are organized in directories by the page or section of the page that they are used in.

`src/components/shared` contains React components reused throughout the application.

`src/hooks` contains React custom hooks.

`src/lib` and `src/utils` contain helper functions used throughout the application.

`public/` contains static files like images and translation data.

Test files live next to the files that they test, i.e. the test file for `src/components/Tool/Home/Home.tsx` is `src/components/Tool/Home/Home.test.tsx`. Similarly the GraphQL query and mutation definitions live next to or near the component that uses them.

## GraphQL

This project uses GraphQL to load data from the API server. GraphQL allows us to load exactly the data that each component needs. It is an alternative to a REST API. If you aren't familiar with GraphQL, a great resource for learning more is https://graphql.com/learn.

### GraphQL Playground

The GraphQL playground can be a useful tool/interface for testing out queries and mutations. It can accessed locally during development at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

### Using a Query

To load data in your component, the first step will be to write a query definition based on the fields that your component needs. The easiest way to do this is to go to [Apollo Studio](http://localhost:3000/api/graphql), click the plus sign next to the query you want to load, and then click the plus signs next to the fields you want to use in your component. On line 1, give the query a name that describes the data it loads and is unique across the entire project. Then create a `.graphql` file with the same name as your component (i.e. if your component is `Partners.tsx`, the query goes in `Partners.graphql`) and copy and paste the query from Apollo studio into it. It should look something like this:

```gql
# Partners.graphql
query PartnerCommitments($accountListId: ID!) {
  contacts(accountListId: $accountListId) {
    nodes {
      id
      name
      pledgeAmount
      pledgeCurrency
      pledgeFrequency
      pledgeReceived
      pledgeStartDate
    }
  }
}
```

Finally, run `yarn gql` to update the automatically generated types and hooks for your query. You will need to run this after every change to your `.graphql` query file. If you want it to rerun automatically when it detects changes, run `yarn gql:w`.

To use your new query in a component, import and call the automatically generated `use...Query` hook inside your component. If your query in the `.graphql` file is called `PartnerCommitments`, for example, type `usePartnerCommitmentsQuery` and let autocomplete in VS Code automatically find and import the hook.

```tsx
// Partners.tsx
import { usePartnerCommitmentsQuery } from './Partners.generated';

interface PartnersProps {
  accountListId: string;
}

export const Partners: React.FC<PartnersProps> = ({ accountListId }) => {
  const { data, loading } = usePartnerCommitmentsQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <div>
      {loading
        ? 'Loading...'
        : data?.contacts.nodes.map((contact) => <div>{contact.name}</div>)}
    </div>
  );
};
```

This hook returns a lot of helpful fields, but the most important ones are `data` and `loading`. `data` will be undefined while the query is loading or if it errors and will contain the data from the query. `loading` will be `true` while the query is loading and `false` when it finishes loading. If your query in the `.graphql` file defined any variables, you must pass them into the query hook via the `variables` property. The `use...Query` hooks have a lot more functionality, which you can read about [here](https://www.apollographql.com/docs/react/data/queries).

### Using a Mutation

To modify data in your component, the process is similar to using a query. Go to Apollo Studio, go to the root, click on `mutation`, and click the add button next to the mutation you want to use. Select the fields that you want to load in the mutation response, rename the query, and put it in a `.graphql` file with the same name as your component. A `.graphql` file can contain multiple queries and/or mutations, so if you already have a query defined, simply add your mutation in the same file. Lastly, run `yarn gql`.

```gql
# Partners.graphql
mutation DeletePartner($accountListId: ID!, $contactId: ID!) {
  deleteContact(input: { accountListId: $accountListId, id: $contactId }) {
    id
  }
}
```

Now you can import and call the `use...Mutation` hook. Like the query, it will have the same name as the mutation you just defined. The hook will return an array where the first item is a method that you can call to run the mutation. Make sure you pass in the variables you defined in your mutation. You can read more about the `use...Mutation` hooks [here](https://www.apollographql.com/docs/react/data/mutations).

```tsx
// Partners.tsx
import {
  useDeletePartnerMutation,
  usePartnerCommitmentsQuery,
} from './Partners.generated';

interface PartnersProps {
  accountListId: string;
}

export const Partners: React.FC<PartnersProps> = ({ accountListId }) => {
  const { data, loading } = usePartnerCommitmentsQuery({
    variables: {
      accountListId,
    },
  });
  const [deletePartner] = useDeletePartnerMutation();

  return (
    <div>
      {loading
        ? 'Loading...'
        : data?.contacts.nodes.map((contact) => (
            <div>
              {contact.name}{' '}
              <button
                onClick={() =>
                  deletePartner({
                    variables: { accountListId, contactId: contact.id },
                  })
                }
              >
                Delete
              </button>
            </div>
          ))}
    </div>
  );
};
```

### Apollo Cache

In a large application like this, multiple components will end up referencing the same piece of data. For example, the contact list shows a contact's name, and the contact detail header shows the same contact's name. Imagine that the contact detail component updates the contact's name. It can update itself with the new name, but how will the contact list know to update the contact's name as well? To solve this problem, Apollo provides a centralized cache of all data loaded by any query in the application.

Every time a query receives new data, Apollo recursively looks through the response to see which objects in its cache need to be updated. It identifies objects using their type and their `id` field. For example, if a contact is in the cache from a previous query that loaded 20 fields, and another query later on loads just the contact's name, as long as the `id` field matches a the `id` of contact in the cache, it will update the cached contact's modified fields and leave the others intact. Any component referencing that cached contact will automatically update without having to load the entire query again.

**Important**: For cache normalization to work, you **must** add the `id` property to **every** object in **every** query and mutation you define. Otherwise, the server won't send the `id` and Apollo know that two objects from two different queries are actually the same. Here's an example of a deeply nested query and a mutation that have the `id`s needed:

```gql
query TaskDetails($accountListId: ID!) {
  tasks(accountListId: $accountListId) {
    nodes {
      id
      subject
      contacts {
        nodes {
          addresses {
            nodes {
              id
              street
              city
              state
            }
          }
          people {
            nodes {
              id
              firstName
              lastName
            }
          }
        }
      }
      comments {
        nodes {
          id
          body
        }
      }
    }
  }
}

mutation UpdateTaskSubject(
  $accountListId: ID!
  $taskId: ID!
  $subject: String!
) {
  updateTask(
    input: {
      accountListId: $accountListId
      attributes: { id: $taskId, subject: $subject }
    }
  ) {
    task {
      id
      subject
    }
  }
}
```

To learn more about Apollo's cache normalization, [this](https://www.apollographql.com/blog/apollo-client/caching/demystifying-cache-normalization/) is a helpful resource.

### Architecture

Originally, the API server provided a REST API for reading and writing data that all clients used. However, with the rewrite of the web client in React, it was decided to use GraphQL. The API server now exposes a GraphQL endpoint in addition to the original REST API. However, the GraphQL API doesn't yet fully expose all of the data that was available in the REST API. To prevent the web client from having to query some data through GraphQL and other data through the REST API, this project includes a REST->GraphQL proxy. It essentially extends the API server's GraphQL schema with additional queries and mutations. When the web client uses those additional queries via the extended GraphQL API, the proxy makes a request to the REST API, manipulates the data as necessary, and returns the response back to the client in the GraphQL response. As complicated as this seems, the important part is that the client _doesn't have to know_ whether a particular query is ultimately satisfied by the API server's native GraphQL API or by the REST API. It can make queries and let the proxy worry about routing queries to the correct place.

The extended GraphQL server is implemented in JavaScript and is available at `/api/graphql` on the domain that the web client is running on. To see the queries and mutations provided by the API server, you can go [here](https://studio.apollographql.com/sandbox/explorer?endpoint=https://api.mpdx.org/graphql). To see the extended set of queries and mutations provided by the web client's supergraph, you can go [here](https://studio.apollographql.com/sandbox/explorer?endpoint=https://next.mpdx.org/api/graphql).

### Adding REST Proxy Queries

To add a new GraphQL query that interacts with the REST API, you will need to follow several steps.

1. Find an existing query folder in `pages/api/Schema` (`CoachingAnswerSets` is a good starting point), make a copy of it, and rename it to the name of the query you are adding.
2. In the folder you just created, rename the `.graphql` file to the name of the query you are adding. Adjust the `extend type Query {}` section that `.graphql` file to contain the query or queries that you are adding, including their arguments and return types. Define the types of the return types of your query in the rest of the file.
3. Run `yarn gql:server` to generate TypeScript definitions for the new queries. You will need to run this after every time you modify a `.graphql` file in `pages/api/Schema`. If you want it to rerun automatically when it detects changes, run `yarn gql:server:w`.
4. In `pages/api/graphql-rest.page.ts` add a method to the `MpdxRestApi` class that makes a request to the REST API.
5. In the `dataHandler.ts` file for your query, rename the exported method to be appropriate for your query and modify it so that it takes the response from the REST API and returns data in the format returned by the GraphQL query. Make sure that the types match what you defined in the `.graphql` file. Also, make sure that the method you added to `graphql-rest.page.ts` imports and calls your datahandler.
6. In the `resolvers.ts` file for your query, make sure that the `Query` property on the exported resolvers contains one property for each query you are adding (and the same for the `Mutation` property if you are adding mutations). The second argument of each of those query resolver functions will be an object containing the inputs to your query. Make sure they match the inputs you defined in your `.graphql`. Also make sure that the resolver functions call the `dataSources.mpdxRestApi` method that you defined in `graphq-rest.page.ts`.
7. In `pages/api/Schema/index.ts` import the typedefs and resolvers for your new query and add them to the `buildSubgraphSchema` call.

### Pagination

When loading GraphQL queries that contain lists of items supporting pagination, e.g. tasks or donations, the server will only respond with 25 items by default for performance reasons. Any field where you query `nodes` supports pagination and has a default page size of 25. For example:

```gql
query ContactNames($accountListId: ID!) {
  contacts(accountListId: $accountListId) {
    # `nodes` means the results are paginated
    nodes {
      id
      firstName
      lastName
    }
  }
}
```

Not setting an explicit page or manually paginating the results can cause situations where items more than 25 are silently discarded. To avoid this, you have two options.

**Explicit Page Size**: If you are certain that there is no reasonable case where there are more than 25 results, explicitly set the page size via the `first` (or `last`) filter. For example:

```gql
query ContactEmails($accountListId: ID!, $contactId: ID!) {
  contact(accountListId: $accountListId, id: $contactId) {
    primaryPerson {
      # Here we make clear our assumption that no person will have more than 10 email addresses
      emailAddresses(first: 10) {
        nodes {
          id
          email
        }
      }
    }
  }
}
```

Note that the server limits the maximum page size for most queries to 50. Even if you say `first: 250` in your query, the server will still only send 50. The current exceptions to this are the `contacts` query, which allows a maximum page size of 20,000, the `donations` query, which allows a maximum page size of 100, and the `tasks` query, which allows a maximum page size of 1,000. [Look here](https://github.com/search?q=repo%3ACruGlobal%2Fmpdx_api%20max_page_size&type=code) for the most up-to-date information.

**Pagination**: If there might be a large number of results, you will need to use pagination:

```gql
query ContactNames($accountListId: ID!, $after: String) {
  contacts(accountListId: $accountListId, after: $after) {
    # `nodes` means the results are paginated
    nodes {
      id
      firstName
      lastName
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

If you want to use infinite scrolling or have a load more button, use the `fetchMore` function to load the next page.

```ts
const { data, fetchMore } = useContactNamesQuery({
  variables: { accountListId },
});

const handleLoadMore = () => {
  if (!data?.contacts.pageInfo.hasNextPage) {
    fetchMore({
      variables: {
        after: data?.contacts.pageInfo.endCursor,
      },
    });
  }
};
```

If you want to load all the pages, use the `useFetchAllPages` hook. As long as your query accepts an `after` variable, this hook will load all the pages into `data`, and set `loading` to `false` once all pages have loaded. For this, the field you are querying needs to have its field policy set to `paginationFieldPolicy` in `src/lib/client.ts` so that Apollo will know to merge the results from the additional pages back into the result from the initial query. Consult the Apollo docs for more information.

```ts
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';

const { data } = useContactNamesQuery({
  variables: { accountListId },
});
const { loading } = useFetchAllPages({
  pageInfo: data?.contacts.pageInfo,
  fetchMore,
});
```

## Testing

This project uses [`jest`](https://jestjs.io/) for testing. To test React components we use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). Our test code calls the testing library package's `render` helper with a component. `render` renders the component in an emulated, in-memory DOM (i.e. it doesn't use a real browser for rendering) and returns some helper functions that can be used to check that the DOM output is working as expected. For example:

```tsx
import { render } from '@testing-library/react';

describe('Header', () => {
  it('renders the header text', () => {
    const { getByText } = render(<Header text="Header Text" />);

    expect(getByText('Header Text')).toBeInTheDocument();
  });
});
```

To interact with the component, use the helpers from the `@testing-library/user-event` package. For example:

```tsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('responds to button clicks', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Click Me</Button>);

    userEvent.click(getByText('Click Me'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

Sometimes the component doesn't render in it's final state on the first render, especially when it loads data asynchronously through GraphQL. In this case, you will need to use a `find...` query. It will look for the elements multiple times and return them after it finds them, or timeout with an error after several seconds.

```tsx
import { render } from '@testing-library/react';

describe('AsyncComponent', () => {
  // Note that this test must be an async function to use await
  it('shows the data', async () => {
    const { getByText, findByText } = render(<AsyncComponent />);

    // The loading state should show initially
    expect(getByText('Loading')).toBeInTheDocument();

    // The data should show asynchronously after it loads
    expect(await findByText('Async data')).toBeInTheDocument();
  });
});
```

React Testing Library contains dozen of methods for finding elements. Read [this documentation](https://testing-library.com/docs/dom-testing-library/cheatsheet/#queries) to learn more.

When testing components that load data through GraphQL, it is helpful to be able to control some or all of the data in the query response. Wrapping components in a `<GqlMockedProvider>` in the test lets us accomplish this. By default, `GqlMockedProvider` intercepts all GraphQL queries, looks at the schema to see what type each of the fields should be, and generates random data that matches the schema. It uses a seeded random number generator, so the random data it returns will be stable between test runs.

```tsx
import { render } from '@testing-library/react';

describe('PartnersComponent', () => {
  it('shows the contact name', async () => {
    const { findByText } = render(
      <GqlMockedProvider>
        <PartnersComponent />
      </GqlMockedProvider>,
    );

    // Find the contact's randomly-generated name
    expect(await findByText('Thermometer Gate')).toBeInTheDocument();
  });
});
```

We can also mock certain fields in the query. For example, suppose that a component uses this GraphQL query:

```gql
query PartnerCommitments($accountListId: ID!) {
  contacts(accountListId: $accountListId) {
    nodes {
      id
      name
      pledgeAmount
      pledgeCurrency
      pledgeFrequency
      pledgeReceived
      pledgeStartDate
    }
  }
}
```

In our test, we can pass a `mocks` prop to `GqlMockedProvider` to tell it which fields to override. For example, the following mock will make `contacts.nodes` be an array with one contact and the `name` of that contact be John Doe. The contact's `id`, `pledgeAmount`, `pledgeCurrency`, etc. will still be randomly generated. We only have to mock the fields that we care about for the test.

```tsx
import { render } from '@testing-library/react';

describe('PartnersComponent', () => {
  it('shows the contact name', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{ PartnerCommitments: PartnerCommitmentsQuery }>
        mocks={{
          // This property tells GqlMockedProvider which query to mock and it must exactly match the name of the query defined in our .graphql file
          PartnerCommitments: {
            contacts: {
              nodes: [
                {
                  name: 'John Doe',
                },
              ],
            },
          },
        }}
      >
        <PartnersComponent />
      </GqlMockedProvider>,
    );

    expect(await findByText('John Doe')).toBeInTheDocument();
  });
});
```

**Important note**: the structure of the `mocks` object must _exactly_ match the structure of the query in the GraphQL file. If you miss a level of nesting or misspell a field, those mocks won't be used.

Another common pattern in tests is checking that a GraphQL query or mutation is called with the expected inputs. To do this, we use the `onCall` prop. `GqlMockedProvider` calls it every time it receives a GraphQL query or mutation and we can pass it a Jest mocked function to check these calls.

```gql
query ContactDetails($accountListId: ID!, $contactId: ID!) {
  contact(accountListId: $accountListId, contactId: $contactId) {
    id
    name
  }
}
```

```tsx
import { render } from '@testing-library/react';

const mutationSpy = jest.fn();

describe('ContactComponent', () => {
  it('shows the contact name', () => {
    render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ContactComponent
          accountListId="account-list-1"
          contactId="contact-1"
        />
      </GqlMockedProvider>,
    );

    // calls[0] is the first call, and calls[0][0] is the first argument of the first call
    expect(mutationSpy.calls[0][0]).toMatchObject({
      operation: {
        // Matches the name of the query defined in the component's .graphql file
        operationName: 'ContactDetails',
        variables: {
          accountListId: 'account-list-1',
          contactId: 'contact-1',
        },
      },
    });
  });
});
```

We can use the same strategy for testing variables passed to mutations:

```gql
mutation DeletePartner($accountListId: ID!, $contactId: ID!) {
  deleteContact(input: { accountListId: $accountListId, id: $contactId }) {
    id
  }
}
```

```tsx
import { render } from '@testing-library/react';

const mutationSpy = jest.fn();

describe('ContactComponent', () => {
  it('shows the contact name', async () => {
    const { findByText } = render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ContactComponent
          accountListId="account-list-1"
          contactId="contact-1"
        />
      </GqlMockedProvider>,
    );

    userEvent.click(await findByText('Delete'));

    // The first operation was the query to load the contact, so we test the second operation
    expect(mutationSpy.calls[1][0]).toMatchObject({
      operation: {
        // Matches the name of the mutation defined in the component's .graphql file
        operationName: 'DeletePartner',
        variables: {
          accountListId: 'account-list-1',
          contactId: 'contact-1',
        },
      },
    });
  });
});
```

## Localization

This project uses the [react-i18next](https://react.i18next.com/) library for localization. All user-visible labels must be localized. To localize your labels, use the `useTranslation` hook like this:

```tsx
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return <h1>{t('Dashboard')}</h1>;
};
```

At some point after using a new `t()` label, you will need to run `yarn onesky:upload` to extract all the labels used by the application (including your new one) and send them to OneSky for translation. Once they have been translated, you can then run `yarn onesky:download` to pull the updated translations from OneSky into the project. Then you can submit a PR with the changes to the `public/locales/` directory.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
