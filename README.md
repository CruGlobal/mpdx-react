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
- `REWRITE_DOMAIN` - The domain which where new & old MPDX applications live. Set to `mpdx.org` for next.mpdx.org & mpdx.org.
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
- `API_OAUTH_ISSUER` - Api OAuth issuer web address
- `API_OAUTH_VISIBLE_NAME` - UI name for your OAuth, default is `SSO`.

_Also if you're viewing the next-auth code, you'll come across this file `pages/api/auth/apiOauthSignIn.ts`. `apiOauthSignIn.ts` is a Graphql generated file, but since the apiOauthSignIn Graphql isn't added to MPDX API Prod, only to MPDX API Staging for security reasons. We've added the generated file for apiOauthSignIn and not the GraphQl file since it will cause build errors on prod._

#### Favicon & Logo Env Vars

Since we don't want accidental re-use of our logos by non-Cru organizations, the values of `NEXT_PUBLIC_MEDIA_LOGO` and `NEXT_PUBLIC_MEDIA_FAVICON` are not included in this README.
If you need them, request a developer to send you the values to these env variables.

## GraphQL Playground

The GraphQL playground can be a useful tool/interface for testing out queries and mutations. It can accessed locally during development via [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!
