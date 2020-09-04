import { InMemoryCache } from '@apollo/client';
import { GetLocalStateQuery } from '../types/GetLocalStateQuery';
import GET_LOCAL_STATE_QUERY from '../src/queries/getLocalStateQuery.graphql';

const cacheMock = (data?: Partial<GetLocalStateQuery>): InMemoryCache => {
    const cache = new InMemoryCache({ addTypename: false });
    cache.writeQuery({
        query: GET_LOCAL_STATE_QUERY,
        data: {
            currentAccountListId: '1',
            breadcrumb: null,
            ...data,
        },
    });
    return cache;
};

export default cacheMock;
