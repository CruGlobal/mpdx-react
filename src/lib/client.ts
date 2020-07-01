import { IncomingMessage } from 'http';
import { ApolloClient, createHttpLink, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { persistCache } from 'apollo-cache-persist';
import fetch from 'isomorphic-fetch';

const cache = new InMemoryCache();

const httpLink = createHttpLink({
    uri: `${process.env.SITE_URL}/api/graphql`,
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

const config = {
    link: httpLink,
    cache,
    typeDefs,
};

const client = new ApolloClient(config);

export const ssrClient = (token?: string): ApolloClient<NormalizedCacheObject> => {
    const httpLink = createHttpLink({
        uri: process.env.API_URL,
        fetch,
        headers: {
            Authorization: token ? `Bearer ${token}` : null,
            Accept: 'application/json',
        },
    });

    return new ApolloClient({
        ...config,
        ssrMode: true,
        link: httpLink,
    });
};

export default client;
