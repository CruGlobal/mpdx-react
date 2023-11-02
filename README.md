# MPDX

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).
The project uses node version 16.16.0.

## Environments

- Production: https://next.mpdx.org/
- Staging: https://next.stage.mpdx.org/
- Local: http://localhost:3000/

## Getting Started

Before you start, make sure you get the environment variables necessary for this project from another developer.

Once you have these variables you can install the dependencies:

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
- `SHOW_BANNER` - Display a hard-coded banner on the Dashboard. Set to `true` or `false`

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

## GraphQL Playground

The GraphQL playground can be a useful tool/interface for testing out queries and mutations. It can accessed locally during development via [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

## Project Guidelines

### Pagination

When loading GraphQL queries that contain lists of items supporting pagination, e.g. tasks or donations, the server will only respond with 25 items by default for performance reasons. Any field where you query `nodes` supports pagination and has this default page size of 25, for example:

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!
