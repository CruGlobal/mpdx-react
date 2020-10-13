import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { persistCache } from 'apollo-cache-persist';
import fetch from 'isomorphic-fetch';

export const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                userNotifications: relayStylePagination(['accountListId']),
            },
        },
    },
});

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

const client = new ApolloClient({
    link: httpLink,
    cache,
});

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
        link: httpLink,
        ssrMode: true,
        cache: new InMemoryCache(),
    });
};

export default client;
