import { ApolloClient, createHttpLink, InMemoryCache, gql } from '@apollo/client';
import { setContext } from '@apollo/link-context';
import { persistCache } from 'apollo-cache-persist';
import fetch from 'isomorphic-fetch';

const cache = new InMemoryCache();

const httpLink = createHttpLink({
    uri: process.env.API_URL,
    fetch,
});

if (process.browser && process.env.NODE_ENV === 'production') {
    persistCache({
        cache,
        storage: window.localStorage,
    });
}

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = process.browser ? localStorage.getItem('token') : '';
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const typeDefs = gql`
    extend type Query {
        currentAccountListId: ID
        breadcrumb: String
    }
`;

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache,
    typeDefs,
});

export default client;
