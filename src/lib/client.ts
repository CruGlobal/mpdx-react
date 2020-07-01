import { ApolloClient, createHttpLink, InMemoryCache, gql } from '@apollo/client';
import { persistCache } from 'apollo-cache-persist';
import fetch from 'isomorphic-fetch';

const cache = new InMemoryCache();

const link = createHttpLink({
    uri: `${process.env.VERCEL_URL}/api/graphql`,
    fetch,
});

if (process.browser && process.env.NODE_ENV === 'production') {
    persistCache({
        cache,
        storage: window.localStorage,
    });
}

const typeDefs = gql`
    extend type Query {
        currentAccountListId: ID
        breadcrumb: String
    }
`;

const client = new ApolloClient({ link, cache, typeDefs });

export default client;
