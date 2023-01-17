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

#### Favicon & Logo

You will need to add these environment vars locally, so the logo and favicon shows.

```NEXT_PUBLIC_MEDIA_LOGO=/images/logo.svg
NEXT_PUBLIC_MEDIA_FAVICON=/favicon.png
```

## GraphQL Playground

The GraphQL playground can be a useful tool/interface for testing out queries and mutations. It can accessed locally during development via [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!
